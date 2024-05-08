import { Box, Link, Stack } from '@mui/material'
import { useAtom } from 'jotai'
import { getSystem, jumpGateAtom, jumpGateConnectionsAtom, jumpGateConstructionAtom, systemAtom } from '../../data'
import { RenderLoadableAtom } from './RenderLoadableAtom'

export const JumpGate = () => {
  const [_, setSystemAtom] = useAtom(systemAtom)
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
                    <Link sx={{ cursor: 'pointer' }} onClick={() => setSystemAtom(getSystem(connection))}>
                      {connection}
                    </Link>
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
