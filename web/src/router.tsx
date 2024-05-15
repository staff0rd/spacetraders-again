import { Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import ErrorPage from './Error.tsx'
import { agentAtom, getSystemSymbolFromWaypointSymbol, systemAtom } from './data.ts'
import { JumpGate } from './features/agent/JumpGate.tsx'
import Market from './features/agent/Market.tsx'
import { Markets } from './features/agent/Markets.tsx'
import { Raw } from './features/agent/Raw.tsx'
import { System } from './features/agent/System.tsx'

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
      errorElement: <ErrorPage />,
      children: [
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
          errorElement: <ErrorPage />,
          children: [
            {
              path: 'markets',
              errorElement: <ErrorPage />,
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
