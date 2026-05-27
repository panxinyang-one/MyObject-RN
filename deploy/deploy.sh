#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${SERVER_APP_DIR:-/opt/evidence-api}"
COMPOSE_FILE="${APP_DIR}/deploy/docker-compose.prod.yml"
ENV_FILE="${APP_DIR}/deploy/.env.prod"

cd "$APP_DIR"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull api
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

sleep 3
curl -fsS "http://127.0.0.1:${API_PORT:-3000}/health" || {
  echo "Health check failed"
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs --tail=80 api
  exit 1
}
echo "Deploy OK"
