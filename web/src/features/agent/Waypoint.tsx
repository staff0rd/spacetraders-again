import { Box, Stack } from '@mui/material'
import { useAtomValue } from 'jotai'
import { marketAtomFamily, waypointAtomFamily } from '../../data'
import Market from './Market'
import { RenderLoadableAtom } from './RenderLoadableAtom'

type WaypointProps = {
  symbol: string
}
export function Waypoint({ symbol }: WaypointProps) {
  const waypoint = useAtomValue(waypointAtomFamily(symbol))
  const marketAtom = marketAtomFamily(symbol)
  if (!waypoint) return null
  return (
    <Stack spacing={2}>
      <Box>{waypoint.symbol}</Box>
      {marketAtom && <RenderLoadableAtom title="Market" atom={marketAtom} render={(market) => <Market market={market} />} />}
    </Stack>
  )
}
