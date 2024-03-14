import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity()
export class Status {
  @PrimaryKey()
  id: number

  @Property()
  resetDate: string

  constructor(resetDate: string) {
    this.id = 1
    this.resetDate = resetDate
  }
}
