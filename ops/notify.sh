#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

load_env
require_cmd curl

SEVERITY="${1:-INFO}"
MESSAGE="${2:-No message provided}"

json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

TEXT="[$PROJECT_NAME][$SEVERITY] $MESSAGE"
ESCAPED_TEXT="$(json_escape "$TEXT")"

sent=0

if [ -n "${ALERT_WEBHOOK_URL:-}" ]; then
  curl -fsS -X POST "$ALERT_WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "{\"text\":\"${ESCAPED_TEXT}\"}" >/dev/null && sent=1 || warn "Webhook alert failed"
fi

if [ -n "${ALERT_TELEGRAM_BOT_TOKEN:-}" ] && [ -n "${ALERT_TELEGRAM_CHAT_ID:-}" ]; then
  curl -fsS -X POST "https://api.telegram.org/bot${ALERT_TELEGRAM_BOT_TOKEN}/sendMessage" \
    -d "chat_id=${ALERT_TELEGRAM_CHAT_ID}" \
    --data-urlencode "text=${TEXT}" >/dev/null && sent=1 || warn "Telegram alert failed"
fi

if [ "$sent" -eq 1 ]; then
  log "Alert sent: $TEXT"
else
  warn "No alert channel configured. Message: $TEXT"
fi
