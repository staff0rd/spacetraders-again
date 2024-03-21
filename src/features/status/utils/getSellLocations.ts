import { Ship } from '../../../../api'
import { log } from '../../../logging/configure-logging'
import { WaypointEntity } from '../waypoint.entity'
import { getClosest } from './getClosest'

export const getSellLocations = async (markets: WaypointEntity[], ship: Ship, dontSellSymbol: string) => {
  const excessCargo = ship.cargo.inventory.filter((item) => item.symbol !== dontSellSymbol)
  const sellLocations = excessCargo.map((cargo) => {
    const marketsThatImport = markets.filter((m) => m.imports.includes(cargo.symbol))
    return {
      symbol: cargo.symbol,
      units: cargo.units,
      closestMarket: getClosest(marketsThatImport, ship.nav.route.destination),
    }
  })

  sellLocations.forEach((location) => {
    if (!location.closestMarket) {
      log.warn('agent', `Have ${location.units}x${location.symbol}, but there is no sell location`)
    }
  })
  return sellLocations
}
