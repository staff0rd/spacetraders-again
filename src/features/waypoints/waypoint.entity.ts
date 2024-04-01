import { Entity, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/core'
import { MarketTradeGood, Shipyard, TradeSymbol } from '../../../api'

@Entity({ tableName: 'waypoint' })
export class WaypointEntity {
  @PrimaryKey()
  resetDate: string

  @PrimaryKey()
  symbol: string

  @Property()
  systemSymbol: string

  @Property()
  x: number

  @Property()
  y: number

  @Property()
  imports: TradeSymbol[] = []

  @Property()
  exports: TradeSymbol[] = []

  @Property()
  exchange: TradeSymbol[] = []

  @Property({ type: 'json' })
  tradeGoods: MarketTradeGood[] | undefined

  @Property({ type: 'json' })
  shipyard: undefined | Pick<Shipyard, 'modificationsFee' | 'shipTypes'>

  @Property({ type: 'json' })
  ships: undefined | Shipyard['ships'];

  [PrimaryKeyProp]?: ['resetDate', 'symbol']

  @Property()
  isUnderConstruction: boolean

  @Property()
  traits: string[]

  @Property()
  faction: string | undefined

  @Property()
  type: string

  @Property()
  modifiers: string[]

  distanceFromEngineeredAsteroid: number = 0

  get label() {
    return `${this.type} (${this.symbol})`
  }

  constructor(values: {
    resetDate: string
    symbol: string
    systemSymbol: string
    x: number
    y: number
    isUnderConstruction: boolean
    traits: string[]
    faction: string | undefined
    type: string
    modifiers: string[]
  }) {
    this.resetDate = values.resetDate
    this.symbol = values.symbol
    this.systemSymbol = values.systemSymbol
    this.x = values.x
    this.y = values.y
    this.isUnderConstruction = values.isUnderConstruction
    this.traits = values.traits
    this.faction = values.faction
    this.type = values.type
    this.modifiers = values.modifiers
  }
}
