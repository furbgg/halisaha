#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

TEMPLATE_FILE="$ROOT_DIR/.env.template"

[ -f "$TEMPLATE_FILE" ] || die "Missing template file: $TEMPLATE_FILE"

if [ ! -f "$ENV_FILE" ]; then
  cp "$TEMPLATE_FILE" "$ENV_FILE"
  log "Created $ENV_FILE from .env.template"
else
  log "Using existing $ENV_FILE"
fi

# shellcheck disable=SC1090
. "$ENV_FILE"

DB_PASSWORD="${DB_PASSWORD:-}"
JWT_SECRET="${JWT_SECRET:-}"
TOTP_ENCRYPTION_KEY="${TOTP_ENCRYPTION_KEY:-}"

generate_totp_key() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand 32 | openssl base64 -A
  else
    head -c 32 /dev/urandom | base64 | tr -d '\n'
  fi
}

is_totp_key_valid() {
  local key="$1"
  [[ "$key" =~ ^[A-Za-z0-9+/]{43}=$ ]]
}

if is_placeholder "$DB_PASSWORD"; then
  upsert_env_var "DB_PASSWORD" "$(generate_secret 40)" "$ENV_FILE"
  log "Generated DB_PASSWORD"
fi

if is_placeholder "$JWT_SECRET"; then
  upsert_env_var "JWT_SECRET" "$(generate_secret 64)" "$ENV_FILE"
  log "Generated JWT_SECRET"
fi

if is_placeholder "$TOTP_ENCRYPTION_KEY" || ! is_totp_key_valid "$TOTP_ENCRYPTION_KEY"; then
  upsert_env_var "TOTP_ENCRYPTION_KEY" "$(generate_totp_key)" "$ENV_FILE"
  log "Generated valid base64 TOTP_ENCRYPTION_KEY (32 bytes)"
fi

if grep -q "^SPRING_PROFILES_ACTIVE=dev$" "$ENV_FILE"; then
  upsert_env_var "SPRING_PROFILES_ACTIVE" "prod" "$ENV_FILE"
  log "Set SPRING_PROFILES_ACTIVE=prod"
fi

missing=0
for key in APP_BASE_URL CORS_ALLOWED_ORIGINS STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET MAIL_HOST MAIL_PORT MAIL_PASSWORD ADMIN_EMAIL ADMIN_NAME; do
  value="$(grep -E "^${key}=" "$ENV_FILE" | head -n1 | cut -d= -f2- || true)"
  if is_placeholder "$value"; then
    warn "$key still uses placeholder value"
    missing=$((missing + 1))
  fi
done

if [ "$missing" -gt 0 ]; then
  warn "Please edit $ENV_FILE and set the placeholder values before go-live."
else
  log ".env values look production-ready."
fi

log "Done."
