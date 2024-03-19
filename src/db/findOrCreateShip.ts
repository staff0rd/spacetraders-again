import { Ship } from '../../api'
import { ShipEntity } from '../features/ship/ship.entity'
import { getEntityManager } from '../orm'

export async function findOrCreateShip(resetDate: string, ship: Ship) {
  const em = getEntityManager()
  const entity = await em.findOne(ShipEntity, { resetDate, symbol: ship.symbol })
  if (entity) return entity

  const newEntity = new ShipEntity(resetDate, ship)
  await em.persistAndFlush(newEntity)
  return newEntity
}
