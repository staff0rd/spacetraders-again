# spacetraders-again

## Getting started

1. Start the containers:

   ```bash
   docker compose up -d
   ```

2. Configure `INFLUX_TOKEN` in `.env`:

   ```bash
   npm run influx:add-token
   ```

3. Add influx user for connecting via web ui

   ```bash
   npm run influx:add-user
   ```

4. Connect influxdb to grafana
   Url: http://influxdb:8086
   Header: Authorization
   Value: Token <token>
   Database: my-bucket
