import { DefaultApiFactory } from '../../api'
import { updateShips } from '../db/updateShips'
import { invariant } from '../invariant'
import { getActor } from './status/actions/getActor'
import { getAgent } from './status/actions/getAgent'
import { getWaypoints } from './waypoints/getWaypoints'

export async function init(performWaypointScan: boolean) {
  const {
    data: { resetDate },
  } = await DefaultApiFactory().getStatus()
  const { agent, api } = await getAgent(resetDate)

  const {
    data: { data: shipsFromApi },
  } = await api.fleet.getMyShips()
  const ships = await updateShips(resetDate, agent, shipsFromApi)

  const commandShip = ships.find((s) => s.registration.role === 'COMMAND')
  invariant(commandShip, 'Expected to find a command ship')

  const systemSymbol = commandShip.nav.systemSymbol

  const waypoints = await getWaypoints(systemSymbol, agent, api, performWaypointScan)

  const act = await getActor(agent, api, waypoints, ships)
  return {
    act,
    waypoints,
    ships,
    commandShip,
    agent,
  }
}
