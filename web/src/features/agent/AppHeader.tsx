import GitHubIcon from '@mui/icons-material/GitHub'
import LeaderboardIcon from '@mui/icons-material/Leaderboard'
import { AppBar, Box, Button, IconButton, Stack, Toolbar, Typography } from '@mui/material'
import { useAtomValue } from 'jotai'
import { Link } from 'react-router-dom'
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
            {/*
            // @ts-expect-error this works at runtime */}
            <IconButton aria-label="status" to="/status" sx={{ cursor: 'pointer' }} LinkComponent={Link}>
              <LeaderboardIcon sx={{ color: 'white', fontSize: '28px' }} />
            </IconButton>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
            {isLoggedIn ? (
              <Logout />
            ) : (
              <Button aria-label="login" color="inherit" component={Link} to="/login" variant="outlined">
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
