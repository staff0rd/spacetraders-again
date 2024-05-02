import lodash from 'lodash'
import { TradeSymbol, WaypointTraitSymbol } from '../../../api'
import { getConfig } from '../../config'
import { invariant } from '../../invariant'
import { log } from '../../logging/configure-logging'
import { miningDroneActorFactory } from '../ship/actors/mining-drone'
import { probeActorFactory } from '../ship/actors/probe'
import { shuttleActorFactory } from '../ship/actors/shuttle'
import { Supply } from '../ship/actors/supply'
import { traderActorFactory } from '../ship/actors/trading'
import { ShipEntity } from '../ship/ship.entity'
import { getEntineeredAsteroid } from '../waypoints/getEntineeredAsteroid'
import { WaypointEntity } from '../waypoints/waypoint.entity'
import { getActor } from './actions/getActor'
import { AgentEntity } from './agent.entity'

export const spawnShipWorkers = async (
  agent: AgentEntity,
  ships: ShipEntity[],
  waypoints: WaypointEntity[],
  act: Awaited<ReturnType<typeof getActor>>,
  keep: TradeSymbol[],
  supplyChainIgnore: Supply[],
  commandShip?: ShipEntity,
) => {
  const config = getConfig()
  const probes = ships.filter((s) => s.registration.role === 'SATELLITE').toSorted((a, b) => a.label.localeCompare(b.label))
  const locationsToProbe = waypoints
    .filter((x) => x.type !== 'ENGINEERED_ASTEROID')
    .filter((x) => x.traits.includes(WaypointTraitSymbol.Marketplace) || x.traits.includes(WaypointTraitSymbol.Shipyard))

  if (commandShip && probes.length < locationsToProbe.length && (agent.data?.credits ?? 0) > 250_000) {
    await act.purchaseShip(commandShip, 'SHIP_PROBE')
    return
  } else {
    const sortedProbeLocations = lodash.orderBy(
      locationsToProbe,
      [(w) => w.distanceFromEngineeredAsteroid, (w) => w.symbol],
      ['asc', 'asc'],
    )
    const sortedProbes = lodash.orderBy(probes, [(s) => s.label])

    const expectedProbeLocations = sortedProbes
      .map((p, ix) => ({ [p.label]: sortedProbeLocations[ix].symbol }))
      .reduce((a, b) => ({ ...a, ...b }), {})
    const actualProbeLocations = sortedProbes.map((p) => ({
      probeLabel: p.label,
      expected: expectedProbeLocations[p.label],
      actual: p.nav.waypointSymbol,
    }))

    actualProbeLocations.forEach((x) => {
      if (x.actual === x.expected) log.info('probe', `${x.probeLabel}: ✅ ${x.actual}`)
      else {
        log.info('probe', `${x.probeLabel}: ❌ expected ${x.expected}, but targeting ${x.actual}`)
      }
    })

    sortedProbes.forEach((probe, ix) => {
      if (probe.isCommanded) return
      log.info('command', `Spawning worker for ${probe.label}`)
      probe.isCommanded = true
      const monitorWaypoint = probes.length > 1 ? sortedProbeLocations[ix] : waypoints.find((x) => x.symbol === probe.nav.waypointSymbol)
      invariant(monitorWaypoint, 'Expected to find a monitor waypoint')
      probeActorFactory(probe, agent, act, monitorWaypoint)
    })
  }

  const miningDrones = ships.filter((s) => s.frame.symbol === 'FRAME_DRONE')
  // TODO: don't hardcode the price
  if (commandShip && miningDrones.length < config.purchases.mining && (agent.data?.credits ?? 0) > 75_000) {
    await act.purchaseShip(commandShip, 'SHIP_MINING_DRONE')
    return true
  } else if (config.strategy.mine) {
    const idleDrones = miningDrones.filter((s) => !s.isCommanded)
    idleDrones.forEach((drone) => {
      log.info('command', `Spawning worker for ${drone.label}`)
      drone.isCommanded = true
      miningDroneActorFactory(drone, agent, act, getEntineeredAsteroid(waypoints), keep)
    })
  }

  const shuttles = ships.filter((s) => s.frame.symbol === 'FRAME_SHUTTLE')
  // TODO: add price
  if (commandShip && shuttles.length < config.purchases.shuttles) {
    await act.purchaseShip(commandShip, 'SHIP_LIGHT_SHUTTLE')
    return true
  } else {
    const idleShuttles = shuttles.filter((s) => !s.isCommanded)
    idleShuttles.forEach((ship) => {
      log.info('command', `Spawning worker for ${ship.label}`)
      ship.isCommanded = true
      shuttleActorFactory(ship, agent, act, getEntineeredAsteroid(waypoints), ships, keep)
    })
  }
  const haulers = ships.filter((s) => s.frame.symbol === 'FRAME_LIGHT_FREIGHTER')
  if (haulers.length && !keep.includes('SILICON_CRYSTALS')) {
    keep.push('SILICON_CRYSTALS', 'QUARTZ_SAND')
  }
  if (commandShip && haulers.length < config.purchases.haulers && (agent.data?.credits ?? 0) > 600_000) {
    await act.purchaseShip(commandShip, 'SHIP_LIGHT_HAULER')
    return true
  } else {
    const shuttleCount = (() => {
      if (haulers.length > 4) return 2
      if (haulers.length > 2) return 1
      return 0
    })()

    const idleHaulers = haulers.filter((s) => !s.isCommanded)
    idleHaulers.forEach((ship, ix) => {
      log.info('command', `Spawning worker for ${ship.label}`)
      ship.isCommanded = true
      if (ix < shuttleCount) shuttleActorFactory(ship, agent, act, getEntineeredAsteroid(waypoints), ships, keep)
      else traderActorFactory(ship, agent, act, waypoints, supplyChainIgnore)
    })
  }
  return false
}
