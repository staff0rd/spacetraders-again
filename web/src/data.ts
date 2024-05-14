import { AxiosError } from 'axios'
import { atom } from 'jotai'
import { atomFamily, atomWithDefault, atomWithStorage, loadable } from 'jotai/utils'
import { WaypointTraitSymbol, WaypointType } from './backend/api'
import { apiFactory } from './backend/apiFactory'
import { invariant } from './backend/invariant'
import { getPages } from './backend/util/getPages'

export const tokenAtom = atomWithStorage('token', '')

export const apiAtom = atom((get) => (get(tokenAtom) ? apiFactory(get(tokenAtom)) : null))

export const agentAtom = loadable(
  atom(async (get) => {
    const api = get(apiAtom)
    if (!api) return
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

export const getSystem = (symbol: string) => symbol.match(/(.+-.+)?-/)![1]

export const systemSymbolAtom = atomWithDefault((get) => {
  const agent = get(agentAtom)
  return agent.state === 'hasData' && agent.data ? getSystem(agent.data.headquarters) : null
})

export const systemAtom = loadable(
  atom(async (get) => {
    const api = get(apiAtom)
    const systemSymbol = get(systemSymbolAtom)
    if (!api || !systemSymbol) return
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
    if (!api || !systemSymbol) return
    return handleError(() => getPages((page, count) => api.systems.getSystemWaypoints(systemSymbol, page, count)))
  }),
)

export const waypointAtomFamily = atomFamily((symbol: string) =>
  atom(async (get) => {
    const data = get(waypointsAtom)
    if (data.state !== 'hasData') return
    return data.data?.find((x) => x.symbol === symbol)
  }),
)

export const marketAtomFamily = atomFamily((symbol: string) =>
  loadable(
    atom(async (get) => {
      const api = get(apiAtom)
      const systemSymbol = get(systemSymbolAtom)
      if (!api || !systemSymbol) return
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
    if (!api || !systemSymbol || waypoints.state !== 'hasData') return
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
    if (jumpGate.state !== 'hasData' || !api || !systemSymbol) return
    const result = await handleError(() => api.systems.getJumpGate(systemSymbol, jumpGate.data!.symbol))
    return result.data.data
  }),
)

export const jumpGateConstructionAtom = loadable(
  atom(async (get) => {
    const jumpGate = get(jumpGateAtom)
    const api = get(apiAtom)
    const systemSymbol = get(systemSymbolAtom)
    if (jumpGate.state !== 'hasData' || !api || !systemSymbol) return
    const result = await handleError(() => api.systems.getConstruction(systemSymbol, jumpGate.data!.symbol))
    return result.data.data
  }),
)
