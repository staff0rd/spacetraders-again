import { EntityData } from '@mikro-orm/core'
import { lineLength } from 'geometric'
import { Ship, Shipyard } from '../../../../api'
import { findOrCreateShip } from '../../../db/findOrCreateShip'
import { invariant } from '../../../invariant'
import { log } from '../../../logging/configure-logging'
import { getEntityManager } from '../../../orm'
import { ShipEntity } from '../../ship/ship.entity'
import { AgentEntity } from '../agent.entity'
import { apiFactory } from '../apiFactory'
import { writeCredits, writeMarketTransaction } from '../influxWrite'
import { getClosest } from '../utils/getClosest'
import { shipArriving, shipCooldownRemaining } from '../utils/getCurrentFlightTime'
import { getSellLocations } from '../utils/getSellLocations'
import { WaypointEntity } from '../waypoint.entity'
import { IWaypoint } from './IWaypoint'
import { updateAgentFactory } from './getAgent'

export const getActor = async (agent: AgentEntity, api: ReturnType<typeof apiFactory>) => {
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
    if (ship.fuel.current < ship.fuel.capacity) {
      await dockShip(ship)
      const {
        data: {
          data: { fuel, transaction, agent: data },
        },
      } = await api.fleet.refuelShip(ship.symbol)
      ship.fuel = fuel

      writeMarketTransaction(resetDate, transaction, data)
      await updateAgent(agent, { data })

      log.info(
        'ship',
        `${ship.label} refueled for $${transaction.totalPrice.toLocaleString()}, now have $${agent.data?.credits.toLocaleString()}`,
      )
      await updateShip(ship, { fuel })
    }
  }

  const orbitShip = async (ship: ShipEntity) => {
    const {
      data: {
        data: { nav },
      },
    } = await api.fleet.orbitShip(ship.symbol)
    await updateShip(ship, { nav })
  }

  const navigateShip = async (ship: ShipEntity, target: IWaypoint, otherWaypoints: WaypointEntity[]) => {
    await refuelShip(ship)
    if (ship.nav.route.destination.symbol !== target.symbol) {
      const distance = lineLength([
        [ship.nav.route.destination.x, ship.nav.route.destination.y],
        [target.x, target.y],
      ])
      const fuelNeeded = Math.round(distance)
      log.info(
        'ship',
        `${ship.label} will navigate to ${target.symbol}, distance: ${distance}, fuel requirement: ${fuelNeeded}, fuel: ${ship.fuel.current}`,
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
        log.warn('ship', `${ship.label} cannot reach ${target.symbol}, will navigate to ${byDistanceToTarget[0].w.symbol}`)
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
        const { distance } = shipArriving(ship)
        log.info('ship', `${ship.label} will arrive at ${target.symbol} ${distance}`)
      }
    }
  }

  const jettisonUnsellable = async (markets: WaypointEntity[], ship: ShipEntity, dontSellSymbol: string) => {
    const locations = await getSellLocations(markets, ship, dontSellSymbol)
    const unsellable = locations.filter((p) => !p.closestMarket)
    await Promise.all(
      unsellable.map(async ({ symbol, units }) => {
        log.warn('ship', `${ship.label} is jettisoning ${units}x${symbol}`)
        const {
          data: {
            data: { cargo },
          },
        } = await api.fleet.jettison(ship.symbol, { symbol, units })
        await updateShip(ship, { cargo })
      }),
    )
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
      await navigateShip(ship, destination, waypoints)
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

  const sellGoods = async (markets: WaypointEntity[], ship: ShipEntity, dontSellSymbol: string) => {
    log.info('ship', `${ship.label} will sell goods`)
    const locations = await getSellLocations(markets, ship, dontSellSymbol)

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
          writeMarketTransaction(resetDate, transaction, agent)
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
      await navigateShip(ship, closest!, markets)
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

  const beginMining = async (ship: ShipEntity) => {
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
    await updateShip(ship, { cargo, cooldown })
    if (cargo.units < cargo.capacity) {
      await beginMining(ship)
    }
  }
  const getOrPurchaseMiningDrone = async (ships: ShipEntity[], shipyard: Shipyard) => {
    if (ships.length === 2) {
      const {
        data: {
          data: { ship, agent: data, transaction },
        },
      } = await api.fleet.purchaseShip({ shipType: 'SHIP_MINING_DRONE', waypointSymbol: shipyard.symbol })
      updateAgent(agent, { data })
      // TODO: write shipyard transaction
      const entity = await findOrCreateShip(resetDate, ship)
      ships.push(entity)
      return entity
    } else {
      return ships.find((s) => s.frame.symbol === 'FRAME_DRONE')!
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
    getOrPurchaseMiningDrone,
    deliverGoods,
    fulfillContract,
  }
}
