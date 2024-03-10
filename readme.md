# spacetraders-again

## Getting started

1. Start the containers:

   ```bash
   docker compose up -d
   ```

2. Configure `INFLUX_TOKEN` in `.env`:

   ```bash
   docker exec spacetraders-again-influxdb-1 influx auth create --org my-org --all-access
   ```

3. Add influx user:

   ```bash
   docker exec spacetraders-again-influxdb-1 influx user create -n staff0rd -p mypassword -o my-org
   ```

4. Connect influxdb to grafana
   Url: http://influxdb:8086
   Header: Authorization
   Value: Token <token>
   Database: my-bucket
