import { useParams } from 'react-router-dom'
import { waypointAtomFamily } from '../../data'
import { Raw } from '../../shared/Raw'

export const WaypointRaw = () => {
  const { waypointSymbol } = useParams()
  const waypointAtom = waypointAtomFamily(waypointSymbol!)
  return <Raw atom={waypointAtom} />
}
