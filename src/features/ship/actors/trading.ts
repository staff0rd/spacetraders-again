import { invariant } from '../../../invariant'
import { log } from '../../../logging/configure-logging'
import { getActor } from '../../status/actions/getActor'
import { AgentEntity } from '../../status/agent.entity'
import { decisionMaker } from '../../status/decisionMaker'
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
      const route = await act.getTradeRoute(ship)
      if (!route) {
        log.warn('ship', `${ship.label} could not find a trade route, will wait`)
        await act.wait(1000 * 60)
        return false
      }
      await act.updateShipAction(ship, {
        type: ShipActionType.TRADE,
        from: route.buyLocation.symbol,
        to: route.sellLocation.symbol,
        tradeSymbol: route.tradeSymbol,
        expectedProfit: route.totalProfit,
        totalPurchaseCost: 0,
        totalSellPrice: 0,
      })
      log.info(
        'ship',
        `${ship.label} will trade ${route.tradeSymbol} from ${route.buyLocation.symbol} to ${route.sellLocation.symbol} for ${route.totalProfit.toLocaleString()} credits`,
      )
      await act.navigateShip(ship, route.buyLocation)
      return true
    }

    const { from, to, tradeSymbol } = current
    const purchaseLocation = waypoints.find((x) => x.symbol === from)
    const sellLocation = waypoints.find((x) => x.symbol === to)
    invariant(purchaseLocation, `Expected to find a waypoint for ${from}`)
    invariant(sellLocation, `Expected to find a waypoint for ${to}`)

    if (ship.nav.route.destination.symbol === to) {
      if (ship.cargo.inventory.filter((x) => x.symbol === tradeSymbol).length) {
        await act.sellGood(ship, tradeSymbol, ship.cargo.inventory.find((x) => x.symbol === tradeSymbol)!.units)
        return true
      } else {
        if (ship.action?.type === ShipActionType.TRADE) {
          const { expectedProfit, totalPurchaseCost, totalSellPrice, tradeSymbol } = ship.action
          const actualProfit = totalSellPrice - totalPurchaseCost
          log.info(
            'ship',
            `${ship.label} made ${actualProfit.toLocaleString()} credits trading ${tradeSymbol}, expected ${expectedProfit.toLocaleString()} credits, variance: ${(actualProfit - expectedProfit).toLocaleString()}`,
          )
        }
        // scan before leaving
        await act.scanWaypoint(ship.nav.waypointSymbol)

        await act.updateShipAction(ship, { type: ShipActionType.NONE })
        return true
      }
    } else if (ship.cargo.units < ship.cargo.capacity) {
      if (ship.nav.route.destination.symbol !== from) {
        await act.navigateShip(ship, purchaseLocation)
        return true
      } else {
        const purchaseTradeGood = purchaseLocation.tradeGoods?.find((x) => x.symbol === tradeSymbol)
        const sellTradeGood = sellLocation.tradeGoods?.find((x) => x.symbol === tradeSymbol)
        invariant(purchaseTradeGood, `Expected to find a tradeGood for purchase: ${tradeSymbol}`)
        invariant(sellTradeGood, `Expected to find a tradeGood for sale: ${tradeSymbol}`)
        if (purchaseTradeGood.purchasePrice < sellTradeGood.sellPrice) {
          await act.purchaseGoods(ship, tradeSymbol, Math.min(ship.cargo.capacity - ship.cargo.units, purchaseTradeGood.tradeVolume))
          await act.scanWaypoint(ship.nav.waypointSymbol)
        } else {
          await act.navigateShip(ship, waypoints.find((x) => x.symbol === to)!)
        }
        return true
      }
    } else {
      await act.navigateShip(ship, waypoints.find((x) => x.symbol === to)!)
      return true
    }
  }
