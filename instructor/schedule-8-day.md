# 8-day schedule (instructor)

Core path without the mobile workshop. For Day 9 as well, use [`schedule-9-day.md`](schedule-9-day.md).

Assume 09:00–16:30 with 60 min lunch. Security habit is explicit every afternoon.

| Day | AM | PM |
|----:|----|----|
| 1 | Git + WSL/Docker verify | Dockerfile labs A–E, API exercise, scan talk |
| 2 | Compose edge + volumes | 502 lab, Terraform Docker provider |
| 3 | Linux VM + k3s (must be pre-imaged if possible) | Manifests, PVC, RBAC, Terraform k8s |
| 4 | Helm lint/template/install | Staging values, rollback, ClamAV flag |
| 5 | Gitea + Jenkins lite | Maven/Gradle, fail tests, Syft |
| 6 | Argo CD Application | Vault KV + rotate |
| 7 | Headers + WAF concepts | ClamAV + optional tunnel |
| 8 | Scanners + CIS | Capstone + share-outs |

**Pre-work (mandatory):** [`docs/00-prerequisites-wsl-docker.md`](../docs/00-prerequisites-wsl-docker.md) and VM creation **before** Day 3.

**Seed data:** `.env.example` lab passwords only. Rotate if the class repo is public.
