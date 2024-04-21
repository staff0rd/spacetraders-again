import { init } from '../init'
import { getBestTradeRoutes } from '../trade/getBestTradeRoute'
import { getGraph } from './pathfinding'

export async function routeTest() {
  const { waypoints, commandShip, act } = await init(false)
  const { graph } = getGraph(waypoints)
  const result = await getBestTradeRoutes(commandShip, waypoints, true)
}
