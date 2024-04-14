import createGraph from 'ngraph.graph'
import { aStar } from 'ngraph.path'
import { ShipNavFlightMode } from '../../../api'
import { ShipEntity } from '../ship/ship.entity'
import { WaypointEntity } from './waypoint.entity'

const addLink = (a: WaypointEntity, b: WaypointEntity, graph: ReturnType<typeof getGraph>['graph']) => {
  const existingLink = graph.getLink(a.symbol, b.symbol)
  const aNode = graph.getNode(a.symbol)
  const bNode = graph.getNode(b.symbol)
  if (!existingLink && aNode && bNode) graph.addLink(a.symbol, b.symbol)
}

export const getGraph = (waypoints: WaypointEntity[]) => {
  const graph = createGraph()
  waypoints.forEach((waypoint) => {
    graph.addNode(waypoint.symbol, waypoint)
  })

  waypoints.forEach((a) => {
    waypoints.forEach((b) => {
      if (a !== b) addLink(a, b, graph)
    })
  })

  return { graph }
}

type Route = {
  from: WaypointEntity
  to: WaypointEntity
  fuelNeeded: number
}

export const getShortestPath = (graph: ReturnType<typeof getGraph>['graph'], from: string, to: string, ship: ShipEntity) => {
  const pathFinder = aStar<WaypointEntity, WaypointEntity>(graph, {
    distance(fromNode, toNode) {
      const distance = distanceWaypoint(fromNode.data, toNode.data)
      const fuelCost = getFuelNeeded(fromNode.data, toNode.data, ship)
      if (fuelCost > ship.fuel.capacity) return Infinity
      return distance
    },
    heuristic(fromNode, toNode) {
      const dx = fromNode.data.x - toNode.data.x
      const dy = fromNode.data.y - toNode.data.y
      return Math.sqrt(dx * dx + dy * dy)
    },
  })
  const path = pathFinder.find(from, to).reverse()

  const route: Route[] = []

  path.forEach((p, ix) => {
    if (ix) {
      const from = path[ix - 1].data
      const to = p.data
      const fuelNeeded = getFuelNeeded(from, to, ship)
      //const fuelAvailable = fuelCache[from.symbol]?.available ?? 0
      route.push({
        from,
        to,
        fuelNeeded,
      })
    }
  })
  return route
}

function getFuelNeeded(from: WaypointEntity, to: WaypointEntity, ship: ShipEntity) {
  if (ship.fuel.capacity === 0) return 0 // satelites don't appear to need fuel
  const distance = distanceWaypoint(from, to)
  switch (ship.nav.flightMode) {
    case ShipNavFlightMode.Cruise:
    case ShipNavFlightMode.Stealth:
      return Math.max(1, Math.round(distance))
    case ShipNavFlightMode.Drift:
      return 1
    case ShipNavFlightMode.Burn:
      return Math.max(1, 2 * Math.round(distance))
    default:
      throw new Error(`Unknown flight mode: ${ship.nav.flightMode}`)
  }
}

function getNavigationMultipler(ship: ShipEntity) {
  switch (ship.nav.flightMode) {
    case ShipNavFlightMode.Cruise:
      return 25
    case ShipNavFlightMode.Stealth:
      return 30
    case ShipNavFlightMode.Drift:
      return 250
    case ShipNavFlightMode.Burn:
      return 12.5
    default:
      throw new Error(`Unknown flight mode: ${ship.nav.flightMode}`)
  }
}

export function getTravelTime(from: WaypointEntity, to: WaypointEntity, ship: ShipEntity) {
  const distance = distanceWaypoint(from, to)
  return Math.round(Math.round(Math.max(1, distance)) * (getNavigationMultipler(ship) / ship.engine.speed) + 15)
}

export function distanceWaypoint(from: WaypointEntity, to: WaypointEntity) {
  return distancePoint(from, to)
}

type Point = { x: number; y: number }

export const distancePoint = (p1: Point, p2: Point) => {
  return distance(p1.x, p1.y, p2.x, p2.y)
}

const distance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2)
}
