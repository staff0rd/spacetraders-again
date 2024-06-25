import { Suspense } from 'react'
import { Cargo } from '../features/Ship/Cargo.tsx'
import { Cooldown } from '../features/Ship/Cooldown.tsx'
import { Modules } from '../features/Ship/Modules.tsx'
import { Mounts } from '../features/Ship/Mounts.tsx'
import { Nav } from '../features/Ship/Nav.tsx'
import { Ship } from '../features/Ship/Ship.tsx'
import { ShipRaw } from '../features/Ship/ShipRaw.tsx'

export const ships = {
  path: 'ships/:shipSymbol',
  element: (
    <Suspense>
      <Ship />
    </Suspense>
  ),
  children: [
    {
      path: 'nav',
      element: (
        <Suspense>
          <Nav />
        </Suspense>
      ),
    },
    {
      path: 'cooldown',
      element: (
        <Suspense>
          <Cooldown />
        </Suspense>
      ),
    },
    {
      path: 'cargo',
      element: (
        <Suspense>
          <Cargo />
        </Suspense>
      ),
    },
    {
      path: 'mounts',
      element: (
        <Suspense>
          <Mounts />
        </Suspense>
      ),
    },
    {
      path: 'modules',
      element: (
        <Suspense>
          <Modules />
        </Suspense>
      ),
    },
    {
      path: 'raw',
      element: (
        <Suspense>
          <ShipRaw />
        </Suspense>
      ),
    },
  ],
}
