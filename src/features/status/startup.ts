import lodash from 'lodash'
import { DefaultApiFactory, TradeSymbol, WaypointTraitSymbol } from '../../../api'
import { getConfig } from '../../config'
import { updateShips } from '../../db/updateShips'
import { invariant } from '../../invariant'
import { log } from '../../logging/configure-logging'
import { miningDroneActorFactory } from '../ship/actors/mining-drone'
import { probeActorFactory } from '../ship/actors/probe'
import { shuttleActorFactory, shuttleLogicFactory } from '../ship/actors/shuttle'
import { ShipEntity } from '../ship/ship.entity'
import { getWaypoints } from '../waypoints/getWaypoints'
import { getActor } from './actions/getActor'
import { getAgent } from './actions/getAgent'
import { decisionMaker } from './decisionMaker'

export type Position = { x: number; y: number }

export async function startup() {
  const config = getConfig()
  const {
    data: { resetDate },
  } = await DefaultApiFactory().getStatus()
  const { agent, api } = await getAgent(resetDate)

  const {
    data: { data: shipsFromApi },
  } = await api.fleet.getMyShips()
  const ships = await updateShips(resetDate, agent, shipsFromApi)

  const commandShip = ships.find((s) => s.registration.role === 'COMMAND')
  invariant(commandShip, 'Expected to find a command ship')

  const systemSymbol = commandShip.nav.systemSymbol

  const waypoints = await getWaypoints(systemSymbol, agent, api)

  const {
    data: {
      data: [engineeredAsteroid],
    },
  } = await api.systems.getSystemWaypoints(commandShip.nav.systemSymbol, undefined, 20, 'ENGINEERED_ASTEROID')

  const keep: TradeSymbol[] = ['IRON_ORE', 'COPPER_ORE', 'ALUMINUM_ORE']

  const act = await getActor(agent, api, waypoints)

  const shuttleLogic = shuttleLogicFactory(act, engineeredAsteroid, ships, keep)

  await decisionMaker(commandShip, true, agent, act, async (ship: ShipEntity) => {
    if (!agent.contract || agent.contract.fulfilled) {
      await act.getOrAcceptContract(ship)
      return
    }

    if (agent.contractGood.unitsFulfilled === agent.contractGood.unitsRequired) {
      await act.fulfillContract()
      return
    }

    const probes = ships.filter((s) => s.frame.symbol === 'FRAME_PROBE').toSorted((a, b) => a.label.localeCompare(b.label))
    if (probes.length < config.purchases.satelites) {
      await act.purchaseShip(commandShip, 'SHIP_PROBE', ships)
      return
    } else {
      const probedLocations = waypoints
        .filter((x) => x.type !== 'ENGINEERED_ASTEROID')
        .filter((x) => x.traits.includes(WaypointTraitSymbol.Marketplace) || x.traits.includes(WaypointTraitSymbol.Shipyard))

      const sortedProbeLocations = lodash.orderBy(
        probedLocations,
        [(w) => w.imports.length, (w) => w.exports.length, (w) => w.distanceFromEngineeredAsteroid, (w) => w.symbol],
        ['desc', 'desc', 'asc', 'asc'],
      )
      const sortedProbes = lodash.orderBy(probes, [(s) => s.label])
      sortedProbes.forEach((probe, ix) => {
        if (probe.isCommanded) return
        log.warn('command', `Spawning worker for ${probe.label}`)
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
        log.warn('command', `Spawning worker for ${drone.label}`)
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
        log.warn('command', `Spawning worker for ${ship.label}`)
        ship.isCommanded = true
        shuttleActorFactory(ship, agent, act, engineeredAsteroid, ships, keep)
      })
    }

    await shuttleLogic(commandShip, agent)
  })
}
