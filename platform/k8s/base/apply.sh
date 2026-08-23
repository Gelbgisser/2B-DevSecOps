#!/usr/bin/env bash
# Apply the Day 3 base manifests. Run on the Linux VM with kubectl talking to k3s.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
kubectl apply -k "$ROOT"
echo "---"
kubectl -n secure-demo get pvc,pods,svc,ingress
echo
echo "Import images into k3s if they were built with Docker:"
echo "  docker save secure-demo-api:local | sudo k3s ctr images import -"
echo "  docker save secure-demo-web:local | sudo k3s ctr images import -"
