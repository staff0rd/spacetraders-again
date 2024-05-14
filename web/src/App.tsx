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
        <Agent />
        <TokenForm />
      </Box>
    </ScopedCssBaseline>
  )
}

export default App
