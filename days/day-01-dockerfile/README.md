# Day 1 — Git + your first Docker images

**Timebox:** ~6.5 hours (Git 45–60 min + labs)  
**Where:** Windows 11. Git in **Cursor**. Docker commands in **WSL Ubuntu** (not `docker-desktop`).  
**Do this first:** [`docs/00-start-here.md`](../../docs/00-start-here.md) → [`docs/00-prerequisites-wsl-docker.md`](../../docs/00-prerequisites-wsl-docker.md) → [`docs/00-git-basics.md`](../../docs/00-git-basics.md)

**How Dockerfiles are put together:** [`docs/01-reading-dockerfiles.md`](../../docs/01-reading-dockerfiles.md) (open it next to the lab files).

## What you will have by 16:30

- A branch **on your GitHub fork** (not on `ItayPr/2B-DevSecOps`)
- Several images you built; one of them is the class API
- A mental model: **context → layers → run as non-root → publish with `-p`**

## Learning objectives

- Clone / branch / commit / pull / push on **your** repo
- Read a Dockerfile line by line
- Explain every flag you type on `docker build` and `docker run`
- Multi-stage builds and why the final image is small
- `.dockerignore` so secrets never enter the daemon

## Agenda

| Block | Minutes | What |
|------:|--------:|------|
| 0 | 45–60 | Git on **your fork** |
| A | 45 | Hello image + flag walkthrough |
| B | 40 | Layer cache |
| C | 40 | Multi-stage |
| D | 40 | Non-root |
| E | 30 | `.dockerignore` |
| Ex | 60 | API Dockerfile |
| Scan | 20 | Scout / Grype habit |
| Debug | 30 | Broken Dockerfile |
| Self-check | 15 | |

---

## Block 0 — Git

Finish the self-check in [`docs/00-git-basics.md`](../../docs/00-git-basics.md).

You should be on a personal branch **and** have pushed it to **your** fork:

```bash
cd ~/src/2B-DevSecOps
git switch -c lab/$USER/day-01   # skip -c if the branch already exists
git remote -v                    # origin must be YOUR_USER/2B-DevSecOps
```

---

## Lab A — build, run, understand flags

Open [`labs/lab-a-hello/Dockerfile`](labs/lab-a-hello/Dockerfile) and read the comments. Then:

```bash
cd days/day-01-dockerfile/labs/lab-a-hello

# -t  tag (name:tag) so you can run it by name instead of a hex id
# .   build context = THIS directory (Dockerfile + server.js only)
docker build -t lab-a-hello:1 .

# --rm     remove container filesystem when the process exits
# -p 3000:3000
#      published port. Left = host (Windows localhost). Right = process in the container.
#      Without -p, curl http://localhost:3000 fails even if the app is "up".
# --name   stable name for logs / exec / stop (must be unique)
docker run --rm -p 3000:3000 --name lab-a lab-a-hello:1
```

**What to expect:** last line of the container log looks like `listen 3000`. The terminal is **blocked** — that is the server. Leave it running.

**Second WSL tab:**

```bash
# -s  silent progress  -S  show errors
curl -sS http://localhost:3000
# Expected JSON: {"message":"hello from lab A", ...}

docker logs lab-a
# stdout of PID 1 (node)

docker exec lab-a ps aux
# exec = extra process inside the SAME container

docker inspect lab-a --format '{{.Config.User}} {{.Config.ExposedPorts}}'
# User is often empty (root) in this lab — Lab D changes that.
```

Stop: Ctrl+C in the first tab, or `docker stop lab-a`.

**EXPOSE vs `-p`:** `EXPOSE 3000` in the Dockerfile does **not** open a Windows port. Only `-p` (or Compose `ports:`) does. The debug lab abuses this.

---

## Lab B — why COPY order matters

Read comments in `Dockerfile.slow` vs `Dockerfile.fast`.

```bash
cd days/day-01-dockerfile/labs/lab-b-layers

# -f  choose a Dockerfile whose name is not "Dockerfile"
docker build -t lab-b:slow -f Dockerfile.slow .
docker build -t lab-b:fast -f Dockerfile.fast .
```

Bump the version in `package.json`, rebuild both (watch which one reruns `npm install`). Then add a `README.md` and rebuild again.

```bash
docker history lab-b:fast
# Newest layer at the top. Cached steps say CACHED on rebuild.
```

**Security:** a layer that `COPY`’d `.env` stays in history forever even if a later layer deletes the file. Never copy secrets.

