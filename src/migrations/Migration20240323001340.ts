import { Migration } from '@mikro-orm/migrations'

export class Migration20240323001340 extends Migration {
  async up(): Promise<void> {
    this.addSql('truncate table "waypoint" restart identity cascade;')
    this.addSql(
      'alter table "waypoint" add column "exports" text[] not null, add column "exchange" text[] not null, add column "trade_goods" jsonb null;',
    )
  }

  async down(): Promise<void> {
    this.addSql('alter table "waypoint" drop column "exports";')
    this.addSql('alter table "waypoint" drop column "exchange";')
    this.addSql('alter table "waypoint" drop column "trade_goods";')
  }
}
