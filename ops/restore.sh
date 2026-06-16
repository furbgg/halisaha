#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

load_env
require_cmd docker

FORCE=0
SKIP_SAFETY_BACKUP=0
BACKUP_FILE=""
USE_LATEST=0

while [ $# -gt 0 ]; do
  case "$1" in
    --latest)
      USE_LATEST=1
      shift
      ;;
    --force)
      FORCE=1
      shift
      ;;
    --skip-safety-backup)
      SKIP_SAFETY_BACKUP=1
      shift
      ;;
    *)
      BACKUP_FILE="$1"
      shift
      ;;
  esac
done

if [ "$USE_LATEST" -eq 1 ] && [ -n "$BACKUP_FILE" ]; then
  die "Use either --latest or an explicit backup file path, not both."
fi

if [ "$USE_LATEST" -eq 1 ]; then
  backup_dir="${BACKUP_DIR:-./ops/backups}"
  case "$backup_dir" in
    /*) backup_path="$backup_dir" ;;
    *) backup_path="$ROOT_DIR/$backup_dir" ;;
  esac
  BACKUP_FILE="$(ls -1t "$backup_path"/*.sql.gz 2>/dev/null | head -n1 || true)"
  [ -n "$BACKUP_FILE" ] || die "No backup file found under $backup_path"
fi

[ -n "$BACKUP_FILE" ] || die "Usage: $0 [--latest] [--force] [--skip-safety-backup] <backup.sql.gz>"

case "$BACKUP_FILE" in
  /*) RESTORE_FILE="$BACKUP_FILE" ;;
  *) RESTORE_FILE="$ROOT_DIR/$BACKUP_FILE" ;;
esac

[ -f "$RESTORE_FILE" ] || die "Backup file not found: $RESTORE_FILE"

if [ "$FORCE" -ne 1 ]; then
  warn "You are about to restore database from: $RESTORE_FILE"
  read -r -p "Type RESTORE to continue: " answer
  [ "$answer" = "RESTORE" ] || die "Restore cancelled."
fi

if [ "$SKIP_SAFETY_BACKUP" -ne 1 ]; then
  "$SCRIPT_DIR/backup.sh" "pre_restore"
fi

log "Stopping backend to avoid writes during restore"
dc stop backend >/dev/null

log "Restoring database..."
if [[ "$RESTORE_FILE" == *.gz ]]; then
  gunzip -c "$RESTORE_FILE" | dc exec -T -e PGPASSWORD="$DB_PASSWORD" postgres \
    psql -h localhost -U "$DB_USERNAME" -d "$DB_NAME"
else
  cat "$RESTORE_FILE" | dc exec -T -e PGPASSWORD="$DB_PASSWORD" postgres \
    psql -h localhost -U "$DB_USERNAME" -d "$DB_NAME"
fi

log "Starting backend after restore"
dc up -d backend >/dev/null

wait_for_backend_health "${MONITOR_BACKEND_URL:-http://127.0.0.1:${BACKEND_PORT:-8080}/api/fields}" \
  "${MONITOR_BACKEND_FALLBACK_URL:-http://127.0.0.1:${BACKEND_PORT:-8080}/api/actuator/health}" \
  240 \
  || die "Backend did not become healthy after restore"

log "Restore completed successfully."
