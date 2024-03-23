import { Migration } from '@mikro-orm/migrations';

export class Migration20240322235321 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "waypoint" add column "ships" jsonb null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "waypoint" drop column "ships";');
  }

}
