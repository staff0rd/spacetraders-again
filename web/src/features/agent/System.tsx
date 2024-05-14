import { Link as MuiLink } from '@mui/material'
import { useAtomValue } from 'jotai'
import { Link, useParams } from 'react-router-dom'
import { agentAtom, systemAtom } from '../../data'
import { Overview } from './Overview'
import { RenderLoadableAtom } from './RenderLoadableAtom'
import { TabStructure } from './TabStructure'
import { Waypoints } from './Waypoints'

export type Tabs = 'markets' | 'waypoints'

export const System = () => {
  const agent = useAtomValue(agentAtom)
  const { systemSymbol } = useParams()

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
                <MuiLink to="" component={Link}>
                  {system.waypoints.length} waypoints
                </MuiLink>,
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
