import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { MarketTradeGood, Shipyard, TradeSymbol } from '../../../api'

@Entity({ tableName: 'waypoint' })
export class WaypointEntity {
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
  imports: TradeSymbol[]

  @Property()
  exports: TradeSymbol[]

  @Property()
  exchange: TradeSymbol[]

  @Property({ type: 'json' })
  tradeGoods: MarketTradeGood[] | undefined

  @Property({ type: 'json' })
  shipyard: undefined | Pick<Shipyard, 'modificationsFee' | 'shipTypes'>

  @Property({ type: 'json' })
  ships: undefined | Shipyard['ships']

  constructor(
    resetDate: string,
    systemSymbol: string,
    symbol: string,
    imports: TradeSymbol[],
    exports: TradeSymbol[],
    exchange: TradeSymbol[],
    tradeGoods: MarketTradeGood[] | undefined,
    x: number,
    y: number,
  ) {
    this.resetDate = resetDate
    this.symbol = symbol
    this.systemSymbol = systemSymbol
    this.x = x
    this.y = y
    this.imports = imports
    this.exports = exports
    this.exchange = exchange
    this.tradeGoods = tradeGoods
  }
}
