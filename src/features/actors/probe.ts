import { log } from '../../logging/configure-logging'
import { ShipEntity } from '../ship/ship.entity'
import { getActor } from '../status/actions/getActor'
import { AgentEntity } from '../status/agent.entity'
import { decisionMaker } from '../status/decisionMaker'
import { WaypointEntity } from '../status/waypoint.entity'

export const probeActorFactory = (
  probe: ShipEntity,
  agent: AgentEntity,
  act: Awaited<ReturnType<typeof getActor>>,
  assignedWaypoint: WaypointEntity,
) =>
  decisionMaker(probe, false, agent, act, async (ship: ShipEntity, agent: AgentEntity) => {
    if (ship.nav.waypointSymbol !== assignedWaypoint.symbol) {
      log.warn('ship', `${ship.label} is not at ${assignedWaypoint.label}, navigating...`)
      await act.navigateShip(ship, assignedWaypoint)
    } else {
      log.info('ship', `${ship.label} will check ${assignedWaypoint.symbol}`)
      await act.updateCurrentWaypoint(ship)
      await act.wait(1000 * 60 * 5)
    }
  })
