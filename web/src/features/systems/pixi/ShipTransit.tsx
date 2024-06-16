import { Container } from '@pixi/react'
import { differenceInMilliseconds } from 'date-fns'
import { useAtomValue } from 'jotai'
import { Ship } from '../../../backend/api'
import { shipsAtom } from '../../../data'
import { ShipTransitMarker } from './ShipTransitMarker'

type ShipTransitProps = {
  worldWidth: number
  worldHeight: number
  systemSymbol: string
  hoveredShip: Ship | null
  setHoveredShip: (ship: Ship | null) => void
  onClick: (shipSymbol: string) => void
}
export function ShipTransit({ worldWidth, worldHeight, systemSymbol, hoveredShip, setHoveredShip, onClick }: ShipTransitProps) {
  const ships = useAtomValue(shipsAtom)

  if (ships.state !== 'hasData' || !ships.data) return null
  const shipsInTransit = ships.data.filter(
    (ship) =>
      ship.nav.route.destination.systemSymbol === systemSymbol &&
      ship.nav.status === 'IN_TRANSIT' &&
      differenceInMilliseconds(ship.nav.route.arrival, new Date()) > 0,
  )
  console.log(
    'shipsOnRoute',
    shipsInTransit.length,
    shipsInTransit.map((ship) => `${ship.symbol} ${ship.nav.route.origin.symbol} -> ${ship.nav.route.destination.symbol}`).join(', '),
  )
  return (
    <Container x={worldWidth / 2} y={worldHeight / 2}>
      <>
        {shipsInTransit.map((ship) => (
          <ShipTransitMarker
            key={ship.symbol}
            ship={ship}
            isHovered={hoveredShip?.symbol === ship.symbol}
            onOut={() => setHoveredShip(null)}
            onOver={() => setHoveredShip(ship)}
            onClick={() => {
              onClick(ship.symbol)
            }}
          />
        ))}
      </>
    </Container>
  )
}
