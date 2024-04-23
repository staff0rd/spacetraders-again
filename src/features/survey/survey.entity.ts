import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { v4 as uuidv4 } from 'uuid'
import { Survey } from '../../../api'

@Entity({ tableName: 'survey' })
export class SurveyEntity {
  @PrimaryKey({ type: 'uuid' })
  id = uuidv4()

  @Property()
  resetDate: string

  @Property({ type: 'json' })
  data: Survey

  @Property({ default: false })
  exhausted: boolean = false

  constructor({ resetDate, data }: { resetDate: string; data: Survey }) {
    this.resetDate = resetDate
    this.data = data
  }
}
