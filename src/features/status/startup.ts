import lodash from 'lodash'
import { DefaultApiFactory } from '../../../api'
import { getOrPopulateMarkets } from '../../db/getOrPopulateMarkets'
import { updateShips } from '../../db/updateShips'
import { invariant } from '../../invariant'
import { log } from '../../logging/configure-logging'
import { miningDroneActorFactory } from '../actors/mining-drone'
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

  const { markets, shipyards, shipyardWaypoints } = await initSystem(api, resetDate, systemSymbol)

  const {
    data: {
      data: [engineeredAsteroid],
    },
  } = await api.systems.getSystemWaypoints(commandShip.nav.systemSymbol, undefined, 20, 'ENGINEERED_ASTEROID')

  const miningDronesToPurchase = 1

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
    if (miningDrones.length < miningDronesToPurchase) {
      const miningDroneShipyard = shipyards.find((x) => x.shipTypes.map((s) => s.type).includes('SHIP_MINING_DRONE'))
      invariant(miningDroneShipyard, 'Expected to find a shipyard with a mining drone ship')
      const miningDroneShipyardWaypoint = shipyardWaypoints.find((x) => x.symbol === miningDroneShipyard.symbol)
      invariant(miningDroneShipyardWaypoint, 'Expected to find a waypoint for the mining drone shipyard')
      if (commandShip.nav.route.destination.symbol !== miningDroneShipyard.symbol) {
        await act.navigateShip(commandShip, miningDroneShipyardWaypoint, markets)
        return
      }

      await act.getOrPurchaseMiningDrone(ships, miningDroneShipyard)
      return
    } else {
      const idleDrones = miningDrones.filter((s) => !s.isCommanded)
      idleDrones.forEach((drone) => {
        log.warn('command', `Spawning worker for ${drone.label}`)
        drone.isCommanded = true
        miningDroneActorFactory(drone, act, agent, markets, engineeredAsteroid)
      })
    }

    const haulerShipYard = shipyards.find((x) => x.shipTypes.map((s) => s.type).includes('SHIP_LIGHT_HAULER'))
    invariant(haulerShipYard, 'Expected to find a shipyard with a light hauler ship')
    if (commandShip.nav.route.destination.symbol !== haulerShipYard.symbol) {
      const waypoint = shipyardWaypoints.find((x) => x.symbol === haulerShipYard.symbol)!
      await act.navigateShip(commandShip, { symbol: haulerShipYard.symbol, x: waypoint?.x, y: waypoint.y }, markets)
      return
    }

    log.info('ship', `${ship.label} will wait 5 minutes`)
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
      invariant(result, 'Expected to update waypoint')
      return shipyard
    }),
  )
  return { markets, shipyards, shipyardWaypoints }
}
