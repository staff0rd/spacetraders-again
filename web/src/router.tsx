import { Suspense } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import RouteError from './RouteError.tsx'
import { agentAtom, getSystemSymbolFromWaypointSymbol, systemAtom } from './data.ts'
import { AppHeader } from './features/agent/AppHeader.tsx'
import { JumpGate } from './features/agent/JumpGate.tsx'
import Market from './features/agent/Market.tsx'
import { Markets } from './features/agent/Markets.tsx'
import { Raw } from './features/agent/Raw.tsx'
import { System } from './features/agent/System.tsx'
import { Waypoint } from './features/agent/Waypoint.tsx'
import { WaypointRaw } from './features/agent/WaypointRaw.tsx'

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
          path: 'app',
          element: <Navigate to="/" />,
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
