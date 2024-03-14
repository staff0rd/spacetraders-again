import { Migration } from '@mikro-orm/migrations'

export class Migration20240314134141 extends Migration {
  async up(): Promise<void> {
    this.addSql('create table "status" ("id" serial primary key, "reset_date" varchar(255) not null);')
  }
}
