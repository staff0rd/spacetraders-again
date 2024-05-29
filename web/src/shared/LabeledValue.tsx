import { Box, Typography } from '@mui/material'
import { ReactNode } from 'react'

type LabeledValueProps = {
  label: ReactNode
  value: ReactNode
}
export function LabeledValue({ label, value }: LabeledValueProps) {
  return (
    <Box>
      <Typography sx={{ fontWeight: 600 }} variant="body1" component="span">
        {label}:
      </Typography>
      <Typography variant="body1" component="span">
        {' '}
        {value}
      </Typography>
    </Box>
  )
}
