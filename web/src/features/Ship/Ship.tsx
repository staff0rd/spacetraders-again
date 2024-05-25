import { Alert } from '@mui/material'
import { useAtomValue } from 'jotai'
import { useParams } from 'react-router-dom'
import { shipsAtom } from '../../data'
import { Overview } from '../agent/Overview'
import { RenderLoadableAtom } from '../agent/RenderLoadableAtom'
import { TabStructure } from '../agent/TabStructure'
import { Cargo } from './Cargo'

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
            tabs={['Cargo']}
            firstTab={<Cargo />}
            header={() => (
              <Overview
                symbol={ship.symbol}
                type="Ship"
                subtype={ship.registration.role}
                lines={[`Fuel: ${ship.fuel.current}/${ship.fuel.current}`, `Cargo: ${ship.cargo.units}/${ship.cargo.capacity}`]}
              />
            )}
          />
        )
      }}
    />
  )
}
