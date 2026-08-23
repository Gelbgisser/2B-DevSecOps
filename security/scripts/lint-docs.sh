#!/usr/bin/env bash
# Cheap docs lint: catch invented :80 origins and committed secret files.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
FAIL=0

if grep -R --include='*.md' -n 'http://localhost:80' "$ROOT" | grep -v troubleshooting | grep -v 'invent' ; then
  echo "Found http://localhost:80 — document why or remove it."
  FAIL=1
fi

if [ -f "$ROOT/.env" ]; then
  echo "Note: .env exists locally (ok). Confirm it is gitignored."
fi

if git -C "$ROOT" ls-files --error-unmatch .env >/dev/null 2>&1; then
  echo ".env is tracked by git — remove it."
  FAIL=1
fi

if git -C "$ROOT" ls-files '*.tfstate' '*.pem' '.vault-token' 2>/dev/null | grep -q .; then
  echo "Secret-like files are tracked."
  FAIL=1
fi

exit "$FAIL"
