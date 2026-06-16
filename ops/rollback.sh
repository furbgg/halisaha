#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

load_env
require_cmd docker
require_cmd curl

STATE_FILE="$STATE_DIR/last_update.env"
RESTORE_DB=0

while [ $# -gt 0 ]; do
  case "$1" in
    --restore-db)
      RESTORE_DB=1
      shift
      ;;
    *)
      die "Unknown argument: $1"
      ;;
  esac
done

[ -f "$STATE_FILE" ] || die "Missing rollback state file: $STATE_FILE"
# shellcheck disable=SC1090
. "$STATE_FILE"

[ -n "${PREV_IMAGE_ID:-}" ] || die "PREV_IMAGE_ID is empty in $STATE_FILE"

log "Restoring previous backend image..."
docker image tag "$PREV_IMAGE_ID" halisaha-backend:latest
dc up -d backend

wait_for_backend_health "${MONITOR_BACKEND_URL:-http://127.0.0.1:${BACKEND_PORT:-8080}/api/fields}" \
  "${MONITOR_BACKEND_FALLBACK_URL:-http://127.0.0.1:${BACKEND_PORT:-8080}/api/actuator/health}" \
  240 \
  || die "Backend is not healthy after image rollback."

if [ "$RESTORE_DB" -eq 1 ]; then
  [ -n "${PRE_UPDATE_BACKUP:-}" ] || die "No PRE_UPDATE_BACKUP recorded in $STATE_FILE"
  log "Restoring database from pre-update backup: $PRE_UPDATE_BACKUP"
  "$SCRIPT_DIR/restore.sh" --force --skip-safety-backup "$PRE_UPDATE_BACKUP"
fi

log "Rollback completed."
