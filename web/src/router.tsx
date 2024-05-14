import { Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import ErrorPage from './Error.tsx'
import { systemAtom } from './data.ts'
import { JumpGate } from './features/agent/JumpGate.tsx'
import Market from './features/agent/Market.tsx'
import { Markets } from './features/agent/Markets.tsx'
import { Raw } from './features/agent/Raw.tsx'
import { System } from './features/agent/System.tsx'
import { Waypoints } from './features/agent/Waypoints.tsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: ':systemSymbol',
        element: <System />,
        children: [
          {
            path: 'markets',
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
            path: 'waypoints',
            element: (
              <Suspense>
                <Waypoints />
              </Suspense>
            ),
          },
          {
            path: 'jumpgate',
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
])
