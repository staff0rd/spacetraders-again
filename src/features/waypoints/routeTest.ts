import { invariant } from '../../invariant'
import { init } from '../init'
import { getBestTradeRoutes } from '../trade/getBestTradeRoute'
import { getGraph } from './pathfinding'

export async function routeTest() {
  const { waypoints, commandShip, api } = await init(false)
  const jumpGate = waypoints.find((x) => x.type === 'JUMP_GATE')
  invariant(jumpGate, 'No jump gate found')
  const {
    data: { data: construction },
  } = await api.systems.getConstruction(commandShip.nav.systemSymbol, jumpGate.symbol)
  const { graph } = getGraph(waypoints)
  const result = await getBestTradeRoutes(commandShip, waypoints, true)
  const result2 = await getBestTradeRoutes(commandShip, waypoints, true, true)
  const result3 = await getBestTradeRoutes(commandShip, waypoints, true, true, true)
}
