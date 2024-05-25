import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { useParams } from 'react-router-dom'
import { waypointAtomFamily } from '../../data'
import { RenderLoadableAtom } from '../agent/RenderLoadableAtom'

export const WaypointTraits = () => {
  const { waypointSymbol } = useParams()
  const waypointAtom = waypointAtomFamily(waypointSymbol!)

  return (
    <RenderLoadableAtom
      id="traits"
      atom={waypointAtom}
      render={({ traits }) => {
        return (
          <TableContainer component={Paper}>
            <Table aria-label="waypoints" size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {traits
                  .toSorted((a, b) => a.symbol.localeCompare(b.symbol))
                  .map(({ name, description, symbol }) => (
                    <TableRow key={symbol} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell component="th" scope="row">
                        {name}
                      </TableCell>
                      <TableCell>{description}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      }}
    />
  )
}
