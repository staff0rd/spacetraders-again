import { Migration } from '@mikro-orm/migrations'

export class Migration20240327134507 extends Migration {
  async up(): Promise<void> {
    this.addSql(`DROP VIEW IF EXISTS ships_cargo;
    DROP VIEW IF EXISTS ships_nav;
    DROP VIEW IF EXISTS ships;
    CREATE VIEW ships AS
    
        select
          REPLACE(symbol, agent.data->>'symbol', registration->>'role') as ship, 
          symbol,
          nav->>'status' as status,
          nav->'route'->'destination'->>'symbol' as destination_symbol, 
          nav->'route'->'destination'->>'type' as destination_type, 
          date_trunc('second', AGE((nav->'route'->>'arrival')::timestamp, NOW())) as arrival,
          agent.reset_date
        from
          ship
        JOIN
          agent on agent.reset_date = ship.reset_date
    ;
    CREATE VIEW ships_nav AS
    SELECT
      ship,
      CASE status WHEN 'IN_TRANSIT' THEN '🚀'
                  WHEN 'DOCKED' THEN '🌕'
                  ELSE '🌑' END as status,
      destination_type || ' (' || destination_symbol || ')' as destination,
      CASE status WHEN 'IN_TRANSIT' then arrival::text else '-' end as arrival,
      reset_date
    FROM
      ships;
    CREATE VIEW ships_cargo AS
        select
          symbol,
          registration->>'role' as role, 
          (cargo->>'units')::int as units, 
          (cargo->>'capacity')::int as capacity, 
          (cargo->>'units')::float/CASE (cargo->>'capacity')::int WHEN 0 THEN 1 ELSE (cargo->>'capacity')::int END as percent,
          reset_date
        from "ship"`)
  }
}
