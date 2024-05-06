import { TradeSymbol } from '../../api'
import { getConfig } from '../../config'
import { invariant } from '../../invariant'
import { init } from '../init'
import { contractTraderLogicFactory } from '../ship/actors/contract-trading'
import { shuttleLogicFactory } from '../ship/actors/shuttle'
import { Supply } from '../ship/actors/supply'
import { systemReconLogicFactory } from '../ship/actors/system-recon'
import { ShipEntity } from '../ship/ship.entity'
import { decisionMaker } from './decisionMaker'
import { spawnShipWorkers } from './spawnShipWorkers'

export type Position = { x: number; y: number }

export async function startup() {
  const config = getConfig()

  const { act, waypoints, ships, commandShip, agent } = await init(config.strategy.scanOnStartup)

  const engineeredAsteroid = waypoints.find((x) => x.type === 'ENGINEERED_ASTEROID')
  invariant(engineeredAsteroid, 'Expected to find an engineered asteroid')

  const keep: TradeSymbol[] = ['IRON_ORE', 'ALUMINUM_ORE', 'COPPER_ORE']

  const supplyChainIgnore: Supply[] = [{ import: 'IRON_ORE', export: 'IRON' }]

  const shuttleLogic = shuttleLogicFactory(act, engineeredAsteroid, ships, keep)
  const contractTraderLogic = contractTraderLogicFactory(act)
  const systemReconLogic = systemReconLogicFactory(act)

  await spawnShipWorkers(agent, ships, waypoints, act, keep, supplyChainIgnore)

  await decisionMaker(commandShip, true, agent, act, async (ship: ShipEntity) => {
    if (await spawnShipWorkers(agent, ships, waypoints, act, keep, supplyChainIgnore, commandShip)) return

    if (await systemReconLogic(commandShip, agent)) return

    if (await contractTraderLogic(commandShip, agent)) return
    // const supplyLogic = supplyLogicFactory(act, engineeredAsteroid, ships, supplyChainIgnore[0])
    // if (await supplyLogic(commandShip, agent)) return

    await shuttleLogic(commandShip, agent)
  })
}
