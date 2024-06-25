import { Box, Stack } from '@mui/material'
import { jumpGateAtom, jumpGateConnectionsAtom, jumpGateConstructionAtom } from '../../data'
import { routes } from '../../router/router'
import { RenderLoadableAtom } from '../../shared/RenderLoadableAtom'
import { RouterLink } from '../../shared/RouterLink'

export const JumpGate = () => {
  return (
    <RenderLoadableAtom
      title="Jump Gate"
      atom={jumpGateAtom}
      render={(waypoint) => (
        <>
          <Box>Jump Gate: {waypoint.symbol}</Box>
          <RenderLoadableAtom
            title="Connections"
            atom={jumpGateConnectionsAtom}
            render={(data) => (
              <Stack>
                <Box>Connections:</Box>
                {data.connections.map((connection) => (
                  <Box key={connection} sx={{ paddingLeft: 2 }}>
                    <RouterLink to={routes.waypoint(connection)}>{connection}</RouterLink>
                  </Box>
                ))}
              </Stack>
            )}
          />
          <RenderLoadableAtom
            title="Construction"
            atom={jumpGateConstructionAtom}
            render={(data) => (
              <Stack>
                <Box>{data.isComplete ? 'Construction completed ✅' : 'Under construction 🚧'}</Box>
                {!data.isComplete &&
                  data.materials.map((material) => (
                    <Box key={material.tradeSymbol}>
                      {material.tradeSymbol} ({material.fulfilled}/{material.required})
                    </Box>
                  ))}
              </Stack>
            )}
          />
        </>
      )}
    />
  )
}
