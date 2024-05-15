import { Alert, Stack } from '@mui/material'
import { PropsWithChildren } from 'react'
import { useRouteError } from 'react-router-dom'

export default function RouteError({ children }: PropsWithChildren) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error: any = useRouteError()
  console.error(error)
  return (
    <Stack spacing={2}>
      {children}
      <Alert severity="error">An unexpected error has occurred: {error.statusText || error.message}</Alert>
    </Stack>
  )
}
