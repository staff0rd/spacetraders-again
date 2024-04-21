import { getActor } from '../../status/actions/getActor'
import { AgentEntity } from '../../status/agent.entity'
import { ShipEntity } from '../ship.entity'

export const systemReconLogicFactory =
  (act: Awaited<ReturnType<typeof getActor>>) =>
  async (ship: ShipEntity, agent: AgentEntity): Promise<boolean> => {
    const waypoint = act.findClosestUnvisitedMarket(ship)

    if (!waypoint) return false

    if (ship.nav.waypointSymbol !== waypoint.symbol) {
      await act.navigateShip(ship, waypoint)
    } else {
      await act.scanWaypoint(waypoint.symbol)
    }
    return true
  }
