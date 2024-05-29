import { Alert } from '@mui/material'
import { useParams } from 'react-router-dom'
import { marketAtomFamily } from '../../../data'
import { DataTable } from '../../../shared/DataTable'
import { RenderLoadableAtom } from '../../../shared/RenderLoadableAtom'

export const Imports = () => {
  const { waypointSymbol } = useParams()
  const marketAtom = marketAtomFamily(waypointSymbol!)
  return (
    <RenderLoadableAtom
      atom={marketAtom}
      id="market-imports"
      render={(market) =>
        market.imports.length ? (
          <DataTable
            title="Imports"
            headers={['Symbol', 'Name', 'Description']}
            rows={market.imports.map((row) => [row.symbol, row.name, row.description])}
          />
        ) : (
          <Alert severity="warning">No imports</Alert>
        )
      }
    />
  )
}
