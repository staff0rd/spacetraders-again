import { Migration } from '@mikro-orm/migrations';

export class Migration20240319143354 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "ship" ("id" uuid not null, "reset_date" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "symbol" varchar(255) not null, "registration" jsonb not null, "nav" jsonb not null, "crew" jsonb not null, "frame" jsonb not null, "reactor" jsonb not null, "engine" jsonb not null, "cooldown" jsonb not null, "modules" jsonb not null, "mounts" jsonb not null, "cargo" jsonb not null, "fuel" jsonb not null, constraint "ship_pkey" primary key ("id"));');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "ship" cascade;');
  }

}
