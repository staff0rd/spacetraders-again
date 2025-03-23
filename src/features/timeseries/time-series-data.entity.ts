import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core'

@Entity()
export class TimeSeriesDataEntity {
  @PrimaryKey()
  id!: number

  @Property()
  @Index()
  timestamp!: Date

  @Property()
  @Index()
  resetDate!: string

  @Property()
  @Index()
  agentSymbol!: string

  @Property()
  @Index()
  measurementName!: string

  @Property({ type: 'jsonb', default: '{}' })
  tags: Record<string, string> = {}

  @Property({ type: 'jsonb', default: '{}' })
  fields: Record<string, number | string> = {}

  constructor(options: Partial<TimeSeriesDataEntity> = {}) {
    Object.assign(this, options)
  }
}
