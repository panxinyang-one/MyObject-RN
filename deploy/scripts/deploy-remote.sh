#!/usr/bin/env bash
# Run on Aliyun server (manually or via GitHub Actions SSH).
# Strategy: pull Hub image (fast) → login retry → local docker build (CN fallback).
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/myobject-rn}"
cd "$APP_DIR"

echo "=== deploy-remote: $(date -Is) ==="
whoami
pwd

if [[ ! -f deploy/.env.prod ]]; then
  echo "ERROR: Missing deploy/.env.prod"
  echo "Copy: cp deploy/env.prod.example deploy/.env.prod && fill secrets"
  exit 1
fi

if [[ ! -f deploy/docker-compose.prod.yml ]]; then
  echo "ERROR: Missing deploy/docker-compose.prod.yml under $APP_DIR"
  exit 1
fi

# CI syncs backend/ via SCP; manual deploy may still git pull
if [[ "${DEPLOY_SKIP_GIT_PULL:-}" == "1" ]]; then
  echo "=== skip git pull (DEPLOY_SKIP_GIT_PULL=1, backend synced by CI) ==="
elif git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "=== git pull (max 20s, best effort) ==="
  timeout 20 env GIT_TERMINAL_PROMPT=0 git pull --ff-only origin main \
    || timeout 20 env GIT_TERMINAL_PROMPT=0 git pull --ff-only origin master \
    || echo "WARN: git pull skipped (timeout or local changes)"
else
  echo "=== skip git pull (not a git repo) ==="
fi

set -a
# shellcheck disable=SC1091
source deploy/.env.prod
set +a

if [[ -n "${DOCKER_IMAGE_OVERRIDE:-}" ]]; then
  export DOCKER_IMAGE="$DOCKER_IMAGE_OVERRIDE"
fi

if [[ -z "${DOCKER_IMAGE:-}" ]]; then
  echo "ERROR: DOCKER_IMAGE not set in deploy/.env.prod"
  exit 1
fi

echo "DOCKER_IMAGE=$DOCKER_IMAGE"
COMPOSE=(docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod)

try_docker_login() {
  if [[ -z "${DOCKERHUB_USERNAME:-}" || -z "${DOCKERHUB_TOKEN:-}" ]]; then
    echo "Skip docker login (no credentials in env)"
    return 1
  fi
  echo "=== docker login (30s timeout) ==="
  if timeout 30 bash -c 'echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin' \
    >/dev/null 2>&1; then
    echo "docker login OK"
    return 0
  fi
  echo "WARN: docker login failed or timed out (Hub may be slow from CN)"
  return 1
}

try_pull_api() {
  local attempt
  for attempt in 1 2; do
    echo "=== docker compose pull api (attempt ${attempt}/2, max 90s) ==="
    if timeout 90 "${COMPOSE[@]}" pull api; then
      echo "pull OK"
      return 0
    fi
    echo "pull failed, retry in 5s..."
    sleep 5
  done
  return 1
}

build_api_on_server() {
  echo "=== fallback: docker build on server (may take 3-8 min) ==="
  if [[ ! -f backend/Dockerfile ]]; then
    echo "ERROR: backend/Dockerfile missing on server"
    echo "Ensure CI scp step ran or git pull succeeded"
    exit 1
  fi
  docker build -t "$DOCKER_IMAGE" ./backend
}

ensure_api_image() {
  if try_pull_api; then
    return 0
  fi
  try_docker_login || true
  if try_pull_api; then
    return 0
  fi
  build_api_on_server
}

ensure_api_image

echo "=== docker compose up ==="
"${COMPOSE[@]}" up -d --pull never

echo "=== wait for health ==="
HEALTH_URL="http://127.0.0.1:${API_PORT:-3000}/health"
for i in $(seq 1 30); do
  if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
    echo "health OK"
    curl -fsS "$HEALTH_URL"
    echo ""
    docker ps --filter name=evidence-
    exit 0
  fi
  echo "waiting for API ($i/30)..."
  sleep 2
done

echo "ERROR: health check failed at $HEALTH_URL"
"${COMPOSE[@]}" ps || true
docker logs evidence-api --tail 80 || true
exit 1
