# Prerequisites — full laptop setup (Git, WSL, Docker)

Do this **once** before Day 1. Timebox: **60–120 minutes** including a Windows reboot.

You will end with: **Git for Windows** (Cursor push/pull), **Ubuntu in WSL** (`docker`), Docker Desktop attached to Ubuntu, and **one clone of your fork** in a Windows folder.

Commands: **PowerShell** or Cursor for Git; **bash in Ubuntu** for Docker. Never use the `docker-desktop` WSL distro as a terminal.

---

## 0. What you need on the table

- Windows 11 (Home is OK)
- **16 GB RAM** recommended (8 GB is tight after Docker starts)
- **40 GB** free disk
- Virtualization **on** in BIOS (Intel VT-x / AMD-V). Task Manager → Performance → CPU should say “Virtualization: Enabled”
- Admin rights **once** (WSL + Docker Desktop installers)
- A **GitHub account** (free): https://github.com/signup  
  You will fork the class repo. You will **not** push to the instructor’s repo.

Give Docker Desktop / WSL **at least 6 GB RAM**: Docker Desktop → Settings → Resources.

---

## 1. Install WSL2 + Ubuntu

**PowerShell (Run as Administrator):**

```powershell
# Installs WSL2 and the Ubuntu distro. Reboot if Windows asks.
wsl --install -d Ubuntu
```

After reboot, Ubuntu opens. Create a **UNIX** username and password (not your Windows password). Remember the password — `sudo` will ask for it.

**PowerShell** (check version 2):

```powershell
wsl -l -v
```

Expected: `Ubuntu` and `VERSION` **2**. If it is 1:

```powershell
wsl --set-version Ubuntu 2
```

Open **Ubuntu** from the Start menu when you need Docker. If Ubuntu never appeared, Microsoft Store → Ubuntu.

**Wrong window:** prompt `docker-desktop:...#` is Docker Desktop’s helper VM. Close it. It cannot run `apt` or class labs.

---

## 2. Install Git for Windows (this is what Cursor uses)

Yes — **use regular Windows Git**. Cursor / VS Code Source Control calls that `git.exe`. Push/pull from the UI is the class default. You do **not** need `sudo apt install git` for homework.

1. Download: https://git-scm.com/download/win  
2. Install with defaults. Enable **Git from the command line** (Git in PATH).  
3. New PowerShell:

```powershell
git --version
# Expected: git version 2.x.x
```

### Git identity (before first commit)

```powershell
git config --global user.name "Your Name"
git config --global user.email "you@company.example"
git config --global init.defaultBranch main
git config --global core.autocrlf true
git config --global --list
```

`core.autocrlf true` on Windows stores LF in git and CRLF on disk — normal for this setup.

### Why we still have Ubuntu

Ubuntu is for **Docker**, not for being your Git client:

| Tool | Job |
|------|-----|
| Git for Windows + Cursor | Fork, branch, commit, push, pull |
| WSL Ubuntu | `docker build`, `docker compose`, bash labs |
| Linux VM (Day 3) | k3s — *that* machine gets `apt install git` so it can clone onto the VM |

Installing Git *again* inside Ubuntu is optional (CLI in bash). If both exist, still commit from **one** place (Cursor) so you do not mix two index states.

### GitHub login

GitHub rejects account passwords for `git push`. Cursor will prompt a browser login, or use a **Personal Access Token**, or Git Credential Manager (comes with Git for Windows).

SSH is optional (GitHub → Settings → SSH keys). Not required if Cursor HTTPS works.

---

## 3. Install Docker Desktop and attach **Ubuntu**

1. Download: https://docs.docker.com/desktop/setup/install/windows-install/
2. Install with **Use WSL 2 instead of Hyper-V** checked.
3. Start Docker Desktop; wait until it is running.
4. Settings → Resources → **WSL integration** → enable **Ubuntu**.
5. Apply & Restart.

**New Ubuntu tab**, then:

```bash
docker version
# Must show a Client block AND a Server block. Server = the engine is reachable.

docker compose version
# Compose v2 (plugin). Expected: Docker Compose version v2.x

# --rm  delete the container when it exits (no leftover named container)
docker run --rm hello-world
# Expected: "Hello from Docker!" and a short explanation
```

### `docker: command not found`

Integration did not inject the CLI. Toggle Ubuntu integration off/on, Restart Docker Desktop, **close Ubuntu completely**, open a new tab.

### Only Client, no Server

Same fix. Also confirm Docker Desktop is actually running (whale icon).

### Slow / out of memory

Settings → Resources: CPUs ≥ 2, Memory ≥ 6 GB, Swap ≥ 1 GB.

---

## 4. Fork and clone (Windows folder Cursor will open)

Full Git lab: [`00-git-basics.md`](00-git-basics.md). Minimum:

1. Browser: https://github.com/ItayPr/2B-DevSecOps → **Fork** → owner = **you**.
2. In Cursor: Command Palette → **Git: Clone** → paste **your** fork URL → pick e.g. `Desktop\Projects`.  
   Or PowerShell:

```powershell
cd $HOME\Desktop\Projects
git clone https://github.com/YOUR_GITHUB_USER/2B-DevSecOps.git
cd 2B-DevSecOps
git remote add upstream https://github.com/ItayPr/2B-DevSecOps.git
git remote -v
# origin    = your fork (push here)
# upstream  = class repo (fetch only)

copy .env.example .env
git check-ignore -v .env
```

3. **File → Open Folder** on that clone. All commits happen here.

4. Ubuntu, same files:

```bash
cd /mnt/c/Users/$USER/Desktop/Projects/2B-DevSecOps
# adjust the path if you cloned elsewhere
pwd
docker version
```

Do not `git clone` a second copy in `~/src` unless you intend two working trees.

Optional in Ubuntu (docker labs only): `sudo apt update && sudo apt install -y curl make ca-certificates`

---

## 5. What you will **not** install on Day 1

| Tool | When | Where |
|------|------|--------|
| Terraform | end of Day 2 | WSL — [`01-terraform-basics.md`](01-terraform-basics.md) |
| Linux VM + k3s + kubectl + Helm | **before Day 3** | [`00-linux-vm-k3s.md`](00-linux-vm-k3s.md) |
| Jenkins / Gitea / Vault | Days 5–6 | Compose profiles or the VM |
| Syft / Grype / Gitleaks | Day 8 (Scout optional Day 1) | WSL or VM |

Do not turn on Docker Desktop Kubernetes on Day 1. Cluster work is k3s on a VM so disks are real Linux PVCs.

---

## Self-check (do not skip)

- [ ] `wsl -l -v` → Ubuntu version **2** (and you open **Ubuntu**, never `docker-desktop`)
- [ ] `git --version` works in **PowerShell** or Cursor (Git for Windows)
- [ ] `git config --global user.email` is set
- [ ] Cursor Source Control shows this repo
- [ ] `docker version` in **Ubuntu** has a **Server** section
- [ ] `docker run --rm hello-world` succeeds in Ubuntu
- [ ] Repo is **your fork**; `git remote -v` → `origin` = you, `upstream` = `ItayPr/2B-DevSecOps`
- [ ] `.env` exists and is ignored

Next: [`00-git-basics.md`](00-git-basics.md) (push a branch to **your** fork), then Day 1.

Stuck: [`troubleshooting.md`](troubleshooting.md).
