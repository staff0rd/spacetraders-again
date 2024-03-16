import { faker } from '@faker-js/faker'
import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity()
export class Agent {
  @PrimaryKey({ autoincrement: true })
  id!: number

  @Property()
  resetDate: string

  @Property()
  symbol: string

  @Property({ columnType: 'character varying(600)' })
  token: string

  constructor(resetDate: string, symbol: string, token: string) {
    this.resetDate = resetDate
    this.symbol = symbol
    this.token = token
  }

  static generateSymbol(): string {
    const result = faker.internet.userName()
    if (result.length < 3 || result.length > 14) return Agent.generateSymbol()
    return result
  }
}
