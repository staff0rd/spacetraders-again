import HomeIcon from '@mui/icons-material/Home'
import { Box, IconButton, Stack } from '@mui/material'
import { useResetAtom } from 'jotai/utils'
import { agentAtom, getSystem, systemAtom } from '../../data'
import { ClearAgent } from './ClearAgent'
import { JumpGate } from './JumpGate'
import { Markets } from './Markets'
import { RenderAtom, RenderLoadableAtom } from './RenderLoadableAtom'
import { Waypoints } from './Waypoints'

export const Agent = () => {
  const resetSystem = useResetAtom(systemAtom)
  return (
    <RenderLoadableAtom
      title="Agent"
      atom={agentAtom}
      render={(agent) => (
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box>Agent: {agent.symbol}</Box>
            <ClearAgent />
          </Stack>
          <Box>Credits: ${agent.credits.toLocaleString()}</Box>
          <RenderAtom
            atom={systemAtom}
            render={(system) => (
              <Box>
                System: {system}{' '}
                <IconButton disabled={system === getSystem(agent.headquarters)} onClick={resetSystem}>
                  <HomeIcon />
                </IconButton>
              </Box>
            )}
          />
          <Waypoints />
          <Markets />
          <JumpGate />
        </Stack>
      )}
    />
  )
}
