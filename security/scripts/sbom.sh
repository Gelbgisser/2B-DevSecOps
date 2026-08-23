#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/security/reports"
mkdir -p "$OUT"
if ! command -v syft >/dev/null 2>&1; then
  echo "Install syft: curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b ~/.local/bin"
  exit 1
fi
syft dir:"$ROOT/apps/secure-demo/api" -o spdx-json > "$OUT/sbom-api.spdx.json"
syft dir:"$ROOT/apps/secure-demo/api" -o table
echo "Wrote $OUT/sbom-api.spdx.json"
