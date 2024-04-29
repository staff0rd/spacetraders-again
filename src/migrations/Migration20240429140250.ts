import { Migration } from '@mikro-orm/migrations'

export class Migration20240429140250 extends Migration {
  async up(): Promise<void> {
    this.addSql(`CREATE OR REPLACE VIEW "ships" AS
    SELECT replace((ship.symbol)::text, (agent.data ->> 'symbol'::text), (ship.registration ->> 'role'::text)) AS ship,
        ship.symbol,
        (ship.nav ->> 'status'::text) AS status,
        (((ship.nav -> 'route'::text) -> 'destination'::text) ->> 'symbol'::text) AS destination_symbol,
        (((ship.nav -> 'route'::text) -> 'destination'::text) ->> 'type'::text) AS destination_type,
        date_trunc('second'::text, age(((((ship.nav -> 'route'::text) ->> 'arrival'::text))::timestamp without time zone)::timestamp with time zone, now())) AS arrival,
        agent.reset_date,
        (agent.data ->> 'symbol'::text) AS agent_symbol
      FROM ship 
    JOIN agent ON  agent.reset_date = ship.reset_date
    WHERE ship.symbol like agent.data->>'symbol' || '%'`)
  }
}
