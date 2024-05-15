import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { agentAtom, systemAtom, systemSymbolAtom } from '../../data'
import { Overview } from './Overview'
import { RenderLoadableAtom } from './RenderLoadableAtom'
import { RouterLink } from './RouterLink'
import { TabStructure } from './TabStructure'
import { Waypoints } from './Waypoints'

export type Tabs = 'markets' | 'waypoints'

export const System = () => {
  const agent = useAtomValue(agentAtom)
  const { systemSymbol } = useParams()
  const setSystemSymbol = useSetAtom(systemSymbolAtom)

  useEffect(() => {
    if (systemSymbol) setSystemSymbol(systemSymbol)
  }, [systemSymbol, setSystemSymbol])

  const regex = `^/${systemSymbol}/(.*)/?.*`
  return (
    <TabStructure
      regex={regex}
      value={agent}
      tabs={['Waypoints', 'Markets', 'Jump Gate']}
      root={<Waypoints />}
      header={() => (
        <RenderLoadableAtom
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
