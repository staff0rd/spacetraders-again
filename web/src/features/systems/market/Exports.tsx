import { Alert } from '@mui/material'
import { useParams } from 'react-router-dom'
import { marketAtomFamily } from '../../../data'
import { DataTable } from '../../agent/DataTable'
import { RenderLoadableAtom } from '../../agent/RenderLoadableAtom'

export const Exports = () => {
  const { waypointSymbol } = useParams()
  const marketAtom = marketAtomFamily(waypointSymbol!)
  return (
    <RenderLoadableAtom
      atom={marketAtom}
      id="market-exports"
      render={(market) =>
        market.exports.length ? (
          <DataTable
            title="Exports"
            headers={['Symbol', 'Name', 'Description']}
            rows={market.exports.map((row) => [row.symbol, row.name, row.description])}
          />
        ) : (
          <Alert severity="warning">No exports</Alert>
        )
      }
    />
  )
}
