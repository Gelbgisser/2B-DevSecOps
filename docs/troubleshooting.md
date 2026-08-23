# Troubleshooting bible

Commands are **bash** (WSL or the Linux VM) unless noted.

## Docker Desktop / WSL integration

**Symptom:** prompt looks like `docker-desktop:/tmp/...#` and `sudo` / `apt` / `git` are `not found`.

You opened Docker Desktop’s **internal** distro. It is not Ubuntu and not for class.

- Close that terminal.
- Start menu → **Ubuntu**.
- `wsl -l -v` should list `Ubuntu` version 2. Use that distro: `wsl -d Ubuntu`.

**Symptom:** `docker version` has no Server section, or `Cannot connect to the Docker daemon`.

- Docker Desktop is running (whale icon).
- Settings → Resources → WSL integration → **Ubuntu** enabled; Apply & Restart.
- Open a **new** WSL tab after changing integration.
- `wsl -l -v` shows VERSION **2**.

**Symptom:** builds hang / OOM.

- Settings → Resources: memory **≥6 GB**. Close other browsers.

**Symptom:** Cursor Source Control empty, or “Git not found”.

- Install Git for Windows, **restart Cursor**.
- Settings → `git.path` → `C:\Program Files\Git\cmd\git.exe`.
- Full UI walkthrough: [`00-cursor-git.md`](00-cursor-git.md).

**Symptom:** `Authentication failed` / `could not read Username`.

- GitHub does not accept your account password. Use browser login, Git Credential Manager, or a PAT (see [`00-cursor-git.md`](00-cursor-git.md)).
- Confirm `git remote -v` `origin` is **your** fork, not `ItayPr/2B-DevSecOps`.

**Symptom:** `Bind for 0.0.0.0:3080 failed`.

- Change `NGINX_HTTP_PORT` in `.env` (e.g. `3082`) **and** set `APP_URL=http://localhost:3082`.
- Jenkins `8090`, Gitea `3000`, Vault `8200`, Nexus `8081` — same idea.

Do not “fix” OIDC/browser redirects by assuming port 80.

## Compose 502 after recreate

NGINX resolved `api` **once** at start. Recreate assigns a new IP.

- Confirm `platform/docker/nginx/conf.d/default.conf` uses `resolver 127.0.0.11` and `set $upstream_api`.
- `docker compose exec nginx nginx -s reload` as a temporary unblock.

## kubectl context wrong

**Symptom:** `kubectl get nodes` shows Docker Desktop / empty / connection refused.

- Day 3+ : run kubectl **on the VM** with `KUBECONFIG=~/.kube/config` copied from `/etc/rancher/k3s/k3s.yaml`.
- `kubectl config current-context`
- Never commit kubeconfig.

## Helm ownership / immutable selector

- `helm upgrade` vs objects created with raw `kubectl apply`: use a **new namespace** or `helm upgrade --install` after adopting (advanced) — class default is `secure-demo-helm`.
- Deployment `spec.selector` cannot change. Delete the Deployment; **keep the PVC**.

## Jenkins agent disk / no Node

- Jenkins home is a volume; prune images: `docker image prune`.
- If `node` is missing, run tests in `docker.image('node:22-alpine').inside { ... }` (Day 5).
- Mounting `/var/run/docker.sock` is a **lab shortcut**, not production.

## Vault seal / token

- Compose **dev** server is unsealed and uses `VAULT_DEV_ROOT_TOKEN` from `.env`.
- If you installed real Vault on k3s and it is **sealed**, `vault operator unseal` with **unseal keys you stored outside git**. Class should prefer `-dev`.
- `403` from API after rotate: you updated Vault but did not restart pods.

## ClamAV first start slow

Signature DB download can take **3–10 minutes**. `docker compose logs -f clamav` until `clamd` listens on 3310.

If healthcheck fails: increase `start_period`. Do not publish 3310 on the host.

**EICAR:** stream in-process (`node security/scripts/eicar-stream.js`). On-disk `eicar.com` on Windows may vanish.

## Cloudflare cert / tunnel missing

- `cloudflared` credentials live in `~/.cloudflared/` (gitignored).
- Tunnel must target the **edge** (`localhost:3080` or VM `:80`), not Postgres.
- Optional lab — skip if you have no account.

## Grype / Syft DB download failures

- Corporate proxy: set `HTTPS_PROXY`.
- Air-gap: copy Grype DB per Anchore offline docs; keep `--fail-on critical`.
- `make scan` failing because the tool is missing: install or document lite skip — do not delete the Makefile target.

## Terraform cannot talk to Docker

- WSL: Docker Desktop integration (same as docker CLI).
- Linux VM: `sudo systemctl start docker` and your user in group `docker`.

## Postgres empty after restart

- Compose: you ran `make down-v` or deleted the named volume.
- k3s: PVC pending (`kubectl describe pvc`) or a **new** PVC name after helm values change.

## Phone cannot reach the API (Day 9)

- The app still uses `localhost` / `127.0.0.1` — that is the **phone**, not Docker on the PC. Use `http://<PC-LAN-IPv4>:3080`.
- Windows Firewall or Wi‑Fi profile **Public**. Allow inbound TCP on `NGINX_HTTP_PORT`; set the LAN to **Private**.
- Guest Wi‑Fi / client isolation: phone and PC cannot talk. Use the classroom LAN or a Cloudflare Tunnel hostname (HTTPS).
- Android/iOS blocking HTTP: lab manifests must allow cleartext; production uses HTTPS instead.
- Emulator vs device: Android emulator may use `http://10.0.2.2:3080` for the **host**. A physical phone never uses that alias.

## Windows browser cannot open the VM

- Ping VM IP; hypervisor network = bridged or host-only with known IP.
- `APP_URL=http://<vm-ip>` with no `:80`.
- Windows firewall / `ufw` on the VM (allow 80).
