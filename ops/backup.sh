#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

load_env
require_cmd docker

TAG="${1:-manual}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
BACKUP_BASE_DIR="${BACKUP_DIR:-./ops/backups}"

if [ $# -gt 1 ]; then
  die "Usage: $0 [tag]"
fi

case "$BACKUP_BASE_DIR" in
  /*) BACKUP_PATH="$BACKUP_BASE_DIR" ;;
  *) BACKUP_PATH="$ROOT_DIR/$BACKUP_BASE_DIR" ;;
esac

mkdir -p "$BACKUP_PATH"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
FILE_NAME="halisaha_${TAG}_${STAMP}.sql.gz"
BACKUP_FILE="$BACKUP_PATH/$FILE_NAME"

log "Creating backup: $BACKUP_FILE"

dc exec -T -e PGPASSWORD="$DB_PASSWORD" postgres \
  pg_dump -h localhost -U "$DB_USERNAME" --clean --if-exists --no-owner --no-privileges "$DB_NAME" \
  | gzip -9 >"$BACKUP_FILE"

if command -v sha256sum >/dev/null 2>&1; then
  sha256sum "$BACKUP_FILE" >"${BACKUP_FILE}.sha256"
elif command -v shasum >/dev/null 2>&1; then
  shasum -a 256 "$BACKUP_FILE" >"${BACKUP_FILE}.sha256"
fi

find "$BACKUP_PATH" -type f -name "*.sql.gz" -mtime +"$RETENTION_DAYS" -delete
find "$BACKUP_PATH" -type f -name "*.sha256" -mtime +"$RETENTION_DAYS" -delete

if [ -n "${BACKUP_REMOTE_DIR:-}" ]; then
  if command -v rclone >/dev/null 2>&1; then
    log "Copying backup to remote: $BACKUP_REMOTE_DIR"
    rclone copy "$BACKUP_FILE" "$BACKUP_REMOTE_DIR"
    if [ -f "${BACKUP_FILE}.sha256" ]; then
      rclone copy "${BACKUP_FILE}.sha256" "$BACKUP_REMOTE_DIR"
    fi
  else
    warn "BACKUP_REMOTE_DIR is set but rclone is not installed."
  fi
fi

log "Backup completed."
printf '%s\n' "$BACKUP_FILE"
