import { blueGrey, orange } from '@mui/material/colors'
import { Container, Graphics, Text } from '@pixi/react'
import { differenceInSeconds } from 'date-fns'
import { gsap } from 'gsap'
import { Color, TextStyle } from 'pixi.js'
import { ComponentProps, useCallback, useEffect, useMemo, useRef } from 'react'
import { Ship } from '../../../backend/api'

type ShipTransitMarkerProps = {
  ship: Ship
  isHovered: boolean
  onOver?: () => void
  onOut?: () => void
  onClick?: () => void
}

export const ShipTransitMarker = ({ onOver, onOut, ship, isHovered }: ShipTransitMarkerProps) => {
  const markerRef = useRef<React.ElementRef<typeof Graphics>>(null)
  const shipPosition = useMemo(() => {
    const total = differenceInSeconds(ship.nav.route.arrival, ship.nav.route.departureTime)
    const left = differenceInSeconds(ship.nav.route.arrival, new Date())
    const progress = 1 - left / total
    const x = ship.nav.route.origin.x + (ship.nav.route.destination.x - ship.nav.route.origin.x) * progress
    const y = ship.nav.route.origin.y + (ship.nav.route.destination.y - ship.nav.route.origin.y) * progress
    return { x, y }
  }, [
    ship.nav.route.arrival,
    ship.nav.route.departureTime,
    ship.nav.route.destination.x,
    ship.nav.route.destination.y,
    ship.nav.route.origin.x,
    ship.nav.route.origin.y,
  ])

  useEffect(() => {
    if (!markerRef.current) return
    const tween = gsap.to(markerRef.current, {
      x: ship.nav.route.destination.x,
      y: ship.nav.route.destination.y,
      duration: differenceInSeconds(ship.nav.route.arrival, new Date()),
    })
    return () => {
      tween.kill()
    }
  }, [ship.nav.route.arrival, ship.nav.route.destination.x, ship.nav.route.destination.y, shipPosition])

  const drawRoute = useCallback(
    (g: Parameters<NonNullable<ComponentProps<typeof Graphics>['draw']>>[0]) => {
      g.clear()
      g.lineStyle(1, new Color(blueGrey['400']).toNumber())
      g.moveTo(ship.nav.route.origin.x, ship.nav.route.origin.y)
      g.lineTo(ship.nav.route.destination.x, ship.nav.route.destination.y)
    },
    [ship],
  )

  const drawMarker = useCallback(
    (g: Parameters<NonNullable<ComponentProps<typeof Graphics>['draw']>>[0]) => {
      g.clear()
      g.lineStyle(0)
      g.beginFill(new Color(isHovered ? orange['200'] : orange['700']).toNumber())

      const angle = Math.atan2(
        ship.nav.route.destination.y - ship.nav.route.origin.y,
        ship.nav.route.destination.x - ship.nav.route.origin.x,
      )
      const size = 5
      const p1 = { x: Math.cos(angle) * size, y: Math.sin(angle) * size }
      const p2 = { x: Math.cos(angle + (2 * Math.PI) / 3) * size, y: Math.sin(angle + (2 * Math.PI) / 3) * size }
      const p3 = { x: Math.cos(angle + (4 * Math.PI) / 3) * size, y: Math.sin(angle + (4 * Math.PI) / 3) * size }
      g.drawPolygon([p1.x, p1.y, p2.x, p2.y, p3.x, p3.y])
    },
    [ship, isHovered],
  )

  const label = `${ship.symbol}\n${ship.registration.role}`

  return (
    <Container interactive={true} cursor="pointer" onmouseover={onOver} onmouseout={onOut}>
      {label && (
        <>
          {isHovered && <Graphics draw={drawRoute} />}
          <Container x={shipPosition.x} y={shipPosition.y} ref={markerRef}>
            <Graphics draw={drawMarker} />
            {isHovered && (
              <Text
                text={label}
                x={0}
                y={0}
                style={new TextStyle({ fill: orange['200'], align: 'center' })}
                scale={0.3}
                anchor={{ x: 0.5, y: -0.5 }}
              />
            )}
          </Container>
        </>
      )}
    </Container>
  )
}
