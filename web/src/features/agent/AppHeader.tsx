import GitHubIcon from '@mui/icons-material/GitHub'
import { AppBar, Box, IconButton, Stack, Toolbar, Typography } from '@mui/material'
import { useAtomValue } from 'jotai'
import { agentAtom, tokenAtom } from '../../data'
import { Logout } from './Logout'
import { RenderLoadableAtom } from './RenderLoadableAtom'
import { RequestQueue } from './RequestQueue'
import { RouterLink } from './RouterLink'
export const AppHeader = () => {
  const isLoggedIn = Boolean(useAtomValue(tokenAtom))

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" color="white" component="div" sx={{ flexGrow: 1, fontSize: '18px', '& a:visited': { color: 'white' } }}>
            <RenderLoadableAtom
              id="agent"
              atom={agentAtom}
              render={(agent) => (
                <RouterLink to="/" color="inherit" sx={{ textDecoration: 'none' }}>
                  {agent.symbol}
                </RouterLink>
              )}
            />
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
            {isLoggedIn && <Logout />}
            <RequestQueue />
            <IconButton aria-label="source" href="https://github.com/staff0rd/spacetraders-again/tree/main/web" sx={{ cursor: 'pointer' }}>
              <GitHubIcon sx={{ color: 'white', fontSize: '28px' }} />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  )
}
