#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

load_env
require_cmd docker
require_cmd curl

errors=()
warnings=()

log "Running health checks..."

running_services="$(dc ps --status running --services | tr '\n' ' ')"
for service in postgres backend; do
  if [[ "$running_services" != *"$service"* ]]; then
    errors+=("Service '$service' is not running")
  fi
done

BACKEND_URL="${MONITOR_BACKEND_URL:-http://127.0.0.1:${BACKEND_PORT:-8080}/api/fields}"
BACKEND_FALLBACK_URL="${MONITOR_BACKEND_FALLBACK_URL:-http://127.0.0.1:${BACKEND_PORT:-8080}/api/actuator/health}"
if ! is_backend_http_ok "$BACKEND_URL" && ! is_backend_http_ok "$BACKEND_FALLBACK_URL"; then
  errors+=("Backend health endpoint check failed ($BACKEND_URL, fallback: $BACKEND_FALLBACK_URL)")
fi

if ! dc exec -T -e PGPASSWORD="$DB_PASSWORD" postgres \
  psql -h localhost -U "$DB_USERNAME" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
  errors+=("Postgres connectivity check failed")
fi

disk_path="${MONITOR_DISK_PATH:-/}"
disk_threshold="${MONITOR_DISK_THRESHOLD_PERCENT:-85}"
disk_usage="$(df -P "$disk_path" | awk 'NR==2 {gsub("%","",$5); print $5}')"
if [ -n "$disk_usage" ] && [ "$disk_usage" -ge "$disk_threshold" ]; then
  errors+=("Disk usage ${disk_usage}% on ${disk_path} exceeds threshold ${disk_threshold}%")
fi

backend_cid="$(dc ps -q backend || true)"
if [ -n "$backend_cid" ]; then
  restart_count="$(docker inspect --format '{{.RestartCount}}' "$backend_cid" 2>/dev/null || echo 0)"
  if [ "${restart_count:-0}" -ge 3 ]; then
    warnings+=("Backend restart count is high: ${restart_count}")
  fi
fi

if [ "${#warnings[@]}" -gt 0 ]; then
  warn_msg="$(printf '%s; ' "${warnings[@]}")"
  "$SCRIPT_DIR/notify.sh" "WARN" "$warn_msg"
fi

if [ "${#errors[@]}" -gt 0 ]; then
  err_msg="$(printf '%s; ' "${errors[@]}")"
  "$SCRIPT_DIR/notify.sh" "CRITICAL" "$err_msg"
  die "$err_msg"
fi

log "All checks passed."
