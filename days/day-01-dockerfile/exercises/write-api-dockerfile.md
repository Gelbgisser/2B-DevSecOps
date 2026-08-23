# Exercise — Dockerfile for the Secure Demo API

Do **not** open `apps/secure-demo/api/Dockerfile` until you have a running container.

## Requirements

- Base: official Node **22** alpine (or distroless as a stretch)
- App listens on `3001`
- Production `node_modules` only in the final image
- User `10001`
- Healthcheck hitting `/health/live` (stretch)
- You start it with `docker run -p 3001:3001`

## Hints

- `COPY package.json` before `COPY src`
- `npm ci --omit=dev` needs a lockfile; `npm install --omit=dev` is OK for class if you generated none
- Alpine has no bash; `CMD` should be exec form `["node", "src/index.js"]`

## Done when

```bash
curl -sS http://localhost:3001/api/hello | grep hello
```
