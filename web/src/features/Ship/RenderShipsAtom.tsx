import { Alert, Card, CardContent } from '@mui/material'
import { useParams } from 'react-router-dom'
import { Ship } from '../../backend/api'
import { shipsAtom } from '../../data'
import { RenderLoadableAtom } from '../../shared/RenderLoadableAtom'

type RenderShipsAtomProps = { render: (ship: Ship) => JSX.Element; card?: boolean }

export function RenderShipsAtom({ render, card }: RenderShipsAtomProps) {
  const { shipSymbol } = useParams()
  return (
    <RenderLoadableAtom
      atom={shipsAtom}
      id={`ship-${shipSymbol}-crew`}
      render={(ships) => {
        const ship = ships.find((x) => x.symbol === shipSymbol)
        if (!ship) return <Alert severity="warning">Ship not found</Alert>

        if (card)
          return (
            <Card>
              <CardContent>{render(ship)}</CardContent>
            </Card>
          )
        return render(ship)
      }}
    />
  )
}
