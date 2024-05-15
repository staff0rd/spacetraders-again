import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { waypointsAtom } from '../../data'
import { routes } from '../../router'
import { RenderLoadableAtom } from './RenderLoadableAtom'
import { RouterLink } from './RouterLink'

export const Waypoints = () => {
  return (
    <RenderLoadableAtom
      title="Waypoints"
      atom={waypointsAtom}
      render={(waypoints) => (
        <TableContainer component={Paper}>
          <Table aria-label="waypoints" size="small">
            <TableHead>
              <TableRow>
                <TableCell>Waypoints: {waypoints.length}</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Faction</TableCell>
                <TableCell>Traits</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {waypoints
                .toSorted((a, b) => a.symbol.localeCompare(b.symbol))
                .map(({ symbol, traits, type, faction }) => (
                  <TableRow key={symbol} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">
                      <RouterLink to={routes.waypoint(symbol)}>{symbol}</RouterLink>
                    </TableCell>
                    <TableCell>{type.replaceAll('_', ' ')}</TableCell>
                    <TableCell>{faction?.symbol ?? '-'}</TableCell>
                    <TableCell>{traits.map((x) => x.symbol.replaceAll('_', ' ')).join(', ')}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    />
  )
}
