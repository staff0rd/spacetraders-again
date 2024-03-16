git pull
npm i
npm run db:migration:up
docker compose --profile prod build app
./restart.sh
