import { Box } from '@mui/material'
import { blueGrey } from '@mui/material/colors'
import { Container, Graphics, Stage } from '@pixi/react'
import { gsap } from 'gsap'
import { PixiPlugin } from 'gsap/PixiPlugin'
import { Color } from 'pixi.js'
import { ComponentProps, ElementRef, useCallback, useMemo, useRef, useState } from 'react'
import { Waypoint } from '../../backend/api'
import { waypointsAtom } from '../../data'
import { RenderLoadableAtom } from '../../shared/RenderLoadableAtom'

gsap.registerPlugin(PixiPlugin)

function clamp(value: number, minimum: number, maximum: number) {
  if (value < minimum) return minimum
  else if (maximum < value) return maximum
  else return value
}

type SystemMapInnerProps = {
  waypoints: Waypoint[]
}

const getBoundingScale = (waypoints: Waypoint[]) => {
  const maxY = waypoints.reduce((max, waypoint) => Math.max(max, waypoint.y), 0)
  const minY = waypoints.reduce((min, waypoint) => Math.min(min, waypoint.y), 0)
  const maxX = waypoints.reduce((max, waypoint) => Math.max(max, waypoint.x), 0)
  const minX = waypoints.reduce((min, waypoint) => Math.min(min, waypoint.x), 0)

  const scaleX = 700 / (maxX - minX)
  const scaleY = 500 / (maxY - minY)
  const scale = Math.min(scaleX, scaleY)
  return { x: scale, y: scale }
}

function SystemMapInner({ waypoints }: SystemMapInnerProps) {
  const container = useRef<ElementRef<typeof Container>>(null)
  const startScale = useMemo(() => getBoundingScale(waypoints), [waypoints])
  const [scale, setScale] = useState(startScale)

  return (
    <Box
      onWheel={(s) => {
        const newScale = clamp(scale.x * Math.pow(2, -s.deltaY / 300), startScale.x, 10)
        gsap.killTweensOf(container.current!.scale)
        gsap.to(container.current!.scale, {
          x: newScale,
          y: newScale,
          duration: 0.25,
          onUpdate: () => {
            const { x, y } = container.current!.scale
            setScale({ x, y })
          },
        })
      }}
    >
      <Stage width={740} height={555} options={{ background: new Color(blueGrey['900']).toNumber(), width: 740, height: 370 }}>
        <Container x={740 / 2} y={555 / 2} ref={container} scale={scale}>
          {waypoints.map((waypoint) => (
            <DrawnWaypoint key={waypoint.symbol} x={waypoint.x} y={waypoint.y} scale={scale.x} />
          ))}
        </Container>
      </Stage>
    </Box>
  )
}

export function SystemMap() {
  return <RenderLoadableAtom id="Map" atom={waypointsAtom} render={(waypoints) => <SystemMapInner waypoints={waypoints} />} />
}

type DrawnWaypointProps = {
  x: number
  y: number
  scale: number
}

const DrawnWaypoint = ({ x, y, scale }: DrawnWaypointProps) => {
  const draw = useCallback(
    (g: Parameters<NonNullable<ComponentProps<typeof Graphics>['draw']>>[0]) => {
      const radius = 3 / scale
      g.clear()
      g.beginFill(new Color(blueGrey['400']).toNumber())
      g.drawCircle(x, y, radius)
      g.endFill()
    },
    [scale, x, y],
  )
  return <Graphics draw={draw} />
}
