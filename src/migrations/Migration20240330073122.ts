import { Migration } from '@mikro-orm/migrations'

export class Migration20240330073122 extends Migration {
  async up(): Promise<void> {
    this.addSql('truncate table "waypoint"')
    this.addSql('alter table "waypoint" drop constraint "waypoint_pkey";')
    this.addSql('alter table "waypoint" drop column "id";')

    this.addSql(
      'alter table "waypoint" add column "is_under_construction" boolean not null, add column "traits" text[] not null, add column "faction" varchar(255) null, add column "type" varchar(255) not null, add column "modifiers" text[] not null;',
    )
    this.addSql('alter table "waypoint" add constraint "waypoint_pkey" primary key ("reset_date", "symbol");')
  }

  async down(): Promise<void> {
    this.addSql('alter table "waypoint" drop constraint "waypoint_pkey";')
    this.addSql('alter table "waypoint" drop column "is_under_construction";')
    this.addSql('alter table "waypoint" drop column "traits";')
    this.addSql('alter table "waypoint" drop column "faction";')
    this.addSql('alter table "waypoint" drop column "type";')
    this.addSql('alter table "waypoint" drop column "modifiers";')

    this.addSql('alter table "waypoint" add column "id" serial not null;')
    this.addSql('alter table "waypoint" add constraint "waypoint_pkey" primary key ("id");')
  }
}
