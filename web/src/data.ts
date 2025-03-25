import { AxiosError } from 'axios'
import { atom } from 'jotai'
import { atomFamily, atomWithStorage, loadable } from 'jotai/utils'
import { WaypointTraitSymbol, WaypointType } from './backend/api'
import { apiFactory, loggedOutApiFactory } from './backend/apiFactory'
import { invariant } from './backend/invariant'
import { getPages } from './backend/util/getPages'

export const tokenAtom = atomWithStorage('token', '')

export const apiAtom = atom((get) => (get(tokenAtom) ? apiFactory(get(tokenAtom)) : loggedOutApiFactory()))

export const statusAtom = loadable(
  atom(async (get) => {
    const api = get(apiAtom)
    const result = await api.global.getStatus()
    return result.data
  }),
)

export const agentAtom = loadable(
  atom(async (get) => {
    const api = get(apiAtom)
    if (!api.loggedIn) return
    try {
      const result = await api.agents.getMyAgent()
      return result.data.data
    } catch (e) {
      if (e instanceof AxiosError && e.response?.data.error) {
        const { code, message } = e.response!.data.error
        throw new Error(`${code}: ${message}`)
      }
      throw e
    }
  }),
)

export const limiterAtom = atom((get) => {
  const api = get(apiAtom)
  return api?.limiter
})

export const contractsAtom = loadable(
  atom(async (get) => {
    const api = get(apiAtom)
    if (!api.loggedIn) return
    const contracts = await getPages((page, count) => api.contracts.getContracts(page, count))
    return contracts.toSorted((a, b) => (a.accepted ? -1 : b.accepted ? 1 : 0))
  }),
)

export const shipsAtom = loadable(
  atom(async (get) => {
    const api = get(apiAtom)
    if (!api.loggedIn) return
    return await getPages((page, count) => api.fleet.getMyShips(page, count))
  }),
)

export const getSystemSymbolFromWaypointSymbol = (waypointSymbol: string) => waypointSymbol.match(/(.+-.+)?-/)![1]

export const systemSymbolAtom = atom<string | null>(null)

export const systemAtom = loadable(
  atom(async (get) => {
    const api = get(apiAtom)
    const systemSymbol = get(systemSymbolAtom)
    if (!api.loggedIn || !systemSymbol) return
    const result = await api.systems.getSystem(systemSymbol)
    return result.data.data
  }),
)

const handleError = async <T>(doWork: () => Promise<T>) => {
  try {
    return await doWork()
  } catch (e) {
    if (e instanceof AxiosError && e.response?.data.error) {
      const { code, message } = e.response!.data.error
      throw new Error(`${code}: ${message}`)
    }
    throw e
  }
}

export const waypointsAtom = loadable(
  atom(async (get) => {
    const api = get(apiAtom)
    const systemSymbol = get(systemSymbolAtom)
    if (!api.loggedIn || !systemSymbol) return
    return handleError(() => getPages((page, count) => api.systems.getSystemWaypoints(systemSymbol, page, count)))
  }),
)

export const waypointAtomFamily = atomFamily((symbol: string) =>
  loadable(
    atom(async (get) => {
      const data = get(waypointsAtom)
      if (data.state !== 'hasData') return
      return data.data?.find((x) => x.symbol === symbol)
    }),
  ),
)

export const marketAtomFamily = atomFamily((symbol: string) =>
  loadable(
    atom(async (get) => {
      const api = get(apiAtom)
      const systemSymbol = get(systemSymbolAtom)
      if (!api.loggedIn || !systemSymbol) return
      const result = await handleError(() => api.systems.getMarket(systemSymbol, symbol))
      return result.data.data
    }),
  ),
)

export const marketsAtom = atom(async (get) => {
  const waypoints = get(waypointsAtom)
  if (waypoints.state !== 'hasData') return
  return waypoints.data
    ?.filter((x) => x.traits.some((t) => t.symbol === WaypointTraitSymbol.Marketplace))
    .toSorted((a, b) => a.symbol.localeCompare(b.symbol))
    .map((x) => ({ symbol: x.symbol, atom: marketAtomFamily(x.symbol) }))
})

export const jumpGateAtom = loadable(
  atom(async (get) => {
    const api = get(apiAtom)
    const waypoints = get(waypointsAtom)
    const systemSymbol = get(systemSymbolAtom)
    if (!api.loggedIn || !systemSymbol || waypoints.state !== 'hasData') return
    const jumpGate = waypoints.data!.find((x) => x.type === WaypointType.JumpGate)
    invariant(jumpGate, 'Expected to find jump gate')
    return jumpGate
  }),
)

export const jumpGateConnectionsAtom = loadable(
  atom(async (get) => {
    const jumpGate = get(jumpGateAtom)
    const api = get(apiAtom)
    const systemSymbol = get(systemSymbolAtom)
    if (jumpGate.state !== 'hasData' || !api.loggedIn || !systemSymbol) return
    const result = await handleError(() => api.systems.getJumpGate(systemSymbol, jumpGate.data!.symbol))
    return result.data.data
  }),
)

export const jumpGateConstructionAtom = loadable(
  atom(async (get) => {
    const jumpGate = get(jumpGateAtom)
    const api = get(apiAtom)
    const systemSymbol = get(systemSymbolAtom)
    if (jumpGate.state !== 'hasData' || !api.loggedIn || !systemSymbol) return
    const result = await handleError(() => api.systems.getConstruction(systemSymbol, jumpGate.data!.symbol))
    return result.data.data
  }),
)
