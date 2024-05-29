import { Box } from '@mui/material'
import { useAtomValue } from 'jotai'
import { useParams } from 'react-router-dom'
import { WaypointTraitSymbol } from '../../backend/api'
import { waypointAtomFamily } from '../../data'
import { routes } from '../../router'
import { CircularProgressLoader } from '../../shared/CircularProgressLoader'
import { Overview } from '../../shared/Overview'
import { RenderLoadableAtom } from '../../shared/RenderLoadableAtom'
import { RouterLink } from '../../shared/RouterLink'
import { TabStructure } from '../../shared/TabStructure'
import { WaypointTraits } from './WaypointTraits'

export function Waypoint() {
  const { waypointSymbol } = useParams()
  const waypointAtom = waypointAtomFamily(waypointSymbol!)
  const waypoint = useAtomValue(waypointAtom)
  if (!waypoint) return <CircularProgressLoader id="waypoint-component" />
  const regex = `^.*/waypoint/${waypointSymbol}/(.[a-z]+)`
  const hasMarket = waypoint.state === 'hasData' && waypoint.data?.traits.map((x) => x.symbol).includes(WaypointTraitSymbol.Marketplace)
  return (
    <TabStructure
      regex={regex}
      id="waypoint"
      value={waypoint}
      tabs={['Traits', ...(hasMarket ? ['Market'] : [])]}
      firstTab={<WaypointTraits />}
      childTabs={['market']}
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
