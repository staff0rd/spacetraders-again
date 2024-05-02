import { init } from '../init'
import { getGraph, getShortestPath } from './pathfinding'

export async function routeTest() {
  const { waypoints, commandShip, api } = await init(false)
  const { graph } = getGraph(waypoints)
  const result = getShortestPath(graph, 'X1-ZQ60-J64', 'X1-ZQ60-C45', commandShip)
}
