import { Box } from '@mui/material'
import { blueGrey } from '@mui/material/colors'
import { Container, Stage } from '@pixi/react'
import { gsap } from 'gsap'
import { PixiPlugin } from 'gsap/PixiPlugin'
import * as lodash from 'lodash'
import * as PIXI from 'pixi.js'
import { Color } from 'pixi.js'
import { useMemo, useState } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { Ship, Waypoint } from '../../../backend/api'
import { waypointsAtom } from '../../../data'
import { RenderLoadableAtom } from '../../../shared/RenderLoadableAtom'
import { Ship as ShipComponent } from '../../Ship/Ship'
import Viewport from '../../pixi/Viewport'
import { Waypoint as WaypointComponent } from '../Waypoint'
import { ShipTransit } from './ShipTransit'
import { WaypointMarker } from './WaypointMarker'

gsap.registerPlugin(PixiPlugin)

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
  const { shipSymbol, waypointSymbol } = useParams()
  const [hoveredWaypoint, setHoveredWaypoint] = useState<Waypoint | null>(null)
  const [hoveredShip, setHoveredShip] = useState<Ship | null>(null)

  const screenWidth = 740
  const screenHeight = 555
  const { width: worldWidth, height: worldHeight } = getWorldBounds(waypoints)

  const navigate = useNavigate()
  const selectShip = (shipSymbol: string) => {
    navigate(`ships/${shipSymbol}`)
  }
  const selectWaypoint = (waypointSymbol: string) => {
    navigate(`waypoints/${waypointSymbol}`)
  }

  const waypointsGroupedByLocation = useMemo((): Waypoint[][] => {
    const grouped = lodash.groupBy(waypoints, ({ x, y }) => `${x},${y}`)
    return Object.values(grouped)
  }, [waypoints])

  return (
    <Box>
      <Stage
        width={740}
        height={555}
        options={{ background: new Color(blueGrey['900']).toNumber(), width: 740, height: 370 }}
        onMouseLeave={() => {
          setHoveredWaypoint(null)
          setHoveredShip(null)
        }}
      >
        <Viewport screenWidth={screenWidth} screenHeight={screenHeight} worldWidth={worldWidth} worldHeight={worldHeight}>
          <Container x={worldWidth / 2} y={worldHeight / 2}>
            {waypointsGroupedByLocation.map((w) => (
              <WaypointMarker
                key={w[0].symbol}
                waypoints={w}
                hoveredWaypoint={hoveredWaypoint}
                onOver={(waypoint) => setHoveredWaypoint(waypoint)}
                onOut={() => setHoveredWaypoint(null)}
                onClick={selectWaypoint}
              />
            ))}
          </Container>
          <ShipTransit
            worldHeight={worldHeight}
            worldWidth={worldWidth}
            systemSymbol={waypoints[0].systemSymbol}
            hoveredShip={hoveredShip}
            setHoveredShip={setHoveredShip}
            onClick={selectShip}
          />
        </Viewport>
      </Stage>
      {hoveredWaypoint ? (
        <WaypointComponent symbol={waypointSymbol === hoveredWaypoint.symbol ? undefined : hoveredWaypoint.symbol} />
      ) : hoveredShip ? (
        <ShipComponent symbol={shipSymbol === hoveredShip.symbol ? undefined : hoveredShip.symbol} />
      ) : (
        <Outlet />
      )}
    </Box>
  )
}

export function SystemMap() {
  return <RenderLoadableAtom id="Map" atom={waypointsAtom} render={(waypoints) => <SystemMapInner waypoints={waypoints} />} />
}
