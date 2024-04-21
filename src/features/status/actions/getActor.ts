import { EntityData } from '@mikro-orm/core'
import lodash from 'lodash'
import { Ship, ShipNavFlightMode, ShipType, TradeSymbol } from '../../../../api'
import { findOrCreateShip } from '../../../db/findOrCreateShip'
import { invariant } from '../../../invariant'
import { log } from '../../../logging/configure-logging'
import { getEntityManager } from '../../../orm'
import { ShipAction, ShipEntity } from '../../ship/ship.entity'
import { getPages, updateWaypoint } from '../../waypoints/getWaypoints'
import { getGraph, getShortestPath } from '../../waypoints/pathfinding'
import { WaypointEntity } from '../../waypoints/waypoint.entity'
import { AgentEntity } from '../agent.entity'
import { apiFactory } from '../apiFactory'
import { writeContract, writeCredits, writeExtraction, writeMyMarketTransaction, writeShipyardTransaction } from '../influxWrite'
import { getClosest } from '../utils/getClosest'
import { shipArriving, shipCooldownRemaining } from '../utils/getCurrentFlightTime'
import { getSellLocations } from '../utils/getSellLocations'
import { updateAgentFactory } from './getAgent'

export const getActor = async (
  agent: AgentEntity,
  api: ReturnType<typeof apiFactory>,
  waypoints: WaypointEntity[],
  ships: ShipEntity[],
) => {
  const { token, resetDate } = agent
  const updateAgent = updateAgentFactory(token, resetDate)
  async function updateShip(ship: ShipEntity, data: EntityData<ShipEntity>) {
    await getEntityManager().fork().nativeUpdate(ShipEntity, { symbol: ship.symbol, resetDate }, data)
    Object.entries(data).forEach(([key, value]) => {
      // @ts-expect-error bad type
      ship[key as keyof Ship] = value
    })
  }

  const getOrAcceptContract = async (commandShip: ShipEntity) => {
    await dockShip(commandShip)

    const contracts = await getPages((page, count) => api.contracts.getContracts(page, count))

    const unfulfilled = contracts.filter((c) => !c.fulfilled)

    if (unfulfilled.length === 0) {
      log.info('ship', 'Requesting new contract')
      await api.fleet.negotiateContract(commandShip.symbol)
    } else {
      invariant(unfulfilled.length === 1, 'Expected exactly one contract')

      const firstContract = unfulfilled[0]
      if (firstContract.accepted) {
        await updateAgent(agent, { contract: firstContract })
        return
      }
      log.info(
        'agent',
        `Accepting contract, on accepted: $${firstContract.terms.payment.onAccepted.toLocaleString()}, on fullfillment: $${firstContract.terms.payment.onFulfilled.toLocaleString()}`,
      )
      const {
        data: {
          data: {
            agent: { accountId, symbol, ...rest },
            contract,
          },
        },
      } = await api.contracts.acceptContract(firstContract.id)
      writeContract(contract, resetDate, agent.data.symbol)
      writeCredits({ symbol, credits: rest.credits }, resetDate)
      await updateAgent(agent, { contract, ...rest })
    }
  }

  const dockShip = async (ship: ShipEntity) => {
    const {
      data: {
        data: { nav },
      },
    } = await api.fleet.dockShip(ship.symbol)
    await updateShip(ship, { nav })
  }

  const refuelShip = async (ship: ShipEntity) => {
    if (ship.fuel.capacity > 0 && ship.fuel.current < ship.fuel.capacity) {
      await dockShip(ship)
      const {
        data: {
          data: { fuel, transaction, agent: data },
        },
      } = await api.fleet.refuelShip(ship.symbol)
      ship.fuel = fuel

      writeMyMarketTransaction(resetDate, transaction, data)
      await updateAgent(agent, { data })

      log.info(
        'ship',
        `${ship.label} refueled for $${transaction.totalPrice.toLocaleString()}, now have $${agent.data?.credits.toLocaleString()}`,
      )
      await updateShip(ship, { fuel })
    }
  }

  const scanWaypoint = async (resetDate: string, symbol: string) => {
    const em = getEntityManager()
    const waypoint = await em.getRepository(WaypointEntity).findOneOrFail({ resetDate, symbol })
    await updateWaypoint(waypoint, agent, api)
    await em.persistAndFlush(waypoint)
    const index = waypoints.findIndex((w) => w.symbol === symbol)
    waypoints[index] = waypoint
  }

  const orbitShip = async (ship: ShipEntity) => {
    const {
      data: {
        data: { nav },
      },
    } = await api.fleet.orbitShip(ship.symbol)
    await updateShip(ship, { nav })
  }

  const setFlightMode = async (ship: ShipEntity, flightMode: ShipNavFlightMode) => {
    if (ship.nav.flightMode === flightMode) return
    const {
      data: { data: nav },
    } = await api.fleet.patchShipNav(ship.symbol, { flightMode })
    await updateShip(ship, { nav })
  }

  const navigate = async (ship: ShipEntity, target: WaypointEntity) => {
    if (ship.nav.status === 'DOCKED') {
      await orbitShip(ship)
    }
    const {
      data: {
        data: { nav, fuel },
      },
    } = await api.fleet.navigateShip(ship.symbol, { waypointSymbol: target.symbol })
    await updateShip(ship, { nav, fuel })
    const { distance } = shipArriving(ship)
    log.info('ship', `${ship.label} will arrive at ${target.label} ${distance}`)
  }

  const navigateShip = async (ship: ShipEntity, target: WaypointEntity) => {
    if (ship.nav.waypointSymbol !== target.symbol) {
      await setFlightMode(ship, 'CRUISE')
      const { graph } = getGraph(waypoints)
      const route = getShortestPath(graph, ship.nav.waypointSymbol, target.symbol, ship)
      const from = waypoints.find((w) => w.symbol === ship.nav.waypointSymbol)!
      invariant(route.length, `Expected to find a route from ${from.label} to ${target.label}`)
      const fuelNeeded = route[0].fuelNeeded

      log.info(
        'ship',
        `${ship.label} will navigate ${from.label} -> ${route.map((r) => r.to.label).join(' -> ')}, fuel requirement: ${fuelNeeded}, fuel: ${ship.fuel.current}`,
      )

      if (fuelNeeded > ship.fuel.current) {
        const currentWaypointHasFuel = waypoints
          .find((x) => x.symbol === ship.nav.waypointSymbol)!
          .tradeGoods?.find((x) => x.symbol === 'FUEL')
        if (!currentWaypointHasFuel) {
          log.warn('ship', `${ship.label} has no fuel, will drift to ${route[0].to.label}`)
          await setFlightMode(ship, 'DRIFT')
          await navigate(ship, route[0].to)
          return
        }
        await refuelShip(ship)
      }
      if (ship.fuel.capacity < fuelNeeded) {
        log.warn('ship', `${ship.label} cannot reach ${route[0].to.label}, will drift`)
        await setFlightMode(ship, 'DRIFT')
        await navigateShip(ship, route[0].to)
      } else {
        await navigate(ship, route[0].to)
      }
    }
  }

  const jettisonUnsellable = async (markets: WaypointEntity[], ship: ShipEntity, keep: TradeSymbol[]) => {
    const locations = await getSellLocations(markets, ship, keep)
    const unsellable = locations.filter((p) => !p.bestMarket)
    await Promise.all(
      unsellable.map(async ({ symbol, units }) => {
        log.warn('ship', `${ship.label} is jettisoning ${units}x${symbol} because it is unsellable`)
        const {
          data: {
            data: { cargo },
          },
        } = await api.fleet.jettison(ship.symbol, { symbol, units })
        await updateShip(ship, { cargo })
      }),
    )
  }

  const toKeep = (keep: TradeSymbol[]) => [...keep, agent.contract?.terms.deliver?.[0].tradeSymbol].filter(Boolean) as TradeSymbol[]

  const jettisonUnwanted = async (ship: ShipEntity, keep: TradeSymbol[]) => {
    const excessCargo = ship.cargo.inventory.filter((p) => !toKeep(keep).includes(p.symbol))
    await Promise.all(
      excessCargo.map(async ({ symbol, units }) => {
        log.warn('ship', `${ship.label} is jettisoning ${units}x${symbol} because it is unwanted`)
        const {
          data: {
            data: { cargo },
          },
        } = await api.fleet.jettison(ship.symbol, { symbol, units })
        await updateShip(ship, { cargo })
      }),
    )
  }

  const transferGoods = async (from: ShipEntity, to: ShipEntity, units: number, wanted: TradeSymbol[]) => {
    if (from.nav.status !== to.nav.status) {
      if (from.nav.status === 'DOCKED') {
        await dockShip(to)
      } else if (from.nav.status === 'IN_ORBIT') {
        await orbitShip(to)
      } else {
        throw new Error(`From ship, ${from.label}, is unexpectedly in transit`)
      }
    }

    const toTransfer = from.cargo.inventory.find((p) => toKeep(wanted).includes(p.symbol))
    invariant(toTransfer, `Expected ${from.label} to have ${toKeep(wanted).join(', ')} to transfer`)

    const payload: Parameters<typeof api.fleet.transferCargo>[1] = {
      shipSymbol: to.symbol,
      tradeSymbol: toTransfer.symbol,
      units: Math.min(units, toTransfer.units),
    }

    const {
      data: {
        data: { cargo },
      },
    } = await api.fleet.transferCargo(from.symbol, payload)

    log.info('ship', `${from.label} transferred ${payload.units}x${payload.tradeSymbol} to ${to.label}`)

    await updateShip(from, { cargo })
    const toShipCargo = await api.fleet.getMyShip(to.symbol)
    await updateShip(to, { cargo: toShipCargo.data.data.cargo })
  }

  const deliverContractGoods = async (ship: ShipEntity) => {
    log.info('ship', `${ship.label} will deliver goods`)
    invariant(agent.contract, 'Expected agent to have a contract')
    invariant(agent.contract.terms.deliver, 'Expected contract to have deliver terms')
    invariant(agent.contract.terms.deliver.length === 1, 'Expected contract to have exactly one deliver term')
    const deliver = agent.contract.terms.deliver[0]
    const destination = waypoints.find((w) => w.symbol === deliver.destinationSymbol)
    invariant(destination, `Expected waypoint ${deliver.destinationSymbol} to exist`)
    const contractUnitBalance = deliver.unitsRequired - deliver.unitsFulfilled
    const units = Math.min(contractUnitBalance, ship.cargo.inventory.find((p) => p.symbol === deliver.tradeSymbol)?.units || 0)
    invariant(units > 0, `Expected ${ship.label} to have ${deliver.tradeSymbol} to deliver`)

    if (ship.nav.waypointSymbol !== destination.symbol) {
      await navigateShip(ship, destination)
      return
    }

    await dockShip(ship)

    const {
      data: {
        data: { cargo, contract },
      },
    } = await api.contracts.deliverContract(agent.contract.id, { shipSymbol: ship.symbol, tradeSymbol: deliver.tradeSymbol, units })
    log.info('ship', `${ship.label} delivered ${units} of ${deliver.tradeSymbol}`)
    await updateShip(ship, { cargo })
    await updateAgent(agent, { contract })
  }

  const purchaseGoods = async (ship: ShipEntity, tradeSymbol: TradeSymbol, units: number) => {
    log.info('ship', `${ship.label} will purchase goods`)
    await dockShip(ship)
    const {
      data: {
        data: { cargo, transaction, agent: data },
      },
    } = await api.fleet.purchaseCargo(ship.symbol, { symbol: tradeSymbol, units })
    writeMyMarketTransaction(resetDate, transaction, data)
    log.info(
      'ship',
      `${ship.label} purchased ${transaction.units} x ${transaction.tradeSymbol} @ $${transaction.totalPrice.toLocaleString()}, now have $${data.credits.toLocaleString()}`,
    )
    await updateAgent(agent, { data })
    await updateShip(ship, { cargo })
  }

  const sellGoods = async (ship: ShipEntity, keep: TradeSymbol[]) => {
    log.info('ship', `${ship.label} will sell goods`)
    const locations = await getSellLocations(waypoints, ship, keep)

    const sellableHere = locations.filter((p) => p.bestMarket && p.bestMarket.symbol === ship.nav.waypointSymbol)

    if (sellableHere.length) {
      await dockShip(ship)
      await Promise.all(
        sellableHere.map(async (p) => {
          const market = p.bestMarket.tradeGoods?.find((x) => x.symbol === p.symbol)!
          const units = Math.min(market.tradeVolume, p.units)
          log.info('ship', `${ship.label} is selling ${units} of ${p.symbol} at ${p.bestMarket!.label}`)
          const {
            data: {
              data: { cargo, transaction, agent: data },
            },
          } = await api.fleet.sellCargo(ship.symbol, {
            symbol: p.symbol,
            units: units,
          })
          writeMyMarketTransaction(resetDate, transaction, data)
          log.info(
            'ship',
            `${ship.label} sold ${transaction.units} of ${transaction.tradeSymbol} for $${transaction.totalPrice.toLocaleString()}, now have $${data.credits.toLocaleString()}`,
          )
          await updateAgent(agent, { data })
          await updateShip(ship, { cargo })
        }),
      )
    } else {
      const closest = getClosest(
        locations.filter((p) => p.bestMarket).map((p) => p.bestMarket!),
        ship.nav.route.destination,
      )
      await navigateShip(ship, closest!)
    }
  }

  const wait = async (delayMs: number) => new Promise((resolve) => setTimeout(resolve, delayMs))

  const findClosestUnvisitedMarket = (ship: ShipEntity) => {
    const markets = waypoints.filter((x) => x.exchange.filter((e) => e !== 'FUEL').length || x.imports.length || x.exports.length)
    const unvisitedMarkets = markets.filter((x) => !x.tradeGoods)
    const shipyards = waypoints.filter((x) => x.shipyard)
    const unvisitedShipyards = shipyards.filter((x) => !x.ships?.length)
    const unvisited = [...unvisitedMarkets, ...unvisitedShipyards]
    if (!unvisited.length) return
    log.info('ship', `${ship.label} There are ${unvisited.length} unvisited markets or shipyards`)
    return getClosest(unvisited, ship.nav.route.destination)
  }

  const findTradeSymbol = async (tradeSymbol: TradeSymbol) => {
    const exports = waypoints.filter((p) => p.exports.includes(tradeSymbol))
    const exchanges = waypoints.filter((p) => p.exchange.includes(tradeSymbol))
    const imports = waypoints.filter((p) => p.imports.includes(tradeSymbol))
    return lodash.orderBy(
      [...exports, ...exchanges, ...imports],
      (x) => x.tradeGoods?.find((g) => g.symbol === tradeSymbol)?.purchasePrice,
      'asc',
    )[0]
  }

  const scanMarketIfNeccessary = async (ship: ShipEntity) => {
    const hasSatelite = ships.find(
      (x) => x.registration.role === 'SATELLITE' && x.nav.waypointSymbol === ship.nav.waypointSymbol && x.nav.status !== 'IN_TRANSIT',
    )
    if (hasSatelite) return
    await scanWaypoint(resetDate, ship.nav.waypointSymbol)
  }

  const fulfillContract = async () => {
    invariant(agent.contract, 'Expected agent to have a contract')
    const {
      data: {
        data: { agent: data, contract },
      },
    } = await api.contracts.fulfillContract(agent.contract.id)

    writeCredits(data, resetDate)
    await updateAgent(agent, { contract, data })

    log.info('agent', `Fulfilled contract, current credits: $${agent.data?.credits.toLocaleString()}`)
  }

  const beginMining = async (ship: ShipEntity, keep: TradeSymbol[]) => {
    await orbitShip(ship)
    const { seconds, distance } = shipCooldownRemaining(ship)
    if (seconds > 0) {
      log.info('ship', `${ship.label} is on cooldown and will begin mining ${distance}`)
      await wait(seconds * 1000)
    }

    const {
      data: {
        data: { cooldown, cargo, extraction },
      },
    } = await api.fleet.extractResources(ship.symbol)
    log.info('ship', `${ship.label} mining result: is ${extraction.yield.units}x${extraction.yield.symbol}`)
    writeExtraction(agent, extraction)
    await updateShip(ship, { cargo, cooldown })
    await jettisonUnwanted(ship, toKeep(keep))
    if (cargo.units < cargo.capacity) {
      await beginMining(ship, toKeep(keep))
    }
  }

  const purchaseShip = async (buyer: ShipEntity, shipType: ShipType) => {
    const shipyard = waypoints.find((x) => x.shipyard?.shipTypes.map((s) => s.type).includes(shipType))
    invariant(shipyard, `Expected to find a waypoint for the ${shipType} shipyard`)
    if (buyer.nav.route.destination.symbol !== shipyard.symbol) {
      await navigateShip(buyer, shipyard)
      return
    }

    const {
      data: {
        data: { ship, agent: data, transaction },
      },
    } = await api.fleet.purchaseShip({ shipType, waypointSymbol: shipyard.symbol })
    updateAgent(agent, { data })
    log.info('agent', `Purchased 1 x ${transaction.shipType} @ $${transaction.price.toLocaleString()}`)
    writeShipyardTransaction(resetDate, transaction, data)
    const entity = await findOrCreateShip(resetDate, ship)
    ships.push(entity)
  }

  const updateShipAction = async (ship: ShipEntity, action: ShipAction) => {
    ship.action = action
    log.info('ship', `${ship.label} will now ${ship.action.type}`)
    await getEntityManager().fork().persistAndFlush(ship)
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
    purchaseShip,
    deliverContractGoods,
    fulfillContract,
    updateShipAction,
    transferGoods,
    jettisonUnwanted,
    scanWaypoint,
    findTradeSymbol,
    purchaseGoods,
    scanMarketIfNeccessary,
    findClosestUnvisitedMarket,
  }
}
