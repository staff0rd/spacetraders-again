import { Suspense } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import App from '../App.tsx'
import RouteError from '../RouteError.tsx'
import { agentAtom, getSystemSymbolFromWaypointSymbol, statusAtom, systemAtom } from '../data.ts'
import { Agent } from '../features/agent/Agent.tsx'
import { Contracts } from '../features/agent/Contracts.tsx'
import { JumpGate } from '../features/agent/JumpGate.tsx'
import { AppHeader } from '../features/app/AppHeader.tsx'
import { TokenForm } from '../features/app/LoginForm.tsx'
import { Announcements } from '../features/status/Announcements.tsx'
import { MostCredits } from '../features/status/MostCredits.tsx'
import { MostSubmittedCharts } from '../features/status/MostSubmittedCharts.tsx'
import { Status } from '../features/status/Status.tsx'
import { System } from '../features/systems/System.tsx'
import { Markets } from '../features/systems/market/Markets.tsx'
import { SystemMap } from '../features/systems/pixi/SystemMap.tsx'
import { Raw } from '../shared/Raw.tsx'
import { ships } from './ships.tsx'
import { waypoints } from './waypoints.tsx'

export const routes = {
  system: (systemSymbol: string) => `/system/${systemSymbol}`,
  market: (waypointSymbol: string) =>
    `${routes.system(getSystemSymbolFromWaypointSymbol(waypointSymbol))}/waypoints/${waypointSymbol}/market`,
  waypoint: (waypointSymbol: string) =>
    `${routes.system(getSystemSymbolFromWaypointSymbol(waypointSymbol))}/map/waypoints/${waypointSymbol}`,
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
              children: [ships, waypoints],
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
