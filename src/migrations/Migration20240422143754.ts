import { Migration } from '@mikro-orm/migrations';

export class Migration20240422143754 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "survey" ("reset_date" varchar(255) not null, "signature" varchar(255) not null, "symbol" varchar(255) not null, "deposits" text[] not null, "expiration" timestamptz not null, "size" varchar(255) not null, constraint "survey_pkey" primary key ("reset_date", "signature"));');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "survey" cascade;');
  }

}
