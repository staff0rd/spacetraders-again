import lodash from 'lodash'
import { DefaultApiFactory } from '../../../api'
import { getOrPopulateMarkets } from '../../db/getOrPopulateMarkets'
import { updateShips } from '../../db/updateShips'
import { invariant } from '../../invariant'
import { log } from '../../logging/configure-logging'
import { miningDroneActorFactory } from '../actors/mining-drone'
import { shuttleActorFactory } from '../actors/shuttle'
import { ShipEntity } from '../ship/ship.entity'
import { getActor } from './actions/getActor'
import { getAgent } from './actions/getAgent'
import { decisionMaker } from './decisionMaker'
import { updateWaypoint } from './updateWaypoint'

export type Position = { x: number; y: number }

export async function startup() {
  const {
    data: { resetDate },
  } = await DefaultApiFactory().getStatus()
  const { agent, api } = await getAgent(resetDate)

  const act = await getActor(agent, api)
  const {
    data: { data: shipsFromApi },
  } = await api.fleet.getMyShips()
  const ships = await updateShips(resetDate, agent, shipsFromApi)

  const commandShip = ships.find((s) => s.registration.role === 'COMMAND')
  invariant(commandShip, 'Expected to find a command ship')

  const systemSymbol = commandShip.nav.systemSymbol

  const { markets, shipyards } = await initSystem(api, resetDate, systemSymbol)

  const {
    data: {
      data: [engineeredAsteroid],
    },
  } = await api.systems.getSystemWaypoints(commandShip.nav.systemSymbol, undefined, 20, 'ENGINEERED_ASTEROID')

  const miningDronesToPurchase = 10
  const shuttlesToPurchase = 1

  await decisionMaker(commandShip, act, async (ship: ShipEntity) => {
    if (!agent.contract || agent.contract.fulfilled) {
      await act.getOrAcceptContract(ship)
      return
    }

    if (agent.contractGood.unitsFulfilled === agent.contractGood.unitsRequired) {
      await act.fulfillContract()
      return
    }

    const miningDrones = ships.filter((s) => s.frame.symbol === 'FRAME_DRONE')
    log.info('agent', `There are ${miningDrones.length} mining drones`)
    // TODO: don't hardcode the price
    if (miningDrones.length < miningDronesToPurchase && (agent.data?.credits ?? 0) > 50000) {
      await act.purchaseShip(commandShip, 'SHIP_MINING_DRONE', shipyards, markets, ships)
      return
    } else {
      const idleDrones = miningDrones.filter((s) => !s.isCommanded)
      idleDrones.forEach((drone) => {
        log.warn('command', `Spawning worker for ${drone.label}`)
        drone.isCommanded = true
        miningDroneActorFactory(drone, act, markets, engineeredAsteroid)
      })
    }

    const shuttles = ships.filter((s) => s.frame.symbol === 'FRAME_SHUTTLE')
    log.info('agent', `There are ${shuttles.length} shuttles`)
    if (shuttles.length < shuttlesToPurchase) {
      await act.purchaseShip(commandShip, 'SHIP_LIGHT_SHUTTLE', shipyards, markets, ships)
      return
    } else {
      const idleShuttles = shuttles.filter((s) => !s.isCommanded)
      idleShuttles.forEach((ship) => {
        log.warn('command', `Spawning worker for ${ship.label}`)
        ship.isCommanded = true
        shuttleActorFactory(ship, act, agent, markets, engineeredAsteroid, ships, ['IRON_ORE', 'COPPER_ORE', 'ALUMINUM_ORE'])
      })
    }

    log.info('ship', `${ship.label} has nothing to do, will idle 5 minutes`)
    await act.wait(1000 * 60 * 5)
  })
}

const initSystem = async (api: Awaited<ReturnType<typeof getAgent>>['api'], resetDate: string, systemSymbol: string) => {
  const {
    data: { data: shipyardWaypoints, meta },
    //@ts-expect-error because it is wrong
  } = await api.systems.getSystemWaypoints(systemSymbol, undefined, 20, undefined, { traits: ['SHIPYARD'] })
  invariant(meta.total < 21, 'Expected less than 21 shipyards')

  const markets = await getOrPopulateMarkets(api, resetDate, systemSymbol)

  const shipyards = await Promise.all(
    shipyardWaypoints.map(async (waypoint) => {
      const {
        data: { data: shipyard },
      } = await api.systems.getShipyard(systemSymbol, waypoint.symbol)
      const data = lodash.omit(shipyard, 'transactions', 'symbol')
      const result = await updateWaypoint(
        resetDate,
        waypoint.symbol,
        { modificationsFee: data.modificationsFee, shipTypes: data.shipTypes },
        data.ships,
      )
      return result
    }),
  )
  return { markets, shipyards }
}
