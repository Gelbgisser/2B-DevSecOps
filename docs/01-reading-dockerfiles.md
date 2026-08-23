# How a Dockerfile is built (read this with Day 1)

A Dockerfile is a **recipe**. Docker runs instructions **top to bottom**. Each instruction usually creates a **layer** (a snapshot). Rebuilds reuse unchanged layers from the cache — that is why **order** matters.

You do not install Node or Go on Windows for these labs. The **image** already contains the compiler or runtime.

---

## Anatomy of Lab A (hello HTTP)

File: [`days/day-01-dockerfile/labs/lab-a-hello/Dockerfile`](../days/day-01-dockerfile/labs/lab-a-hello/Dockerfile)

```dockerfile
# Base image: Node 22 on Alpine Linux (small). Everything below stacks on this.
FROM node:22-alpine

# Default directory for later COPY/CMD. Like "cd" that persists in the image.
WORKDIR /usr/src/app

# Copy file from your laptop (build context) into the image.
# The context is the directory you pass to  docker build ... PATH
# Here PATH is "."  →  only this lab folder, not the whole repo.
COPY server.js .

# Documents "this process listens on 3000". Does NOT publish a Windows port.
# Publishing is  docker run -p 3000:3000
EXPOSE 3000

# Default process. Exec form (JSON array) = no shell, PID 1 is node.
CMD ["node", "server.js"]
```

**Build context:** files Docker may `COPY`. `.dockerignore` removes files from that context (secrets, `node_modules`).

---

## Slow vs fast layers (Lab B)

`COPY . .` **before** `npm install` means any file change busts the install cache.

Fast pattern:

1. Copy `package.json` (and lockfile)
2. `RUN npm install`
3. Copy the rest of the source

Source edits reuse step 2.

---

## Multi-stage (Lab C)

Stage `builder` has `go` (hundreds of MB). Final stage is tiny Alpine plus **one binary**. Compilers never ship to production.

`COPY --from=builder /hello /hello` copies **from another stage**, not from your laptop.

---

## Non-root (Lab D)

`USER 10001` — the process is not root. If an attacker breaks out of the app, they do not start as uid 0. Compose/K8s should not override this with `user: "0"` without a reason.

---

## API production file (exercise target)

[`apps/secure-demo/api/Dockerfile`](../apps/secure-demo/api/Dockerfile):

| Stage | Purpose |
|-------|---------|
| `deps` | Production `node_modules` only |
| `test` | Runs `npm test` (fails the **build** if tests fail) |
| `runner` | Copies modules + `src`, drops to uid 10001, `HEALTHCHECK` |

`HEALTHCHECK` is used by Compose `depends_on: condition: service_healthy` on Day 2. `wget` is not in this image; the check uses Node’s `fetch`.

`USER` comes **after** `RUN adduser` and `chown` because those steps need root.

---

## `docker build` / `docker run` flags (Day 1)

```bash
docker build -t lab-a-hello:1 .
#        -t   tag  name:version  (otherwise you only get a hash)
#        .    context directory (where Dockerfile + server.js live)

docker run --rm -p 3000:3000 --name lab-a lab-a-hello:1
#      --rm     delete container on exit (no leftover  docker ps -a  junk)
#      -p 3000:3000
#           hostPort:containerPort
#           Windows/WSL localhost:3000 → process inside the container :3000
#      --name   human name for logs/exec/stop
```

Other flags you will see:

| Flag | Meaning |
|------|---------|
| `-d` | Detached (background) |
| `-e NAME=value` | Environment variable inside the container |
| `-f Dockerfile.fast` | Choose a Dockerfile name |
| `--name` | Must be unique among running containers |
| `docker exec` | Run a command in an **already running** container |
| `docker logs` | stdout/stderr of PID 1 |

Continue in [`days/day-01-dockerfile/README.md`](../days/day-01-dockerfile/README.md).
