import { Ship } from '../api'
import { ShipEntity } from '../features/ship/ship.entity'
import { AgentEntity } from '../features/status/agent.entity'
import { getEntityManager } from '../orm'
import { findOrCreateShip } from './findOrCreateShip'

export async function updateShips(resetDate: string, agent: AgentEntity, ships: Ship[]): Promise<ShipEntity[]> {
  const em = getEntityManager()
  await Promise.all(
    ships.map(async (ship) => {
      const entity = await findOrCreateShip(resetDate, ship)

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
  return em.findAll(ShipEntity, { where: { resetDate, symbol: { $ilike: `${agent.data!.symbol}%` } } })
}
