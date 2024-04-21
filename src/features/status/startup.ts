import lodash from 'lodash'
import { TradeSymbol, WaypointTraitSymbol } from '../../../api'
import { getConfig } from '../../config'
import { invariant } from '../../invariant'
import { log } from '../../logging/configure-logging'
import { init } from '../init'
import { contractTraderLogicFactory } from '../ship/actors/contract-trading'
import { miningDroneActorFactory } from '../ship/actors/mining-drone'
import { probeActorFactory } from '../ship/actors/probe'
import { shuttleActorFactory, shuttleLogicFactory } from '../ship/actors/shuttle'
import { systemReconLogicFactory } from '../ship/actors/system-recon'
import { ShipEntity } from '../ship/ship.entity'
import { decisionMaker } from './decisionMaker'

export type Position = { x: number; y: number }

export async function startup() {
  const config = getConfig()

  const { act, waypoints, ships, commandShip, agent } = await init(config.strategy.scanOnStartup)

  const engineeredAsteroid = waypoints.find((x) => x.type === 'ENGINEERED_ASTEROID')
  invariant(engineeredAsteroid, 'Expected to find an engineered asteroid')
  const keep: TradeSymbol[] = ['IRON_ORE', 'COPPER_ORE', 'ALUMINUM_ORE', 'SILICON_CRYSTALS']

  const shuttleLogic = shuttleLogicFactory(act, engineeredAsteroid, ships, keep)
  const contractTraderLogic = contractTraderLogicFactory(act)
  const systemReconLogic = systemReconLogicFactory(act)

  await decisionMaker(commandShip, true, agent, act, async (ship: ShipEntity) => {
    const probes = ships.filter((s) => s.registration.role === 'SATELLITE').toSorted((a, b) => a.label.localeCompare(b.label))
    const locationsToProbe = waypoints
      .filter((x) => x.type !== 'ENGINEERED_ASTEROID')
      .filter((x) => x.traits.includes(WaypointTraitSymbol.Marketplace) || x.traits.includes(WaypointTraitSymbol.Shipyard))
    if (probes.length < locationsToProbe.length && (agent.data?.credits ?? 0) > 250_000) {
      await act.purchaseShip(commandShip, 'SHIP_PROBE', ships)
      return
    } else {
      const sortedProbeLocations = lodash.orderBy(
        locationsToProbe,
        [(w) => w.imports.length, (w) => w.exports.length, (w) => w.distanceFromEngineeredAsteroid, (w) => w.symbol],
        ['desc', 'desc', 'asc', 'asc'],
      )
      const sortedProbes = lodash.orderBy(probes, [(s) => s.label])
      sortedProbes.forEach((probe, ix) => {
        if (probe.isCommanded) return
        log.info('command', `Spawning worker for ${probe.label}`)
        probe.isCommanded = true
        probeActorFactory(probe, agent, act, sortedProbeLocations[ix])
      })
    }

    const miningDrones = ships.filter((s) => s.frame.symbol === 'FRAME_DRONE')
    // TODO: don't hardcode the price
    if (miningDrones.length < config.purchases.mining && (agent.data?.credits ?? 0) > 50000) {
      await act.purchaseShip(commandShip, 'SHIP_MINING_DRONE', ships)
      return
    } else if (config.strategy.mine) {
      const idleDrones = miningDrones.filter((s) => !s.isCommanded)
      idleDrones.forEach((drone) => {
        log.info('command', `Spawning worker for ${drone.label}`)
        drone.isCommanded = true
        miningDroneActorFactory(drone, agent, act, engineeredAsteroid, keep)
      })
    }

    const shuttles = ships.filter((s) => s.frame.symbol === 'FRAME_SHUTTLE')
    if (shuttles.length < config.purchases.shuttles) {
      await act.purchaseShip(commandShip, 'SHIP_LIGHT_SHUTTLE', ships)
      return
    } else {
      const idleShuttles = shuttles.filter((s) => !s.isCommanded)
      idleShuttles.forEach((ship) => {
        log.info('command', `Spawning worker for ${ship.label}`)
        ship.isCommanded = true
        shuttleActorFactory(ship, agent, act, engineeredAsteroid, ships, keep)
      })
    }

    if (await systemReconLogic(commandShip, agent)) return

    if (await contractTraderLogic(commandShip, agent)) return

    await shuttleLogic(commandShip, agent)
  })
}
