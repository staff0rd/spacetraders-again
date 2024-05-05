import { faker } from '@faker-js/faker'
import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { Agent, Contract } from '../../../api'

@Entity({ tableName: 'agent' })
export class AgentEntity {
  @PrimaryKey({ autoincrement: true })
  id!: number

  @Property()
  resetDate: string

  @Property({ columnType: 'character varying(600)' })
  token: string

  @Property({ columnType: 'json' })
  contract: Contract | undefined

  @Property({ columnType: 'json' })
  data: Agent

  @Property({ default: false })
  isRetired: boolean = false

  constructor(resetDate: string, token: string, agent: Agent) {
    this.resetDate = resetDate
    this.token = token
    this.data = agent
  }

  get contractGood() {
    if (this.contract?.terms.deliver?.length !== 1) throw new Error('Expected agent to have a single deliver contract')
    return this.contract.terms.deliver[0]
  }

  get contractUnitsRemaining() {
    const deliveries = this.contract!.terms.deliver![0]
    const unitsToGo = deliveries?.unitsRequired - deliveries?.unitsFulfilled
    return unitsToGo ?? 0
  }

  static generateSymbol(): string {
    const result = faker.internet.userName()
    if (result.length < 3 || result.length > 14) return AgentEntity.generateSymbol()
    if (result.match(/\./)) return AgentEntity.generateSymbol()
    return result
  }
}
