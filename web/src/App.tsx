import CssBaseline from '@mui/material/CssBaseline'

import { Box } from '@mui/material'
import { Agent } from './features/agent/Agent'
import { TokenForm } from './features/agent/TokenForm'

function App() {
  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', width: '100%' }}>
        <TokenForm />
        <Agent />
      </Box>
    </>
  )
}

export default App
