import { Alert, Box, CircularProgress, Stack } from '@mui/material'
import { useAtom } from 'jotai'
import { getErrorMessage } from '../../backend/util/get-error-message'
import { agentAtom } from '../../data'
import { ClearAgent } from './ClearAgent'

export const Agent = () => {
  const [value] = useAtom(agentAtom)
  if (value.state === 'loading') return <CircularProgress />
  if (value.state === 'hasError') return <Alert severity="error">{getErrorMessage(value.error)}</Alert>
  if (value.data === undefined) return null

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box>Agent: {value.data?.data.data.symbol}</Box>
      <ClearAgent />
    </Stack>
  )
}
