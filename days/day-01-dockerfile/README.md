# Day 1 — Git + Dockerfile

**Timebox:** ~6.5 hours (including Git morning + exercises)  
**Where:** Windows 11 laptop, commands in **WSL Ubuntu**  
**Prerequisites:** [`docs/00-prerequisites-wsl-docker.md`](../../docs/00-prerequisites-wsl-docker.md)

## Learning objectives

By the end of the day you can:

- Clone a repo, create a branch, commit, pull, and push
- Build, tag, run, log, and exec into an image
- Explain layers and why COPY order matters
- Write a multi-stage Dockerfile
- Run the process as a **non-root** user
- Keep secrets **out** of the build context

## Agenda

| Block | Minutes | What |
|------:|--------:|------|
| 0 | 45–60 | Git labs in [`docs/00-git-basics.md`](../../docs/00-git-basics.md) |
| A | 45 | Hello image |
| B | 40 | Layer caching |
| C | 40 | Multi-stage + size |
| D | 40 | Non-root |
| E | 30 | `.dockerignore` |
| Ex | 60 | Dockerfile for `apps/secure-demo/api` |
| Scan | 20 | Image scan habit |
| Debug | 30 | Broken Dockerfile |
| Self-check | 15 | Tick the list |

All commands assume you are in the **repo root** inside WSL unless a `cd` says otherwise.

---

## Block 0 — Git (do this first)

Complete every self-check in [`docs/00-git-basics.md`](../../docs/00-git-basics.md).

You should be on a personal branch:

```bash
git switch -c lab/$USER-day01
git status
```

---

## Lab A — FROM + COPY + CMD

```bash
cd days/day-01-dockerfile/labs/lab-a-hello
docker build -t lab-a-hello:1 .
docker run --rm -p 3000:3000 --name lab-a lab-a-hello:1
```

Other WSL terminal:

```bash
curl -sS http://localhost:3000
docker logs lab-a
docker exec lab-a ps aux
docker inspect lab-a --format '{{.Config.User}} {{.Config.ExposedPorts}}'
```

Expected body:

```json
{"message":"hello from lab A","ts":"..."}
```

Stop with Ctrl+C in the first terminal (or `docker stop lab-a`).

**Notes**

- `-p 3000:3000` is **publish**. Without it the process listens only inside the namespace.
- `EXPOSE` in a Dockerfile does **not** publish a host port. Lab debug will try to trick you with this.

---

## Lab B — layer caching

```bash
cd days/day-01-dockerfile/labs/lab-b-layers
docker build -t lab-b:slow -f Dockerfile.slow .
docker build -t lab-b:fast -f Dockerfile.fast .
```

Edit `package.json` (bump the version) and rebuild **both**. Then edit nothing but add a comment in a new `README.md` and rebuild both again.

Expected: the **fast** file reuses the `npm install` layer when only source files change. The **slow** file reruns install every time.

```bash
docker history lab-b:fast
```

**Security habit:** a fat layer that copied `.env` once stays in history even if you delete the file in a later layer. Do not COPY secrets. Ever.

---

## Lab C — multi-stage

Needs the Go toolchain **inside the image** (you do not install Go on Windows).

```bash
cd days/day-01-dockerfile/labs/lab-c-multistage
docker build -t lab-c:multi .
docker images lab-c:multi
```

Compare with a single-stage mental model: `FROM golang:1.22-alpine` as the final image would ship compilers forever.

```bash
docker run --rm -p 8080:8080 lab-c:multi
curl -sS http://localhost:8080
```

Expected: `hello from multi-stage`

---

## Lab D — non-root

```bash
cd days/day-01-dockerfile/labs/lab-d-nonroot
docker build -t lab-d:nonroot .
docker run --rm -d --name lab-d -p 3000:3000 lab-d:nonroot
docker exec lab-d id
```

Expected: `uid=10001(app)`

```bash
docker inspect lab-d --format '{{.HostConfig.CapDrop}}'
docker stop lab-d
```

Discussion (no extra software): the Docker default is **too many Linux capabilities**. Production runtimes drop `ALL` and add back only what you need (Kubernetes `securityContext.capabilities`). You rarely need `NET_RAW` or `SYS_ADMIN` for an HTTP API.

---

## Lab E — `.dockerignore`

```bash
cd days/day-01-dockerfile/labs/lab-e-dockerignore
docker build -t lab-e:ignore .
docker run --rm lab-e:ignore
```

Expected: `secrets.txt` is **not** listed. Open `.dockerignore` and `secrets.txt` to see why.

If you comment out `.dockerignore` and rebuild, the fake secret is copied into the image and is recoverable from history. That is a supply-chain fail.

---

## Exercise — Dockerfile for the real API

Without looking at the solution:

1. Read [`apps/secure-demo/README.md`](../../apps/secure-demo/README.md) and `apps/secure-demo/api/src/index.js`.
2. Write a Dockerfile under `apps/secure-demo/api/` (or in your notes) that:
   - uses `node:22-alpine`
   - copies `package.json` before source
   - runs as uid `10001`
   - `CMD` starts `node src/index.js`
   - publishes **nothing** except what `docker run -p` does
3. Run it:

```bash
cd apps/secure-demo/api
npm install
npm test
docker build -t secure-demo-api:day1 .
docker run --rm -p 3001:3001 -e APP_URL=http://localhost:3001 secure-demo-api:day1
```

```bash
curl -sS http://localhost:3001/health/live
curl -sS http://localhost:3001/api/hello
```

Expected:

```json
{"status":"live"}
```

and a JSON hello with `requestId`.

Reference solution: [`solutions/README.md`](solutions/README.md) and the repo Dockerfile [`apps/secure-demo/api/Dockerfile`](../../apps/secure-demo/api/Dockerfile).

A starter checklist lives in [`exercises/write-api-dockerfile.md`](exercises/write-api-dockerfile.md).

---

## Security habit — scan before you share a tag

If Docker Scout is available:

```bash
docker scout quickview secure-demo-api:day1
```

If not, install Grype in WSL (optional today, required by Day 8):

```bash
curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b ~/.local/bin
export PATH="$HOME/.local/bin:$PATH"
grype secure-demo-api:day1
```

Talk about **pinning by digest**:

```bash
docker images --digests node | head
# FROM node:22-alpine@sha256:...
```

Tags move. Digests do not. Class images may keep floating tags for speed; production should pin.

---

## Debug challenge

```bash
cd days/day-01-dockerfile/labs/lab-debug-broken
docker build -t lab-broken .
docker run --rm -p 3000:3000 lab-broken
```

It will fail. Fix it **without** opening the solution first. Hints: `WORKDIR`, where `COPY` put the file, and whether `EXPOSE` is why `curl` fails.

Solution: [`solutions/Dockerfile.fixed`](solutions/Dockerfile.fixed).

---

## Self-check

- [ ] I can clone, branch, commit, pull, push
- [ ] I can explain one layer vs the whole image
- [ ] `docker run -p` is what publishes a port, not `EXPOSE`
- [ ] My API image runs as non-root
- [ ] I did not copy `.env` into an image
- [ ] I scanned at least one image or documented why Scout/Grype was missing

## Security takeaway

The build context is an attack surface. Least privilege starts at `USER` and `.dockerignore`, not at the WAF you install on Day 7.
