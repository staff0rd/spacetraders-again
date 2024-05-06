import lodash from 'lodash'
import { SupplyLevel, TradeSymbol } from '../../api'
import { Supply } from '../ship/actors/supply'
import { ShipEntity } from '../ship/ship.entity'
import { distancePoint, distanceWaypoint, getGraph, getShortestPath, getTravelTime } from '../waypoints/pathfinding'
import { WaypointEntity } from '../waypoints/waypoint.entity'

type TradeRoute = {
  tradeSymbol: TradeSymbol
  fuelCost: number
  buyLocation: WaypointEntity
  purchasePricePerUnit: number
  sellLocation: WaypointEntity
  sellPricePerUnit: number
  distance: number
  profitPerUnit: number
  totalProfit: number
  costVolumeDistance: number
  quantityToBuy: number
  fuelNeeded: number
  rank?: number
}

const highCapacity: SupplyLevel[] = ['ABUNDANT', 'HIGH', 'MODERATE']
const lowCapacity: SupplyLevel[] = ['LIMITED', 'SCARCE', 'MODERATE']

type TradeRouteOptions = {
  excludeLoss?: boolean
  limitToModerate?: boolean
  limitToWithin200Radius?: boolean
  supplyChainIgnore?: Supply[]
}

export async function getBestTradeRoutes(
  ship: ShipEntity,
  waypoints: WaypointEntity[],
  { excludeLoss = true, limitToModerate = false, limitToWithin200Radius = false, supplyChainIgnore = [] }: TradeRouteOptions,
): Promise<TradeRoute[]> {
  const goodLocation: TradeGoodWaypoint[] = waypoints
    .filter((x) => x.tradeGoods && x.tradeGoods.length)
    .map((x) => ({ waypoint: x, tradeGoods: x.tradeGoods! }))
    .flatMap((x) =>
      x.tradeGoods
        ?.filter((g) => !supplyChainIgnore.find((s) => s.import === g.symbol || s.export === g.symbol))
        .map((g): TradeGoodWaypoint => ({ waypoint: x.waypoint, tradeGood: g, tradeSymbol: g.symbol })),
    )

  const grouped = groupByGood(goodLocation)
  const { graph } = getGraph(waypoints)
  //const { focusTradeRoute } = getDebug()

  return (
    grouped
      .map((g) =>
        g.locations
          .filter((x) => !limitToModerate || highCapacity.includes(x.tradeGood.supply))
          .filter((x) => !limitToWithin200Radius || distancePoint({ x: 0, y: 0 }, { x: x.waypoint.x, y: x.waypoint.y }) < 200)
          .map((buyLocation) =>
            g.locations
              .filter((dest) => dest.waypoint !== buyLocation.waypoint)
              .filter((x) => !limitToModerate || lowCapacity.includes(x.tradeGood.supply))
              .filter((x) => !limitToWithin200Radius || distancePoint({ x: 0, y: 0 }, { x: x.waypoint.x, y: x.waypoint.y }) < 200)
              .map((sellLocation) => {
                const route = getShortestPath(graph, buyLocation.waypoint.symbol, sellLocation.waypoint.symbol, ship)
                const distance = route.map((p) => distanceWaypoint(p.from, p.to)).reduce((a, b) => a + b)
                const maxFuelNeeded = Math.max(...route.map((a) => a.fuelNeeded))

                const quantityToBuy = ship.cargo.capacity
                const fuelCost = getFuelPriceForRoute(route, waypoints)
                const profitPerUnit = sellLocation.tradeGood.sellPrice - buyLocation.tradeGood.purchasePrice - fuelCost / quantityToBuy
                const flightTime = lodash.sumBy(route, (x) => getTravelTime(x.from, x.to, ship))

                const costVolumeDistance = profitPerUnit / quantityToBuy / flightTime
                const totalProfit = quantityToBuy * profitPerUnit - fuelCost
                const result: TradeRoute = {
                  buyLocation: buyLocation.waypoint,
                  purchasePricePerUnit: buyLocation.tradeGood.purchasePrice,
                  sellLocation: sellLocation.waypoint,
                  sellPricePerUnit: sellLocation.tradeGood.sellPrice,
                  distance,
                  tradeSymbol: g.tradeSymbol,
                  profitPerUnit,
                  fuelCost: fuelCost,
                  costVolumeDistance,
                  fuelNeeded: maxFuelNeeded,
                  quantityToBuy,
                  totalProfit,
                }
                return result
              })
              .flat(),
          )
          .flat(),
      )
      .flat()
      .filter((a) => !excludeLoss || a.costVolumeDistance > 0)
      // .filter(
      //   (a) =>
      //     !focusTradeRoute ||
      //     (focusTradeRoute.from === a.buyLocation && focusTradeRoute.to === a.sellLocation && focusTradeRoute.good === a.good),
      // )
      .sort((a, b) => b.costVolumeDistance - a.costVolumeDistance)
      .map((r, ix) => ({
        ...r,
        rank: ix + 1,
      }))
  )
}

function getFuelPriceForRoute(route: ReturnType<typeof getShortestPath>, waypoints: WaypointEntity[]) {
  const fuelPrices = waypoints
    .filter((w) => w.tradeGoods?.find((g) => g.symbol === TradeSymbol.Fuel))
    .map((x) => ({ waypointSymbol: x.symbol, fuelPrice: x.tradeGoods!.find((g) => g.symbol === TradeSymbol.Fuel)!.purchasePrice }))

  const routeFuelPrices = route.map(
    (r) => fuelPrices.find((x) => x.waypointSymbol === r.from.symbol)?.fuelPrice ?? 100, // TODO: need a better fuel price calculation
  )

  const sum = lodash.sum(routeFuelPrices)

  return sum
}

function groupByGood(market: TradeGoodWaypoint[] | undefined) {
  const grouped: GroupByGood = {}
  market?.reduce(function (res: GroupByGood, value: TradeGoodWaypoint) {
    if (!res[value.tradeSymbol]) {
      res[value.tradeSymbol] = {
        tradeSymbol: value.tradeSymbol,
        locations: [],
      }
      grouped[value.tradeSymbol] = res[value.tradeSymbol]
    }
    res[value.tradeSymbol]!.locations.push(value)
    return res
  }, {})
  return Object.values(grouped)
}

type PartialRecord<K extends string | number | symbol, T> = { [P in K]?: T }

type TradeGoodWaypoint = {
  tradeSymbol: TradeSymbol
  waypoint: WaypointEntity
  tradeGood: Exclude<WaypointEntity['tradeGoods'], undefined>[0]
}

type GroupByGood = PartialRecord<TradeSymbol, { locations: TradeGoodWaypoint[]; tradeSymbol: TradeSymbol }>
