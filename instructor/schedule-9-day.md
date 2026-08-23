# 9-day schedule (instructor)

Days 1–8 are unchanged from [`schedule-8-day.md`](schedule-8-day.md). Day 9 is a **mobile workshop**: phones talk to the same API. Capstone still closes on Day 8; Day 9 is not required to pass.

Assume 09:00–16:30 with 60 min lunch.

| Day | AM | PM |
|----:|----|----|
| 1 | Git + WSL/Docker verify | Dockerfile labs A–E, API exercise, scan talk |
| 2 | Compose edge + volumes | 502 lab, Terraform Docker provider |
| 3 | Linux VM + k3s (pre-image if possible) | Manifests, PVC, RBAC, Terraform k8s |
| 4 | Helm lint/template/install | Staging values, rollback, ClamAV flag |
| 5 | Gitea + Jenkins lite | Maven/Gradle, fail tests, Syft |
| 6 | Argo CD Application | Vault KV + rotate |
| 7 | Headers + WAF concepts | ClamAV + optional tunnel |
| 8 | Scanners + CIS | Capstone + share-outs |
| 9 | LAN origin + phone browser | Expo **or** Flutter + store/k8s discussion |

**Pre-work (Day 9):** learners install **Expo Go** (or Flutter SDK) the night before. Same Wi‑Fi as the classroom; guest networks often block phone→laptop. Demo machine needs a working firewall rule on `NGINX_HTTP_PORT`.

**If short:** skip Flutter and run Expo only. The learning objective is origin + TLS + “store ≠ cluster,” not two toolchains.

**5-day classes:** keep Day 9 as an optional evening workshop. See [`schedule-5-day-compress.md`](schedule-5-day-compress.md).
