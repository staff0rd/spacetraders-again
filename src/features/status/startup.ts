import { Configuration, ContractsApiFactory, DefaultApiFactory, Ship } from '../../../api'
import { findOrCreateAgent } from '../../db/findOrCreateAgent'
import { getOrPopulateMarkets } from '../../db/getOrPopulateMarkets'
import { log } from '../../logging/configure-logging'
import { logError } from '../../logging/log-error'
import { getActor } from './actions/getActor'
import { getOrPurchaseMiningDrone } from './actions/getOrPurchaseMiningDrone'
import { apiFactory } from './apiFactory'
import { getClosest } from './utils/getClosest'
import { getCurrentFlightTime } from './utils/getCurrentFlightTime'

export type Position = { x: number; y: number }

export async function startup() {
  const {
    data: { resetDate },
  } = await DefaultApiFactory().getStatus()
  const agent = await findOrCreateAgent(resetDate)

  const api = apiFactory(agent.token)
  const act = getActor(api)

  const {
    data: { data: myShips },
  } = await api.fleet.getMyShips()
  const contracts = await ContractsApiFactory(new Configuration({ accessToken: agent.token })).getContracts()
  const commandShip = myShips[0]
  const {
    data: { data: waypoint },
  } = await api.systems.getWaypoint(commandShip.nav.systemSymbol, commandShip.nav.waypointSymbol)
  const {
    data: { data: market },
  } = await api.systems.getMarket(commandShip.nav.systemSymbol, commandShip.nav.waypointSymbol)
  const {
    data: { data: orbital },
  } = await api.systems.getWaypoint(commandShip.nav.systemSymbol, waypoint.orbitals[0].symbol)
  const contract = contracts.data.data[0]
  if (!contract.accepted) {
    await ContractsApiFactory(new Configuration({ accessToken: agent.token })).acceptContract(contract.id)
  }
  const desiredResource = contract.terms.deliver![0]

  const {
    data: { data: shipyards },
    //@ts-expect-error because it is wrong
  } = await api.systems.getSystemWaypoints(commandShip.nav.systemSymbol, undefined, 20, undefined, { traits: ['SHIPYARD'] })

  const closestShipyard = getClosest(shipyards, waypoint)
  const {
    data: { data: shipyard },
  } = await api.systems.getShipyard(commandShip.nav.systemSymbol, myShips[1].nav.waypointSymbol)

  const miningDrone = await getOrPurchaseMiningDrone(api, myShips, shipyard)

  const {
    data: {
      data: [engineeredAteroid],
    },
  } = await api.systems.getSystemWaypoints(commandShip.nav.systemSymbol, undefined, 20, 'ENGINEERED_ASTEROID')

  const markets = await getOrPopulateMarkets(api, resetDate, commandShip.nav.systemSymbol)

  const makeDecision = async (ship: Ship) => {
    try {
      const arrival = getCurrentFlightTime(ship)
      if (arrival <= 0) {
        await act.refuelShip(ship)
        await act.jettisonUnsellable(markets, ship, desiredResource.tradeSymbol)

        if (ship.nav.waypointSymbol === engineeredAteroid.symbol) {
          if (ship.cargo.units < ship.cargo.capacity) {
            await act.beginMining(ship)
          } else {
            await act.sellGoods(markets, ship, desiredResource.tradeSymbol)
          }
        } else if (ship.cargo.inventory.filter((p) => p.symbol !== desiredResource.tradeSymbol).length > 0) {
          await act.sellGoods(markets, ship, desiredResource.tradeSymbol)
        } else if (ship.cargo.inventory.find((p) => p.symbol === desiredResource.tradeSymbol)) {
          throw new Error('Not implemented - sell desired resource')
        } else {
          await act.navigateShip(ship, engineeredAteroid)
        }
      } else {
        log.warn('agent', `Mining drone is not yet in position. Waiting for arrival in ${arrival} seconds`)
        await act.wait(arrival * 1000)
        await makeDecision(ship)
      }
      await makeDecision(miningDrone)
    } catch (err) {
      logError('makeDecision', err)
    }
  }
  await makeDecision(miningDrone)

  await new Promise(() => {})
}
