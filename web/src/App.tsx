import { Box, Stack } from '@mui/material'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { tokenAtom } from './data'
import { AppHeader } from './features/app/AppHeader'

document.getElementById('loading')?.remove()

function App() {
  const isLoggedIn = Boolean(useAtomValue(tokenAtom))
  const { pathname } = useLocation()
  const navigate = useNavigate()
  console.log('pathname', pathname)
  useEffect(() => {
    if (pathname === '/') navigate('/status')
  }, [isLoggedIn, navigate, pathname])
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack spacing={1}>
        <AppHeader />
        <Outlet />
      </Stack>
    </Box>
  )
}

export default App
