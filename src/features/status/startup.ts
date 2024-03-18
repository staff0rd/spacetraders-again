import { formatDistance } from 'date-fns'
import { lineLength } from 'geometric'
import { Configuration, ContractsApiFactory, DefaultApiFactory, Ship, SystemsApiFactory, Waypoint } from '../../../api'
import { invariant } from '../../invariant'
import { log } from '../../logging/configure-logging'
import { logError } from '../../logging/log-error'
import { getEntityManager } from '../../orm'
import { Agent } from './agent.entity'
import { apiFactory } from './apiFactory'

async function findOrCreateAgent(resetDate: string) {
  const em = getEntityManager()
  const agent = await em.findOne(Agent, { resetDate })
  if (!agent) {
    const symbol = Agent.generateSymbol()
    const {
      data: { data },
    } = await DefaultApiFactory().register({ faction: 'COSMIC', symbol })
    const newAgent = new Agent(resetDate, symbol, data.token)
    log.warn('agent', `Created new agent ${symbol}`)
    await em.persistAndFlush(newAgent)
    return newAgent
  }
  return agent
}

type Position = { x: number; y: number }

const getClosest = <T extends Position, K extends Position>(points: T[], origin: K): T => {
  let closest = points[0]
  let closestDistance = Infinity
  for (const object of points) {
    const distance = lineLength([
      [origin.x, origin.y],
      [object.x, object.y],
    ])
    if (distance < closestDistance) {
      closest = object
      closestDistance = distance
    }
  }
  return closest
}

const queryMarkets = async (systemsApi: ReturnType<typeof SystemsApiFactory>, waypoints: Waypoint[]) => {
  return Promise.all(
    waypoints.map(async (w) => {
      const {
        data: { data: market },
      } = await systemsApi.getMarket(w.systemSymbol, w.symbol)
      if (market.imports.length) log.info('agent', `Market ${w.symbol} imports ${market.imports.map((t) => t.symbol).join(', ')}.`)
      return market
    }),
  )
}

const findMarkets = async (systemsApi: ReturnType<typeof SystemsApiFactory>, systemSymbol: string, page = 1): Promise<Waypoint[]> => {
  const {
    data: { data: markets, meta },
    //@ts-expect-error because it is wrong
  } = await systemsApi.getSystemWaypoints(systemSymbol, page, 20, undefined, { traits: ['MARKETPLACE'] })
  if (meta.total <= page * 20) {
    return markets
  }
  return markets.concat(await findMarkets(systemsApi, systemSymbol, page + 1))
}

