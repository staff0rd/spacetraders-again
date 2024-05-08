import { Box, ScopedCssBaseline } from '@mui/material'
import { Agent } from './features/agent/Agent'
import { TokenForm } from './features/agent/TokenForm'

document.getElementById('loading')?.remove()

function App() {
  return (
    <ScopedCssBaseline>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <TokenForm />
        <Agent />
      </Box>
    </ScopedCssBaseline>
  )
}

export default App
