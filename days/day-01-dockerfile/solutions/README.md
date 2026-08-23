# Day 1 solutions

> Instructor / self-check — try the exercise first.

## Exercise: Dockerfile for `apps/secure-demo/api`

A complete reference is [`apps/secure-demo/api/Dockerfile`](../../../apps/secure-demo/api/Dockerfile).

Minimum that still teaches the habits:

```dockerfile
FROM node:22-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S -G app -u 10001 app
COPY package.json ./
RUN npm install --omit=dev
COPY src ./src
USER 10001
ENV PORT=3001
EXPOSE 3001
CMD ["node", "src/index.js"]
```

Build and run (WSL, repo root):

```bash
cd apps/secure-demo/api
npm install
docker build -t secure-demo-api:lab .
docker run --rm -p 3001:3001 --name api-lab \
  -e APP_URL=http://localhost:3001 \
  secure-demo-api:lab
```

Another terminal:

```bash
curl -sS http://localhost:3001/health/live
curl -sS http://localhost:3001/api/hello
```

Day 2 will stop publishing `3001` on the host. Today it is OK — there is no edge yet.

## Lab C image size

```bash
docker images | grep -E 'lab-c|golang|alpine'
```

The builder stage is hundreds of MB; the final alpine image with one static Go binary is a few MB. That is the point of multi-stage.

## Lab D — who are you inside the container?

```bash
docker exec api-nonroot id
# uid=10001(app) gid=10001(app)
```

`docker run --user 0` would override this. In Kubernetes we set `runAsNonRoot: true` so that override is harder.

## Lab E — secret must not be in the image

```bash
docker build -t leak-check days/day-01-dockerfile/labs/lab-e-dockerignore
docker run --rm leak-check
# secrets.txt must NOT appear
```

Without `.dockerignore`, `ls` would show `secrets.txt`.

## Debug challenge (broken Dockerfile)

Problems:

1. `WORKDIR /not/the/app` but `CMD ["node", "server.js"]` looks in WORKDIR — file was copied to `/app/server.js`.
2. `EXPOSE 9999` does nothing at runtime. The process listens on 3000. `EXPOSE` is documentation for humans and some tools, not a publish.

Fixed file: [`Dockerfile.fixed`](Dockerfile.fixed).
