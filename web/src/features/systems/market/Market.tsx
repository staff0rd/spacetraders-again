import { useAtomValue } from 'jotai'
import { useParams } from 'react-router-dom'
import { marketAtomFamily } from '../../../data'
import { CircularProgressLoader } from '../../agent/CircularProgressLoader'
import { TabStructure } from '../../agent/TabStructure'
import { Imports } from './Imports'

export function Market() {
  const { waypointSymbol } = useParams()
  const marketAtom = marketAtomFamily(waypointSymbol!)
  const market = useAtomValue(marketAtom)
  if (!market) return <CircularProgressLoader id="market-component" />
  const regex = `^.*/waypoint/${waypointSymbol}/market/(.*)`
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
