import ExportsIcon from '@mui/icons-material/North'
import TransactionIcon from '@mui/icons-material/Receipt'
import ImportsIcon from '@mui/icons-material/South'
import ExchangeIcon from '@mui/icons-material/SyncAlt'
import { Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { marketsAtom } from '../../data'
import { RenderLoadableAtom } from './RenderLoadableAtom'
export const Markets = () => (
  <RenderLoadableAtom
    atom={marketsAtom}
    title="Markets"
    render={(data) => (
      <Stack>
        <TableContainer component={Paper}>
          <Table aria-label="markets" size="small">
            <TableHead>
              <TableRow>
                <TableCell>Markets: {data.length}</TableCell>
                <TableCell align="center">
                  <ImportsIcon titleAccess="Imports" />
                </TableCell>
                <TableCell align="center">
                  <ExportsIcon titleAccess="Exports" />
                </TableCell>
                <TableCell align="center">
                  <ExchangeIcon sx={{ transform: 'rotate(90deg)' }} titleAccess="Exchange" />
                </TableCell>
                <TableCell align="center">
                  <TransactionIcon titleAccess="Transactions" />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data
                .toSorted((a, b) => a.symbol.localeCompare(b.symbol))
                .map((market) => (
                  <TableRow key={market.symbol} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">
                      {market.symbol}
                    </TableCell>
                    <TableCell align="center">{market.imports.length}</TableCell>
                    <TableCell align="center">{market.exports.length}</TableCell>
                    <TableCell align="center">{market.exchange.length}</TableCell>
                    <TableCell align="center">{market.transactions?.length ?? '-'}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    )}
  />
)
