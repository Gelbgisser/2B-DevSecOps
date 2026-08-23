# Contributing (instructors)

This repo is a **course**, not a product. Extend it the same way learners will: small diffs, no secrets, commands that run.

## Adding a lab

1. Put learner-facing steps in `days/day-XX-*/README.md` or `labs/`.
2. Put the broken / starter files in `labs/`, the spoilers in `solutions/`.
3. Mark solutions with `> Instructor / self-check — try the exercise first.`
4. If you add a host port, add it to `.env.example` and mention the **edge-only** rule.
5. If you add a password, put the dummy value in `.env.example` and the key name in the day README. Never commit `.env`.

## Documentation bar

Every day README must keep:

- Learning objectives, timebox, prerequisites
- Bash-first commands (WSL or the Linux VM)
- Expected output snippets
- Security takeaway
- Exercises without spoilers
- Debug challenge
- Link to `solutions/`

## Do not

- Copy private product code, customer data, or real realm secrets into this repo.
- Hardcode `http://localhost` without the published port, or assume `:80`.
- Publish database / scanner ports on the host in later-day Compose/Helm.
- Require a cloud account for Days 1–4. Optional tunnel (Day 7) and store accounts (Day 9 discussion) stay optional.
- Use `hostPath` for databases on k3s. Use a PVC and the default `local-path` StorageClass. Document the cloud CSI equivalent in [`docs/02-lab-to-cloud.md`](docs/02-lab-to-cloud.md).

## Make targets

Keep `Makefile` in sync when you add scanner scripts or compose files. `make lint-docs` should stay green.

## Compressing the calendar

If the class is 5–6 days, merge using [`instructor/schedule-5-day-compress.md`](instructor/schedule-5-day-compress.md). Full calendar with mobile: [`instructor/schedule-9-day.md`](instructor/schedule-9-day.md). Do not delete day folders — jump links instead.
