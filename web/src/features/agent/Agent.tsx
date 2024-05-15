import { Box, CircularProgress, Stack } from '@mui/material'
import { useAtomValue } from 'jotai'
import { Outlet, useParams } from 'react-router-dom'
import { agentAtom, getSystemSymbolFromWaypointSymbol } from '../../data'
import { routes } from '../../router'
import { Overview } from './Overview'
import { RouterLink } from './RouterLink'
import { TabStructure } from './TabStructure'

export const Agent = () => {
  const agent = useAtomValue(agentAtom)
  const { systemSymbol } = useParams()

  const regex = `^/(.*)/?.*`
  return (
    <Stack spacing={1}>
      <Box sx={{ padding: 1 }}>
        {systemSymbol ? (
          <Outlet />
        ) : (
          <TabStructure
            regex={regex}
            value={agent}
            tabs={[]}
            root={<></>}
            header={(agent) => {
              if (!agent) return <CircularProgress />
              const homeSystem = getSystemSymbolFromWaypointSymbol(agent.headquarters)
              return (
                <Overview
                  lines={[
                    `Credits: $${agent.credits.toLocaleString()}`,
                    <RouterLink to={homeSystem ? routes.system(homeSystem) : ''}>Home system: {homeSystem}</RouterLink>,
                  ]}
                  subtype="Your agent"
                  symbol={agent.symbol}
                  type="Agent"
                />
              )
            }}
          />
        )}
      </Box>
    </Stack>
  )
}
