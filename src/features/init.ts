import { DefaultApiFactory } from '../../api'
import { updateShips } from '../db/updateShips'
import { invariant } from '../invariant'
import { getEntityManager } from '../orm'
import { getActor } from './status/actions/getActor'
import { getAgent } from './status/actions/getAgent'
import { SurveyEntity } from './survey/survey.entity'
import { getPages, getWaypoints } from './waypoints/getWaypoints'

export async function init(performWaypointScan: boolean) {
  const {
    data: { resetDate },
  } = await DefaultApiFactory().getStatus()
  const { agent, api } = await getAgent(resetDate)

  const shipsFromApi = await getPages((page, count) => api.fleet.getMyShips(page, count))
  const ships = await updateShips(resetDate, agent, shipsFromApi)

  const commandShip = ships.find((s) => s.registration.role === 'COMMAND')
  invariant(commandShip, 'Expected to find a command ship')

  const systemSymbol = commandShip.nav.systemSymbol

  const waypoints = await getWaypoints(systemSymbol, agent, api, performWaypointScan)

  const surveys = await getEntityManager()
    .fork()
    .findAll(SurveyEntity, { where: { resetDate: agent.resetDate } })

  const act = await getActor(agent, api, waypoints, ships, surveys)
  return {
    act,
    waypoints,
    ships,
    commandShip,
    agent,
    api,
    surveys,
  }
}
