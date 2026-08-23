# Start here — what to do, what to expect

Read this page **before** you install anything. It answers: where you type commands, whose GitHub you push to, and what a “good” first day looks like.

## What you are building toward

In eight days you will run a tiny shop (web + API + database) **behind an edge proxy**, then deploy it on **k3s**, then add CI, GitOps, and scanners. You do **not** start on Kubernetes. You start with Git and a single Docker image on your Windows laptop.

```text
Day 1     one container you built yourself
Day 2     several containers, only NGINX is visible on localhost
Day 3+    same app on a Linux VM with k3s (data on disks that survive restarts)
```

## Where you type commands

| Place | Use it for |
|-------|------------|
| **WSL Ubuntu** (Start menu → Ubuntu) | Almost every command in Days 1–2. This is bash, not PowerShell. |
| **Windows browser** | Open `http://localhost:3080` (Day 2). Docker Desktop publishes ports onto Windows localhost. |
| **Linux VM** (Day 3+) | `kubectl`, Helm, k3s. Not Day 1. |

If a prompt looks like `C:\Users\...>` you are in **cmd/PowerShell**. Open Ubuntu instead. Prompt should look like `you@pc:~/src/2B-DevSecOps$`.

**Why Git inside Ubuntu, not the Windows Git installer?** Docker, bash labs, and (later) the Linux VM all speak Linux. One `git` in WSL keeps line endings, SSH keys, and the repo on the same filesystem as `docker build`. Git for Windows is a different world (`C:\`, CRLF). Details: [`00-prerequisites-wsl-docker.md`](00-prerequisites-wsl-docker.md) § 2.

## Git: your fork — not branches on the class repo

The class curriculum lives here (read-only for learners):

**https://github.com/ItayPr/2B-DevSecOps**

| Do this | Do **not** do this |
|---------|---------------------|
| **Fork** that repo to **your** GitHub account | Push lab work to `ItayPr/2B-DevSecOps` |
| Clone **your fork** | Clone only the class repo and then try to `git push` (you will get permission denied) |
| Create branches on **your** fork, e.g. `lab/itay/day-01` | Open pull requests against the class `main` unless the instructor asked for a curriculum patch |
| `git pull` from `upstream` when the instructor updates labs | Force-push to `main` on anyone’s repo |

**Why:** the public repo is the shared textbook. Your fork is your notebook. Day 5 you will add a **second** remote (local Gitea) for Jenkins — still not the class GitHub.

Step-by-step fork/clone/push: [`00-git-basics.md`](00-git-basics.md).  
Install Git first: [`00-prerequisites-wsl-docker.md`](00-prerequisites-wsl-docker.md) § Install Git.

## Exact sequence (first evening / morning of Day 1)

1. Hardware check (16 GB RAM ideal, virtualization on).
2. Install **WSL2 + Ubuntu** (reboot once).
3. Install **Git inside WSL** (`sudo apt install git`) — Windows “Git for Windows” is optional and **not** what we use in class.
4. Install **Docker Desktop**, turn on Ubuntu WSL integration, verify `docker run --rm hello-world`.
5. Create a **GitHub account**, fork `ItayPr/2B-DevSecOps`, clone **your** fork into `~/src`.
6. `cp .env.example .env` (never commit `.env`).
7. Work through [`00-git-basics.md`](00-git-basics.md) until you have pushed a branch to **your** fork.
8. Open [`days/day-01-dockerfile/README.md`](../days/day-01-dockerfile/README.md).

If any step fails, [`troubleshooting.md`](troubleshooting.md).

## What “expected output” means

Labs show a snippet, not a byte-for-byte screenshot. Timestamps, image IDs, and your username will differ. Failures that **are** problems: `command not found`, `permission denied` on `docker`, `git push` to `ItayPr/...`.

## How commands are written in this course

- Copy the **whole** block into WSL unless a comment says “other terminal”.
- Lines starting with `#` are comments — bash ignores them. Read them; they explain **flags**.
- `\` at end of a line means “command continues on the next line”.
- Replace `<you>` with your GitHub username. Do not leave the angle brackets.

Example (do not run yet — this is how to *read* a command):

```bash
# -t  names the image  "lab-a-hello" with tag "1"
# .   means "use the Dockerfile in the current directory"
docker build -t lab-a-hello:1 .
```

## Files you will learn to read, not just run

| File | First seen | What it is |
|------|------------|------------|
| `Dockerfile` | Day 1 | Recipe to build an image (explained line by line in Day 1) |
| `.dockerignore` | Day 1 | Files **not** sent to the daemon (keep secrets out) |
| `.env` / `.env.example` | Day 2 | Ports and lab passwords; example is committed, `.env` is not |
| `docker-compose.yml` | Day 2 | Several containers + network + volumes |
| `*.yaml` under `platform/k8s` | Day 3 | Kubernetes objects |
| Helm `values.yaml` | Day 4 | Knobs for the same manifests |
| `Jenkinsfile` | Day 5 | CI stages |

Walkthrough of Dockerfiles: [`01-reading-dockerfiles.md`](01-reading-dockerfiles.md) (also embedded in Day 1 labs).

## Security habits (from hour one)

- You work as a **normal user** in WSL; `sudo` only for `apt` and rare Docker Desktop fixes.
- Lab passwords in `.env.example` are **fake**. Still never commit `.env`.
- Images should not run as root (Day 1 Lab D).
- Only the **edge** publishes a host port from Day 2 onward.
