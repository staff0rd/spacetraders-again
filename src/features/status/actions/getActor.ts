import { EntityData } from '@mikro-orm/core'
import { lineLength } from 'geometric'
import { Ship } from '../../../../api'
import { invariant } from '../../../invariant'
import { log } from '../../../logging/configure-logging'
import { getEntityManager } from '../../../orm'
import { ShipEntity } from '../../ship/ship.entity'
import { AgentEntity } from '../agent.entity'
import { apiFactory } from '../apiFactory'
import { getClosest } from '../utils/getClosest'
import { getCurrentFlightTime } from '../utils/getCurrentFlightTime'
import { getSellLocations } from '../utils/getSellLocations'
import { Waypoint as MarketData, Waypoint } from '../waypoint.entity'
import { updateAgentFactory } from './getAgent'

export const getActor = async ({ token, resetDate }: AgentEntity, api: ReturnType<typeof apiFactory>) => {
  const updateAgent = updateAgentFactory(token, resetDate)
  async function updateShip(ship: Ship, data: EntityData<ShipEntity>) {
    await getEntityManager().fork().nativeUpdate(ShipEntity, { symbol: ship.symbol, resetDate }, data)
    Object.entries(data).forEach(([key, value]) => {
      // @ts-expect-error bad type
      ship[key as keyof Ship] = value
    })
  }

  const getOrAcceptContract = async (agent: AgentEntity) => {
    const {
      data: { data: contracts },
    } = await api.contracts.getContracts()

    invariant(contracts.length === 1, 'Expected exactly one contract')

    const firstContract = contracts[0]
    if (firstContract.accepted) {
      await updateAgent(agent, { contract: firstContract })
      return
    }

    const {
      data: {
        data: {
          agent: { accountId, symbol, ...rest },
          contract,
        },
      },
    } = await api.contracts.acceptContract(firstContract.id)
    await updateAgent(agent, { contract, ...rest })
  }

  const dockShip = async (ship: Ship) => {
    const {
      data: {
        data: { nav },
      },
    } = await api.fleet.dockShip(ship.symbol)
    await updateShip(ship, { nav })
  }

  const refuelShip = async (ship: Ship) => {
    if (ship.fuel.current < ship.fuel.capacity) {
      await dockShip(ship)
      const {
        data: {
          data: { fuel, transaction, agent },
        },
      } = await api.fleet.refuelShip(ship.symbol)
      ship.fuel = fuel
      log.info(
        'agent',
        `Refueled ship ${ship.symbol} for $${transaction.totalPrice.toLocaleString()}, now have $${agent.credits.toLocaleString()}`,
      )
      await updateShip(ship, { fuel })
    }
  }

  const orbitShip = async (ship: Ship) => {
    const {
      data: {
        data: { nav },
      },
    } = await api.fleet.orbitShip(ship.symbol)
    await updateShip(ship, { nav })
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
            data: { nav, fuel },
          },
        } = await api.fleet.navigateShip(ship.symbol, { waypointSymbol: target.symbol })
        await updateShip(ship, { nav, fuel })
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
        await updateShip(ship, { cargo })
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
              data: { cargo, transaction, agent },
            },
          } = await api.fleet.sellCargo(ship.symbol, {
            symbol: p.symbol,
            units: p.units,
          })
          log.info(
            'agent',
            `Sold ${transaction.units} of ${transaction.tradeSymbol} for $${transaction.totalPrice.toLocaleString()}, now have $${agent.credits.toLocaleString()}`,
          )
          await updateShip(ship, { cargo })
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
    await updateShip(ship, { cargo, cooldown })
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
    getOrAcceptContract,
  }
}
