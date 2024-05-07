import { Box, Link, Stack } from '@mui/material'
import { useAtom } from 'jotai'
import { getSystem, jumpGateConnectionsAtom, jumpGateConstructionAtom, systemAtom } from '../../data'
import { RenderLoadableAtom } from './RenderLoadableAtom'

export const JumpGate = () => {
  const [_, setSystemAtom] = useAtom(systemAtom)
  return (
    <>
      <RenderLoadableAtom
        atom={jumpGateConnectionsAtom}
        render={(data) => (
          <Stack>
            <Box>Jump Gate: {data.symbol}</Box>
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
  )
}
