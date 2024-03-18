import { DefaultApiFactory } from '../../api'
import { Agent } from '../features/status/agent.entity'
import { log } from '../logging/configure-logging'
import { getEntityManager } from '../orm'

export async function findOrCreateAgent(resetDate: string) {
  const em = getEntityManager()
  const agent = await em.findOne(Agent, { resetDate })
  if (!agent) {
    const symbol = Agent.generateSymbol()
    const {
      data: { data },
    } = await DefaultApiFactory().register({ faction: 'COSMIC', symbol })
    const newAgent = new Agent(resetDate, symbol, data.token)
    log.warn('agent', `Created new agent ${symbol}`)
    await em.persistAndFlush(newAgent)
    return newAgent
  }
  return agent
}
