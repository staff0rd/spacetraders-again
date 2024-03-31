import { WaypointTraitSymbol } from '../../../api'
import { invariant } from '../../invariant'
import { getEntityManager } from '../../orm'
import { getAgent } from './actions/getAgent'
import { writeMarketTransaction } from './influxWrite'
import { WaypointEntity } from './waypoint.entity'

async function getAllWaypoints(api: Awaited<ReturnType<typeof getAgent>>['api'], systemSymbol: string) {
  const {
    data: { data: waypoints, meta },
  } = await api.systems.getSystemWaypoints(systemSymbol, 1, 20)
  if (meta.total > meta.page * meta.limit) {
    const allWaypoints = await Promise.all(
      Array.from({ length: Math.ceil(meta.total / meta.limit) - 1 }, (_, i) => api.systems.getSystemWaypoints(systemSymbol, i + 2, 20)),
    )
    return waypoints.concat(allWaypoints.flatMap((r) => r.data.data))
  }
}

export async function updateWaypoint(waypoint: WaypointEntity, api: Awaited<ReturnType<typeof getAgent>>['api']) {
  if (waypoint.traits.includes(WaypointTraitSymbol.Marketplace)) {
    const {
      data: { data: market },
    } = await api.systems.getMarket(waypoint.systemSymbol, waypoint.symbol)

    waypoint.imports = market.imports.map((i) => i.symbol)
    waypoint.exports = market.exports.map((e) => e.symbol)
    waypoint.exchange = market.exchange.map((e) => e.symbol)
    if (market.tradeGoods) {
      waypoint.tradeGoods = market.tradeGoods
    }
    if (market.transactions) {
      market.transactions.forEach((t) => {
        writeMarketTransaction(t, waypoint.resetDate, t.shipSymbol)
      })
    }
  }

  if (waypoint.traits.includes(WaypointTraitSymbol.Shipyard)) {
    const {
      data: { data: shipyard },
    } = await api.systems.getShipyard(waypoint.systemSymbol, waypoint.symbol)
    waypoint.shipyard = {
      modificationsFee: shipyard.modificationsFee,
      shipTypes: shipyard.shipTypes,
    }
    if (shipyard.ships) waypoint.ships = shipyard.ships
  }
}

export async function systemScan(
  systemSymbol: string,
  resetDate: string,
  api: Awaited<ReturnType<typeof getAgent>>['api'],
): Promise<WaypointEntity[]> {
  const waypoints = await getAllWaypoints(api, systemSymbol)
  invariant(waypoints?.length, 'Expected to find waypoints')
  const em = getEntityManager()
  await em.upsertMany(
    WaypointEntity,
    waypoints.map(
      ({ isUnderConstruction, traits, type, x, y, faction, modifiers, symbol }) =>
        new WaypointEntity({
          resetDate,
          symbol,
          systemSymbol,
          x,
          y,
          isUnderConstruction,
          traits: traits.map((t) => t.symbol),
          faction: faction?.symbol,
          type,
          modifiers: modifiers?.map((m) => m.symbol) ?? [],
        }),
    ),
  )

  const entities = await em.find(WaypointEntity, { resetDate, systemSymbol })

  await Promise.all(
    entities.map(async (waypoint) => {
      await updateWaypoint(waypoint, api)
      em.persist(waypoint)
    }),
  )

  await em.flush()

  const engineeredAsteroid = entities.find((w) => w.type == 'ENGINEERED_ASTEROID')!
  entities.forEach((w) => {
    w.distanceFromEngineeredAsteroid = Math.sqrt((w.x - engineeredAsteroid.x) ** 2 + (w.y - engineeredAsteroid.y) ** 2)
  })

  return entities.toSorted((a, b) => a.distanceFromEngineeredAsteroid - b.distanceFromEngineeredAsteroid)
}
