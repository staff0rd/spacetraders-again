import { Box } from '@mui/material'
import { useAtomValue } from 'jotai'
import { useParams } from 'react-router-dom'
import { waypointAtomFamily } from '../../data'
import { routes } from '../../router'
import { CircularProgressLoader } from './CircularProgressLoader'
import { Overview } from './Overview'
import { RenderLoadableAtom } from './RenderLoadableAtom'
import { RouterLink } from './RouterLink'
import { TabStructure } from './TabStructure'
import { WaypointTraits } from './WaypointTraits'

export function Waypoint() {
  const { waypointSymbol } = useParams()
  const waypointAtom = waypointAtomFamily(waypointSymbol!)
  const waypoint = useAtomValue(waypointAtom)
  if (!waypoint) return <CircularProgressLoader id="waypoint-component" />
  const regex = `^.*/waypoint/${waypointSymbol}/(.*)`
  return (
    <TabStructure
      regex={regex}
      id="waypoint"
      value={waypoint}
      tabs={['Traits', 'Market']}
      firstTab={<WaypointTraits />}
      header={() => (
        <RenderLoadableAtom
          id="waypoint"
          atom={waypointAtom}
          render={(waypoint) => (
            <Overview
              symbol={waypoint.symbol}
              lines={[
                <Box>
                  System: <RouterLink to={routes.system(waypoint.systemSymbol)}>{waypoint.systemSymbol}</RouterLink>
                </Box>,
                `x: ${waypoint.x}, y: ${waypoint.y}`,
                waypoint.faction?.symbol ?? 'No faction',
                waypoint.traits.map((trait) => trait.name).join(', '),
              ]}
              subtype={waypoint.type}
              type="Waypoint"
            />
          )}
        />
      )}
    />
  )
}
