import { Card, CardContent, Grid } from '@mui/material'
import { ObjectValues } from './ObjectValues'
import { RenderShipsAtom } from './RenderShipsAtom'

export function ShipBase() {
  return (
    <RenderShipsAtom
      render={(ship) => (
        <Grid spacing={2} container>
          {' '}
          <Grid item xs={6}>
            <Card>
              <CardContent>
                <ObjectValues object={ship.crew} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card>
              <CardContent>
                <ObjectValues object={ship.reactor} />
                <ObjectValues sx={{ marginTop: 1 }} title="Requirements" object={ship.reactor.requirements} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card>
              <CardContent>
                <ObjectValues object={ship.engine} />
                <ObjectValues sx={{ marginTop: 2 }} title="Requirements" object={ship.engine.requirements} />
              </CardContent>
            </Card>
          </Grid>{' '}
          <Grid item xs={6}>
            <Card>
              <CardContent>
                <ObjectValues object={ship.frame} />
                <ObjectValues sx={{ marginTop: 1 }} title="Requirements" object={ship.frame.requirements} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    />
  )
}
