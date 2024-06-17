import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { agentAtom, systemAtom, systemSymbolAtom } from '../../data'
import { Overview } from '../../shared/Overview'
import { RenderLoadableAtom } from '../../shared/RenderLoadableAtom'
import { RouterLink } from '../../shared/RouterLink'
import { TabStructure } from '../../shared/TabStructure'
import { Waypoints } from './Waypoints'

export type Tabs = 'markets' | 'waypoints'

export const System = () => {
  const agent = useAtomValue(agentAtom)
  const { systemSymbol } = useParams()
  const setSystemSymbol = useSetAtom(systemSymbolAtom)
  const { waypointSymbol } = useParams()

  useEffect(() => {
    if (systemSymbol) setSystemSymbol(systemSymbol)
  }, [systemSymbol, setSystemSymbol])
  const regex = `^/system/${systemSymbol}/(.[a-z]+)`
  return waypointSymbol ? (
    <Outlet />
  ) : (
    <TabStructure
      id="system"
      regex={regex}
      value={agent}
      tabs={['Waypoints', 'Markets', 'Jump Gate', 'Map']}
      firstTab={<Waypoints />}
      header={() => (
        <RenderLoadableAtom
          id="system"
          atom={systemAtom}
          render={(system) => (
            <Overview
              symbol={system.symbol}
              lines={[
                `x: ${system.x}, y: ${system.y}`,
                <RouterLink to="">{system.waypoints.length} waypoints</RouterLink>,
                `${system.factions.length} factions`,
              ]}
              subtype={system.type}
              type="System"
            />
          )}
        />
      )}
    />
  )
}
