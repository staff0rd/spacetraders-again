import { Alert } from '@mui/material'
import { useParams } from 'react-router-dom'
import { shipsAtom } from '../../data'
import { DataTable } from '../agent/DataTable'
import { RenderLoadableAtom } from '../agent/RenderLoadableAtom'

export function Cargo() {
  const { shipSymbol } = useParams()

  return (
    <RenderLoadableAtom
      atom={shipsAtom}
      id={`ship-${shipSymbol}-cargo`}
      render={(ships) => {
        const ship = ships.find((x) => x.symbol === shipSymbol)
        if (!ship) return <Alert severity="warning">Ship not found</Alert>
        if (ship.cargo.inventory.length === 0) return <Alert severity="info">No cargo</Alert>
        return <DataTable title="Cargo" headers={['Symbol', 'Units']} rows={ship.cargo.inventory.map((x) => [x.symbol, x.units])} />
      }}
    />
  )
}
