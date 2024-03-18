import { Migration } from '@mikro-orm/migrations';

export class Migration20240318132858 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "waypoint" ("id" serial primary key, "reset_date" varchar(255) not null, "system_symbol" varchar(255) not null, "symbol" varchar(255) not null, "x" int not null, "y" int not null, "imports" text[] not null);');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "waypoint" cascade;');
  }

}
