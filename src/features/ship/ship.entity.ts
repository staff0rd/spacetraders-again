import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { v4 as uuidv4 } from 'uuid'
import {
  Cooldown,
  Ship,
  ShipCargo,
  ShipCrew,
  ShipEngine,
  ShipFrame,
  ShipFuel,
  ShipModule,
  ShipMount,
  ShipNav,
  ShipReactor,
  ShipRegistration,
  TradeSymbol,
} from '../../api'

export enum ShipActionType {
  SELL = 'SELL',
  FILL = 'FILL',
  TRADE = 'TRADE',
  NONE = 'NONE',
}

export type ShipAction =
  | {
      type: ShipActionType.SELL | ShipActionType.FILL | ShipActionType.NONE
    }
  | {
      type: ShipActionType.TRADE
      tradeSymbol: TradeSymbol
      from: string
      to: string
      expectedProfit: number
      totalPurchaseCost: number
      totalSellPrice: number
    }

@Entity({ tableName: 'ship' })
export class ShipEntity {
  @PrimaryKey({ type: 'uuid' })
  id = uuidv4()

  @Property()
  resetDate: string

  @Property()
  createdAt = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date()

  @Property()
  symbol: string

  @Property({ type: 'json' })
  registration: ShipRegistration
  @Property({ type: 'json' })
  nav: ShipNav
  @Property({ type: 'json' })
  crew: ShipCrew
  @Property({ type: 'json' })
  frame: ShipFrame
  @Property({ type: 'json' })
  reactor: ShipReactor
  @Property({ type: 'json' })
  engine: ShipEngine
  @Property({ type: 'json' })
  cooldown: Cooldown
  @Property({ type: 'json' })
  modules: Array<ShipModule>
  @Property({ type: 'json' })
  mounts: Array<ShipMount>
  @Property({ type: 'json' })
  cargo: ShipCargo
  @Property({ type: 'json' })
  fuel: ShipFuel
  @Property({ type: 'json' })
  action?: ShipAction

  isCommanded = false

  constructor(resetDate: string, ship: Ship) {
    this.resetDate = resetDate
    this.symbol = ship.symbol
    this.cargo = ship.cargo
    this.cooldown = ship.cooldown
    this.registration = ship.registration
    this.nav = ship.nav
    this.crew = ship.crew
    this.frame = ship.frame
    this.reactor = ship.reactor
    this.engine = ship.engine
    this.cooldown = ship.cooldown
    this.modules = ship.modules
    this.mounts = ship.mounts
    this.cargo = ship.cargo
    this.fuel = ship.fuel
  }

  get label() {
    const suffix = this.symbol.match(/-(.+$)/)?.[1] ?? ''
    return `${this.registration.role}-${suffix.padStart(2, '0')}`
  }
}
