#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

load_env

errors=()

check_required() {
  local key="$1"
  local value="${!key:-}"
  if is_placeholder "$value"; then
    errors+=("$key is missing or placeholder")
  fi
}

check_required "DB_PASSWORD"
check_required "JWT_SECRET"
check_required "TOTP_ENCRYPTION_KEY"
check_required "APP_BASE_URL"
check_required "CORS_ALLOWED_ORIGINS"
check_required "STRIPE_SECRET_KEY"
check_required "STRIPE_WEBHOOK_SECRET"
check_required "MAIL_PASSWORD"
check_required "ADMIN_EMAIL"
check_required "ADMIN_NAME"

if [ "${#JWT_SECRET}" -lt 32 ]; then
  errors+=("JWT_SECRET must be at least 32 chars")
fi

if [[ ! "${TOTP_ENCRYPTION_KEY}" =~ ^[A-Za-z0-9+/]{43}=$ ]]; then
  errors+=("TOTP_ENCRYPTION_KEY must be base64 for 32 bytes (example format: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx=)")
fi

if [[ "${SPRING_PROFILES_ACTIVE:-}" != "prod" ]]; then
  errors+=("SPRING_PROFILES_ACTIVE should be prod on customer servers")
fi

if [ "${#errors[@]}" -gt 0 ]; then
  for err in "${errors[@]}"; do
    warn "$err"
  done
  die "Environment validation failed."
fi

log "Environment validation passed."
