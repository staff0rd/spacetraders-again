import { TradeSymbol } from '../../../../api'
import { log } from '../../../logging/configure-logging'
import { getActor } from '../../status/actions/getActor'
import { AgentEntity } from '../../status/agent.entity'
import { decisionMaker } from '../../status/decisionMaker'
import { shipCooldownRemaining } from '../../status/utils/getCurrentFlightTime'
import { WaypointEntity } from '../../waypoints/waypoint.entity'
import { ShipActionType, ShipEntity } from '../ship.entity'

export type Supply = {
  import: TradeSymbol
  export: TradeSymbol
}

export const supplyActorFactory = (
  shuttle: ShipEntity,
  agent: AgentEntity,
  act: Awaited<ReturnType<typeof getActor>>,
  miningLocation: WaypointEntity,
  ships: ShipEntity[],
  supply: Supply,
) => decisionMaker(shuttle, true, agent, act, supplyLogicFactory(act, miningLocation, ships, supply))

export const supplyLogicFactory =
  (act: Awaited<ReturnType<typeof getActor>>, miningLocation: WaypointEntity, ships: ShipEntity[], supply: Supply) =>
  async (ship: ShipEntity, agent: AgentEntity): Promise<boolean> => {
    const currentAction = ship.action?.type
    if (!currentAction) {
      await act.updateShipAction(ship, { type: ShipActionType.FILL })
      return true
    } else if (currentAction === ShipActionType.FILL) {
      if (ship.cargo.units === ship.cargo.capacity) {
        await act.updateShipAction(ship, { type: ShipActionType.SELL })
        return true
      } else if (ship.nav.waypointSymbol !== miningLocation.symbol) {
        await act.navigateShip(ship, miningLocation)
        return true
      } else {
        const capacity = ship.cargo.capacity - ship.cargo.units
        const dronesAtMiningLocation = ships.filter(
          (s) => s.nav.waypointSymbol === miningLocation.symbol && s.frame.symbol === 'FRAME_DRONE' && s.nav.status !== 'IN_TRANSIT',
        )
        const droneWithWantedCargo = dronesAtMiningLocation.find((drone) => drone.cargo.inventory.find((p) => p.symbol === supply.import))
        if (droneWithWantedCargo) {
          await act.transferGoods(droneWithWantedCargo, ship, capacity, [supply.import])
          return true
        }
      }
    } else if (currentAction === ShipActionType.SELL) {
      if (ship.cargo.units === 0) {
        await act.updateShipAction(ship, { type: ShipActionType.FILL })
        return true
      } else if (ship.cargo.inventory.find((p) => p.symbol === supply.import)?.units) {
        await act.deliverySupplyGoods(ship, supply)
        return true
      }
    } else throw new Error(`Unknown action: ${currentAction}`)

    const { seconds, distance } = shipCooldownRemaining(ship)
    if (ship.nav.waypointSymbol === miningLocation.symbol) {
      if (seconds > 0) {
        log.info('ship', `${ship.label} will cooldown, ready ${distance}`)
        await act.wait(1000 * 10)
        return false
      } else {
        await act.survey(ship)
        return true
      }
    }
    return false
  }
