import { TradeSymbol } from '../../../api'
import { ShipActionType, ShipEntity } from '../ship/ship.entity'
import { IWaypoint } from '../status/actions/IWaypoint'
import { getActor } from '../status/actions/getActor'
import { AgentEntity } from '../status/agent.entity'
import { decisionMaker } from '../status/decisionMaker'
import { WaypointEntity } from '../status/waypoint.entity'

export const shuttleActorFactory = (
  shuttle: ShipEntity,
  act: Awaited<ReturnType<typeof getActor>>,
  agent: AgentEntity,
  markets: WaypointEntity[],
  miningLocation: IWaypoint,
  ships: ShipEntity[],
  sell: TradeSymbol[],
) =>
  decisionMaker(shuttle, act, async (ship: ShipEntity) => {
    await act.refuelShip(ship)
    await act.jettisonUnwanted(ship, sell)
    const currentAction = ship.action?.type
    if (!currentAction) {
      await act.updateShipAction(ship, ShipActionType.FILL)
    } else if (currentAction === ShipActionType.FILL) {
      if (ship.cargo.units === ship.cargo.capacity) {
        await act.updateShipAction(ship, ShipActionType.SELL)
      } else if (ship.nav.waypointSymbol !== miningLocation.symbol) {
        await act.navigateShip(ship, miningLocation, markets)
      } else {
        const capacity = ship.cargo.capacity - ship.cargo.units
        const dronesAtMiningLocation = ships.filter(
          (s) => s.nav.waypointSymbol === miningLocation.symbol && s.frame.symbol === 'FRAME_DRONE' && s.nav.status !== 'IN_TRANSIT',
        )
        const droneWithCargo = dronesAtMiningLocation.find((s) => s.cargo.units > 0)
        if (droneWithCargo) {
          await act.transferGoods(droneWithCargo, ship, capacity)
        }
      }
    } else if (currentAction === ShipActionType.SELL) {
      if (ship.cargo.units === 0) {
        await act.updateShipAction(ship, ShipActionType.FILL)
      } else if (ship.cargo.inventory.find((p) => p.symbol === agent.contractGood.tradeSymbol)?.units) {
        await act.deliverGoods(ship)
      } else {
        await act.sellGoods(markets, ship, [agent.contractGood.tradeSymbol as TradeSymbol])
      }
    } else throw new Error(`Unknown action: ${currentAction}`)
    await act.wait(1000 * 10)
  })
