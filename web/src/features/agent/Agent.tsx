import GitHubIcon from '@mui/icons-material/GitHub'
import { AppBar, Box, IconButton, Link as MuiLink, Stack, Toolbar, Typography } from '@mui/material'
import { useAtomValue } from 'jotai'
import { Link, Outlet, useParams } from 'react-router-dom'
import { agentAtom, systemSymbolAtom, tokenAtom } from '../../data'
import { Logout } from './Logout'
import { Overview } from './Overview'
import { RenderLoadableAtom } from './RenderLoadableAtom'
import { TabStructure } from './TabStructure'
export const Agent = () => {
  const isLoggedIn = Boolean(useAtomValue(tokenAtom))
  const agent = useAtomValue(agentAtom)
  const homeSystem = useAtomValue(systemSymbolAtom)
  const { systemSymbol } = useParams()

  const regex = `^/(.*)/?.*`
  return (
    <Stack spacing={1}>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" color="white" component="div" sx={{ flexGrow: 1, fontSize: '18px' }}>
              <RenderLoadableAtom
                atom={agentAtom}
                render={(agent) => (
                  <MuiLink to="/" component={Link} color="inherit" sx={{ textDecoration: 'none' }}>
                    {agent.symbol}
                  </MuiLink>
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
      <Box sx={{ padding: 1 }}>
        {systemSymbol ? (
          <Outlet />
        ) : (
          <TabStructure
            regex={regex}
            value={agent}
            tabs={[]}
            root={<></>}
            header={(agent) => (
              <Overview
                lines={[
                  `Credits: $${agent?.credits.toLocaleString()}`,
                  <MuiLink to={homeSystem ?? ''} component={Link}>
                    Home system: {homeSystem}
                  </MuiLink>,
                ]}
                subtype="Your agent"
                symbol={agent?.symbol}
                type="Agent"
              />
            )}
          />
        )}
      </Box>
    </Stack>
  )
}
