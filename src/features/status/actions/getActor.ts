import { lineLength } from 'geometric'
import { Ship } from '../../../../api'
import { log } from '../../../logging/configure-logging'
import { apiFactory } from '../apiFactory'
import { getClosest } from '../utils/getClosest'
import { getCurrentFlightTime } from '../utils/getCurrentFlightTime'
import { getSellLocations } from '../utils/getSellLocations'
import { Waypoint as MarketData, Waypoint } from '../waypoint.entity'

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

  const navigateShip = async (ship: Ship, target: { symbol: string; x: number; y: number }, otherWaypoints: Waypoint[]) => {
    await refuelShip(ship)
    if (ship.nav.route.destination.symbol !== target.symbol) {
      const distance = lineLength([
        [ship.nav.route.destination.x, ship.nav.route.destination.y],
        [target.x, target.y],
      ])
      const fuelNeeded = Math.round(distance)
      log.info(
        'agent',
        `Navigating ship ${ship.symbol} to ${target.symbol}, distance: ${distance}, fuel requirement: ${fuelNeeded}, fuel: ${ship.fuel.current}`,
      )
      if (ship.fuel.capacity < fuelNeeded) {
        const reachableWaypoints = otherWaypoints.filter((w) => {
          const distance = lineLength([
            [ship.nav.route.destination.x, ship.nav.route.destination.y],
            [w.x, w.y],
          ])
          return ship.fuel.capacity >= distance
        })
        const byDistanceToTarget = reachableWaypoints
          .map((w) => ({
            w,
            distance: lineLength([
              [w.x, w.y],
              [target.x, target.y],
            ]),
          }))
          .sort((a, b) => a.distance - b.distance)
        log.warn('agent', `Ship ${ship.symbol} cannot reach ${target.symbol}, will navigate to ${byDistanceToTarget[0].w.symbol}`)
        await navigateShip(ship, byDistanceToTarget[0].w, otherWaypoints)
      } else {
        if (ship.nav.status === 'DOCKED') {
          await orbitShip(ship)
        }
        const {
          data: {
            data: { nav },
          },
        } = await api.fleet.navigateShip(ship.symbol, { waypointSymbol: target.symbol })
        ship.nav = nav
        const flightTime = getCurrentFlightTime(ship)
        log.info('agent', `Ship will arrive at ${target.symbol} in ${flightTime}s`)
      }
    }
  }

  const jettisonUnsellable = async (markets: MarketData[], ship: Ship, dontSellSymbol: string) => {
    const locations = await getSellLocations(markets, ship, dontSellSymbol)
    const unsellable = locations.filter((p) => !p.closestMarket)
    await Promise.all(
      unsellable.map(async ({ symbol, units }) => {
        log.warn('agent', `Jettisoning ${units}x${symbol}`)
        const {
          data: {
            data: { cargo },
          },
        } = await api.fleet.jettison(ship.symbol, { symbol, units })
        ship.cargo = cargo
      }),
    )
  }

  const sellGoods = async (markets: MarketData[], ship: Ship, dontSellSymbol: string) => {
    log.info('agent', 'Will sell goods')
    const locations = await getSellLocations(markets, ship, dontSellSymbol)

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
      await navigateShip(ship, closest!, markets)
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
    jettisonUnsellable,
    wait,
  }
}
