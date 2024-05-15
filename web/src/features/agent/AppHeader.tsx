import GitHubIcon from '@mui/icons-material/GitHub'
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material'
import { useAtomValue } from 'jotai'
import { agentAtom, tokenAtom } from '../../data'
import { Logout } from './Logout'
import { RenderLoadableAtom } from './RenderLoadableAtom'
import { RouterLink } from './RouterLink'

export const AppHeader = () => {
  const isLoggedIn = Boolean(useAtomValue(tokenAtom))
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" color="white" component="div" sx={{ flexGrow: 1, fontSize: '18px', '& a:visited': { color: 'white' } }}>
            <RenderLoadableAtom
              atom={agentAtom}
              render={(agent) => (
                <RouterLink to="/" color="inherit" sx={{ textDecoration: 'none' }}>
                  {agent.symbol}
                </RouterLink>
              )}
            />
          </Typography>
          {isLoggedIn && <Logout />}
          <IconButton aria-label="source" href="https://github.com/staff0rd/spacetraders-again/tree/main/web" sx={{ cursor: 'pointer' }}>
            <GitHubIcon sx={{ color: 'white', fontSize: '28px' }} />
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  )
}
