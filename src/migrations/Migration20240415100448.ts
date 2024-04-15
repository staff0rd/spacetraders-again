import { Migration } from '@mikro-orm/migrations';

export class Migration20240415100448 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `agent` (`id` int unsigned not null auto_increment primary key, `reset_date` varchar(255) not null, `token` character varying(600) not null, `contract` json null, `data` json not null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `ship` (`id` varchar(36) not null, `reset_date` varchar(255) not null, `created_at` datetime not null, `updated_at` datetime not null, `symbol` varchar(255) not null, `registration` json not null, `nav` json not null, `crew` json not null, `frame` json not null, `reactor` json not null, `engine` json not null, `cooldown` json not null, `modules` json not null, `mounts` json not null, `cargo` json not null, `fuel` json not null, `action` json null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `waypoint` (`reset_date` varchar(255) not null, `symbol` varchar(255) not null, `system_symbol` varchar(255) not null, `x` int not null, `y` int not null, `imports` text not null, `exports` text not null, `exchange` text not null, `trade_goods` json null, `shipyard` json null, `ships` json null, `is_under_construction` tinyint(1) not null, `traits` text not null, `faction` varchar(255) null, `type` varchar(255) not null, `modifiers` text not null, `last_shipyard_scan` datetime null, `last_marketplace_scan` datetime null, primary key (`reset_date`, `symbol`)) default character set utf8mb4 engine = InnoDB;');
  }

}
