import { Card, CardContent, Grid, Typography } from '@mui/material'
import { statusAtom } from '../../data'
import { RenderLoadableAtom } from '../../shared/RenderLoadableAtom'

export function Announcements() {
  return (
    <RenderLoadableAtom
      id="most-credits"
      atom={statusAtom}
      render={(status) => (
        <Grid container spacing={3}>
          {status.announcements.map(({ body, title }) => (
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{title}</Typography>
                  <Typography>{body}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    />
  )
}
