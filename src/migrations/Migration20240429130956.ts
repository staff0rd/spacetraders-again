import { Migration } from '@mikro-orm/migrations';

export class Migration20240429130956 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "agent" add column "is_retired" boolean not null default false;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "agent" drop column "is_retired";');
  }

}
