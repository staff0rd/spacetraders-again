import { Card, CardContent, Stack, Typography } from '@mui/material'
import { ReactNode } from 'react'

type OverviewProps = {
  type: string | undefined
  symbol: string | undefined
  subtype: string | undefined
  lines: ReactNode[]
}
export const Overview = ({ type, symbol, subtype = '', lines }: OverviewProps) => (
  <Card variant="outlined">
    <CardContent>
      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
        {type}
      </Typography>
      <Typography variant="h5" component="div" sx={{ letterSpacing: 1 }}>
        {symbol}
      </Typography>
      <Typography sx={{ mb: 1.5, fontSize: 16 }} color="text.secondary">
        {subtype.replaceAll('_', ' ')}
      </Typography>
      <Stack>
        {lines.map((line, index) => (
          <Typography key={index} variant="body2">
            {line}
          </Typography>
        ))}
      </Stack>
    </CardContent>
  </Card>
)
