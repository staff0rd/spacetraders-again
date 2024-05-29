import { Alert, Card, CardContent, Grid } from '@mui/material'
import { ObjectValues } from '../../shared/ObjectValues'
import { RenderShipsAtom } from './RenderShipsAtom'

export function Mounts() {
  return (
    <RenderShipsAtom
      render={(ship) => {
        if (!ship.mounts.length) return <Alert severity="info">No mounts</Alert>
        return (
          <Grid spacing={2} container>
            {ship.mounts.map((mount, ix) => (
              <Grid item xs={6}>
                <Card key={ix}>
                  <CardContent>
                    <ObjectValues object={mount} />
                    <ObjectValues sx={{ marginTop: 1 }} title="Requirements" object={mount.requirements} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      }}
    />
  )
}
