# Checklist before class

- [ ] This repo cloned on a demo machine; `cp .env.example .env`
- [ ] Docker Desktop + WSL2 verified (`docker version` shows Server)
- [ ] USB or internal mirror of images: `nginx`, `postgres:16-alpine`, `redis:7-alpine`, `node:22-alpine`, `clamav/clamav` (Day 7)
- [ ] Linux VM template: Ubuntu 22.04/24.04, 8 GB RAM, k3s install script from `docs/00-linux-vm-k3s.md` tested once
- [ ] Gitea/Jenkins images pulled if teaching Days 5–6 onsite (slow Wi-Fi)
- [ ] No production kubeconfigs, vault tokens, or Cloudflare certs in the demo clone (`git status` clean of secrets)
- [ ] Printed or projected **public origin rule** (`APP_URL` includes port)
- [ ] Answer keys kept closed until debug review
- [ ] Learners told: **fork** `ItayPr/2B-DevSecOps`; push only to **their** GitHub. No classwork PRs to the textbook repo unless you ask
- [ ] Git **for Windows** installed; Cursor Source Control works. Learners do not use the `docker-desktop` WSL distro as a terminal
- [ ] Learners told: EICAR is streamed, not saved on Windows Desktop
- [ ] Lite-mode story ready for 8 GB laptops (skip Nexus, skip WAF image)
- [ ] If teaching Day 9: demo phone + Expo Go, classroom Wi‑Fi that allows client-to-client, firewall rule on `NGINX_HTTP_PORT` (Private profile)

Emergency: Day 1–2 + Day 8 scanners still make a coherent “containers + supply chain” course if k3s VMs fail.
