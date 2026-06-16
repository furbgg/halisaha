#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

load_env
require_cmd docker
require_cmd curl

SKIP_PULL=0
SKIP_BACKUP=0
SKIP_BUILD=0
NO_AUTO_ROLLBACK=0

while [ $# -gt 0 ]; do
  case "$1" in
    --skip-pull)
      SKIP_PULL=1
      shift
      ;;
    --skip-backup)
      SKIP_BACKUP=1
      shift
      ;;
    --skip-build)
      SKIP_BUILD=1
      shift
      ;;
    --no-auto-rollback)
      NO_AUTO_ROLLBACK=1
      shift
      ;;
    *)
      die "Unknown argument: $1"
      ;;
  esac
done

PREV_IMAGE_ID=""
BACKUP_FILE=""
STATE_FILE="$STATE_DIR/last_update.env"

backend_cid="$(dc ps -q backend || true)"
if [ -n "$backend_cid" ]; then
  PREV_IMAGE_ID="$(docker inspect --format '{{.Image}}' "$backend_cid" 2>/dev/null || true)"
fi

if [ "$SKIP_BACKUP" -eq 0 ]; then
  BACKUP_FILE="$("$SCRIPT_DIR/backup.sh" "pre_update")"
fi

cat >"$STATE_FILE" <<EOF
PREV_IMAGE_ID=$PREV_IMAGE_ID
PRE_UPDATE_BACKUP=$BACKUP_FILE
UPDATED_AT=$(timestamp)
EOF

if [ "$SKIP_PULL" -eq 0 ] && [ -d "$ROOT_DIR/.git" ] && command -v git >/dev/null 2>&1; then
  log "Pulling latest code..."
  git -C "$ROOT_DIR" pull --ff-only
fi

log "Deploying update..."
if [ "$SKIP_BUILD" -eq 1 ]; then
  dc up -d backend
else
  dc up -d --build backend
fi

if wait_for_backend_health \
  "${MONITOR_BACKEND_URL:-http://127.0.0.1:${BACKEND_PORT:-8080}/api/fields}" \
  "${MONITOR_BACKEND_FALLBACK_URL:-http://127.0.0.1:${BACKEND_PORT:-8080}/api/actuator/health}" \
  240; then
  log "Update succeeded."
  exit 0
fi

warn "Update failed: backend did not become healthy."
"$SCRIPT_DIR/notify.sh" "CRITICAL" "Update failed on $PROJECT_NAME. Attempting rollback."

if [ "$NO_AUTO_ROLLBACK" -eq 1 ]; then
  die "Auto rollback disabled. Run ./ops/rollback.sh manually."
fi

if [ -z "$PREV_IMAGE_ID" ]; then
  die "No previous backend image found. Cannot auto rollback."
fi

log "Rolling back to previous backend image..."
docker image tag "$PREV_IMAGE_ID" halisaha-backend:latest
dc up -d backend

if wait_for_backend_health \
  "${MONITOR_BACKEND_URL:-http://127.0.0.1:${BACKEND_PORT:-8080}/api/fields}" \
  "${MONITOR_BACKEND_FALLBACK_URL:-http://127.0.0.1:${BACKEND_PORT:-8080}/api/actuator/health}" \
  240; then
  "$SCRIPT_DIR/notify.sh" "WARN" "Rollback applied successfully after failed update."
  die "Update failed, rollback applied."
fi

die "Update failed and rollback did not recover health."
