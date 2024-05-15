import { Box } from '@mui/material'
import { Agent } from './features/agent/Agent'
import { TokenForm } from './features/agent/TokenForm'

document.getElementById('loading')?.remove()

function App() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Agent />
      <TokenForm />
    </Box>
  )
}

export default App
