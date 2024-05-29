import { useParams } from 'react-router-dom'
import { marketAtomFamily } from '../../../data'
import { Raw } from '../../../shared/Raw'

export const MarketRaw = () => {
  const { waypointSymbol } = useParams()
  const marketAtom = marketAtomFamily(waypointSymbol!)
  return <Raw atom={marketAtom} />
}
