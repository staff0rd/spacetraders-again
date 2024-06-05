import { blueGrey, green } from '@mui/material/colors'
import { Container, Graphics, Text } from '@pixi/react'
import { Color, TextStyle } from 'pixi.js'
import { ComponentProps, useCallback, useMemo } from 'react'
import { Waypoint } from '../../../backend/api'

type WaypointMarkerProps = {
  waypoint: Waypoint
  waypoints: Waypoint[]
  isHovered: boolean
  onOver?: () => void
  onOut?: () => void
  onClick?: () => void
}
export const WaypointMarker = ({ onOver, onOut, waypoint, waypoints, isHovered }: WaypointMarkerProps) => {
  const draw = useCallback(
    (g: Parameters<NonNullable<ComponentProps<typeof Graphics>['draw']>>[0]) => {
      const radius = 3
      g.clear()
      g.beginFill(new Color(isHovered ? green['400'] : blueGrey['400']).toNumber())
      g.drawCircle(waypoint.x, waypoint.y, radius)
      g.endFill()
    },
    [waypoint, isHovered],
  )
  const label = useMemo(() => {
    const waypointsAtLocation = waypoints.filter((w) => w.x === waypoint.x && w.y === waypoint.y)
    const isFirst = waypointsAtLocation[0].symbol === waypoint.symbol
    const label = isFirst ? waypointsAtLocation.map((w) => w.symbol.match(/.*-(.*)$/)![1]).join('/') : ''
    return label
  }, [waypoints, waypoint])

  return (
    <Container interactive={true} cursor="pointer" onmouseover={onOver} onmouseout={onOut}>
      {label && (
        <>
          <Graphics draw={draw} />
          <Text
            text={label}
            x={waypoint.x}
            y={waypoint.y}
            style={new TextStyle({ fill: isHovered ? green['400'] : 'white' })}
            scale={0.3}
            anchor={{ x: 0.5, y: -0.5 }}
          />
        </>
      )}
    </Container>
  )
}
