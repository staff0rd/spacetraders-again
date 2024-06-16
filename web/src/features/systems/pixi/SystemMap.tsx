import { Box, Stack, Typography } from '@mui/material'
import { blueGrey } from '@mui/material/colors'
import { Container, Stage } from '@pixi/react'
import { gsap } from 'gsap'
import { PixiPlugin } from 'gsap/PixiPlugin'
import * as PIXI from 'pixi.js'
import { Color } from 'pixi.js'
import { useMemo, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Ship, Waypoint } from '../../../backend/api'
import { waypointsAtom } from '../../../data'
import { RenderLoadableAtom } from '../../../shared/RenderLoadableAtom'
import Viewport from '../../pixi/Viewport'
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

type SelectedShipProps = {
  ship: Ship
}

function SelectedShip({ ship }: SelectedShipProps) {
  return (
    <Stack>
      <Typography variant="h5">{ship.symbol}</Typography>
      <Typography variant="h6">{ship.registration.role}</Typography>
    </Stack>
  )
}

function SystemMapInner({ waypoints }: SystemMapInnerProps) {
  const waypointsSortedByName = useMemo(() => waypoints.toSorted((a, b) => a.symbol.localeCompare(b.symbol)), [waypoints])
  const [hoveredWaypoint, setHoveredWaypoint] = useState<Waypoint | null>(null)
  const [hoveredShip, setHoveredShip] = useState<Ship | null>(null)
  const [selectedItem, setSelectedItem] = useState<Waypoint | Ship | null>(null)

  const screenWidth = 740
  const screenHeight = 555
  const { width: worldWidth, height: worldHeight } = getWorldBounds(waypoints)

  const hoveredWaypoints = useMemo(
    () => (hoveredWaypoint ? waypointsSortedByName.filter((w) => w.x === hoveredWaypoint.x && w.y === hoveredWaypoint.y) : []),
    [hoveredWaypoint, waypointsSortedByName],
  )
  const navigate = useNavigate()
  const selectShip = (shipSymbol: string) => {
    navigate(`ships/${shipSymbol}`)
  }
  return (
    <Box>
      <Stage width={740} height={555} options={{ background: new Color(blueGrey['900']).toNumber(), width: 740, height: 370 }}>
        <Viewport screenWidth={screenWidth} screenHeight={screenHeight} worldWidth={worldWidth} worldHeight={worldHeight}>
          <Container x={worldWidth / 2} y={worldHeight / 2}>
            {waypoints.map((waypoint) => (
              <WaypointMarker
                key={waypoint.symbol}
                waypoint={waypoint}
                waypoints={waypointsSortedByName}
                isHovered={hoveredWaypoint === waypoint}
                onOver={() => setHoveredWaypoint(waypoint)}
                onOut={() => setHoveredWaypoint(null)}
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
      {selectedItem ? (
        <Box>
          <SelectedShip ship={selectedItem as Ship} />
        </Box>
      ) : (
        hoveredWaypoints.map((waypoint) => (
          <Box>
            <Typography>
              {waypoint.symbol} ({waypoint.type})
            </Typography>
          </Box>
        ))
      )}
      <Outlet />
    </Box>
  )
}

export function SystemMap() {
  return <RenderLoadableAtom id="Map" atom={waypointsAtom} render={(waypoints) => <SystemMapInner waypoints={waypoints} />} />
}
