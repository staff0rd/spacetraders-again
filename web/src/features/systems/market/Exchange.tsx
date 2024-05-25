import { Alert } from '@mui/material'
import { useParams } from 'react-router-dom'
import { marketAtomFamily } from '../../../data'
import { DataTable } from '../../agent/DataTable'
import { RenderLoadableAtom } from '../../agent/RenderLoadableAtom'

export const Exchange = () => {
  const { waypointSymbol } = useParams()
  const marketAtom = marketAtomFamily(waypointSymbol!)
  return (
    <RenderLoadableAtom
      atom={marketAtom}
      id="market-exchange"
      render={(market) =>
        market.exchange.length ? (
          <DataTable
            title="Exchange"
            headers={['Symbol', 'Name', 'Description']}
            rows={market.exchange.map((row) => [row.symbol, row.name, row.description])}
          />
        ) : (
          <Alert severity="warning">No exchange</Alert>
        )
      }
    />
  )
}
