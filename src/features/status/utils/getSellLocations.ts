import { lineLength } from 'geometric'
import { Market, Ship, Waypoint } from '../../../../api'
import { log } from '../../../logging/configure-logging'
import { getClosest } from './getClosest'

export const getSellLocations = async (markets: Waypoint[], marketData: Market[], ship: Ship, dontSellSymbol: string) => {
  const excessCargo = ship.cargo.inventory.filter((item) => item.symbol !== dontSellSymbol)
  const sellLocations = excessCargo.map((item) => ({
    symbol: item.symbol,
    units: item.units,
    closestMarket: getClosest(
      marketData
        .filter((m) => m.imports.map((p) => p.symbol).includes(item.symbol))
        .map((m) => markets.find((p) => p.symbol === m.symbol)!),
      ship.nav.route.destination,
    ),
  }))

  sellLocations.forEach((location) => {
    if (location.closestMarket) {
      log.info(
        'agent',
        `Will sell ${location.symbol} at ${location.closestMarket.symbol}, distance: ${lineLength([
          [ship.nav.route.destination.x, ship.nav.route.destination.y],
          [location.closestMarket.x, location.closestMarket.y],
        ])}`,
      )
    } else {
      log.warn('agent', `Have ${location.units}x${location.symbol}, but there is no sell location`)
    }
  })
  return sellLocations
}
