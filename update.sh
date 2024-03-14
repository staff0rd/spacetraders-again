git pull
npm i
npm run db:migrate
docker compose --profile prod build app
./restart.sh