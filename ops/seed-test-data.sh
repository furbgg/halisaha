#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

load_env
require_cmd docker

RESET_DEMO=0

while [ $# -gt 0 ]; do
  case "$1" in
    --reset-demo)
      RESET_DEMO=1
      shift
      ;;
    *)
      die "Unknown argument: $1"
      ;;
  esac
done

SQL_FILE="$ROOT_DIR/ops/sql/seed-test-data.sql"
[ -f "$SQL_FILE" ] || die "Missing SQL seed file: $SQL_FILE"

if [ "$RESET_DEMO" -eq 1 ]; then
  log "Cleaning existing DEMO-* reservations/payments/rentals and demo users..."
  dc exec -T -e PGPASSWORD="$DB_PASSWORD" postgres \
    psql -h localhost -U "$DB_USERNAME" -d "$DB_NAME" -v ON_ERROR_STOP=1 <<'SQL'
DELETE FROM equipment_rentals er
USING reservations r
WHERE er.reservation_id = r.id
  AND r.confirmation_code LIKE 'DEMO-%';

DELETE FROM payments p
USING reservations r
WHERE p.reservation_id = r.id
  AND r.confirmation_code LIKE 'DEMO-%';

DELETE FROM notifications n
USING reservations r
WHERE n.reservation_id = r.id
  AND r.confirmation_code LIKE 'DEMO-%';

DELETE FROM reservations
WHERE confirmation_code LIKE 'DEMO-%';

DELETE FROM users
WHERE lower(email) IN (
  'demo1@halisaha.local',
  'demo2@halisaha.local',
  'demo3@halisaha.local'
);
SQL
fi

log "Seeding idempotent demo/test dataset..."
dc exec -T -e PGPASSWORD="$DB_PASSWORD" postgres \
  psql -h localhost -U "$DB_USERNAME" -d "$DB_NAME" -v ON_ERROR_STOP=1 <"$SQL_FILE"

log "Seed completed. Current counts:"
dc exec -T -e PGPASSWORD="$DB_PASSWORD" postgres \
  psql -h localhost -U "$DB_USERNAME" -d "$DB_NAME" -c \
  "SELECT 'users' AS t, COUNT(*) FROM users
   UNION ALL SELECT 'reservations', COUNT(*) FROM reservations
   UNION ALL SELECT 'payments', COUNT(*) FROM payments
   UNION ALL SELECT 'equipment_rentals', COUNT(*) FROM equipment_rentals
   ORDER BY t;"
