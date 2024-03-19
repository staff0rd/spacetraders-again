import { Ship } from '../../api'
import { ShipEntity } from '../features/ship/ship.entity'
import { getEntityManager } from '../orm'
import { findOrCreateShip } from './findOrCreateShip'

export async function updateShips(resetDate: string, ships: Ship[]) {
  return Promise.all(
    ships.map(async (ship) => {
      const entity = await findOrCreateShip(resetDate, ship)
      const em = getEntityManager()
      await em.nativeUpdate(
        ShipEntity,
        { id: entity.id },
        {
          cargo: ship.cargo,
          registration: ship.registration,
          nav: ship.nav,
          crew: ship.crew,
          frame: ship.frame,
          reactor: ship.reactor,
          engine: ship.engine,
          cooldown: ship.cooldown,
          modules: ship.modules,
          mounts: ship.mounts,
          fuel: ship.fuel,
        },
      )
    }),
  )
}
