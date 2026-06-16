#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

load_env
require_cmd docker

ADMIN_EMAIL="${ADMIN_EMAIL:-}"
ADMIN_NAME="${ADMIN_NAME:-Facility Admin}"
ADMIN_PHONE="${ADMIN_PHONE:-}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"

while [ $# -gt 0 ]; do
  case "$1" in
    --admin-email)
      ADMIN_EMAIL="$2"
      shift 2
      ;;
    --admin-name)
      ADMIN_NAME="$2"
      shift 2
      ;;
    --admin-phone)
      ADMIN_PHONE="$2"
      shift 2
      ;;
    --admin-password)
      ADMIN_PASSWORD="$2"
      shift 2
      ;;
    *)
      die "Unknown argument: $1"
      ;;
  esac
done

if is_placeholder "$ADMIN_EMAIL"; then
  die "ADMIN_EMAIL is missing or placeholder in $ENV_FILE"
fi

SQL_FILE="$ROOT_DIR/ops/sql/provision-admin.sql"
[ -f "$SQL_FILE" ] || die "Missing SQL file: $SQL_FILE"

if [ -z "$ADMIN_PASSWORD" ]; then
  ADMIN_PASSWORD="$(generate_secret 20)"
  GENERATED_PASSWORD=1
else
  GENERATED_PASSWORD=0
fi

log "Ensuring admin user exists for $ADMIN_EMAIL"

dc exec -T -e PGPASSWORD="$DB_PASSWORD" postgres psql -h localhost -U "$DB_USERNAME" -d "$DB_NAME" \
  -v admin_email="$ADMIN_EMAIL" \
  -v admin_name="$ADMIN_NAME" \
  -v admin_phone="$ADMIN_PHONE" \
  -v admin_password="$ADMIN_PASSWORD" \
  -v ON_ERROR_STOP=1 \
  -f /dev/stdin <"$SQL_FILE"

if [ "$GENERATED_PASSWORD" -eq 1 ]; then
  log "Generated admin password (store now): $ADMIN_PASSWORD"
else
  log "Admin password updated from provided value."
fi

log "Admin provisioning complete."
