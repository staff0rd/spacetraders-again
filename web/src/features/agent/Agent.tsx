import { Box, CircularProgress, Stack } from '@mui/material'
import { useAtomValue } from 'jotai'
import { agentAtom, getSystemSymbolFromWaypointSymbol } from '../../data'
import { routes } from '../../router/router'
import { Overview } from '../../shared/Overview'
import { RouterLink } from '../../shared/RouterLink'
import { TabStructure } from '../../shared/TabStructure'
import { Ships } from '../Ship/Ships'

export const Agent = () => {
  const agent = useAtomValue(agentAtom)
  const regex = `^/agent/([a-z]+)/?.*`
  return (
    <Stack spacing={1}>
      <Box sx={{ padding: 1 }}>
        <TabStructure
          id="agent-tabs"
          regex={regex}
          value={agent}
          tabs={['Ships', 'Contracts']}
          firstTab={<Ships />}
          header={(agent) => {
            if (!agent) return <CircularProgress id="agent-tabs-header" />
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
      </Box>
    </Stack>
  )
}
