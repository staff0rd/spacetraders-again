import { Migration } from '@mikro-orm/migrations';

export class Migration20240320122737 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "agent" drop column "symbol";');

    this.addSql('alter table "agent" add column "contract" json null, add column "data" json null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "agent" drop column "contract";');
    this.addSql('alter table "agent" drop column "data";');

    this.addSql('alter table "agent" add column "symbol" varchar(255) not null;');
  }

}
