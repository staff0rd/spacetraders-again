import { AxiosError } from 'axios'
import { atom } from 'jotai'
import { atomWithDefault, atomWithStorage, loadable } from 'jotai/utils'
import { WaypointType } from './backend/api'
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

export const systemAtom = atomWithDefault((get) => {
  const agent = get(agentAtom)
  return agent.state === 'hasData' ? getSystem(agent.data!.headquarters) : null
})

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
    const systemSymbol = get(systemAtom)
    if (!api || !systemSymbol) return
    return handleError(() => getPages((page, count) => api.systems.getSystemWaypoints(systemSymbol, page, count)))
  }),
)

const jumpGateAtom = atom((get) => {
  const api = get(apiAtom)
  const waypoints = get(waypointsAtom)
  const systemSymbol = get(systemAtom)
  if (!api || !systemSymbol || waypoints.state !== 'hasData') return
  const jumpGate = waypoints.data!.find((x) => x.type === WaypointType.JumpGate)
  invariant(jumpGate, 'Expected to find jump gate')
  return jumpGate
})

export const jumpGateConnectionsAtom = loadable(
  atom(async (get) => {
    const jumpGate = get(jumpGateAtom)
    const api = get(apiAtom)
    const systemSymbol = get(systemAtom)
    if (!jumpGate || !api || !systemSymbol) return
    const result = await handleError(() => api.systems.getJumpGate(systemSymbol, jumpGate?.symbol))
    return result.data.data
  }),
)

export const jumpGateConstructionAtom = loadable(
  atom(async (get) => {
    const jumpGate = get(jumpGateAtom)
    const api = get(apiAtom)
    const systemSymbol = get(systemAtom)
    if (!jumpGate || !api || !systemSymbol) return
    const result = await handleError(() => api.systems.getConstruction(systemSymbol, jumpGate?.symbol))
    return result.data.data
  }),
)
