#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cat <<EOF
# Add these entries with: crontab -e
# Daily DB backup at 03:00 UTC
0 3 * * * cd $ROOT_DIR && ./ops/backup.sh daily >> ./ops/backup.runtime.log 2>&1

# Health checks every 5 minutes
*/5 * * * * cd $ROOT_DIR && ./ops/monitor.sh >> ./ops/monitor.runtime.log 2>&1
EOF
