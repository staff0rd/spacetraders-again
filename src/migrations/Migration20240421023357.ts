import { Migration } from '@mikro-orm/migrations'

export class Migration20240421023357 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
    CREATE VIEW trade_goods as
    SELECT goods.type,
  supply,
  goods.symbol,
  activity,
  "sellPrice" as sell_price,
  "tradeVolume" as trade_volume,
  "purchasePrice" as purchase_price,
  reset_date,
  waypoint.symbol as waypoint_symbol,
  waypoint.type as waypoint_type
    from waypoint, jsonb_to_recordset(trade_goods) as goods(type text, supply text, symbol text, activity text, "sellPrice" int, "tradeVolume" int, "purchasePrice" int)
  `)
  }
}