---

## Lab C — multi-stage (tiny final image)

You do **not** install Go on Windows. The **builder** stage contains Go.

```bash
cd days/day-01-dockerfile/labs/lab-c-multistage
docker build -t lab-c:multi .
docker images lab-c:multi
# SIZE is a few MB, not hundreds (the golang image is not the final image)

docker run --rm -p 8080:8080 lab-c:multi
```

Other tab: `curl -sS http://localhost:8080` → `hello from multi-stage`

`COPY --from=builder` copies from **stage "builder"**, not from your laptop.

---

## Lab D — non-root

```bash
cd days/day-01-dockerfile/labs/lab-d-nonroot
docker build -t lab-d:nonroot .

# -d  detached (background). Use docker logs / docker stop.
docker run --rm -d --name lab-d -p 3000:3000 lab-d:nonroot
docker exec lab-d id
# Expected: uid=10001(app)
docker stop lab-d
```

Default Linux capabilities are generous. Kubernetes later uses `drop: [ALL]`. You do not need `NET_RAW` for this API.

---

## Lab E — `.dockerignore`

```bash
cd days/day-01-dockerfile/labs/lab-e-dockerignore
docker build -t lab-e:ignore .
docker run --rm lab-e:ignore
# secrets.txt must NOT appear. Open .dockerignore to see the pattern.
```

If you comment out `.dockerignore` and rebuild, the fake secret is **inside the image**. That is a supply-chain fail.

---

## Exercise — Dockerfile for the class API

Read [`docs/01-reading-dockerfiles.md`](../../docs/01-reading-dockerfiles.md) § API production file, then **write your own** before opening the reference.

1. Read `apps/secure-demo/api/src/index.js` (health + `/api/hello`).
2. Requirements: `node:22-alpine`, copy `package.json` first, uid `10001`, `CMD` runs `node src/index.js`, no host ports in the Dockerfile.
3. Run:

```bash
cd apps/secure-demo/api
npm install          # laptop Node, for tests only
npm test

docker build -t secure-demo-api:day1 .

# -e  set env inside the container (APP_URL must include the port you publish)
docker run --rm -p 3001:3001 -e APP_URL=http://localhost:3001 secure-demo-api:day1
```

Other tab:

```bash
curl -sS http://localhost:3001/health/live
curl -sS http://localhost:3001/api/hello
```

Expected: `{"status":"live"}` and JSON with `requestId`.

Reference: [`solutions/README.md`](solutions/README.md) and [`apps/secure-demo/api/Dockerfile`](../../apps/secure-demo/api/Dockerfile) (commented).

Checklist: [`exercises/write-api-dockerfile.md`](exercises/write-api-dockerfile.md).

---

## Security habit — scan before you share a tag

```bash
docker scout quickview secure-demo-api:day1   # if Scout is installed

# Grype (optional today, required Day 8)
curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b ~/.local/bin
export PATH="$HOME/.local/bin:$PATH"
grype secure-demo-api:day1
```

Tags move; digests do not: `docker images --digests node | head`

---

## Debug challenge

```bash
cd days/day-01-dockerfile/labs/lab-debug-broken
docker build -t lab-broken .
docker run --rm -p 3000:3000 lab-broken
```

Fix it without the solution first. Think `WORKDIR`, `COPY` destination, and `EXPOSE` vs `-p`.

Solution: [`solutions/Dockerfile.fixed`](solutions/Dockerfile.fixed).

---

## Push your work (your fork)

```bash
git add days/day-01-dockerfile apps/secure-demo/api/Dockerfile
git status                 # .env must not appear
git commit -m "lab: day 1 dockerfile work"
git push -u origin lab/$USER/day-01
```

`origin` = your GitHub. Do not push to `upstream`.

---

## Self-check

- [ ] I can clone, branch, commit, pull, push **on my fork**
- [ ] I can explain `-t`, `-p host:container`, `--rm`, `-d`, `-e`, `-f`
- [ ] I can explain `FROM` / `WORKDIR` / `COPY` / `RUN` / `USER` / `CMD` / `EXPOSE`
- [ ] `docker run -p` publishes; `EXPOSE` does not
- [ ] API image runs as non-root; `.env` never copied
- [ ] I scanned an image or wrote down why Scout/Grype was missing

## Security takeaway

The build **context** is an attack surface. Least privilege starts at `USER` and `.dockerignore`, not at the WAF on Day 7.
