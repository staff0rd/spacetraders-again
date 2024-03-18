import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity()
export class Waypoint {
  @PrimaryKey({ autoincrement: true })
  id!: number

  @Property()
  resetDate: string

  @Property()
  systemSymbol: string

  @Property()
  symbol: string

  @Property()
  x: number

  @Property()
  y: number

  @Property()
  imports: string[]

  constructor(resetDate: string, systemSymbol: string, symbol: string, imports: string[], x: number, y: number) {
    this.resetDate = resetDate
    this.symbol = symbol
    this.systemSymbol = systemSymbol
    this.x = x
    this.y = y
    this.imports = imports
  }
}
