import { Migration } from '@mikro-orm/migrations';

export class Migration20240316122310 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "agent" ("id" serial primary key, "reset_date" varchar(255) not null, "symbol" varchar(255) not null, "token" character varying(600) not null);');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "agent" cascade;');
  }

}
