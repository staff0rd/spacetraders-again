import { CircularProgress } from '@mui/material'

export function CircularProgressLoader({ id }: { id: string }) {
  return (
    <CircularProgress
      id={id}
      sx={{
        marginTop: 1,
      }}
    />
  )
}
