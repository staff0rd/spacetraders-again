import { waypointsAtom } from '../../data'
import { routes } from '../../router/router'
import { DataTable } from '../../shared/DataTable'
import { RenderLoadableAtom } from '../../shared/RenderLoadableAtom'
import { RouterLink } from '../../shared/RouterLink'

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
