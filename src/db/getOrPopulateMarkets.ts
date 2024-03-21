import { findMarkets } from '../features/status/actions/findMarkets'
import { queryMarkets } from '../features/status/actions/queryMarkets'
import { apiFactory } from '../features/status/apiFactory'
import { WaypointEntity } from '../features/status/waypoint.entity'
import { log } from '../logging/configure-logging'
import { getEntityManager } from '../orm'

export const getOrPopulateMarkets = async (
  api: ReturnType<typeof apiFactory>,
  resetDate: string,
  systemSymbol: string,
): Promise<WaypointEntity[]> => {
  const em = getEntityManager()
  const data = await em.findAll(WaypointEntity, { where: { systemSymbol, resetDate } })
  if (data.length) return data
  log.warn('populate-data', 'Populating market data')
  const markets = await findMarkets(api.systems, systemSymbol)
  const marketData = await queryMarkets(api.systems, markets)
  const newData = marketData.map((data) => {
    const market = markets.find((m) => m.symbol === data.symbol)!
    return new WaypointEntity(
      resetDate,
      market.systemSymbol,
      market.symbol,
      data.imports.map((d) => d.symbol),
      market.x,
      market.y,
    )
  })
  await Promise.all(newData.map((m) => em.persist(m)))
  await em.flush()
  return newData
}
