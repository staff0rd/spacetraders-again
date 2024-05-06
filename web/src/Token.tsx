import DeleteIcon from '@mui/icons-material/Delete'
import { FormControl, FormHelperText, IconButton, Input, InputAdornment, InputLabel } from '@mui/material'
import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { debounce } from 'lodash'
import { useCallback, useState } from 'react'
import { apiFactory } from './backend/apiFactory'
const tokenAtom = atomWithStorage('token', '')

export const apiAtom = atom((get) => (get(tokenAtom) ? apiFactory(get(tokenAtom)) : undefined))

export const Token = () => {
  const [persistedToken, persistToken] = useAtom(tokenAtom)
  const [token, setLocalToken] = useState(persistedToken)
  const setPersistedToken = useCallback(
    debounce(
      (value: string) => {
        console.log('boink!')
        persistToken(value)
      },
      500,
      { leading: false },
    ),
    [persistToken],
  )
  const setToken = (value: string) => {
    setLocalToken(value)
    setPersistedToken(value)
  }
  return (
    <FormControl>
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
              <IconButton aria-label="delete token" onClick={() => setToken('')} edge="end">
                <DeleteIcon />
              </IconButton>
            </InputAdornment>
          )
        }
      />
      <FormHelperText id="my-helper-text">This value will be persited to your browser's local storage</FormHelperText>
    </FormControl>
  )
}
