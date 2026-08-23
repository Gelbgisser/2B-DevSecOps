# Day 2 solutions

> Try the labs first.

## 502 after recreate

1. NGINX resolved `api` **once** at start (broken `proxy_pass http://api:3001` without a variable). Recreate assigns a new IP → 502 until NGINX reloads.
2. You curled `http://localhost/api/hello` (**port 80**) while the edge is on **3080**.

Fix: keep `platform/docker/nginx/conf.d/default.conf` (resolver + `$upstream_api`) and always use `APP_URL` from `.env`.

## Worker

`RPUSH scan-jobs ...` is enough. A production worker would call ClamAV (Day 7) and update `/data/meta/*.json`.
