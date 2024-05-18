import { waypointsAtom } from '../../data'
import { routes } from '../../router'
import { DataTable } from './DataTable'
import { RenderLoadableAtom } from './RenderLoadableAtom'
import { RouterLink } from './RouterLink'

export const Waypoints = () => {
  return (
    <RenderLoadableAtom
      title="Waypoints"
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
