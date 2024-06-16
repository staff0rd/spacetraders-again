import { Suspense } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import RouteError from './RouteError.tsx'
import { agentAtom, getSystemSymbolFromWaypointSymbol, statusAtom, systemAtom } from './data.ts'
import { Cargo } from './features/Ship/Cargo.tsx'
import { Cooldown } from './features/Ship/Cooldown.tsx'
import { Modules } from './features/Ship/Modules.tsx'
import { Mounts } from './features/Ship/Mounts.tsx'
import { Nav } from './features/Ship/Nav.tsx'
import { Ship } from './features/Ship/Ship.tsx'
import { ShipRaw } from './features/Ship/ShipRaw.tsx'
import { Agent } from './features/agent/Agent.tsx'
import { Contracts } from './features/agent/Contracts.tsx'
import { JumpGate } from './features/agent/JumpGate.tsx'
import { AppHeader } from './features/app/AppHeader.tsx'
import { TokenForm } from './features/app/LoginForm.tsx'
import { Announcements } from './features/status/Announcements.tsx'
import { MostCredits } from './features/status/MostCredits.tsx'
import { MostSubmittedCharts } from './features/status/MostSubmittedCharts.tsx'
import { Status } from './features/status/Status.tsx'
import { System } from './features/systems/System.tsx'
import { Waypoint } from './features/systems/Waypoint.tsx'
import { WaypointRaw } from './features/systems/WaypointRaw.tsx'
import { Exchange } from './features/systems/market/Exchange.tsx'
import { Exports } from './features/systems/market/Exports.tsx'
import { Market } from './features/systems/market/Market.tsx'
import { MarketRaw } from './features/systems/market/MarketRaw.tsx'
import { Markets } from './features/systems/market/Markets.tsx'
import { TradeGoods } from './features/systems/market/TradeGoods.tsx'
import Transactions from './features/systems/market/Transactions.tsx'
import { SystemMap } from './features/systems/pixi/SystemMap.tsx'
import { Raw } from './shared/Raw.tsx'

export const routes = {
  system: (systemSymbol: string) => `/system/${systemSymbol}`,
  market: (waypointSymbol: string) =>
    `${routes.system(getSystemSymbolFromWaypointSymbol(waypointSymbol))}/waypoint/${waypointSymbol}/market`,
  waypoint: (waypointSymbol: string) => `${routes.system(getSystemSymbolFromWaypointSymbol(waypointSymbol))}/waypoint/${waypointSymbol}`,
}

const ships = {
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

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      errorElement: (
        <RouteError>
          <AppHeader />
        </RouteError>
      ),
      children: [
        {
          path: 'index.html',
          element: <Navigate to="/" />,
        },
        {
          path: 'login',
          element: <TokenForm />,
        },
        {
          path: 'status',
          element: <Status />,
          children: [
            { path: 'most-credits', element: <MostCredits /> },
            { path: 'most-submitted-charts', element: <MostSubmittedCharts /> },
            { path: 'announcements', element: <Announcements /> },
            {
              path: 'raw',
              element: (
                <Suspense>
                  <Raw atom={statusAtom} />
                </Suspense>
              ),
            },
          ],
        },
        {
          path: 'agent',
          element: <Agent />,
          children: [
            {
              path: 'contracts',
              element: (
                <Suspense>
                  <Contracts />
                </Suspense>
              ),
            },
            {
              path: 'raw',
              element: (
                <Suspense>
                  <Raw atom={agentAtom} />
                </Suspense>
              ),
            },
            ships,
          ],
        },
        {
          path: '/system/:systemSymbol',
          element: <System />,
          errorElement: <RouteError />,
          children: [
            {
              path: 'markets',
              errorElement: <RouteError />,
              element: (
                <Suspense>
                  <Markets />
                </Suspense>
              ),
            },
            {
              path: 'jump-gate',
              element: (
                <Suspense>
                  <JumpGate />
                </Suspense>
              ),
            },
            {
              path: 'map',
              element: (
                <Suspense>
                  <SystemMap />
                </Suspense>
              ),
              children: [ships],
            },
            {
              path: 'raw',
              element: (
                <Suspense>
                  <Raw atom={systemAtom} />
                </Suspense>
              ),
            },
            {
              path: 'waypoint/:waypointSymbol',
              errorElement: <RouteError />,
              element: (
                <Suspense>
                  <Waypoint />
                </Suspense>
              ),
              children: [
                {
                  path: 'market',
                  errorElement: <RouteError />,
                  element: (
                    <Suspense>
                      <Market />
                    </Suspense>
                  ),
                  children: [
                    {
                      path: 'transactions',
                      element: <Transactions />,
                    },
                    {
                      path: 'exchange',
                      element: <Exchange />,
                    },
                    {
                      path: 'Exports',
                      element: <Exports />,
                    },
                    {
                      path: 'trade-goods',
                      element: <TradeGoods />,
                    },
                    {
                      path: 'raw',
                      element: <MarketRaw />,
                    },
                  ],
                },
                {
                  path: 'raw',
                  element: <WaypointRaw />,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  { basename: '/spacetraders' },
)
