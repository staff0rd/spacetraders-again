import { init } from '../init'
import { getGraph, getShortestPath } from './pathfinding'

export async function routeTest() {
  const { waypoints, commandShip, act } = await init(false)
  const { graph } = getGraph(waypoints)
  const result = getShortestPath(graph, commandShip.nav.waypointSymbol, 'X1-UD75-J60', commandShip)
}
