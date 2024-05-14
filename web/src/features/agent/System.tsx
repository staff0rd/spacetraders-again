import HomeIcon from '@mui/icons-material/Home'
import { Box, Card, CardContent, IconButton, Link as MuiLink, Stack, Tab, Tabs, Typography } from '@mui/material'
import { useAtomValue } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { ReactNode } from 'react'
import { Link, Outlet, useLocation, useParams } from 'react-router-dom'
import { agentAtom, getSystem, systemAtom, systemSymbolAtom } from '../../data'
import { RenderAtom, RenderLoadableAtom } from './RenderLoadableAtom'

type Tabs = 'markets' | 'waypoints'

const card = (type: string, symbol: string, subtype: string, lines: ReactNode[]) => (
  <Card variant="outlined">
    <CardContent>
      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
        {type}
      </Typography>
      <Typography variant="h5" component="div" sx={{ letterSpacing: 1 }}>
        {symbol}
      </Typography>
      <Typography sx={{ mb: 1.5, fontSize: 16 }} color="text.secondary">
        {subtype.replace('_', ' ')}
      </Typography>
      <Stack>
        {lines.map((line, index) => (
          <Typography key={index} variant="body2">
            {line}
          </Typography>
        ))}
      </Stack>
    </CardContent>
  </Card>
)

export const System = () => {
  const resetSystem = useResetAtom(systemSymbolAtom)
  const agent = useAtomValue(agentAtom)
  const { systemSymbol } = useParams()
  const { pathname } = useLocation()
  const matches = pathname.match(`^/${systemSymbol}/(.*)/?.*`) ?? []
  const tab = matches[1] ?? ''

  if (agent.state !== 'hasData') return null
  return (
    <Stack>
      <RenderAtom
        atom={systemSymbolAtom}
        render={(system) => (
          <Box>
            System: {system}{' '}
            <IconButton disabled={agent.data && system === getSystem(agent.data.headquarters)} onClick={resetSystem}>
              <HomeIcon />
            </IconButton>
          </Box>
        )}
      />
      <Tabs value={tab}>
        <Tab label="Overview" value="" to="" component={Link} />
        <Tab label="Markets" value="markets" to="markets" component={Link} />
        <Tab label="Waypoints" value="waypoints" to="waypoints" component={Link} />
        <Tab label="Jump Gate" value="jumpgate" to="jumpgate" component={Link} />
        <Tab label="Raw" value="raw" to="raw" component={Link} />
      </Tabs>
      {!tab ? (
        <RenderLoadableAtom
          atom={systemAtom}
          render={(system) =>
            card('System', system.symbol, system.type, [
              `x: ${system.x}, y: ${system.y}`,
              <MuiLink to="waypoints" component={Link}>
                {system.waypoints.length} waypoints
              </MuiLink>,
              `${system.factions.length} factions`,
            ])
          }
        />
      ) : (
        <Outlet />
      )}
    </Stack>
  )
}
