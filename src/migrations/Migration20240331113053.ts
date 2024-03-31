import { Migration } from '@mikro-orm/migrations'

export class Migration20240331113053 extends Migration {
  async up(): Promise<void> {
    this.addSql('drop table if exists "status" cascade;')
  }

  async down(): Promise<void> {
    this.addSql('create table "status" ("id" serial primary key, "reset_date" varchar(255) not null);')
  }
}
