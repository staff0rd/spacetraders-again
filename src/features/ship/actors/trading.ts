import { invariant } from '../../../invariant'
import { log } from '../../../logging/configure-logging'
import { getActor } from '../../status/actions/getActor'
import { AgentEntity } from '../../status/agent.entity'
import { decisionMaker } from '../../status/decisionMaker'
import { getBestTradeRoute } from '../../trade/getBestTradeRoute'
import { WaypointEntity } from '../../waypoints/waypoint.entity'
import { ShipActionType, ShipEntity } from '../ship.entity'

export const traderActorFactory = (
  ship: ShipEntity,
  agent: AgentEntity,
  act: Awaited<ReturnType<typeof getActor>>,
  waypoints: WaypointEntity[],
) => decisionMaker(ship, true, agent, act, traderLogicFactory(act, waypoints))

export const traderLogicFactory =
  (act: Awaited<ReturnType<typeof getActor>>, waypoints: WaypointEntity[]) =>
  async (ship: ShipEntity, agent: AgentEntity): Promise<boolean> => {
    const current = ship.action
    if (!current || current.type !== ShipActionType.TRADE) {
      const bestRoute = await getBestTradeRoute(ship, waypoints, true)
      if (!bestRoute.length) {
        log.warn('ship', `${ship.label} could not find a trade route, will wait`)
        await act.wait(1000 * 60)
        return false
      }
      await act.updateShipAction(ship, {
        type: ShipActionType.TRADE,
        from: bestRoute[0].buyLocation.symbol,
        to: bestRoute[0].sellLocation.symbol,
        tradeSymbol: bestRoute[0].tradeSymbol,
      })
      return true
    }

    const { from, to, tradeSymbol } = current
    const purchaseLocation = waypoints.find((x) => x.symbol === from)!

    if (ship.nav.route.destination.symbol === to) {
      if (ship.cargo.inventory.filter((x) => x.symbol === tradeSymbol).length) {
        await act.sellGoods(ship, [tradeSymbol])
        return true
      } else {
        await act.updateShipAction(ship, { type: ShipActionType.NONE })
        return true
      }
    } else if (ship.cargo.units < ship.cargo.capacity) {
      if (ship.nav.route.destination.symbol !== from) {
        await act.navigateShip(ship, purchaseLocation)
        return true
      } else {
        const tradeVolume = purchaseLocation.tradeGoods?.find((x) => x.symbol === tradeSymbol)?.tradeVolume
        invariant(tradeVolume, `Expected to find trade volume for ${tradeSymbol}`)
        await act.purchaseGoods(ship, tradeSymbol, Math.min(ship.cargo.capacity - ship.cargo.units, tradeVolume))
        return true
      }
    } else {
      await act.navigateShip(ship, waypoints.find((x) => x.symbol === to)!)
      return true
    }
  }
