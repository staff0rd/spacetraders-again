import { blueGrey, green } from '@mui/material/colors'
import { Container, Graphics, PixiComponent } from '@pixi/react'
import * as lodash from 'lodash'
import { Color, Container as PixiContainer, Text as PixiText, TextStyle } from 'pixi.js'
import { ComponentProps, useCallback } from 'react'
import { Waypoint } from '../../../backend/api'

const isSamePoint = (x1: number | undefined, y1: number | undefined, x2: number | undefined, y2: number | undefined) =>
  x1 === x2 && y1 === y2

type WaypointMarkerProps = {
  waypoints: Waypoint[]
  hoveredWaypoint: Waypoint | null
  onOver: (waypoint: Waypoint) => void
  onOut: () => void
  onClick: (waypointSymbol: string) => void
}
export const WaypointMarker = ({ onOver, onOut, waypoints, hoveredWaypoint, onClick }: WaypointMarkerProps) => {
  const firstWaypoint = waypoints[0]
  const { x, y, symbol } = firstWaypoint
  const draw = useCallback(
    (g: Parameters<NonNullable<ComponentProps<typeof Graphics>['draw']>>[0]) => {
      const radius = 3
      g.clear()
      g.beginFill(new Color(isSamePoint(hoveredWaypoint?.x, hoveredWaypoint?.y, x, y) ? green['400'] : blueGrey['400']).toNumber())
      g.drawCircle(x, y, radius)
      g.endFill()
    },
    [x, y, hoveredWaypoint],
  )

  return (
    <Container>
      <Graphics
        interactive
        draw={draw}
        onmouseover={() => onOver(firstWaypoint)}
        onmouseout={onOut}
        cursor="pointer"
        onclick={() => onClick(symbol)}
      />
      <WaypointsLabel waypoints={waypoints} x={x} y={y} hoveredWaypoint={hoveredWaypoint} onOver={onOver} onOut={onOut} onClick={onClick} />
    </Container>
  )
}

type WaypointsLabelProps = {
  waypoints: Waypoint[]
  x: number
  y: number
  hoveredWaypoint: Waypoint | null
  onOver: (waypoint: Waypoint) => void
  onOut: () => void
  onClick: (waypointSymbol: string) => void
}

const WaypointsLabel = PixiComponent<WaypointsLabelProps, PixiContainer>('WaypointsLabel', {
  create: () => new PixiContainer(),
  applyProps: (container, _, { waypoints, x, y, hoveredWaypoint, onOver, onOut, onClick }) => {
    container.x = x
    container.y = y
    container.removeChildren()
    lodash
      .flatMap(
        waypoints.map((waypoint) => ({ label: waypoint.symbol.match(/.*-(.*)$/)![1], waypoint })),
        (value, index, array) => (array.length - 1 !== index ? [value, { label: '•', waypoint: null }] : value),
      )
      .forEach(({ label, waypoint }) => {
        const style = new TextStyle({
          fill: !waypoint ? 'white' : hoveredWaypoint?.symbol === waypoint.symbol ? green['400'] : 'white',
        })
        const text = new PixiText(label, style)
        if (waypoint) {
          text.interactive = true
          text.cursor = 'pointer'
          text.onmouseover = () => onOver(waypoint)
          text.onmouseout = () => onOut()
          text.onclick = () => onClick(waypoint.symbol)
        }
        text.x = container.width / container.scale.x
        container.addChild(text)
      })
    container.pivot.set(container.width / 2 / container.scale.x, -container.height / 2 / container.scale.y)
    container.scale.set(0.3)
  },
})
