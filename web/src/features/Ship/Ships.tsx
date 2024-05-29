import { shipsAtom } from '../../data'
import { DataTable } from '../../shared/DataTable'
import { RenderLoadableAtom } from '../../shared/RenderLoadableAtom'
import { RouterLink } from '../../shared/RouterLink'

export const Ships = () => {
  return (
    <RenderLoadableAtom
      id="ships"
      atom={shipsAtom}
      render={(ships) => (
        <DataTable
          headers={['Symbol', 'Faction', 'Name', 'Role', 'Cargo']}
          rows={ships.map((ship) => [
            <RouterLink to={`/agent/ships/${ship.symbol}`}>{ship.symbol}</RouterLink>,
            ship.registration.factionSymbol,
            ship.registration.name,
            ship.registration.role,
            ship.cargo.inventory.map((x) => `${x.units} x ${x.symbol}`).join(', '),
          ])}
          title="Ships"
        />
      )}
    />
  )
}
