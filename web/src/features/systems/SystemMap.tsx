import { Box } from '@mui/material'
import { blueGrey } from '@mui/material/colors'
import { Container, Graphics, Stage, Text } from '@pixi/react'
import { gsap } from 'gsap'
import { PixiPlugin } from 'gsap/PixiPlugin'
import * as PIXI from 'pixi.js'
import { Color, TextStyle } from 'pixi.js'
import { ComponentProps, ElementRef, useCallback, useRef, useState } from 'react'
import { Waypoint } from '../../backend/api'
import { waypointsAtom } from '../../data'
import { RenderLoadableAtom } from '../../shared/RenderLoadableAtom'
import Viewport from '../pixi/Viewport'

gsap.registerPlugin(PixiPlugin)

function clamp(value: number, minimum: number, maximum: number) {
  if (value < minimum) return minimum
  else if (maximum < value) return maximum
  else return value
}

type SystemMapInnerProps = {
  waypoints: Waypoint[]
}

const getWorldBounds = (waypoints: Waypoint[]) => {
  const maxY = waypoints.reduce((max, waypoint) => Math.max(max, waypoint.y), 0)
  const minY = waypoints.reduce((min, waypoint) => Math.min(min, waypoint.y), 0)
  const maxX = waypoints.reduce((max, waypoint) => Math.max(max, waypoint.x), 0)
  const minX = waypoints.reduce((min, waypoint) => Math.min(min, waypoint.x), 0)

  return new PIXI.Rectangle(minX, minY, maxX - minX, maxY - minY)
}

function SystemMapInner({ waypoints }: SystemMapInnerProps) {
  const container = useRef<ElementRef<typeof Container>>(null)
  const [hoveredWaypoint, setHoveredWaypoint] = useState<Waypoint | null>(null)

  const screenWidth = 740
  const screenHeight = 555
  const { width: worldWidth, height: worldHeight } = getWorldBounds(waypoints)

  return (
    <Box>
      <Stage width={740} height={555} options={{ background: new Color(blueGrey['900']).toNumber(), width: 740, height: 370 }}>
        <Viewport screenWidth={screenWidth} screenHeight={screenHeight} worldWidth={worldWidth} worldHeight={worldHeight}>
          {/* <Graphics
            draw={(g) => {
              g.clear()
              g.beginFill(new Color(purple['900']).toNumber())
              g.drawRect(0, 0, worldWidth, worldHeight)
            }}
          /> */}
          <Container x={worldWidth / 2} y={worldHeight / 2} ref={container}>
            {waypoints.map((waypoint) => (
              <DrawnWaypoint
                key={waypoint.symbol}
                waypoint={waypoint}
                setHoveredWaypoint={setHoveredWaypoint}
                onOver={() => setHoveredWaypoint(waypoint)}
                onOut={() => setHoveredWaypoint(null)}
              />
            ))}
          </Container>
        </Viewport>
      </Stage>
    </Box>
  )
}

export function SystemMap() {
  return <RenderLoadableAtom id="Map" atom={waypointsAtom} render={(waypoints) => <SystemMapInner waypoints={waypoints} />} />
}

type DrawnWaypointProps = {
  waypoint: Waypoint

  setHoveredWaypoint: (waypoint: Waypoint | null) => void
  onOver?: () => void
  onOut?: () => void
  onClick?: () => void
}

const DrawnWaypoint = ({ onOver, onOut, waypoint }: DrawnWaypointProps) => {
  const draw = useCallback(
    (g: Parameters<NonNullable<ComponentProps<typeof Graphics>['draw']>>[0]) => {
      const radius = 3
      g.clear()
      g.beginFill(new Color(blueGrey['400']).toNumber())
      g.drawCircle(waypoint.x, waypoint.y, radius)
      g.endFill()
    },
    [waypoint],
  )
  return (
    <Container interactive={true} cursor="pointer" onmouseover={onOver} onmouseout={onOut}>
      <Graphics draw={draw} />
      <Text
        text={waypoint.symbol.match(/.*-(.*)$/)![1]}
        x={waypoint.x}
        y={waypoint.y}
        style={new TextStyle({ fill: 'white' })}
        scale={0.3}
        anchor={{ x: 0.5, y: 0 }}
      />
    </Container>
  )
}
