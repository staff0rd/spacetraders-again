import { Suspense } from 'react'
import RouteError from '../RouteError.tsx'
import { Waypoint } from '../features/systems/Waypoint.tsx'
import { WaypointRaw } from '../features/systems/WaypointRaw.tsx'
import { Exchange } from '../features/systems/market/Exchange.tsx'
import { Exports } from '../features/systems/market/Exports.tsx'
import { Market } from '../features/systems/market/Market.tsx'
import { MarketRaw } from '../features/systems/market/MarketRaw.tsx'
import { TradeGoods } from '../features/systems/market/TradeGoods.tsx'
import Transactions from '../features/systems/market/Transactions.tsx'

export const waypoints = {
  path: 'waypoints/:waypointSymbol',
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
}
