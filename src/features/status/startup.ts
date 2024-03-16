import { lineLength } from 'geometric'
import { Configuration, ContractsApiFactory, DefaultApiFactory, FleetApiFactory, SystemsApiFactory } from '../../../api'
import { log } from '../../logging/configure-logging'
import { getEntityManager } from '../../orm'
import { Agent } from './agent.entity'

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

export async function startup() {
  const {
    data: { resetDate },
  } = await DefaultApiFactory().getStatus()
  const agent = await findOrCreateAgent(resetDate)
  const fleetApi = FleetApiFactory(new Configuration({ accessToken: agent.token }))
  const {
    data: { data: myShips },
  } = await fleetApi.getMyShips()
  const contracts = await ContractsApiFactory(new Configuration({ accessToken: agent.token })).getContracts()
  const commandShip = myShips[0]
  const systemsApi = SystemsApiFactory(new Configuration({ accessToken: agent.token }))
  const {
    data: { data: waypoint },
  } = await systemsApi.getWaypoint(commandShip.nav.systemSymbol, commandShip.nav.waypointSymbol)
  const {
    data: { data: orbital },
  } = await systemsApi.getWaypoint(commandShip.nav.systemSymbol, waypoint.orbitals[0].symbol)
  const contract = contracts.data.data[0]
  if (!contract.accepted) {
    await ContractsApiFactory(new Configuration({ accessToken: agent.token })).acceptContract(contract.id)
  }

  const {
    data: { data: shipyards },
    //@ts-expect-error because it is wrong
  } = await systemsApi.getSystemWaypoints(commandShip.nav.systemSymbol, undefined, 20, undefined, { traits: ['SHIPYARD'] })
  const closestShipyard = getClosest(shipyards, waypoint)
  const shipyard = await systemsApi.getShipyard(commandShip.nav.systemSymbol, myShips[1].nav.waypointSymbol)
  if (myShips.length === 2) {
    await fleetApi.purchaseShip({ shipType: 'SHIP_MINING_DRONE', waypointSymbol: shipyard.data.data.symbol })
  }

  await new Promise(() => {})
}
