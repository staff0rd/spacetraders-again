import { TradeSymbol } from '../../../../api'
import { ShipEntity } from '../../ship/ship.entity'
import { getActor } from '../../status/actions/getActor'
import { AgentEntity } from '../../status/agent.entity'
import { decisionMaker } from '../../status/decisionMaker'
import { WaypointEntity } from '../../waypoints/waypoint.entity'

export const miningDroneActorFactory = (
  miningDrone: ShipEntity,
  agent: AgentEntity,
  act: Awaited<ReturnType<typeof getActor>>,
  miningLocation: WaypointEntity,
  keep: TradeSymbol[],
) =>
  decisionMaker(miningDrone, false, agent, act, async (ship: ShipEntity, agent: AgentEntity) => {
    await act.refuelShip(ship)
    await act.jettisonUnwanted(miningDrone, keep)
    if (ship.nav.waypointSymbol !== miningLocation.symbol) {
      await act.navigateShip(ship, miningLocation)
    } else if (ship.cargo.units < ship.cargo.capacity) {
      await act.beginMining(ship, keep)
    } else {
      await act.wait(1000 * 60)
    }
  })
