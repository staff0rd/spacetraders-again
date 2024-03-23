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
  data: Agent | undefined // remove undefined after migration

  constructor(resetDate: string, token: string, agent: Agent) {
    this.resetDate = resetDate
    this.token = token
    this.data = agent
  }

  get contractGood() {
    if (this.contract?.terms.deliver?.length !== 1) throw new Error('Expected agent to have a single deliver contract')
    return this.contract.terms.deliver[0]
  }

  static generateSymbol(): string {
    const result = faker.internet.userName()
    if (result.length < 3 || result.length > 14) return AgentEntity.generateSymbol()
    return result
  }
}
