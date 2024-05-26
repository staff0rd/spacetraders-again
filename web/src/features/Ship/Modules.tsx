import { Alert, Card, CardContent, Grid } from '@mui/material'
import { ObjectValues } from './ObjectValues'
import { RenderShipsAtom } from './RenderShipsAtom'

export function Modules() {
  return (
    <RenderShipsAtom
      render={(ship) => {
        if (!ship.modules.length) return <Alert severity="info">No modules</Alert>
        return (
          <Grid spacing={2} container>
            {ship.modules.map((module, ix) => (
              <Grid item xs={6}>
                <Card key={ix}>
                  <CardContent>
                    <ObjectValues object={module} />
                    <ObjectValues sx={{ marginTop: 1 }} title="Requirements" object={module.requirements} />
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
