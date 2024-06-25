import GitHubIcon from '@mui/icons-material/GitHub'
import LeaderboardIcon from '@mui/icons-material/Leaderboard'
import { AppBar, Box, Button, IconButton, Stack, Toolbar, Typography } from '@mui/material'
import { useAtomValue } from 'jotai'
import { Link } from 'react-router-dom'
import { agentAtom, getSystemSymbolFromWaypointSymbol, tokenAtom } from '../../data'
import { routes } from '../../router/router'
import { RenderLoadableAtom } from '../../shared/RenderLoadableAtom'
import { RouterLink } from '../../shared/RouterLink'
import { SystemIcon } from '../systems/SystemIcon'
import { Logout } from './Logout'
import { RequestQueue } from './RequestQueue'

export const AppHeader = () => {
  const isLoggedIn = Boolean(useAtomValue(tokenAtom))

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Stack direction="row" sx={{ flexGrow: 1 }} alignItems="center" spacing={2}>
            <Typography variant="h6" color="white" component="div" sx={{ fontSize: '18px', '& a:visited': { color: 'white' } }}>
              <RenderLoadableAtom
                id="agent"
                atom={agentAtom}
                render={(agent) => (
                  <RouterLink to="/agent" color="inherit" sx={{ textDecoration: 'none' }}>
                    {agent.symbol}
                  </RouterLink>
                )}
              />
            </Typography>
            <Stack direction="row" alignItems="center">
              {/*
            // @ts-expect-error this works at runtime */}
              <IconButton aria-label="status" to="/status" sx={{ cursor: 'pointer' }} LinkComponent={Link}>
                <LeaderboardIcon sx={{ color: 'white', fontSize: '28px' }} />
              </IconButton>
              <RenderLoadableAtom
                atom={agentAtom}
                id="system-button"
                render={(agent) => (
                  // @ts-expect-error this works at runtime */
                  <IconButton
                    aria-label="status"
                    to={routes.system(getSystemSymbolFromWaypointSymbol(agent.headquarters))}
                    sx={{ cursor: 'pointer' }}
                    LinkComponent={Link}
                  >
                    <SystemIcon />
                  </IconButton>
                )}
              />
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
            {isLoggedIn ? (
              <Logout />
            ) : (
              <Button aria-label="login" color="inherit" component={Link} to="/login">
                Login
              </Button>
            )}
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
