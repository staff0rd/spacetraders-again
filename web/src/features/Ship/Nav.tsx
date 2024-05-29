import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Alert, Card, CardContent, Stack, Typography } from '@mui/material'
import { formatDistanceToNow } from 'date-fns'
import { useParams } from 'react-router-dom'
import { shipsAtom } from '../../data'
import { RenderLoadableAtom } from '../../shared/RenderLoadableAtom'
export function Nav() {
  const { shipSymbol } = useParams()

  return (
    <RenderLoadableAtom
      atom={shipsAtom}
      id={`ship-${shipSymbol}-nav`}
      render={(ships) => {
        const ship = ships.find((x) => x.symbol === shipSymbol)
        if (!ship) return <Alert severity="warning">Ship not found</Alert>
        const nav = ship.nav
        return (
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    {nav.route.origin.symbol}
                  </Typography>
                  <Typography variant="h6" component="div">
                    {nav.route.origin.type}
                  </Typography>
                  <Typography variant="body1">
                    Departure: {formatDistanceToNow(new Date(nav.route.departureTime), { addSuffix: true })}
                  </Typography>
                </CardContent>
              </Card>
              <ArrowForwardIcon sx={{ fontSize: 50 }} />
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    {nav.route.destination.symbol}
                  </Typography>
                  <Typography variant="h6" component="div">
                    {nav.route.destination.type}
                  </Typography>
                  <Typography variant="body1">Arrival: {formatDistanceToNow(new Date(nav.route.arrival), { addSuffix: true })}</Typography>
                </CardContent>
              </Card>
            </Stack>
          </Stack>
        )
      }}
    />
  )
}
