import { Alert, Box, CircularProgress } from '@mui/material'
import { AxiosError } from 'axios'
import { atom, useAtom } from 'jotai'
import { loadable } from 'jotai/utils'
import { Suspense } from 'react'
import { apiAtom } from './Token'
import { getErrorMessage } from './backend/util/get-error-message'

const getAgentAtom = loadable(
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

export const Agent = () => {
  const [value] = useAtom(getAgentAtom)
  if (value.state === 'loading') return <CircularProgress />
  if (value.state === 'hasError') return <Alert severity="error">{getErrorMessage(value.error)}</Alert>
  if (value.data === undefined) return null

  return (
    <Suspense>
      <Box>
        <p>Agent: {value.data?.data.data.symbol}</p>
      </Box>
    </Suspense>
  )
}
