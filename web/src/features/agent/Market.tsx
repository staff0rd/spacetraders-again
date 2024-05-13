import { Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { formatDistance } from 'date-fns'
import { Market } from '../../backend/api'

type Props = {
  market: Market
}

export default function Render({ market }: Props) {
  const transactions = market.transactions ?? []
  return (
    <Stack spacing={2}>
      <TableContainer component={Paper}>
        <Table aria-label="transactions" size="small">
          <TableHead>
            <TableRow>
              <TableCell>Transactions: {transactions.length}</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Symbol</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Ship</TableCell>
              <TableCell>$/unit</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map(({ pricePerUnit, shipSymbol, timestamp, totalPrice, tradeSymbol, type, units }) => (
              <TableRow key={`${market.symbol}-${timestamp}`} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">
                  {type}
                </TableCell>
                <TableCell>{units}</TableCell>
                <TableCell>{tradeSymbol}</TableCell>
                <TableCell>{formatDistance(timestamp, new Date(), { addSuffix: true })}</TableCell>
                <TableCell>{shipSymbol}</TableCell>
                <TableCell>{pricePerUnit.toLocaleString()}</TableCell>
                <TableCell>{totalPrice.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
