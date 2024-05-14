import GitHubIcon from '@mui/icons-material/GitHub'
import { AppBar, Box, IconButton, Stack, Toolbar, Typography } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { agentAtom } from '../../data'
import { Logout } from './Logout'
import { RenderLoadableAtom } from './RenderLoadableAtom'
export const Agent = () => {
  return (
    <Stack spacing={1}>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" color="white" component="div" sx={{ flexGrow: 1, fontSize: '18px' }}>
              <RenderLoadableAtom title="Agent" atom={agentAtom} render={(agent) => <>{agent.symbol}</>} />
            </Typography>
            <Logout />
            <IconButton aria-label="source" href="https://github.com/staff0rd/spacetraders-again/tree/main/web" sx={{ cursor: 'pointer' }}>
              <GitHubIcon sx={{ color: 'white', fontSize: '28px' }} />
            </IconButton>
          </Toolbar>
        </AppBar>
      </Box>
      <Box sx={{ padding: 1 }}>
        <RenderLoadableAtom title="Agent" atom={agentAtom} render={(agent) => <Box>Credits: ${agent.credits.toLocaleString()}</Box>} />
        <Outlet />
      </Box>
    </Stack>
  )
}
