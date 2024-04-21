import { init } from '../init'
import { getBestTradeRoute } from '../trade/getBestTradeRoute'
import { getGraph } from './pathfinding'

export async function routeTest() {
  const { waypoints, commandShip, act } = await init(false)
  const { graph } = getGraph(waypoints)
  const result = await getBestTradeRoute(commandShip, waypoints, true)
}
