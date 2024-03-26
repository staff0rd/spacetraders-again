import { log } from '../../logging/configure-logging'
import { ShipEntity } from '../ship/ship.entity'
import { IWaypoint } from '../status/actions/IWaypoint'
import { getActor } from '../status/actions/getActor'
import { decisionMaker } from '../status/decisionMaker'
import { WaypointEntity } from '../status/waypoint.entity'

export const miningDroneActorFactory = (
  miningDrone: ShipEntity,
  act: Awaited<ReturnType<typeof getActor>>,
  waypoints: WaypointEntity[],
  miningLocation: IWaypoint,
) =>
  decisionMaker(miningDrone, act, async (ship: ShipEntity) => {
    await act.refuelShip(ship)
    if (ship.nav.waypointSymbol !== miningLocation.symbol) {
      await act.navigateShip(ship, miningLocation, waypoints)
    } else if (ship.cargo.units < ship.cargo.capacity) {
      await act.beginMining(ship)
    } else {
      log.info('ship', `${ship.label} will wait 1 minutes, cargo hold full`)
      await act.wait(1000 * 60)
    }
  })
