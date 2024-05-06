import { Ship, TradeSymbol } from '../../../api'
import { log } from '../../../logging/configure-logging'
import { WaypointEntity } from '../../waypoints/waypoint.entity'
import { getBestSellWaypoint } from './getBestSellWaypoint'

export const getSellLocations = async (markets: WaypointEntity[], ship: Ship, keep: TradeSymbol[]) => {
  const excessCargo = ship.cargo.inventory.filter((item) => !keep.includes(item.symbol))
  const sellLocations = excessCargo.map((cargo) => {
    return {
      symbol: cargo.symbol,
      units: cargo.units,
      bestMarket: getBestSellWaypoint(markets, cargo.symbol),
    }
  })

  sellLocations.forEach((location) => {
    if (!location.bestMarket) {
      log.warn('agent', `Have ${location.units}x${location.symbol}, but there is no sell location`)
    }
  })
  return sellLocations
}
