import { Migration } from '@mikro-orm/migrations'

export class Migration20240331114136 extends Migration {
  async up(): Promise<void> {
    this.addSql('create extension cube;')
  }
}
