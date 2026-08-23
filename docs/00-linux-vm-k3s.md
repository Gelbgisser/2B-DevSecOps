# Linux VM + k3s (primary cluster from Day 3)

**Timebox:** 60–90 minutes before Day 3. Do this **once** per laptop.

Days 1–2 stay on Windows + Docker Desktop. Kubernetes in this course runs on a **Linux VM** so:

- k3s behaves like a small production node
- **PersistentVolumeClaims** use the k3s `local-path` provisioner (data survives pod deletes)
- You are not fighting Docker Desktop’s Kubernetes toggle, k3d disk pressure, or Windows hostPath

Optional fallback (no VM): appendix at the bottom (**k3d**). Only use it if the instructor says so.

## VM specs

| Resource | Minimum | Comfortable (Days 5–6) |
|----------|---------|-------------------------|
| OS | Ubuntu 22.04 or 24.04 Server | same + desktop if you want a browser on the VM |
| vCPU | 2 | 4 |
| RAM | 8 GB | 12–16 GB |
| Disk | 40 GB | 60 GB thin provisioned |
| Network | Host-only or Bridged with a stable IP | Bridged is easiest for Windows browser → VM:80 |

**Hypervisor (pick one):**

- **Hyper-V** (Windows Pro) — New VM, Generation 2, Secure Boot on, Ubuntu ISO
- **VirtualBox** — Bridged adapter or Host-only + port forward 80
- **VMware Workstation**

Enable virtualization in BIOS. Nested virtualization is **not** required: k3s uses containerd, not Docker-in-Docker.

Create a user with `sudo`. Note the VM IPv4:

```bash
ip -4 addr show
hostname -I
```

From **Windows**, ping that IP. You will set `APP_URL` to `http://<vm-ip>` (port 80 can be omitted). If you later expose `:3080`, `APP_URL` **must** include `:3080`.

## 1. Base packages

On the VM:

```bash
sudo apt update
# -y  non-interactive yes. git is required on the VM too (separate machine from WSL).
sudo apt install -y curl git make ca-certificates apt-transport-https
git --version
```

Clone **your fork** onto the VM (real Linux disk — do not use `/mnt/c` from Windows):

```bash
mkdir -p ~/src && cd ~/src
# Replace YOUR_USER. Same fork you pushed to from WSL.
git clone https://github.com/YOUR_USER/2B-DevSecOps.git
cd 2B-DevSecOps
git remote add upstream https://github.com/ItayPr/2B-DevSecOps.git
git switch lab/YOUR_USER/day-02   # or whatever branch has your work
cp .env.example .env
```

## 2. Install k3s (single node)

```bash
# -sfL  curl: silent, fail on HTTP errors, follow redirects
# sudo sh -s -  run the installer as root; args after the last - go to the script
# --write-kubeconfig-mode 644  kubeconfig readable by your user (lab only; lock down at work)
curl -sfL https://get.k3s.io | sudo sh -s - --write-kubeconfig-mode 644
```

What this gives you:

- `kubectl` via `/usr/local/bin/kubectl` (k3s symlink)
- **Traefik** Ingress on node ports **80** and **443**
- **local-path** StorageClass (PVCs write under `/var/lib/rancher/k3s/storage`)
- containerd (not Docker) — you will **import** images you built with Docker if Docker is also installed

Verify:

```bash
sudo k3s kubectl get nodes
sudo k3s kubectl get pods -A
sudo k3s kubectl get sc
```

Expected: node `Ready`. StorageClass `local-path` is default.

Configure kubectl for your user (so you can drop `sudo`):

```bash
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown "$USER:$USER" ~/.kube/config
export KUBECONFIG=~/.kube/config
echo 'export KUBECONFIG=~/.kube/config' >> ~/.bashrc
kubectl get nodes
```

**Never commit** `~/.kube/config`. It contains a cluster admin token.

## 3. Helm

```bash
curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
helm version
```

## 4. Optional Docker on the VM (to build images)

k3s does not use Docker. If you build with Docker you must import:

```bash
sudo apt install -y docker.io
sudo usermod -aG docker "$USER"
# log out and back in
docker build -t secure-demo-api:local ~/src/devsecops-bootcamp/apps/secure-demo/api
docker save secure-demo-api:local | sudo k3s ctr images import -
```

Alternatively install **k3s + buildah/nerdctl**, or use the Gitea/Jenkins registry on Day 5 and set `imagePullPolicy: Always`.

## 5. Persistence — the rule

| Do | Don't |
|----|--------|
| PVC + `storageClassName: local-path` | `hostPath: /mnt/data/postgres` on a laptop path |
| One PVC per stateful workload | Bind-mount the Windows drive into k3s |
| `kubectl get pvc` until Bound | Delete PVC unless you intend to wipe data |

k3s stores volume data on the VM disk. Snapshots of the VM are your backup during class. In cloud the same PVC YAML uses a CSI StorageClass (`gp3`, `managed-csi`, …) — [`docs/02-lab-to-cloud.md`](02-lab-to-cloud.md).

Simulate “pod died, data lived”:

```bash
kubectl -n secure-demo delete pod -l app=postgres
kubectl -n secure-demo get pvc
# PVC still Bound; new pod remounts the same volume
```

## 6. Firewall

If `ufw` is enabled:

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
# Day 5 lite: Jenkins/Gitea on the VM
sudo ufw allow 3000/tcp
sudo ufw allow 8090/tcp
sudo ufw allow 5000/tcp
```

Do not expose Postgres (5432) or Vault (8200) to the public internet. Lab VMs stay on a private network.

## 7. APP_URL on k3s

Traefik listens on **80**. From the Windows browser:

```text
http://<vm-ip>/
http://<vm-ip>/api/hello
```

Set in ConfigMap / `.env` on the VM:

```bash
APP_URL=http://192.168.56.10
```

No `:80`. If you published a non-default port, include it. This is the same Keycloak/OIDC lesson as Compose’s `localhost:3080`.

## Self-check

- [ ] `kubectl get nodes` → Ready
- [ ] `kubectl get sc` → `local-path`
- [ ] Windows browser can hit `http://<vm-ip>` (even if 404 — Traefik is up)
- [ ] kubeconfig is **not** in git (`git check-ignore` / never copied into the repo)

## Debug

| Symptom | Check |
|---------|--------|
| `kubectl` connection refused | k3s service: `sudo systemctl status k3s` |
| Ingress 404 | No Ingress object yet — Day 3 creates it |
| PVC Pending | `kubectl describe pvc` — local-path provisioner pod in `kube-system` |
| Windows cannot reach VM | Hypervisor network mode, Windows firewall, `ip addr` |

Full bible: [`troubleshooting.md`](troubleshooting.md).

---

## Appendix — k3d on Docker Desktop (fallback only)

If you cannot create a VM:

```bash
curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
k3d cluster create lab --agents 0 -p "3080:80@loadbalancer"
```

Then `APP_URL=http://localhost:3080`. Persistence is a Docker volume behind k3d — still better than hostPath, worse than a dedicated VM disk. Return to k3s when you can.
