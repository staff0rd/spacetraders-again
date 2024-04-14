import { Migration } from '@mikro-orm/migrations';

export class Migration20240414125551 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "waypoint" add column "last_shipyard_scan" timestamptz null, add column "last_marketplace_scan" timestamptz null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "waypoint" drop column "last_shipyard_scan";');
    this.addSql('alter table "waypoint" drop column "last_marketplace_scan";');
  }

}
