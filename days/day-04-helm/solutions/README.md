# Day 4 solutions

> Try first.

Sidecar: `--set clamav.sidecar=true` injects a second container. It does **not** by itself scan uploads until `CLAMAV_HOST` points at `127.0.0.1` (the ConfigMap template does this when sidecar is true).

Immutable selector: you cannot change `spec.selector` on an existing Deployment. Delete the Deployment (PVC stays) or install a new release name.
