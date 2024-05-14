import { Alert, Box } from '@mui/material'
import { useRouteError } from 'react-router-dom'

export default function ErrorPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error: any = useRouteError()
  console.error(error)
  return (
    <Box>
      <Alert severity="error">An unexpected error has occurred: {error.statusText || error.message}</Alert>
    </Box>
  )
}
