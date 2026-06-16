#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

require_cmd docker
require_cmd curl

ADMIN_ARGS=()
SKIP_BUILD=0
SKIP_ADMIN=0
SEED_TEST_DATA=0

while [ $# -gt 0 ]; do
  case "$1" in
    --admin-email|--admin-name|--admin-phone|--admin-password)
      ADMIN_ARGS+=("$1" "$2")
      shift 2
      ;;
    --skip-build)
      SKIP_BUILD=1
      shift
      ;;
    --skip-admin)
      SKIP_ADMIN=1
      shift
      ;;
    --seed-test-data)
      SEED_TEST_DATA=1
      shift
      ;;
    *)
      die "Unknown argument: $1"
      ;;
  esac
done

"$SCRIPT_DIR/init-env.sh"
load_env

if is_placeholder "${STRIPE_SECRET_KEY:-}"; then
  warn "STRIPE_SECRET_KEY is placeholder. Payments will fail until updated."
fi
if is_placeholder "${STRIPE_WEBHOOK_SECRET:-}"; then
  warn "STRIPE_WEBHOOK_SECRET is placeholder. Webhooks will fail until updated."
fi

if [ "$SKIP_BUILD" -eq 1 ]; then
  log "Starting stack without build"
  dc up -d
else
  log "Building and starting stack"
  dc up -d --build
fi

log "Waiting for postgres health..."
wait_for_service_healthy "postgres" 180 || die "Postgres did not become healthy in time"

log "Waiting for backend health..."
wait_for_backend_health \
  "${MONITOR_BACKEND_URL:-http://127.0.0.1:${BACKEND_PORT:-8080}/api/fields}" \
  "${MONITOR_BACKEND_FALLBACK_URL:-http://127.0.0.1:${BACKEND_PORT:-8080}/api/actuator/health}" \
  240 || die "Backend health check failed"

if [ "$SKIP_ADMIN" -eq 0 ]; then
  "$SCRIPT_DIR/bootstrap-admin.sh" "${ADMIN_ARGS[@]}"
else
  warn "Skipped admin provisioning (--skip-admin)"
fi

if [ "$SEED_TEST_DATA" -eq 1 ] || [ "${SEED_TEST_DATA_ON_BOOTSTRAP:-false}" = "true" ]; then
  "$SCRIPT_DIR/seed-test-data.sh"
else
  log "Skipping demo seed data. Use --seed-test-data to load test reservations/payments."
fi

log "Bootstrap completed successfully."
log "Run ./ops/monitor.sh to verify health, then schedule backup/update jobs."
