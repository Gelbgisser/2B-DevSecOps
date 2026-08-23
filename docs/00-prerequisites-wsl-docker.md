# Prerequisites — Windows 11 + WSL2 + Docker Desktop

**Audience:** every learner before Day 1. Commands below are **bash inside WSL** unless a PowerShell box says otherwise.

**Timebox:** 45–90 minutes the first time (including a Windows reboot).

## Hardware checklist

- Windows 11 (Home is fine if WSL2 works)
- 16 GB RAM recommended (8 GB is tight once Docker is up)
- 40 GB free disk
- Virtualization enabled in BIOS (Intel VT-x / AMD-V)
- Admin rights once, to install WSL and Docker Desktop

Give Docker Desktop / WSL **at least 6 GB RAM**. In Docker Desktop: Settings → Resources.

## 1. Install WSL2 + Ubuntu

**PowerShell (Admin):**

```powershell
wsl --install -d Ubuntu
```

Reboot if Windows asks. After reboot, Ubuntu opens and you create a UNIX username + password (this is **not** your Windows password).

Verify from PowerShell:

```powershell
wsl -l -v
```

Expected: `Ubuntu` with `VERSION` **2**.

If you see version 1:

```powershell
wsl --set-version Ubuntu 2
```

Open Ubuntu from the Start menu. All remaining commands in this course are typed **there**, not in cmd.exe.

```bash
sudo apt update && sudo apt install -y git curl make ca-certificates
git --version
```

## 2. Install Docker Desktop

1. Download Docker Desktop for Windows: https://docs.docker.com/desktop/setup/install/windows-install/
2. Install with **Use WSL 2 instead of Hyper-V** enabled.
3. Start Docker Desktop and wait until it says running.
4. Settings → Resources → WSL Integration → enable **Ubuntu**.
5. Apply & Restart.

In **WSL**:

```bash
docker version
docker compose version
docker run --rm hello-world
```

Expected: Client **and** Server sections from `docker version`. If you only see Client, WSL integration is off — go back to step 4.

### “docker: command not found” in WSL

Docker Desktop did not inject the CLI. Toggle WSL integration off/on, *Restart*, open a **new** Ubuntu tab.

### Slow or OOM

Docker Desktop → Settings → Resources: CPUs 2+, Memory 6 GB+, Swap 1 GB. Disk image on the drive with space.

## 3. Git identity (you will push on Day 5)

```bash
git config --global user.name "Your Name"
git config --global user.email "you@company.example"
git config --global init.defaultBranch main
```

Do **not** generate a GitHub token yet unless the instructor hosts the origin on GitHub. Class origin is often **Gitea on the Linux VM** (Day 5).

Continue: [`00-git-basics.md`](00-git-basics.md).

## 4. Clone this repo in WSL (not under a weird Windows path if you can avoid it)

Best: clone inside your Linux home (I/O is faster than `/mnt/c/...`).

```bash
mkdir -p ~/src && cd ~/src
git clone <instructor-origin-url> devsecops-bootcamp
cd devsecops-bootcamp
cp .env.example .env
```

If the repo already lives on the Windows desktop:

```bash
cd /mnt/c/Users/<You>/Desktop/Projects/2B-DevSecOps
```

That path works; it is just slower.

## 5. What you will NOT do on Windows

| Later topic | Where it runs |
|-------------|----------------|
| Dockerfile, Compose, Terraform Docker provider | WSL + Docker Desktop |
| k3s, kubectl, Helm, Argo CD, Vault, Jenkins-on-cluster | **Linux VM** — see [`00-linux-vm-k3s.md`](00-linux-vm-k3s.md) |

Do not install Minikube/k3d on Day 1 unless the instructor explicitly wants a no-VM fallback. The primary cluster is k3s on a VM so **PersistentVolumeClaims** land on a real Linux disk.

## 6. Optional tools (install when the day needs them)

| Tool | Day | Install (WSL or VM) |
|------|-----|---------------------|
| Terraform | 2 | https://developer.hashicorp.com/terraform/install |
| kubectl + helm | 3 | on the **VM** |
| syft / grype | 1 stretch, 8 | Anchore install scripts |
| gitleaks / semgrep | 8 | GitHub releases / pipx |

## Self-check

- [ ] `wsl -l -v` shows Ubuntu version 2
- [ ] `docker version` prints a Server section from WSL
- [ ] `docker run --rm hello-world` succeeds
- [ ] `git config user.email` is set
- [ ] `.env` exists and is **not** going to be committed (`git check-ignore -v .env`)

## Debug

See [`troubleshooting.md`](troubleshooting.md) § Docker Desktop WSL integration.
