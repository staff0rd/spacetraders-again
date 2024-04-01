import { EntityData } from '@mikro-orm/core'
import { lineLength } from 'geometric'
import { Ship, ShipType, TradeSymbol } from '../../../../api'
import { findOrCreateShip } from '../../../db/findOrCreateShip'
import { invariant } from '../../../invariant'
import { log } from '../../../logging/configure-logging'
import { getEntityManager } from '../../../orm'
import { ShipActionType, ShipEntity } from '../../ship/ship.entity'
import { AgentEntity } from '../agent.entity'
import { apiFactory } from '../apiFactory'
import { updateWaypoint } from '../getWaypoints'
import { writeCredits, writeExtraction, writeMyMarketTransaction, writeShipyardTransaction } from '../influxWrite'
import { getClosest } from '../utils/getClosest'
import { shipArriving, shipCooldownRemaining } from '../utils/getCurrentFlightTime'
import { getSellLocations } from '../utils/getSellLocations'
import { WaypointEntity } from '../waypoint.entity'
import { IWaypoint } from './IWaypoint'
import { updateAgentFactory } from './getAgent'

export const getActor = async (agent: AgentEntity, api: ReturnType<typeof apiFactory>, waypoints: WaypointEntity[]) => {
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

    const {
      data: { data: contracts },
    } = await api.contracts.getContracts()

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
      log.info('agent', `Accepting contract`)
      const {
        data: {
          data: {
            agent: { accountId, symbol, ...rest },
            contract,
          },
        },
      } = await api.contracts.acceptContract(firstContract.id)
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

  const updateCurrentWaypoint = async (ship: ShipEntity) => {
    const em = getEntityManager()
    const waypoint = waypoints.find((x) => x.symbol === ship.nav.waypointSymbol)
    invariant(waypoint, `Expected waypoint ${ship.nav.waypointSymbol} to exist`)
    await updateWaypoint(waypoint, agent, api)
  }

  const orbitShip = async (ship: ShipEntity) => {
    const {
      data: {
        data: { nav },
      },
    } = await api.fleet.orbitShip(ship.symbol)
    await updateShip(ship, { nav })
  }

  const navigateShip = async (ship: ShipEntity, target: IWaypoint) => {
    await refuelShip(ship)
    if (ship.nav.route.destination.symbol !== target.symbol) {
      const distance = lineLength([
        [ship.nav.route.destination.x, ship.nav.route.destination.y],
        [target.x, target.y],
      ])
      const fuelNeeded = ship.fuel.capacity === 0 ? 0 : Math.round(distance)
      log.info(
        'ship',
        `${ship.label} will navigate to ${target.symbol}, distance: ${distance.toLocaleString()}, fuel requirement: ${fuelNeeded}, fuel: ${ship.fuel.current}`,
      )
      if (ship.fuel.capacity < fuelNeeded) {
        const reachableWaypoints = waypoints.filter((w) => {
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
        log.warn('ship', `${ship.label} cannot reach ${target.symbol}, will navigate to ${byDistanceToTarget[0].w.symbol}`)
        await navigateShip(ship, byDistanceToTarget[0].w)
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
        const { distance } = shipArriving(ship)
        log.info('ship', `${ship.label} will arrive at ${target.symbol} ${distance}`)
      }
    }
  }

  const jettisonUnsellable = async (markets: WaypointEntity[], ship: ShipEntity, keep: TradeSymbol[]) => {
    const locations = await getSellLocations(markets, ship, keep)
    const unsellable = locations.filter((p) => !p.closestMarket)
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

  const deliverGoods = async (ship: ShipEntity) => {
    log.info('ship', `${ship.label} will deliver goods`)
    invariant(agent.contract, 'Expected agent to have a contract')
    invariant(agent.contract.terms.deliver, 'Expected contract to have deliver terms')
    invariant(agent.contract.terms.deliver.length === 1, 'Expected contract to have exactly one deliver term')
    const deliver = agent.contract.terms.deliver[0]
    const waypoints = await getEntityManager().findAll(WaypointEntity, { where: { resetDate } })
    const destination = waypoints.find((w) => w.symbol === deliver.destinationSymbol)
    invariant(destination, `Expected waypoint ${deliver.destinationSymbol} to exist`)
    const contractUnitBalance = deliver.unitsRequired - deliver.unitsFulfilled
    const units = Math.min(contractUnitBalance, ship.cargo.inventory.find((p) => p.symbol === deliver.tradeSymbol)?.units || 0)
    invariant(units > 0, `Expected ${ship.label} to have ${deliver.tradeSymbol} to deliver`)

    if (ship.nav.waypointSymbol !== destination.symbol) {
      await navigateShip(ship, destination)
      return
    }

    const {
      data: {
        data: { cargo, contract },
      },
    } = await api.contracts.deliverContract(agent.contract.id, { shipSymbol: ship.symbol, tradeSymbol: deliver.tradeSymbol, units })
    log.info('ship', `${ship.label} delivered ${units} of ${deliver.tradeSymbol}`)
    await updateShip(ship, { cargo })
    await updateAgent(agent, { contract })
  }

  const sellGoods = async (ship: ShipEntity, keep: TradeSymbol[]) => {
    log.info('ship', `${ship.label} will sell goods`)
    const locations = await getSellLocations(waypoints, ship, keep)

    const sellableHere = locations.filter((p) => p.closestMarket && p.closestMarket.symbol === ship.nav.waypointSymbol)

    if (sellableHere.length) {
      await dockShip(ship)
      await Promise.all(
        sellableHere.map(async (p) => {
          log.info('ship', `${ship.label} is selling ${p.units} of ${p.symbol} at ${p.closestMarket!.symbol}`)
          const {
            data: {
              data: { cargo, transaction, agent },
            },
          } = await api.fleet.sellCargo(ship.symbol, {
            symbol: p.symbol,
            units: p.units,
          })
          writeMyMarketTransaction(resetDate, transaction, agent)
          log.info(
            'ship',
            `${ship.label} sold ${transaction.units} of ${transaction.tradeSymbol} for $${transaction.totalPrice.toLocaleString()}, now have $${agent.credits.toLocaleString()}`,
          )
          await updateShip(ship, { cargo })
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
      log.info('ship', `${ship.symbol} is on cooldown and will begin mining ${distance}`)
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

  const purchaseShip = async (buyer: ShipEntity, shipType: ShipType, ships: ShipEntity[]) => {
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
    log.info('agent', `Purchased ${transaction.shipType} for $${transaction.price.toLocaleString()}`)
    writeShipyardTransaction(resetDate, transaction, data)
    const entity = await findOrCreateShip(resetDate, ship)
    ships.push(entity)
  }

  const updateShipAction = async (ship: ShipEntity, action: ShipActionType) => {
    ship.action = { type: action }
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
    deliverGoods,
    fulfillContract,
    updateShipAction,
    transferGoods,
    jettisonUnwanted,
    updateCurrentWaypoint,
  }
}
