# DevSecOps Bootcamp

Nine-day, lab-first training for developers and ops. You will build, ship, and **secure** a tiny shop API — from a Dockerfile on Windows to GitOps on k3s — then wire a **phone** to the same API.

This repository is **self-contained**. You do not need any product codebase to teach or take the course. Days 1–8 are the core path (capstone on Day 8). **Day 9** is a mobile workshop (Flutter / React Native) and can be a half-day after the capstone.

## Start here if you are new

**Do this in order. Do not skip Git install — it is not bundled with Windows.**

1. Read **what to expect and whose GitHub you push to:** [`docs/00-start-here.md`](docs/00-start-here.md).  
   Short version: **fork this repo to your account.** Lab branches live on **your** fork. Do **not** push to `ItayPr/2B-DevSecOps`.
2. Install **Git for Windows**, **Cursor (or VS Code)**, connect them to **your GitHub fork**, and install WSL Ubuntu + Docker: [`docs/00-prerequisites-wsl-docker.md`](docs/00-prerequisites-wsl-docker.md) and [`docs/00-cursor-git.md`](docs/00-cursor-git.md) (click-by-click clone / Source Control / GitHub login).
3. Fork, clone, first push: [`docs/00-git-basics.md`](docs/00-git-basics.md).
4. How to read a Dockerfile (line by line): [`docs/01-reading-dockerfiles.md`](docs/01-reading-dockerfiles.md).
5. Open **Day 1**: [`days/day-01-dockerfile/README.md`](days/day-01-dockerfile/README.md) (every `docker` flag is commented).

From **Day 3** onward you leave Docker Desktop as the “cluster” and run **k3s on a Linux VM** so data lives on persistent volumes. Setup: [`docs/00-linux-vm-k3s.md`](docs/00-linux-vm-k3s.md).

Terraform (no cloud account required) starts at the end of Day 2: [`docs/01-terraform-basics.md`](docs/01-terraform-basics.md).

## Who this is for

Developers and ops who may be new to containers. Security is not an appendix — every day after Day 1 names at least one **security habit** you will reuse at work.

## Hardware

| Track | RAM | Disk | Notes |
|-------|-----|------|--------|
| Days 1–2 (Windows + Docker Desktop) | 8 GB workable, **16 GB better** | 40 GB free | WSL2 + Docker Desktop. Give WSL **≥6 GB**. |
| Days 3–4 (Linux VM + k3s) | VM: **8 GB** | 40 GB | Ubuntu 22.04/24.04. Host still runs Windows. |
| Days 5–6 full CI + GitOps | VM: **12–16 GB** | 60 GB | Gitea + Jenkins + Nexus + Argo CD + Vault. |
| Day 9 (mobile) | Same as Days 1–2 | — | Physical phone on the **same Wi‑Fi** as the PC. Expo Go is enough; Flutter SDK optional. |
| Lite mode | VM: 8 GB | 40 GB | Skip Nexus UI; use the local registry. Skip WAF image. |

**Capstone** can run the Compose path (Days 1–2 + scanners) if the VM is under-powered. The rubric says which extras earn extra credit.

## Environment map (do not skip)

```text
Days 1–2   Windows 11 laptop
           └─ WSL2 (Ubuntu) + Docker Desktop
              └─ images, Compose, Terraform Docker provider

Day 3+     Same laptop
           └─ Linux VM (Hyper-V / VMware / VirtualBox)  ← you install this
              └─ k3s (single node)
                 └─ local-path StorageClass + PVCs  ← data survives pod restarts
                 └─ Helm, Jenkins, Gitea, Argo CD, Vault
```

Docker Desktop is for **learning containers**. k3s is for **learning Kubernetes the way a small team actually runs it**. We do **not** put Postgres hostPath mounts on the Windows disk.

## Schedule

| Day | Theme | Folder | Outcome |
|----:|-------|--------|---------|
| 1 | Git + Dockerfile | [`days/day-01-dockerfile`](days/day-01-dockerfile/README.md) | Clone/pull/push; build/run images; layers; non-root |
| 2 | Compose + Terraform intro | [`days/day-02-compose`](days/day-02-compose/README.md) | Multi-service app behind NGINX; IaC for Docker |
| 3 | Linux VM + k3s | [`days/day-03-kubernetes`](days/day-03-kubernetes/README.md) | Deployments, Services, Ingress, PVCs, namespaces |
| 4 | Helm | [`days/day-04-helm`](days/day-04-helm/README.md) | Parameterized releases and rollbacks |
| 5 | CI foundations | [`days/day-05-cicd-foundations`](days/day-05-cicd-foundations/README.md) | Gitea → Jenkins → Nexus/registry; Maven/Gradle glimpse |
| 6 | GitOps + Vault | [`days/day-06-gitops-secrets`](days/day-06-gitops-secrets/README.md) | Argo CD sync; secrets not in git |
| 7 | Edge & malware | [`days/day-07-edge-waf-malware`](days/day-07-edge-waf-malware/README.md) | Headers, WAF/CRS or F5 concepts, ClamAV, optional tunnel |
| 8 | Supply chain & capstone | [`days/day-08-supply-chain-capstone`](days/day-08-supply-chain-capstone/README.md) | Syft/Grype/Semgrep/Gitleaks + CIS + self-deploy |
| 9 | Mobile clients | [`days/day-09-mobile`](days/day-09-mobile/README.md) | Phone → LAN `IP:port`, then Play Store / App Store / HTTPS Ingress |

