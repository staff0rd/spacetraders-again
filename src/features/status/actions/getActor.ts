import { Market, Ship, Waypoint } from '../../../../api'
import { invariant } from '../../../invariant'
import { log } from '../../../logging/configure-logging'
import { apiFactory } from '../apiFactory'
import { getClosest } from '../utils/getClosest'
import { getSellLocations } from '../utils/getSellLocations'

export const getActor = (api: ReturnType<typeof apiFactory>) => {
  const dockShip = async (ship: Ship) => {
    const {
      data: {
        data: { nav },
      },
    } = await api.fleet.dockShip(ship.symbol)
    ship.nav = nav
  }

  const refuelShip = async (ship: Ship) => {
    if (ship.fuel.current < ship.fuel.capacity) {
      await dockShip(ship)
      const {
        data: {
          data: { fuel },
        },
      } = await api.fleet.refuelShip(ship.symbol)
      ship.fuel = fuel
    }
  }

  const orbitShip = async (ship: Ship) => {
    const {
      data: {
        data: { nav },
      },
    } = await api.fleet.orbitShip(ship.symbol)
    ship.nav = nav
  }

  const navigateShip = async (ship: Ship, waypoint: Waypoint) => {
    invariant(ship, 'Ship is required')
    invariant(waypoint, 'Waypoint is required')
    invariant(ship.nav.route.destination, 'Destination is required')
    await refuelShip(ship)
    if (ship.nav.route.destination.symbol !== waypoint.symbol) {
      log.info('agent', `Navigating ship ${ship.symbol} to ${waypoint.symbol}`)
      if (ship.nav.status === 'DOCKED') {
        await orbitShip(ship)
      }
      const {
        data: {
          data: { nav },
        },
      } = await api.fleet.navigateShip(ship.symbol, { waypointSymbol: waypoint.symbol })
      ship.nav = nav
    }
  }

  const sellGoods = async (markets: Waypoint[], marketData: Market[], ship: Ship, dontSellSymbol: string) => {
    log.info('agent', 'Will sell goods')
    const locations = await getSellLocations(markets, marketData, ship, dontSellSymbol)

    const sellableHere = locations.filter((p) => p.closestMarket && p.closestMarket.symbol === ship.nav.waypointSymbol)

    if (sellableHere.length) {
      await dockShip(ship)
      await Promise.all(
        sellableHere.map(async (p) => {
          log.info('agent', `Selling ${p.units} of ${p.symbol} at ${p.closestMarket!.symbol}`)
          const {
            data: {
              data: { cargo, transaction },
            },
          } = await api.fleet.sellCargo(ship.symbol, {
            symbol: p.symbol,
            units: p.units,
          })
          log.info('agent', `Sold ${transaction.units} of ${transaction.tradeSymbol} for $${transaction.totalPrice.toLocaleString()}`)
          ship.cargo = cargo
        }),
      )
    } else {
      const closest = getClosest(
        locations.filter((p) => p.closestMarket).map((p) => p.closestMarket!),
        ship.nav.route.destination,
      )
      await navigateShip(ship, closest!)
    }
  }

  const wait = async (delayMs: number) => new Promise((resolve) => setTimeout(resolve, delayMs))

  const beginMining = async (ship: Ship) => {
    await orbitShip(ship)
    const {
      data: {
        data: { cooldown, cargo, extraction },
      },
    } = await api.fleet.extractResources(ship.symbol)
    log.info('agent', `Mining result: ${JSON.stringify(extraction.yield)}`)
    ship.cargo = cargo
    if (cargo.units < cargo.capacity) {
      log.info('agent', `Mining drone cooldown ${cooldown.remainingSeconds}s`)
      await wait(cooldown.remainingSeconds * 1000)
      await beginMining(ship)
    }
  }

  return {
    dockShip,
    refuelShip,
    navigateShip,
    sellGoods,
    beginMining,
  }
}
