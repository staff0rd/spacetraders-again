import { invariant } from '../../invariant'
import { WaypointEntity } from './waypoint.entity'

export function getEntineeredAsteroid(waypoints: WaypointEntity[]): WaypointEntity {
  const engineeredAsteroid = waypoints.find((x) => x.type === 'ENGINEERED_ASTEROID')
  invariant(engineeredAsteroid, 'Expected to find an engineered asteroid')
  return engineeredAsteroid
}
