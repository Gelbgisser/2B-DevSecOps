# Compose stacks

Core file: [`docker-compose.yml`](docker-compose.yml) — only **nginx** publishes a host port.

```bash
cp .env.example .env
docker compose -f platform/compose/docker-compose.yml --env-file .env up -d --build
```

Profiles: `clamav`, `waf` (overlay [`docker-compose.waf.yml`](docker-compose.waf.yml)), `cicd`, `cicd-full`, `vault`.

Named volumes keep Postgres/Redis/uploads across `down`. `down -v` is the data-loss lesson.
