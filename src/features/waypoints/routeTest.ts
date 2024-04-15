import { DefaultApiFactory } from '../../../api'
import { getEntityManager } from '../../orm'
import { ShipEntity } from '../ship/ship.entity'
import { getAgent } from '../status/actions/getAgent'
import { getBestTradeRoute } from '../trade/getBestTradeRoute'
import { WaypointEntity } from './waypoint.entity'

export async function routeTest() {
  const em = getEntityManager()
  const {
    data: { resetDate },
  } = await DefaultApiFactory().getStatus()
  const { agent } = await getAgent(resetDate)
  const ships = await em.findAll(ShipEntity, { where: { resetDate, symbol: { $like: `${agent.data!.symbol}%` } } })
  const commandShip = ships.find((s) => s.registration.role === 'COMMAND')!
  const waypoints = await em.findAll(WaypointEntity, { where: { systemSymbol: commandShip.nav.systemSymbol } })
  const route = await getBestTradeRoute(commandShip, waypoints, false)
}
