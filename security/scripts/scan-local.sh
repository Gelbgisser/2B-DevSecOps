#!/usr/bin/env bash
# Local supply-chain gate (Day 8). Run from repo root in WSL or the Linux VM.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/security/reports"
mkdir -p "$OUT"
FAIL=0

have() { command -v "$1" >/dev/null 2>&1; }

echo "== Syft (SBOM) =="
if have syft; then
  syft dir:"$ROOT/apps/secure-demo/api" -o json > "$OUT/sbom-api.json"
  syft dir:"$ROOT/apps/secure-demo/api" -o table
else
  echo "syft not installed — https://github.com/anchore/syft"
  FAIL=1
fi

echo "== Grype =="
if have grype; then
  if grype dir:"$ROOT/apps/secure-demo/api" --fail-on critical -o json > "$OUT/grype-api.json"; then
    echo "grype: no CRITICAL"
  else
    echo "grype: CRITICAL findings (or DB missing). See $OUT/grype-api.json"
    FAIL=1
  fi
else
  echo "grype not installed — https://github.com/anchore/grype"
  FAIL=1
fi

echo "== Gitleaks =="
if have gitleaks; then
  if gitleaks detect --source "$ROOT" --no-git -c "$ROOT/security/policies/gitleaks.toml" -r "$OUT/gitleaks.json" || true; then
    :
  fi
else
  echo "gitleaks not installed — skipping (install for capstone)"
fi

echo "== Semgrep =="
if have semgrep; then
  semgrep --config "$ROOT/security/policies/semgrep-rules.yaml" "$ROOT/apps/secure-demo/api" --json -o "$OUT/semgrep.json" || FAIL=1
else
  echo "semgrep not installed — optional (pipx install semgrep)"
fi

echo "== Trivy (optional alternate) =="
if have trivy; then
  trivy fs --severity CRITICAL --exit-code 1 "$ROOT/apps/secure-demo/api" || FAIL=1
fi

exit "$FAIL"
