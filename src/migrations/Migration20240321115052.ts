import { Migration } from '@mikro-orm/migrations';

export class Migration20240321115052 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "waypoint" add column "shipyard" jsonb null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "waypoint" drop column "shipyard";');
  }

}
