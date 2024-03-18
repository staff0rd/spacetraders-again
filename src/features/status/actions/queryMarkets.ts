import { SystemsApiFactory, Waypoint } from '../../../../api'
import { log } from '../../../logging/configure-logging'

export const queryMarkets = async (systemsApi: ReturnType<typeof SystemsApiFactory>, waypoints: Waypoint[]) => {
  return Promise.all(
    waypoints.map(async (w) => {
      const {
        data: { data: market },
      } = await systemsApi.getMarket(w.systemSymbol, w.symbol)
      if (market.imports.length) log.info('agent', `Market ${w.symbol} imports ${market.imports.map((t) => t.symbol).join(', ')}.`)
      return market
    }),
  )
}
