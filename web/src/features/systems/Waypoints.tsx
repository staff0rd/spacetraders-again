import { waypointsAtom } from '../../data'
import { routes } from '../../router'
import { DataTable } from '../agent/DataTable'
import { RenderLoadableAtom } from '../agent/RenderLoadableAtom'
import { RouterLink } from '../agent/RouterLink'

export const Waypoints = () => {
  return (
    <RenderLoadableAtom
      id="Waypoints"
      atom={waypointsAtom}
      render={(waypoints) => (
        <DataTable
          headers={[`Waypoints: ${waypoints.length}`, 'Type', 'Faction', 'Traits']}
          title="waypoints"
          rows={waypoints
            .toSorted((a, b) => a.symbol.localeCompare(b.symbol))
            .map(({ symbol, traits, type, faction }) => [
              <RouterLink to={routes.waypoint(symbol)}>{symbol}</RouterLink>,
              type.replaceAll('_', ' '),
              faction?.symbol ?? '-',
              traits.map((x) => x.symbol.replaceAll('_', ' ')).join(', '),
            ])}
        />
      )}
    />
  )
}
