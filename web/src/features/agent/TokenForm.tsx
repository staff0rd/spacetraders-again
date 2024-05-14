import { FormControl, FormHelperText, Input, InputAdornment, InputLabel } from '@mui/material'
import { useAtom, useAtomValue } from 'jotai'
import { debounce } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { agentAtom, systemSymbolAtom, tokenAtom } from '../../data'
import { Logout } from './Logout'

export const TokenForm = () => {
  const [agent] = useAtom(agentAtom)
  const navigate = useNavigate()
  const systemSymbol = useAtomValue(systemSymbolAtom)
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
    <FormControl sx={{ maxWidth: 300 }}>
      <InputLabel htmlFor="my-input">Token</InputLabel>
      <Input
        id="token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        aria-describedby="my-helper-text"
        placeholder="Enter your token"
        type="password"
        endAdornment={
          persistedToken && (
            <InputAdornment position="end">
              <Logout />
            </InputAdornment>
          )
        }
      />
      <FormHelperText id="my-helper-text">This value will be persisted to your browser's local storage</FormHelperText>
    </FormControl>
  )
}
