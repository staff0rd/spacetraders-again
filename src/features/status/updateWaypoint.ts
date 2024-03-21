import { getEntityManager } from '../../orm'
import { WaypointEntity } from './waypoint.entity'

export const updateWaypoint = async (resetDate: string, symbol: string, data: Partial<WaypointEntity>) => {
  return await getEntityManager().fork().nativeUpdate(WaypointEntity, { resetDate, symbol }, data)
}
