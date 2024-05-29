import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { ReactNode } from 'react'

type DataTableProps = {
  headers: string[]
  rows: ReactNode[][]
  title: string
}
export function DataTable({ headers, rows, title }: DataTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label={title} size="small">
        <TableHead>
          <TableRow>
            {headers.map((header) => (
              <TableCell key={header}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, ix) => (
            <TableRow key={ix} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th" scope="row">
                {row[0]}
              </TableCell>
              {row.slice(1).map((cell, ix) => (
                <TableCell key={ix}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
