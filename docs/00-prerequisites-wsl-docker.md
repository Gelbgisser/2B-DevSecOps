# Prerequisites — full laptop setup (Git, WSL, Docker)

Do this **once** before Day 1. Timebox: **60–120 minutes** including a Windows reboot.

You will end with: Ubuntu in WSL, `git` and `docker` working **inside Ubuntu**, and a clone of **your GitHub fork**.

Commands are **bash in WSL** unless the box says **PowerShell**.

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

Open **Ubuntu** from the Start menu for the rest of this page.

---

## 2. Install Git (and basic build tools) **inside WSL**

Class commands use the **Linux** `git` inside Ubuntu, not “Git for Windows” / Git Bash.

### Why not the regular Windows Git installer?

You *can* install Git for Windows. We still install Git **in Ubuntu** because **the whole course runs in WSL**:

| | Git for Windows (Git Bash / PowerShell) | Git in WSL Ubuntu |
|--|-----------------------------------------|-------------------|
| Shell | Windows world (`C:\Users\...`) | Same bash as `docker`, `make`, Day 3 VM |
| Files | NTFS, CRLF line endings by default | Linux filesystem (`~/src`), LF |
| Docker | Easy to clone under `C:\` then wonder why builds are slow | Clone next to where Docker Desktop’s WSL engine reads files |
| Keys / tokens | `C:\Users\you\.ssh` | `~/.ssh` in Ubuntu — the same place `git push` in class uses |

If you only install Windows Git and then type `git` in Ubuntu, you often get a **Windows** binary via `/mnt/c/Program Files/Git/...`. That mix causes:

- `warning: LF will be replaced by CRLF` and broken shell scripts (`./apply.sh` fails with `\r`)
- Credentials/SSH keys in the Windows profile while you work in Linux
- Slow or confusing paths (`/mnt/c/Users/...` vs `~/src`)

**Git for Windows is optional** if you like GitHub Desktop or VS Code’s Windows Git UI. For every copy-paste in this repo, use Ubuntu’s `git` (`which git` → `/usr/bin/git`).

```bash
# Update package lists, then install tools.
# -y  answers "yes" to apt prompts so you are not stuck on [Y/n]
sudo apt update
sudo apt install -y git curl make ca-certificates unzip

# Confirm the Linux git binary exists
git --version
# Expected: git version 2.x.x
which git
# Expected: /usr/bin/git   (NOT a /mnt/c/Program Files/... path)
```

If `which git` points at `/mnt/c/...`, your PATH is picking Windows Git. Fix: in `~/.bashrc` put `export PATH="/usr/bin:$PATH"` then `source ~/.bashrc`.

### Git identity (required before your first commit)

```bash
# Shown on every commit. Use a real name/email you are allowed to publish.
git config --global user.name "Your Name"
git config --global user.email "you@company.example"

# New repos use 'main' instead of 'master'
git config --global init.defaultBranch main

# Optional: nicer diffs
git config --global core.autocrlf input

git config --global --list
```

`--global` means “for every repo on this WSL user”, not one folder.

---

## 3. GitHub access (HTTPS token or SSH)

You need this to **push to your fork**. GitHub no longer accepts your account password for `git push`.

### Option A — HTTPS + Personal Access Token (simplest)

1. GitHub → Settings → Developer settings → Personal access tokens.  
   Fine-grained token with access to **your fork**, permission **Contents: Read and write**.
2. When `git push` asks for a password, **paste the token**, not your GitHub password.

### Option B — SSH key (nice for the whole course)

```bash
# -t ed25519   modern key type
# -C           label (comment) so you recognise the key on GitHub
# -f           file path; do not overwrite an existing key unless you mean to
# -N ""        empty passphrase for class speed (use a passphrase at work)
ls -la ~/.ssh
ssh-keygen -t ed25519 -C "wsl-class-$(hostname)" -f ~/.ssh/id_ed25519_class -N ""
cat ~/.ssh/id_ed25519_class.pub
```

GitHub → Settings → SSH and GPG keys → New SSH key → paste the **`.pub`** line only.

```bash
# Tell Git to use this key for github.com
cat >> ~/.ssh/config << 'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_class
  IdentitiesOnly yes
EOF
chmod 600 ~/.ssh/config
ssh -T git@github.com
```

Expected: `Hi <username>! You've successfully authenticated...` (exit code may be 1; the message is what matters).

**Never** commit `id_ed25519_class` (no `.pub`). It is a private key.

---

## 4. Install Docker Desktop and attach it to Ubuntu

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

## 5. Fork and clone (your repo, not the class repo)

Full Git lab is [`00-git-basics.md`](00-git-basics.md). Minimum to proceed:

1. Browser: open https://github.com/ItayPr/2B-DevSecOps → **Fork** → owner = **you**.
2. In WSL (HTTPS example — swap URL if you use SSH):

```bash
mkdir -p ~/src
cd ~/src

# Clone YOUR fork. Replace YOUR_GITHUB_USER.
# HTTPS:
git clone https://github.com/YOUR_GITHUB_USER/2B-DevSecOps.git
# SSH:
# git clone git@github.com:YOUR_GITHUB_USER/2B-DevSecOps.git

cd 2B-DevSecOps

# Textbook repo (instructor). You pull updates from here; you do not push here.
git remote add upstream https://github.com/ItayPr/2B-DevSecOps.git
git remote -v
# origin    = your fork (push here)
# upstream  = class repo (fetch/pull only)

cp .env.example .env
git check-ignore -v .env
# Expected: a line pointing at .gitignore  (means .env will not be committed)
```

Cloning under `/mnt/c/Users/...` works but is slower. Prefer `~/src`.

---

## 6. What you will **not** install on Day 1

| Tool | When | Where |
|------|------|--------|
| Terraform | end of Day 2 | WSL — [`01-terraform-basics.md`](01-terraform-basics.md) |
| Linux VM + k3s + kubectl + Helm | **before Day 3** | [`00-linux-vm-k3s.md`](00-linux-vm-k3s.md) |
| Jenkins / Gitea / Vault | Days 5–6 | Compose profiles or the VM |
| Syft / Grype / Gitleaks | Day 8 (Scout optional Day 1) | WSL or VM |

Do not turn on Docker Desktop Kubernetes on Day 1. Cluster work is k3s on a VM so disks are real Linux PVCs.

---

## Self-check (do not skip)

- [ ] `wsl -l -v` → Ubuntu version **2**
- [ ] `git --version` works **in Ubuntu**; `which git` is `/usr/bin/git`
- [ ] `git config user.email` is set
- [ ] `docker version` has a **Server** section
- [ ] `docker run --rm hello-world` succeeds
- [ ] Repo cloned from **your fork**; `git remote -v` shows `origin` = you, `upstream` = `ItayPr/2B-DevSecOps`
- [ ] `.env` exists and is ignored

Next: [`00-git-basics.md`](00-git-basics.md) (push a branch to **your** fork), then Day 1.

Stuck: [`troubleshooting.md`](troubleshooting.md).
