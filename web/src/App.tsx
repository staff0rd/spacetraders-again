import { Box, Stack } from '@mui/material'
import { useAtomValue } from 'jotai'
import { tokenAtom } from './data'
import { Agent } from './features/agent/Agent'
import { AppHeader } from './features/agent/AppHeader'
import { TokenForm } from './features/agent/TokenForm'

document.getElementById('loading')?.remove()

function App() {
  const isLoggedIn = Boolean(useAtomValue(tokenAtom))
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack spacing={1}>
        <AppHeader />
        <TokenForm />
        {isLoggedIn && <Agent />}
      </Stack>
    </Box>
  )
}

export default App
