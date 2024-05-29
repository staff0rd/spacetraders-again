import { Alert } from '@mui/material'
import { useAtomValue } from 'jotai'
import { useParams } from 'react-router-dom'
import { shipsAtom } from '../../data'
import { Overview } from '../../shared/Overview'
import { RenderLoadableAtom } from '../../shared/RenderLoadableAtom'
import { TabStructure } from '../../shared/TabStructure'
import { ShipBase } from './ShipBase'

export function Ship() {
  const { shipSymbol } = useParams()
  const regex = `^.*/ships/${shipSymbol}/(.[a-z]+)`
  const value = useAtomValue(shipsAtom)
  return (
    <RenderLoadableAtom
      id={`ship-${shipSymbol}`}
      atom={shipsAtom}
      render={(ships) => {
        const ship = ships.find((x) => x.symbol === shipSymbol)
        if (!ship) return <Alert severity="warning">Ship not found</Alert>
        return (
          <TabStructure
            id={`ship-${shipSymbol}-tabs`}
            regex={regex}
            value={value}
            tabs={[ship.frame.name, 'Cargo', 'Cooldown', 'Nav', 'Modules', 'Mounts']}
            firstTab={<ShipBase />}
            header={() => (
              <Overview
                symbol={ship.symbol}
                type="Ship"
                subtype={ship.registration.role}
                lines={[
                  `Fuel: ${ship.fuel.current}/${ship.fuel.current}`,
                  `${ship.nav.status} / ${ship.nav.flightMode}`,
                  `Cargo: ${ship.cargo.units}/${ship.cargo.capacity}`,
                ]}
              />
            )}
          />
        )
      }}
    />
  )
}
