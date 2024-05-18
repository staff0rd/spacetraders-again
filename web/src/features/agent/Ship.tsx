import { useParams } from 'react-router-dom'

export function Ship() {
  const { shipSymbol } = useParams()
  return <div>{shipSymbol}</div>
}
