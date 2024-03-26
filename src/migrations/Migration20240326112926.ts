import { Migration } from '@mikro-orm/migrations';

export class Migration20240326112926 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "ship" add column "action" jsonb null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "ship" drop column "action";');
  }

}
