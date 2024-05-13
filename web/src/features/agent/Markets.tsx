import ExportsIcon from '@mui/icons-material/North'
import TransactionIcon from '@mui/icons-material/Receipt'
import ImportsIcon from '@mui/icons-material/South'
import ExchangeIcon from '@mui/icons-material/SyncAlt'
import { CircularProgress, Link, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { useAtom, useSetAtom } from 'jotai'
import { marketsAtom, selectedMarketSymbolAtom } from '../../data'
import { RenderLoadableAtom } from './RenderLoadableAtom'
export const Markets = () => {
  const [marketAtoms] = useAtom(marketsAtom)
  const setSelectedMarketAtom = useSetAtom(selectedMarketSymbolAtom)
  if (!marketAtoms) return <CircularProgress />

  return (
    <Stack>
      <TableContainer component={Paper}>
        <Table aria-label="markets" size="small">
          <TableHead>
            <TableRow>
              <TableCell>Markets: {marketAtoms.length}</TableCell>
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
            {marketAtoms.map(({ symbol, atom }) => (
              <RenderLoadableAtom
                atom={atom}
                progress="linear"
                key={`${atom}`}
                title={symbol}
                render={(market) => (
                  <TableRow key={market.symbol} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">
                      <Link sx={{ cursor: 'pointer' }} onClick={() => setSelectedMarketAtom(market.symbol)}>
                        {market.symbol}
                      </Link>
                    </TableCell>
                    <TableCell align="center">{market.imports.length}</TableCell>
                    <TableCell align="center">{market.exports.length}</TableCell>
                    <TableCell align="center">{market.exchange.length}</TableCell>
                    <TableCell align="center">{market.transactions?.length ?? '-'}</TableCell>
                  </TableRow>
                )}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
