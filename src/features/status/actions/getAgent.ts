import { EntityData } from '@mikro-orm/core'
import { Entries } from 'type-fest'
import { DefaultApiFactory } from '../../../../api'
import { log } from '../../../logging/configure-logging'
import { getEntityManager } from '../../../orm'
import { AgentEntity } from '../agent.entity'
import { apiFactory } from '../apiFactory'

export const updateAgentFactory = (token: string, resetDate: string) => async (agent: AgentEntity, data: EntityData<AgentEntity>) => {
  const agentKeys = Object.keys(agent)
  Object.keys(data).forEach((key) => {
    if (!agentKeys.includes(key)) {
      // @ts-expect-error bad type
      delete data[key]
    }
  })
  await getEntityManager().nativeUpdate(AgentEntity, { token, resetDate }, data)

  const entries = Object.entries(data) as Entries<AgentEntity>

  entries.forEach(([key, value]) => {
    // @ts-expect-error bad type
    if (data[key]) agent[key] = value
  })
}

export const getAgent = async (resetDate: string) => {
  const em = getEntityManager()
  const existing = await em.findOne(AgentEntity, { resetDate })
  if (!existing) {
    const symbol = AgentEntity.generateSymbol()
    const {
      data: {
        data: { agent, token },
      },
    } = await DefaultApiFactory().register({ faction: 'COSMIC', symbol })
    const newAgent = new AgentEntity(resetDate, token, agent)
    log.warn('agent', `Created new agent ${symbol}`)
    await em.persistAndFlush(newAgent)
    const api = apiFactory(token)
    return { agent: newAgent, api }
  } else {
    const updateAgent = updateAgentFactory(existing.token, resetDate)
    const api = apiFactory(existing.token)
    const {
      data: { data: agent },
    } = await api.agents.getMyAgent()
    await updateAgent(existing, { data: agent })
    return { agent: existing, api }
  }
}
