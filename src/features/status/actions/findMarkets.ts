import { SystemsApiFactory, Waypoint } from '../../../../api'

export const findMarkets = async (
  systemsApi: ReturnType<typeof SystemsApiFactory>,
  systemSymbol: string,
  page = 1,
): Promise<Waypoint[]> => {
  const {
    data: { data: markets, meta },
    //@ts-expect-error because it is wrong
  } = await systemsApi.getSystemWaypoints(systemSymbol, page, 20, undefined, { traits: ['MARKETPLACE'] })
  if (meta.total <= page * 20) {
    return markets
  }
  return markets.concat(await findMarkets(systemsApi, systemSymbol, page + 1))
}
