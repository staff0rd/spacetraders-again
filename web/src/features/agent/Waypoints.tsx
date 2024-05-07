import { Box } from '@mui/material'
import { waypointsAtom } from '../../data'
import { RenderLoadableAtom } from './RenderLoadableAtom'

export const Waypoints = () => <RenderLoadableAtom atom={waypointsAtom} render={(data) => <Box>Waypoints: {data.length}</Box>} />
