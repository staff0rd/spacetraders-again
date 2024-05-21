import { Box, CircularProgress, Stack } from '@mui/material'
import { useAtomValue } from 'jotai'
import { agentAtom, getSystemSymbolFromWaypointSymbol } from '../../data'
import { routes } from '../../router'
import { Overview } from './Overview'
import { RouterLink } from './RouterLink'
import { Ships } from './Ships'
import { TabStructure } from './TabStructure'

export const Agent = () => {
  const agent = useAtomValue(agentAtom)
  const regex = `^/agent/(.*)/?.*`
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