export async function startup() {
  const {
    data: { resetDate },
  } = await DefaultApiFactory().getStatus()
  const agent = await findOrCreateAgent(resetDate)

  const api = apiFactory(agent.token)
  const {
    data: { data: myShips },
  } = await api.fleet.getMyShips()
  const contracts = await ContractsApiFactory(new Configuration({ accessToken: agent.token })).getContracts()
  const commandShip = myShips[0]
  const {
    data: { data: waypoint },
  } = await api.systems.getWaypoint(commandShip.nav.systemSymbol, commandShip.nav.waypointSymbol)
  const {
    data: { data: market },
  } = await api.systems.getMarket(commandShip.nav.systemSymbol, commandShip.nav.waypointSymbol)
  const {
    data: { data: orbital },
  } = await api.systems.getWaypoint(commandShip.nav.systemSymbol, waypoint.orbitals[0].symbol)
  const contract = contracts.data.data[0]
  if (!contract.accepted) {
    await ContractsApiFactory(new Configuration({ accessToken: agent.token })).acceptContract(contract.id)
  }
  const desiredResource = contract.terms.deliver![0]

  const {
    data: { data: shipyards },
    //@ts-expect-error because it is wrong
  } = await api.systems.getSystemWaypoints(commandShip.nav.systemSymbol, undefined, 20, undefined, { traits: ['SHIPYARD'] })

  const markets = await findMarkets(api.systems, commandShip.nav.systemSymbol)
  const marketData = await queryMarkets(api.systems, markets)

  const closestShipyard = getClosest(shipyards, waypoint)
  const shipyard = await api.systems.getShipyard(commandShip.nav.systemSymbol, myShips[1].nav.waypointSymbol)

  const getOrPurchaseShip = async () => {
    if (myShips.length === 2) {
      const {
        data: {
          data: { ship },
        },
      } = await api.fleet.purchaseShip({ shipType: 'SHIP_MINING_DRONE', waypointSymbol: shipyard.data.data.symbol })
      return ship
    } else {
      return myShips.find((s) => s.frame.symbol === 'FRAME_DRONE')!
    }
  }

  const miningDrone = await getOrPurchaseShip()

  const {
    data: {
      data: [engineeredAteroid],
    },
  } = await api.systems.getSystemWaypoints(commandShip.nav.systemSymbol, undefined, 20, 'ENGINEERED_ASTEROID')

  const dockShip = async (ship: Ship) => {
    const {
      data: {
        data: { nav },
      },
    } = await api.fleet.dockShip(ship.symbol)
    ship.nav = nav
  }

  const refuelShip = async (ship: Ship) => {
    await dockShip(ship)
    const {
      data: {
        data: { fuel },
      },
    } = await api.fleet.refuelShip(ship.symbol)
    ship.fuel = fuel
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
      await makeDecision(ship)
    }
  }

  const beginMining = async (ship: Ship) => {
    try {
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
        setTimeout(() => beginMining(ship), cooldown.remainingSeconds * 1000)
      } else {
        await makeDecision(ship)
      }
    } catch (err) {
      logError('beginMining', err)
    }
  }

  const getSellLocations = async (ship: Ship) => {
    const excessCargo = ship.cargo.inventory.filter((item) => item.symbol !== desiredResource.tradeSymbol)
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

    sellLocations.forEach((location) =>
      log.info(
        'agent',
        `Will sell ${location.symbol} at ${location.closestMarket.symbol}, distance: ${lineLength([
          [ship.nav.route.destination.x, ship.nav.route.destination.y],
          [location.closestMarket.x, location.closestMarket.y],
        ])}`,
      ),
    )
    return sellLocations
  }

  const sellGoods = async (ship: Ship) => {
    log.info('agent', 'Will sell goods')
    const locations = await getSellLocations(ship)

    const sellableHere = locations.filter((p) => p.closestMarket.symbol === ship.nav.waypointSymbol)

    if (sellableHere.length) {
      await dockShip(ship)
      await Promise.all(
        sellableHere.map(async (p) => {
          log.info('agent', `Selling ${p.units} of ${p.symbol} at ${p.closestMarket.symbol}`)
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
      await makeDecision(ship)
    } else {
      const closest = getClosest(
        locations.map((p) => p.closestMarket),
        ship.nav.route.destination,
      )
      await navigateShip(ship, closest)
    }
  }

  const getFlightTime = (ship: Ship) => {
    const departure = new Date(ship.nav.route.departureTime)
    const arrival = new Date(ship.nav.route.arrival)

    const distance = formatDistance(arrival, new Date(), { addSuffix: true })
    log.info('agent', `Mining drone arrival ${distance} `)
    const flightTimeSeconds = (arrival.getTime() - departure.getTime()) / 1000
    const flightTimeFromNowSeconds = (arrival.getTime() - new Date().getTime()) / 1000
    return flightTimeFromNowSeconds
  }

  const makeDecision = async (ship: Ship) => {
    try {
      const arrival = getFlightTime(ship)
      if (arrival <= 0) {
        if (ship.fuel.current < ship.fuel.capacity) {
          await refuelShip(ship)
        }
        if (ship.nav.waypointSymbol === engineeredAteroid.symbol) {
          if (ship.cargo.units < ship.cargo.capacity) {
            await beginMining(ship)
          } else {
            await sellGoods(ship)
          }
        } else if (ship.cargo.inventory.filter((p) => p.symbol !== desiredResource.tradeSymbol).length > 0) {
          await sellGoods(ship)
        } else if (ship.cargo.inventory.find((p) => p.symbol === desiredResource.tradeSymbol)) {
          throw new Error('Not implemented - sell desired resource')
        } else {
          await navigateShip(ship, engineeredAteroid)
        }
      } else {
        log.warn('agent', `Mining drone is not yet in position. Waiting for arrival in ${arrival} seconds`)
        setTimeout(() => makeDecision(ship), arrival * 1000)
      }
    } catch (err) {
      logError('makeDecision', err)
    }
  }
  await makeDecision(miningDrone)

  await new Promise(() => {})
}