Days 5–6 or 7–8 can merge if you compress to 5–6 training days. Day 9 is an optional workshop on a 5-day calendar. See [`instructor/schedule-5-day-compress.md`](instructor/schedule-5-day-compress.md) and [`instructor/schedule-9-day.md`](instructor/schedule-9-day.md).

## Public origin rule (read this once)

Browsers and identity providers talk to the **published edge port**, not to an invented `:80`.

| Variable | Example | Meaning |
|----------|---------|---------|
| `NGINX_HTTP_PORT` | `3080` | Host port the edge publishes. Avoid `80` (needs admin / collides). |
| `APP_URL` | `http://localhost:3080` | Origin humans and redirects use. **Must include that port.** |

Only the **edge** (NGINX / Ingress / Cloudflare Tunnel) publishes a host port in later labs. Databases, Redis, ClamAV, and scanners stay on internal networks. A **phone** must use a URL it can route to (LAN IP + that port in class; `https://api.example.com` in production) — never `localhost` on the device.

Copy env once:

```bash
cp .env.example .env
# edit NGINX_HTTP_PORT if 3080 is taken
```

## Capstone definition of done

You pass Day 8 when **you** can demonstrate, on your machine:

- [ ] Image built from a non-root, multi-stage Dockerfile
- [ ] App reachable in a browser through the edge (`APP_URL`, not a raw container port)
- [ ] Postgres data on a **named volume** (Compose) or **PVC** (k3s) — restart does not wipe the DB
- [ ] CI job green from Gitea → Jenkins (lite registry is OK)
- [ ] Argo CD Application synced (or a documented GitOps-equivalent apply from git)
- [ ] At least one secret injected from Vault (or a sealed-secret/ExternalSecrets placeholder plus a working env-from-Secret lab)
- [ ] NGINX security headers present on a response
- [ ] An upload goes quarantine → ClamAV → allow or deny
- [ ] Pipeline (or `make scan`) produces an SBOM + Grype report

Rubric: [`instructor/answer-keys.md`](instructor/answer-keys.md).

## Repository map

```text
apps/secure-demo/     Teaching app (Node API + static web + worker)
apps/java-lib/        Tiny Maven + Gradle module for Day 5 only
apps/mobile-demo/     Day 9 Expo (React Native) + Flutter clients
days/                 One folder per training day (README, labs, exercises, solutions)
docs/                 Prerequisites, Git, Terraform, k3s VM, lab→cloud, glossary
platform/             Compose, k8s manifests, Helm, CI, Terraform
security/             Policies + scanner scripts
instructor/           Schedules, checklist, answer keys
```

## Common commands (WSL)

```bash
make env-check    # create .env from example
make up           # Day 2 core stack
make ps
make logs
make down         # keep volumes
make down-v       # DESTROYS database volume
make scan         # local supply-chain gate
```

PowerShell is not the default. If a command must differ, the lab calls it out.

## Teaching principles

- Copy-paste commands, short explanation, then an exercise.
- Every day ends with a **self-check** and a **debug challenge**.
- Solutions live under each day's `solutions/` — try the exercise first.
- No real secrets in git. Vault labs use **dev tokens** only.
- No cloud account for Days 1–4. Cloudflare Tunnel on Day 7 is optional. Lab objects map to EKS/GKE/AKS in [`docs/02-lab-to-cloud.md`](docs/02-lab-to-cloud.md).

## Docs index

| Doc | When |
|-----|------|
| [Start here (expect / GitHub fork)](docs/00-start-here.md) | Before any install |
| [Cursor + GitHub (install, clone, push UI)](docs/00-cursor-git.md) | Before Day 1 Git lab |
| [Prerequisites: Git + WSL + Docker](docs/00-prerequisites-wsl-docker.md) | Before Day 1 |
| [Git: fork, branch, pull, push](docs/00-git-basics.md) | Morning of Day 1 |
| [Reading Dockerfiles](docs/01-reading-dockerfiles.md) | Day 1 labs |
| [Linux VM + k3s](docs/00-linux-vm-k3s.md) | Before Day 3 |
| [Terraform basics](docs/01-terraform-basics.md) | End of Day 2 / start of Day 3 |
| [Lab → cloud / real k8s](docs/02-lab-to-cloud.md) | After Day 2 volumes; again on Days 3–4 and 9 |
| [Pedagogy map](docs/pedagogy.md) | Instructors |
| [Glossary](docs/glossary.md) | Any time |
| [Troubleshooting](docs/troubleshooting.md) | When stuck |
| [Orqestra patterns (analogies only)](docs/reference-orqestra-patterns.md) | Days 7–8 |
| [STRIDE threat model](docs/security-threat-model-lab.md) | Day 7 or 8 |
| [Contributing](CONTRIBUTING.md) | Extending labs |

## License

MIT — see [`LICENSE`](LICENSE). Lab passwords in `.env.example` are placeholders, not production credentials.
