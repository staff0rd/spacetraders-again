import { Shipyard } from '../../../api'
import { getEntityManager } from '../../orm'
import { WaypointEntity } from './waypoint.entity'

export const updateWaypoint = async (
  resetDate: string,
  symbol: string,
  shipyard: Pick<Shipyard, 'modificationsFee' | 'shipTypes'> | undefined,
  ships: Shipyard['ships'] | undefined,
): Promise<WaypointEntity> => {
  const em = getEntityManager().fork()
  const waypoint = await em.findOneOrFail(WaypointEntity, { resetDate, symbol })
  waypoint.shipyard = shipyard
  if (ships) waypoint.ships = ships
  await em.persistAndFlush(waypoint)
  return waypoint
}
