import { EntityData } from '@mikro-orm/core'
import { Entries } from 'type-fest'
import { DefaultApiFactory } from '../../../api'
import { apiFactory } from '../../../apiFactory'
import { log } from '../../../logging/configure-logging'
import { getEntityManager } from '../../../orm'
import { AgentEntity } from '../agent.entity'

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
  const existing = await em.findOne(AgentEntity, { resetDate, isRetired: false })
  if (!existing) {
    const symbol = AgentEntity.generateSymbol()
    log.warn('agent', `Creating new agent with symbol ${symbol}`)
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
    if (existing.contract) {
      const {
        data: { data: contract },
      } = await api.contracts.getContract(existing.contract.id)
      await updateAgent(existing, { contract })
    }
    return { agent: existing, api }
  }
}
