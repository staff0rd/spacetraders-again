import { ShipEntity } from '../ship/ship.entity'
import { IWaypoint } from '../status/actions/IWaypoint'
import { getActor } from '../status/actions/getActor'
import { AgentEntity } from '../status/agent.entity'
import { decisionMaker } from '../status/decisionMaker'
import { WaypointEntity } from '../status/waypoint.entity'

export const miningDroneActorFactory = (
  miningDrone: ShipEntity,
  act: Awaited<ReturnType<typeof getActor>>,
  agent: AgentEntity,
  waypoints: WaypointEntity[],
  miningLocation: IWaypoint,
) =>
  decisionMaker(miningDrone, act, async (ship: ShipEntity) => {
    await act.refuelShip(ship)
    await act.jettisonUnsellable(waypoints, ship, agent.contractGood.tradeSymbol)

    if (ship.cargo.inventory.find((p) => p.symbol === agent.contractGood.tradeSymbol)?.units === ship.cargo.capacity) {
      await act.deliverGoods(ship, agent)
    } else if (ship.nav.waypointSymbol === miningLocation.symbol) {
      if (ship.cargo.units < ship.cargo.capacity) {
        await act.beginMining(ship)
      } else {
        await act.sellGoods(waypoints, ship, agent.contractGood.tradeSymbol)
      }
    } else if (ship.cargo.inventory.filter((p) => p.symbol !== agent.contractGood.tradeSymbol).length > 0) {
      await act.sellGoods(waypoints, ship, agent.contractGood.tradeSymbol)
    } else {
      await act.navigateShip(ship, miningLocation, waypoints)
    }
  })
