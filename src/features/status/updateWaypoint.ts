import { EntityData } from '@mikro-orm/core'
import { Shipyard } from '../../../api'
import { getEntityManager } from '../../orm'
import { WaypointEntity } from './waypoint.entity'

export const updateWaypoint = async (
  resetDate: string,
  symbol: string,
  shipyard: Pick<Shipyard, 'modificationsFee' | 'shipTypes'> | undefined,
  ships: Shipyard['ships'] | undefined,
) => {
  const toUpdate: EntityData<WaypointEntity> = { shipyard }
  if (ships) toUpdate.ships = ships
  return await getEntityManager().fork().nativeUpdate(WaypointEntity, { resetDate, symbol }, toUpdate)
}
