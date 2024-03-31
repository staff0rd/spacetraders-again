import { TradeSymbol } from '../../../api'
import { log } from '../../logging/configure-logging'
import { ShipEntity } from '../ship/ship.entity'
import { IWaypoint } from '../status/actions/IWaypoint'
import { getActor } from '../status/actions/getActor'
import { AgentEntity } from '../status/agent.entity'
import { decisionMaker } from '../status/decisionMaker'

export const miningDroneActorFactory = (
  miningDrone: ShipEntity,
  agent: AgentEntity,
  act: Awaited<ReturnType<typeof getActor>>,
  miningLocation: IWaypoint,
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
      log.info('ship', `${ship.label} will wait 1 minutes, cargo hold full`)
      await act.wait(1000 * 60)
    }
  })
