# Secure Demo

Tiny teaching app for the bootcamp. One language for the HTTP API: **Node.js**. Grow this app across eight days — do not start from a large product monorepo.

| Piece | Role | Speaks to |
|-------|------|-----------|
| `api/` | HTTP API (health, hello, upload + scan status) | Postgres (optional), ClamAV (Day 7), Redis (queue) |
| `web/` | Static page | Browser → **edge** → `/api/*` |
| `worker/` | Pops scan jobs from Redis | Redis, then API/ClamAV |

Java learners: Day 5 also has [`apps/java-lib`](../java-lib/README.md) (Maven + Gradle). That module is **not** the demo API.

## Config (all via env)

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `3001` | API listen port (container-internal) |
| `APP_URL` | `http://localhost:3080` | Public origin — must match the edge port |
| `DATABASE_URL` | unset | Postgres. If unset, `/health/ready` still returns 200 with `db: skipped` |
| `REDIS_URL` | unset | Worker + optional job enqueue |
| `CLAMAV_HOST` / `CLAMAV_PORT` | unset / `3310` | If unset, uploads stay `pending` / `skipped` |
| `DATA_DIR` | `/data` | Quarantine + clean files (bind-mount or PVC) |
| `MOCK_USER_HEADER` | `X-Demo-User` | Fake identity until a real IdP lab |

**OIDC note (stretch):** identity-provider redirects cannot be path-relative. The issuer/redirect origin must be `APP_URL` (including `NGINX_HTTP_PORT`). Do not “fix” a redirect by assuming port 80.

## Local run (no Docker)

```bash
cd apps/secure-demo/api
npm install
npm test
PORT=3001 APP_URL=http://localhost:3001 npm start
```

```bash
# another terminal
curl -sS http://localhost:3001/health/live
curl -sS http://localhost:3001/api/hello
```

Expected:

```json
{"status":"live"}
```

```json
{"message":"hello from secure-demo","requestId":"..."}
```

## Docker (Day 1 exercise)

See [`days/day-01-dockerfile`](../../days/day-01-dockerfile/README.md). A reference Dockerfile lives in `api/Dockerfile`.

## Compose (Day 2)

From repo root:

```bash
cp -n .env.example .env
make up
curl -sS "$APP_URL/api/hello"   # APP_URL from .env, default http://localhost:3080
```

Only NGINX publishes a host port.

## Security habits baked in

- Runs as user `app` (uid 10001), not root
- Secrets come from env / Vault — never `COPY .env`
- Uploads land in **quarantine** until a scanner says CLEAN
- Structured logs include `requestId` from `X-Request-Id` (or a generated UUID)
- WAF (Day 7) is **not** application authorization — a `X-Demo-User` header is a lab mock, not a security control
