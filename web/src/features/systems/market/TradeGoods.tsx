import { Alert } from '@mui/material'
import { useParams } from 'react-router-dom'
import { marketAtomFamily } from '../../../data'
import { DataTable } from '../../agent/DataTable'
import { RenderLoadableAtom } from '../../agent/RenderLoadableAtom'

export const TradeGoods = () => {
  const { waypointSymbol } = useParams()
  const marketAtom = marketAtomFamily(waypointSymbol!)
  return (
    <RenderLoadableAtom
      atom={marketAtom}
      id="market-tradegoods"
      render={(market) =>
        market.tradeGoods?.length ? (
          <DataTable
            title="Tradegoods"
            headers={['Symbol', 'Type', 'Supply', 'Activity', 'Buy', 'Sell', 'Volume']}
            rows={market.tradeGoods?.map((row) => [
              row.symbol,
              row.type,
              row.supply,
              row.activity,
              row.purchasePrice.toLocaleString(),
              row.sellPrice.toLocaleString(),
              row.tradeVolume.toLocaleString(),
            ])}
          />
        ) : (
          <Alert severity="warning">No tradegoods data</Alert>
        )
      }
    />
  )
}
