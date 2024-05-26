import { Alert } from '@mui/material'
import { DataTable } from '../agent/DataTable'
import { RenderShipsAtom } from './RenderShipsAtom'

export function Cargo() {
  return (
    <RenderShipsAtom
      render={(ship) => {
        if (ship.cargo.inventory.length === 0) return <Alert severity="info">No cargo</Alert>
        return <DataTable title="Cargo" headers={['Symbol', 'Units']} rows={ship.cargo.inventory.map((x) => [x.symbol, x.units])} />
      }}
    />
  )
}
