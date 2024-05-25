import { Alert } from '@mui/material'
import { useParams } from 'react-router-dom'
import { shipsAtom } from '../../data'
import { Raw } from '../agent/Raw'
import { RenderLoadableAtom } from '../agent/RenderLoadableAtom'

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
