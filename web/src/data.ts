import { AxiosError } from 'axios'
import { atom } from 'jotai'
import { atomWithStorage, loadable } from 'jotai/utils'
import { apiFactory } from './backend/apiFactory'

export const tokenAtom = atomWithStorage('token', '')

export const apiAtom = atom((get) => (get(tokenAtom) ? apiFactory(get(tokenAtom)) : null))

export const agentAtom = loadable(
  atom(async (get) => {
    const api = get(apiAtom)
    if (!api) return
    try {
      const result = await api.agents.getMyAgent()
      return result
    } catch (e) {
      if (e instanceof AxiosError && e.response?.data.error) {
        const { code, message } = e.response!.data.error
        throw new Error(`${code}: ${message}`)
      }
      throw e
    }
  }),
)
