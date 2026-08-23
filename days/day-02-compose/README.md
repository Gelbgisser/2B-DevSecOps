# Day 2 — Docker Compose + Terraform intro

**Timebox:** ~6.5 hours  
**Where:** WSL + Docker Desktop (same as Day 1)  
**Prerequisites:** Day 1 image for the API; Git branch up to date

```bash
git switch lab/$USER-day01
git pull --ff-only
git switch -c lab/$USER-day02
```

## Learning objectives

- Run web + API + Postgres + Redis + worker behind **one** published edge
- Use Compose DNS names vs **browser** URLs
- Persist Postgres on a **named volume** (and see `down -v` destroy it)
- Wire `depends_on` to **healthchecks**
- Declare the same ideas in **Terraform** (Docker provider, no cloud)

## Public origin rule

| Variable | Default | Meaning |
|----------|---------|---------|
| `NGINX_HTTP_PORT` | `3080` | Host port. Do not use `80` on Windows. |
| `APP_URL` | `http://localhost:3080` | What humans and future OIDC redirects use. **Include the port.** |

Only **nginx** maps a host port. Postgres and Redis do not.

---

## Lab 1 — Start the stack

```bash
cd /path/to/devsecops-bootcamp   # repo root
cp -n .env.example .env
# edit .env if 3080 is taken
make up
make ps
```

Expected: `nginx`, `api`, `web`, `postgres`, `redis`, `worker` healthy or started.

```bash
export APP_URL=http://localhost:3080   # match .env
curl -sS "$APP_URL/nginx-health"
curl -sS "$APP_URL/api/hello"
curl -sS "$APP_URL/health/live"
```

Open `$APP_URL` in a **Windows** browser (Docker publishes on the Windows localhost). Click **Call GET /api/hello**.

Internal DNS (Compose network), not for the browser:

```text
http://api:3001/api/hello     ← other containers
http://localhost:3080/api/hello  ← humans
```

If you `curl localhost:5432` it should **fail**. That is success: the database is not on the host.

---

## Lab 2 — Break the healthcheck

```bash
docker compose -f platform/compose/docker-compose.yml \
  -f days/day-02-compose/labs/broken-healthcheck.yml \
  --env-file .env up
```

Expected: `api` waits on `postgres` and never becomes healthy because the overlay forces `pg_isready` to fail.

Ctrl+C, then `make up` without the overlay to recover.

**Takeaway:** `depends_on: condition: service_healthy` is how you avoid “API started, DB still booting” heisenbugs.

---

## Lab 3 — Named volume vs data loss

```bash
docker compose -f platform/compose/docker-compose.yml --env-file .env exec postgres \
  psql -U secure_demo -d secure_demo -c "CREATE TABLE IF NOT EXISTS lab (id int); INSERT INTO lab VALUES (1);"
docker compose -f platform/compose/docker-compose.yml --env-file .env exec postgres \
  psql -U secure_demo -d secure_demo -c "SELECT * FROM lab;"
```

Restart without wiping:

```bash
make down
make up
# SELECT still returns 1
```

Now the dangerous one (class only):

```bash
make down-v
make up
# table is gone
```

**Never** run `down -v` against a volume you care about. Day 3’s PVC lesson is the Kubernetes version of this.

---

## Lab 4 — 502 after rebuild (resolver)

1. `make up` and confirm `$APP_URL/api/hello` works.
2. Temporarily replace the live config with the broken example:

```bash
cp platform/docker/nginx/conf.d/default.conf /tmp/default.conf.bak
cp platform/docker/nginx/conf.d/default.broken-startup-dns.conf.example \
   platform/docker/nginx/conf.d/default.conf
make up
curl -sS -o /dev/null -w "%{http_code}\n" "$APP_URL/api/hello"
docker compose -f platform/compose/docker-compose.yml --env-file .env up -d --build --force-recreate api
sleep 2
curl -sS -o /dev/null -w "%{http_code}\n" "$APP_URL/api/hello"
```

Often **502**. Restore:

```bash
mv /tmp/default.conf.bak platform/docker/nginx/conf.d/default.conf
make up
```

The good config uses `resolver 127.0.0.11` and `set $upstream_api api:3001` so DNS is **request-time**. That is the Orqestra edge lesson in miniature.

---

## Exercise — worker already in the stack

The `worker` service BRPOPs Redis list `scan-jobs`. Prove it:

```bash
docker compose -f platform/compose/docker-compose.yml --env-file .env logs -f worker
# other terminal: enqueue with redis-cli
docker compose -f platform/compose/docker-compose.yml --env-file .env exec redis \
  redis-cli RPUSH scan-jobs '{"id":"manual"}'
```

Expected: a JSON log line on the worker.

Stretch: change the worker to print `processed` only (edit `apps/secure-demo/worker/src/index.js`) and rebuild.

---

## Terraform (no cloud)

Follow [`docs/01-terraform-basics.md`](../../docs/01-terraform-basics.md) Lab T1 using host port **3081** so you do not fight Compose on **3080**.

---

## Debug challenge

After a successful `make up`, `curl "$APP_URL/api/hello"` returns **502** but `docker compose exec api wget -qO- http://127.0.0.1:3001/api/hello` works.

What are the two most likely causes in *this* repo? (Stale upstream IP vs `APP_URL` / path mismatch.)

Solution notes: [`solutions/README.md`](solutions/README.md).

---

## Self-check

- [ ] Browser uses `APP_URL` including `:3080` (or your port)
- [ ] Postgres has **no** host port
- [ ] I saw data survive `down` and die on `down -v`
- [ ] I can explain Docker DNS `127.0.0.11`
- [ ] Terraform init/plan/apply/destroy worked on the Docker lab

## Security takeaway

The edge is the **trust boundary**. Databases stay off the host firewall. Secrets stay in `.env` (gitignored), never in the image.
