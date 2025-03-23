import { Migration } from '@mikro-orm/migrations';

export class Migration20250323121023 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "time_series_data_entity" ("id" serial primary key, "timestamp" timestamptz not null, "reset_date" varchar(255) not null, "agent_symbol" varchar(255) not null, "measurement_name" varchar(255) not null, "tags" jsonb not null default \'{}\', "fields" jsonb not null default \'{}\');');
    this.addSql('create index "time_series_data_entity_timestamp_index" on "time_series_data_entity" ("timestamp");');
    this.addSql('create index "time_series_data_entity_reset_date_index" on "time_series_data_entity" ("reset_date");');
    this.addSql('create index "time_series_data_entity_agent_symbol_index" on "time_series_data_entity" ("agent_symbol");');
    this.addSql('create index "time_series_data_entity_measurement_name_index" on "time_series_data_entity" ("measurement_name");');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "time_series_data_entity" cascade;');
  }

}
