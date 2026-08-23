# Exercise — add a second queue consumer

The stack already has `worker`. Add **your** service `worker-b` in a personal compose override (do not break the class file if you can avoid it):

```bash
# docker-compose.override.yml is gitignored if you put it in docker-data/ — or use a branch
```

Requirements:

- Same image as `worker`
- Different container name
- Still no host ports

Done when `docker compose ps` shows two workers and both log a job you `RPUSH`.
