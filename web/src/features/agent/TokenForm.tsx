import { FormControl, FormHelperText, Input, InputLabel, Stack, Typography } from '@mui/material'
import { useAtom } from 'jotai'
import { debounce } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { agentAtom, tokenAtom } from '../../data'

export const TokenForm = () => {
  const [agent] = useAtom(agentAtom)
  const [persistedToken, persistToken] = useAtom(tokenAtom)
  const [token, setLocalToken] = useState(persistedToken)
  const setPersistedToken = useCallback(
    debounce((value: string) => persistToken(value), 500, { leading: false }),
    [persistToken],
  )
  const setToken = (value: string) => {
    setLocalToken(value)
    setPersistedToken(value)
  }

  useEffect(() => {
    if (!persistedToken) setLocalToken('')
  }, [persistedToken])

  if (persistedToken && (agent.state == 'hasData' || agent.state === 'loading')) return null

  return (
    <Stack spacing={1}>
      <Typography sx={{ paddingLeft: 2 }} variant="h6">
        Login
      </Typography>
      <FormControl sx={{ maxWidth: '50%' }}>
        <InputLabel htmlFor="my-input">Token</InputLabel>
        <Input
          id="token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          aria-describedby="my-helper-text"
          placeholder="Enter your token"
          type="password"
        />
        <FormHelperText id="my-helper-text">This value will be persisted to your browser's local storage</FormHelperText>
      </FormControl>
    </Stack>
  )
}
