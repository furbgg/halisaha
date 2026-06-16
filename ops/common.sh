#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env}"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT_DIR/docker-compose.yml}"
PROJECT_NAME="${PROJECT_NAME:-halisaha}"
STATE_DIR="$ROOT_DIR/ops/state"

mkdir -p "$STATE_DIR"

timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

log() {
  printf '[%s] %s\n' "$(timestamp)" "$*"
}

warn() {
  printf '[%s] WARN: %s\n' "$(timestamp)" "$*" >&2
}

die() {
  printf '[%s] ERROR: %s\n' "$(timestamp)" "$*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

load_env() {
  [ -f "$ENV_FILE" ] || die "Missing .env file at $ENV_FILE (run ops/init-env.sh first)"
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
  PROJECT_NAME="${PROJECT_NAME:-halisaha}"
}

dc() {
  docker compose --project-name "$PROJECT_NAME" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

upsert_env_var() {
  local key="$1"
  local value="$2"
  local file="$3"

  if grep -q "^${key}=" "$file"; then
    sed -i.bak "s|^${key}=.*|${key}=${value}|" "$file"
    rm -f "${file}.bak"
  else
    printf '%s=%s\n' "$key" "$value" >>"$file"
  fi
}

is_placeholder() {
  local value="$1"
  [[ -z "$value" || "$value" =~ CHANGE_ME|placeholder|example\.com|your_|sk_test_your|whsec_your ]]
}

generate_secret() {
  local length="${1:-48}"

  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 "$length" | tr -dc 'A-Za-z0-9' | head -c "$length"
  else
    tr -dc 'A-Za-z0-9' </dev/urandom | head -c "$length"
  fi
}

wait_for_service_healthy() {
  local service="$1"
  local timeout="${2:-180}"
  local waited=0

  while [ "$waited" -lt "$timeout" ]; do
    local cid
    cid="$(dc ps -q "$service" 2>/dev/null || true)"
    if [ -n "$cid" ]; then
      local status
      status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$cid" 2>/dev/null || true)"
      if [ "$status" = "healthy" ] || [ "$status" = "running" ]; then
        return 0
      fi
    fi
    sleep 2
    waited=$((waited + 2))
  done

  return 1
}

wait_for_backend_health() {
  local url="${1:-${MONITOR_BACKEND_URL:-http://127.0.0.1:${BACKEND_PORT:-8080}/api/fields}}"
  local fallback_url="${2:-${MONITOR_BACKEND_FALLBACK_URL:-http://127.0.0.1:${BACKEND_PORT:-8080}/api/actuator/health}}"
  local timeout="${3:-180}"
  local waited=0

  while [ "$waited" -lt "$timeout" ]; do
    if is_backend_http_ok "$url"; then
      return 0
    fi
    if [ -n "$fallback_url" ] && [ "$fallback_url" != "$url" ] && is_backend_http_ok "$fallback_url"; then
      return 0
    fi
    sleep 3
    waited=$((waited + 3))
  done

  return 1
}

is_backend_http_ok() {
  local url="$1"
  local body

  body="$(curl -fsS --max-time 10 "$url" 2>/dev/null || true)"
  if [ -z "$body" ]; then
    return 1
  fi

  if echo "$body" | grep -q '"UP"'; then
    return 0
  fi

  if echo "$body" | grep -Eq '"success"[[:space:]]*:[[:space:]]*true'; then
    return 0
  fi

  return 1
}
