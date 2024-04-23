import { Migration } from '@mikro-orm/migrations';

export class Migration20240423120934 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "survey" add column "exhausted" boolean not null default false;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "survey" drop column "exhausted";');
  }

}
