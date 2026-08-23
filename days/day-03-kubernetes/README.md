# Day 3 — Linux VM + k3s

**Timebox:** ~7 hours  
**Where:** Ubuntu VM (Hyper-V / VMware / VirtualBox). Windows is only the browser + SSH client.  
**Prerequisites:** Days 1–2; VM built from [`docs/00-linux-vm-k3s.md`](../../docs/00-linux-vm-k3s.md)

## Learning objectives

- Explain Pod, Deployment, Service, Ingress, Namespace, ConfigMap, Secret, PVC
- Use `kubectl` to deploy and debug the Secure Demo
- Reach the app through **Ingress** (Traefik) — not a hostPath database
- Keep Postgres data on a **PVC** (`local-path`) across pod deletes
- Read-only RBAC as a security habit

## Agenda

| Block | Minutes | What |
|------:|--------:|------|
| 0 | 45 | Finish k3s install + `kubectl get nodes` |
| 1 | 40 | Mental model + import images |
| 2 | 50 | Apply `platform/k8s/base` |
| 3 | 40 | Port-forward vs Ingress |
| 4 | 40 | PVC persistence drill |
| 5 | 40 | Wrong Service selector (debug) |
| Ex | 50 | Namespace `team-<name>` |
| TF | 30 | Terraform Kubernetes provider |
| Self-check | 15 | Tick the list |

---

## Lab 0 — Cluster is Ready

On the **VM**:

```bash
sudo systemctl status k3s --no-pager
kubectl get nodes
kubectl get pods -A
kubectl get sc
```

Expected: node `Ready`; StorageClass `local-path` (k3s default name is `local-path`).

If `kubectl` is missing, you are not on the VM or `~/.kube/config` is unset — return to the VM guide.

---

## Lab 1 — Images into containerd

k3s does not see Docker images until you import them.

```bash
cd ~/src/devsecops-bootcamp   # clone path on the VM
docker build -t secure-demo-api:local apps/secure-demo/api
docker build -t secure-demo-web:local apps/secure-demo/web
docker save secure-demo-api:local | sudo k3s ctr images import -
docker save secure-demo-web:local | sudo k3s ctr images import -
sudo k3s ctr images ls | grep secure-demo
```

---

## Lab 2 — Deploy base manifests

```bash
kubectl apply -f platform/k8s/base/secret.example.yaml
chmod +x platform/k8s/base/apply.sh
./platform/k8s/base/apply.sh
kubectl -n secure-demo get deploy,pods,svc,ingress,pvc
kubectl -n secure-demo rollout status deploy/api --timeout=120s
```

Expected: PVCs `Bound`; API and web pods `Running`.

Set `APP_URL` to how **Windows** will browse (VM IP, port 80 omitted):

```bash
VM_IP=$(hostname -I | awk '{print $1}')
echo "Browse from Windows: http://$VM_IP"
kubectl -n secure-demo create configmap secure-demo \
  --from-literal=APP_URL="http://$VM_IP" \
  --from-literal=CLAMAV_HOST="" \
  --from-literal=API_PORT="3001" \
  -o yaml --dry-run=client | kubectl apply -f -
kubectl -n secure-demo rollout restart deploy/api
```

From **Windows** browser: `http://<vm-ip>/` and `http://<vm-ip>/api/hello`.

---

## Lab 3 — Port-forward vs Ingress

```bash
kubectl -n secure-demo port-forward svc/api 3001:3001
# other terminal, on the VM:
curl -sS http://127.0.0.1:3001/health/live
```

Port-forward is a **debug straw**. Ingress is how users arrive. Only the Ingress / Traefik entrypoint is the edge.

```bash
kubectl -n secure-demo get ingress
kubectl -n kube-system get svc traefik
```

---

## Lab 4 — Data survives the pod (PVC, not hostPath)

```bash
kubectl -n secure-demo exec deploy/postgres -- \
  psql -U secure_demo -d secure_demo -c "CREATE TABLE IF NOT EXISTS persist_lab(id int); INSERT INTO persist_lab VALUES (3);"
kubectl -n secure-demo delete pod -l app=postgres
kubectl -n secure-demo wait --for=condition=ready pod -l app=postgres --timeout=90s
kubectl -n secure-demo exec deploy/postgres -- \
  psql -U secure_demo -d secure_demo -c "SELECT * FROM persist_lab;"
```

Expected: row `3` is still there. `kubectl -n secure-demo get pvc` still `Bound`.

**Do not** switch the volume to `hostPath` “to make it easier”.

### In production / cloud

`storageClassName: local-path` is the lab disk. On EKS/GKE/AKS you change **one field** to `gp3` / `managed-csi` / `standard-rwo` (CSI). Traefik on the VM node becomes a cloud LoadBalancer + TLS. Same manifests. [`docs/02-lab-to-cloud.md`](../../docs/02-lab-to-cloud.md). Example Helm overrides: [`platform/helm/secure-demo/values-cloud.yaml.example`](../../platform/helm/secure-demo/values-cloud.yaml.example).

---

## Lab 5 — Empty endpoints (debug)

Apply the broken Service:

```bash
kubectl apply -f days/day-03-kubernetes/labs/wrong-selector.yaml
kubectl -n secure-demo get ep api-broken
kubectl -n secure-demo describe svc api-broken
```

Expected: `Endpoints: <none>`. The selector does not match pod labels. Restore:

```bash
kubectl -n secure-demo delete svc api-broken
```

This is the most common “Service is up but curl hangs” bug in class.

---

## Exercise — team namespace

Create `team-<yourname>` and deploy **only the API** there (ConfigMap + Secret + Deployment + ClusterIP). Do not copy Postgres unless you also add a **new PVC**.

```bash
kubectl create ns team-$USER
# copy and edit labels; set a unique PVC name if you add a database
```

Done when `kubectl -n team-$USER get pods` shows a ready API and `kubectl -n team-$USER run curl --rm -it --image=curlimages/curl -- curl -sS http://api:3001/health/live` works (adjust Service name).

---

## Terraform (k3s provider)

[`docs/01-terraform-basics.md`](../../docs/01-terraform-basics.md) Lab T2: create `team-learner` (or your name) via Terraform. Destroy it at the end of class if you used a throwaway namespace.

---

## Security habit

- Secrets in git = incident. You applied `secret.example.yaml` with **lab** passwords only.
- RBAC: `kubectl -n secure-demo auth can-i delete pods --as=system:serviceaccount:secure-demo:learner-ro` → **no**.
- `kubectl -n secure-demo auth can-i get pods --as=system:serviceaccount:secure-demo:learner-ro` → **yes**.

## Debug challenge

`kubectl get pods` looks fine on your **laptop** but the VM browser (or Windows → VM IP) fails. Which kubeconfig did you just use? (`kubectl config current-context`)

Solution notes: [`solutions/README.md`](solutions/README.md).

## Self-check

- [ ] Node Ready, `local-path` StorageClass exists
- [ ] Ingress serves `/` and `/api/hello` from Windows
- [ ] Postgres data survived a pod delete
- [ ] I can explain why a wrong selector yields empty endpoints
- [ ] I did not commit kubeconfig or filled secrets
