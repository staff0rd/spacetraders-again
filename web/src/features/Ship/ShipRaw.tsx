import { Alert } from '@mui/material'
import { useParams } from 'react-router-dom'
import { shipsAtom } from '../../data'
import { Raw } from '../../shared/Raw'
import { RenderLoadableAtom } from '../../shared/RenderLoadableAtom'

export const ShipRaw = () => {
  const shipSymbol = useParams().shipSymbol
  return (
    <RenderLoadableAtom
      atom={shipsAtom}
      id="ship-raw"
      render={(ships) => {
        const ship = ships.find((x) => x.symbol === shipSymbol)
        if (!ship) return <Alert severity="warning">Ship not found</Alert>

        return <Raw json={ship} />
      }}
    />
  )
}
