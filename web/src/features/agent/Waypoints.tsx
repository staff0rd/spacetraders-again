import { Box } from '@mui/material'
import { waypointsAtom } from '../../data'
import { RenderLoadableAtom } from './RenderLoadableAtom'

export const Waypoints = () => (
  <RenderLoadableAtom title="Waypoints" atom={waypointsAtom} render={(data) => <Box>Waypoints: {data.length}</Box>} />
)
