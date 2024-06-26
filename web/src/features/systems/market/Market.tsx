import { useAtomValue } from 'jotai'
import { useParams } from 'react-router-dom'
import { marketAtomFamily } from '../../../data'
import { CircularProgressLoader } from '../../../shared/CircularProgressLoader'
import { TabStructure } from '../../../shared/TabStructure'
import { Imports } from './Imports'

export function Market() {
  const { waypointSymbol } = useParams()
  const marketAtom = marketAtomFamily(waypointSymbol!)
  const market = useAtomValue(marketAtom)
  if (!market) return <CircularProgressLoader id="market-component" />
  const regex = `^.*/waypoints/${waypointSymbol}/market/(.*)`
  return (
    <TabStructure
      regex={regex}
      id="market"
      value={market}
      tabs={['Imports', 'Exchange', 'Exports', 'Trade Goods', 'Transactions']}
      firstTab={<Imports />}
      header={() => <> </>}
    />
  )
}
