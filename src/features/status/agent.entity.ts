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

  static generateSymbol(): string {
    const result = faker.internet.userName()
    if (result.length < 3 || result.length > 14) return AgentEntity.generateSymbol()
    return result
  }
}
