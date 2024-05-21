import { Suspense } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import RouteError from './RouteError.tsx'
import { agentAtom, getSystemSymbolFromWaypointSymbol, statusAtom, systemAtom } from './data.ts'
import { Agent } from './features/agent/Agent.tsx'
import { AppHeader } from './features/agent/AppHeader.tsx'
import { Contracts } from './features/agent/Contracts.tsx'
import { JumpGate } from './features/agent/JumpGate.tsx'
import { TokenForm } from './features/agent/LoginForm.tsx'
import Market from './features/agent/Market.tsx'
import { Markets } from './features/agent/Markets.tsx'
import { Raw } from './features/agent/Raw.tsx'
import { Ship } from './features/agent/Ship.tsx'
import { System } from './features/agent/System.tsx'
import { Waypoint } from './features/agent/Waypoint.tsx'
import { WaypointRaw } from './features/agent/WaypointRaw.tsx'
import { Leaderboard } from './features/status/Leaderboard.tsx'
import { Status } from './features/status/Status.tsx'

export const routes = {
  market: (waypointSymbol: string) => `/${getSystemSymbolFromWaypointSymbol(waypointSymbol)}/waypoint/${waypointSymbol}/market`,
  system: (systemSymbol: string) => `/${systemSymbol}`,
  waypoint: (waypointSymbol: string) => `/${getSystemSymbolFromWaypointSymbol(waypointSymbol)}/waypoint/${waypointSymbol}`,
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
            { path: 'most-credits', element: <Leaderboard /> },
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
            {
              path: 'ships/:shipSymbol',
              element: (
                <Suspense>
                  <Ship />
                </Suspense>
              ),
            },
          ],
        },

        {
          path: ':systemSymbol',
          element: <System />,
          errorElement: <RouteError />,
          children: [
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
                },
                {
                  path: 'raw',
                  element: <WaypointRaw />,
                },
              ],
            },
            {
              path: 'markets',
              errorElement: <RouteError />,
              element: (
                <Suspense>
                  <Markets />
                </Suspense>
              ),
              children: [
                {
                  path: ':marketSymbol',
                  element: (
                    <Suspense>
                      <Market />
                    </Suspense>
                  ),
                },
              ],
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
              path: 'raw',
              element: (
                <Suspense>
                  <Raw atom={systemAtom} />
                </Suspense>
              ),
            },
          ],
        },
      ],
    },
  ],
  { basename: '/spacetraders' },
)
