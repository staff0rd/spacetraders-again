import { log } from '../../logging/configure-logging'
import { logError } from '../../logging/log-error'
import { ShipEntity } from '../ship/ship.entity'
import { getActor } from './actions/getActor'
import { AgentEntity } from './agent.entity'
import { shipArriving } from './utils/getCurrentFlightTime'

const createDecisionRateMonitor = () => {
  const decisionTimestamps: Date[] = []

  const recordTimestamp = () => {
    decisionTimestamps.push(new Date())
    decisionTimestamps.splice(0, decisionTimestamps.length - 10)
  }
  const getDecisionRate = () => {
    if (decisionTimestamps.length < 10) return Infinity
    const first = decisionTimestamps[0]
    const last = decisionTimestamps[decisionTimestamps.length - 1]
    return (last.getTime() - first.getTime()) / 1000
  }
  return { recordTimestamp, getDecisionRate }
}
export const decisionMaker = async (
  ship: ShipEntity,
  agent: AgentEntity,
  act: Awaited<ReturnType<typeof getActor>>,
  decisions: (ship: ShipEntity, agent: AgentEntity) => void,
) => {
  const { recordTimestamp, getDecisionRate } = createDecisionRateMonitor()
  const makeNextDecision = async (ship: ShipEntity) => {
    recordTimestamp()

    try {
      const { seconds, distance } = shipArriving(ship)
      if (seconds <= 0) {
        await decisions(ship, agent)
      } else {
        log.info('ship', `${ship.label} is not yet in position. Waiting for arrival ${distance}`)
        await act.wait(seconds * 1000)
      }
    } catch (err) {
      logError(`${ship.label} makeDecision`, err)
    }
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await makeNextDecision(ship)
    const decisionRate = getDecisionRate()
    if (decisionRate < 2) {
      ship.isCommanded = false
      throw new Error(`${ship.label}: Decision rate too high`)
    }
  }
}
