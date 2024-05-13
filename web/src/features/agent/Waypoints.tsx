import { Box, LinearProgress, Stack } from '@mui/material'
import { useAtomValue } from 'jotai'
import { Suspense } from 'react'
import { selectedMarketSymbolAtom, waypointsAtom } from '../../data'
import { RenderLoadableAtom } from './RenderLoadableAtom'
import { Waypoint } from './Waypoint'

export const Waypoints = () => {
  const selectedWaypoint = useAtomValue(selectedMarketSymbolAtom)
  return (
    <RenderLoadableAtom
      title="Waypoints"
      atom={waypointsAtom}
      render={(data) => (
        <Stack spacing={2}>
          <Box>Waypoints: {data.length}</Box>
          <Suspense fallback={<LinearProgress />}>{selectedWaypoint && <Waypoint symbol={selectedWaypoint} />}</Suspense>
        </Stack>
      )}
    />
  )
}
