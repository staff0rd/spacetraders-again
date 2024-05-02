import { TradeSymbol } from '../../../../api'
import { ShipActionType, ShipEntity } from '../../ship/ship.entity'
import { getActor } from '../../status/actions/getActor'
import { AgentEntity } from '../../status/agent.entity'
import { decisionMaker } from '../../status/decisionMaker'
import { WaypointEntity } from '../../waypoints/waypoint.entity'
import { survey } from './supply'

export const shuttleActorFactory = (
  shuttle: ShipEntity,
  agent: AgentEntity,
  act: Awaited<ReturnType<typeof getActor>>,
  miningLocation: WaypointEntity,
  ships: ShipEntity[],
  sell: TradeSymbol[],
) => decisionMaker(shuttle, true, agent, act, shuttleLogicFactory(act, miningLocation, ships, sell))

export const shuttleLogicFactory =
  (act: Awaited<ReturnType<typeof getActor>>, miningLocation: WaypointEntity, ships: ShipEntity[], sell: TradeSymbol[]) =>
  async (ship: ShipEntity, agent: AgentEntity) => {
    const currentAction = ship.action?.type
    if (!currentAction) {
      await act.updateShipAction(ship, { type: ShipActionType.FILL })
      return
    } else if (currentAction === ShipActionType.FILL) {
      if (ship.cargo.units === ship.cargo.capacity) {
        await act.updateShipAction(ship, { type: ShipActionType.SELL })
        return
      } else if (ship.nav.waypointSymbol !== miningLocation.symbol) {
        await act.navigateShip(ship, miningLocation)
        return
      } else {
        const capacity = ship.cargo.capacity - ship.cargo.units
        const dronesAtMiningLocation = ships.filter(
          (s) => s.nav.waypointSymbol === miningLocation.symbol && s.frame.symbol === 'FRAME_DRONE' && s.nav.status !== 'IN_TRANSIT',
        )
        const droneWithWantedCargo = dronesAtMiningLocation.find((s) => s.cargo.inventory.find((p) => sell.includes(p.symbol)))
        if (droneWithWantedCargo) {
          await act.transferGoods(droneWithWantedCargo, ship, capacity, sell)
          return
        }
      }
    } else if (currentAction === ShipActionType.SELL) {
      if (ship.cargo.units === 0) {
        await act.updateShipAction(ship, { type: ShipActionType.FILL })
        return
      } else if (ship.cargo.inventory.find((p) => p.symbol === agent.contractGood.tradeSymbol)?.units) {
        await act.deliverContractGoods(ship)
        return
      } else {
        await act.sellUnwantedGoods(ship, [agent.contractGood.tradeSymbol as TradeSymbol])
        return
      }
    } else if (currentAction === ShipActionType.TRADE) {
      await act.updateShipAction(ship, { type: ShipActionType.SELL })
    } else throw new Error(`Unknown action: ${currentAction}`)

    const performedSurveyAction = await survey(ship, miningLocation, act)

    if (!performedSurveyAction) await act.wait(1000 * 10)
  }
