docker compose --profile prod down app
docker compose --profile prod up -d
ips=($(hostname -I))
ip="${ips[0]}"
echo Logs: http://$ip:5341/
echo Queues: http://$ip:3000/admin/queues
docker compose --profile prod logs app -f
