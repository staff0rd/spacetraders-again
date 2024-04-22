import { Migration } from '@mikro-orm/migrations'

export class Migration20240422150639 extends Migration {
  async up(): Promise<void> {
    this.addSql('truncate table "survey"')
    this.addSql('alter table "survey" drop constraint "survey_pkey";')
    this.addSql('alter table "survey" drop column "signature";')
    this.addSql('alter table "survey" drop column "symbol";')
    this.addSql('alter table "survey" drop column "deposits";')
    this.addSql('alter table "survey" drop column "expiration";')
    this.addSql('alter table "survey" drop column "size";')

    this.addSql('alter table "survey" add column "id" uuid not null, add column "data" jsonb not null;')
    this.addSql('alter table "survey" add constraint "survey_pkey" primary key ("id");')
  }

  async down(): Promise<void> {
    this.addSql('alter table "survey" drop constraint "survey_pkey";')
    this.addSql('alter table "survey" drop column "id";')
    this.addSql('alter table "survey" drop column "data";')

    this.addSql(
      'alter table "survey" add column "signature" varchar(255) not null, add column "symbol" varchar(255) not null, add column "deposits" text[] not null, add column "expiration" timestamptz not null, add column "size" varchar(255) not null;',
    )
    this.addSql('alter table "survey" add constraint "survey_pkey" primary key ("reset_date", "signature");')
  }
}
