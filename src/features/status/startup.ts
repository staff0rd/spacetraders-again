import { DefaultApiFactory } from '../../../api'
import { getOrPopulateMarkets } from '../../db/getOrPopulateMarkets'
import { updateShips } from '../../db/updateShips'
import { invariant } from '../../invariant'
import { log } from '../../logging/configure-logging'
import { logError } from '../../logging/log-error'
import { ShipEntity } from '../ship/ship.entity'
import { getActor } from './actions/getActor'
import { getAgent } from './actions/getAgent'
import { getClosest } from './utils/getClosest'
import { getCurrentFlightTime } from './utils/getCurrentFlightTime'

export type Position = { x: number; y: number }

export async function startup() {
  const {
    data: { resetDate },
  } = await DefaultApiFactory().getStatus()
  const { agent, api } = await getAgent(resetDate)

  const act = await getActor(agent, api)
  await act.getOrAcceptContract(agent)

  const {
    data: { data: shipsFromApi },
  } = await api.fleet.getMyShips()
  const ships = await updateShips(resetDate, shipsFromApi)

  const commandShip = ships.find((s) => s.registration.role === 'COMMAND')
  invariant(commandShip, 'Expected to find a command ship')

  const {
    data: { data: waypoint },
  } = await api.systems.getWaypoint(commandShip.nav.systemSymbol, commandShip.nav.waypointSymbol)
  const {
    data: { data: market },
  } = await api.systems.getMarket(commandShip.nav.systemSymbol, commandShip.nav.waypointSymbol)
  const {
    data: { data: orbital },
  } = await api.systems.getWaypoint(commandShip.nav.systemSymbol, waypoint.orbitals[0].symbol)

  const {
    data: { data: shipyards },
    //@ts-expect-error because it is wrong
  } = await api.systems.getSystemWaypoints(commandShip.nav.systemSymbol, undefined, 20, undefined, { traits: ['SHIPYARD'] })

  const closestShipyard = getClosest(shipyards, waypoint)
  const {
    data: { data: shipyard },
  } = await api.systems.getShipyard(commandShip.nav.systemSymbol, shipsFromApi[1].nav.waypointSymbol)

  const miningDrone = await act.getOrPurchaseMiningDrone(api, ships, shipyard)

  const {
    data: {
      data: [engineeredAteroid],
    },
  } = await api.systems.getSystemWaypoints(commandShip.nav.systemSymbol, undefined, 20, 'ENGINEERED_ASTEROID')

  const markets = await getOrPopulateMarkets(api, resetDate, commandShip.nav.systemSymbol)

  const decisionTimestamps: Date[] = []
  const recordTimestamp = () => {
    decisionTimestamps.push(new Date())
    decisionTimestamps.splice(0, decisionTimestamps.length - 10)
  }
  const getDecisionRate = () => {
    if (decisionTimestamps.length < 10) return Infinity
    const first = decisionTimestamps[0]
    const last = decisionTimestamps[decisionTimestamps.length - 1]
    return (last.getTime() - first.getTime()) / 1000
  }

  const makeDecision = async (ship: ShipEntity) => {
    recordTimestamp()

    try {
      invariant(agent.contract?.terms.deliver?.length === 1, 'Expected agent to have a single deliver contract')
      const contractGood = agent.contract.terms.deliver[0]

      const arrival = getCurrentFlightTime(ship)
      if (arrival <= 0) {
        await act.refuelShip(ship)
        await act.jettisonUnsellable(markets, ship, contractGood.tradeSymbol)

        if (contractGood.unitsFulfilled === contractGood.unitsRequired) {
          await act.fulfillContract(agent)
        } else if (ship.nav.waypointSymbol === engineeredAteroid.symbol) {
          if (ship.cargo.units < ship.cargo.capacity) {
            await act.beginMining(ship)
          } else {
            await act.sellGoods(markets, ship, contractGood.tradeSymbol)
          }
        } else if (ship.cargo.inventory.filter((p) => p.symbol !== contractGood.tradeSymbol).length > 0) {
          await act.sellGoods(markets, ship, contractGood.tradeSymbol)
        } else if (ship.cargo.inventory.find((p) => p.symbol === contractGood.tradeSymbol)?.units === ship.cargo.capacity) {
          await act.deliverGoods(ship, agent)
        } else {
          await act.navigateShip(ship, engineeredAteroid, markets)
        }
      } else {
        log.warn('agent', `Mining drone is not yet in position. Waiting for arrival in ${arrival} seconds`)
        await act.wait(arrival * 1000)
      }
      await makeDecision(ship)
    } catch (err) {
      logError('makeDecision', err)
    }
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await makeDecision(miningDrone)
    const decisionRate = getDecisionRate()
    if (decisionRate < 2) {
      throw new Error('Decision rate too high')
    }
  }
}
