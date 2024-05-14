import { Box, Stack } from '@mui/material'
import { waypointsAtom } from '../../data'
import { RenderLoadableAtom } from './RenderLoadableAtom'

export const Waypoints = () => {
  return (
    <RenderLoadableAtom
      title="Waypoints"
      atom={waypointsAtom}
      render={(data) => (
        <Stack spacing={2}>
          <Box>Waypoints: {data.length}</Box>
        </Stack>
      )}
    />
  )
}
