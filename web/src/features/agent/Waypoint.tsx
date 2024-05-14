import { Box, Stack } from '@mui/material'
import { useAtomValue } from 'jotai'
import { waypointAtomFamily } from '../../data'

type WaypointProps = {
  symbol: string
}
export function Waypoint({ symbol }: WaypointProps) {
  const waypoint = useAtomValue(waypointAtomFamily(symbol))

  if (!waypoint) return null
  return (
    <Stack spacing={2}>
      <Box>{waypoint.symbol}</Box>
    </Stack>
  )
}
