import { Box, SxProps, Typography } from '@mui/material'
import { toSentenceCase } from 'js-convert-case'
import { ReactNode } from 'react'
import { LabeledValue } from './LabeledValue'

type ObjectValuesProps = {
  object: NonNullable<unknown>
  title?: string
  sx?: SxProps
}

const isPrimitive = (value: unknown) => value !== Object(value)

export function ObjectValues({ object, title, sx }: ObjectValuesProps) {
  return (
    <Box sx={sx}>
      {title && <Typography variant="h6">{title}</Typography>}
      {Object.entries(object)
        .filter(([, value]) => isPrimitive(value))
        .map(([key, value]) => (
          <LabeledValue key={key} label={toSentenceCase(key)} value={value as ReactNode} />
        ))}
    </Box>
  )
}
