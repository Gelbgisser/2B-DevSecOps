# Day 6 — GitOps (Argo CD) + Vault

**Timebox:** ~7 hours  
**Where:** k3s VM  
**RAM:** Argo CD + Vault + the app ≈ 12 GB comfortable. Skip Nexus today.

## Learning objectives

- Desired state lives in Git; the cluster converges
- Detect drift after `kubectl edit`
- Put a DB password in Vault KV v2, not in git
- Inject the secret into the API (simplest class path: init container **or** a Job that writes a K8s Secret)
- Rotate and bounce pods

## Lab 1 — Install Argo CD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl -n argocd rollout status deploy/argocd-server --timeout=180s
```

For class, port-forward (do not NodePort 80 — Traefik already owns 80):

```bash
kubectl -n argocd port-forward svc/argocd-server 8088:443
```

From Windows, `https://<vm-ip>:8088` only works if you used a NodePort/Ingress instead. Simplest: SSH tunnel or browse on the VM.

Initial admin password:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d; echo
```

Do **not** commit that password.

---

## Lab 2 — Application

Point Argo at **your** Gitea URL (reachable from the cluster):

```bash
# edit gitops/argocd/secure-demo-app.yaml repoURL
kubectl apply -f gitops/argocd/secure-demo-app.yaml
```

Sync in the UI (manual first). Expected: namespace `secure-demo` objects appear.

Change `replicaCount` in `platform/helm/secure-demo/values-dev.yaml`, push to Gitea, **Sync**. Pods scale.

---

## Lab 3 — Drift

```bash
kubectl -n secure-demo scale deploy/api --replicas=3
```

Argo shows **OutOfSync**. Sync to restore Git as source of truth. GitOps rule: do not “fix prod” only with kubectl.

---

## Lab 4 — Vault (dev)

**Compose path (fast):**

```bash
docker compose -f platform/compose/docker-compose.yml --env-file .env --profile vault up -d vault
export VAULT_ADDR=http://127.0.0.1:8200
export VAULT_TOKEN=lab-only-vault-root   # from .env — lab only
```

**k3s path (stretch):** Helm chart `hashicorp/vault` in dev mode — more RAM.

```bash
vault secrets enable -path=secret kv-v2 || true
vault kv put secret/secure-demo db_password=lab-rotated-day06
vault kv get secret/secure-demo
```

Policy (class):

```bash
vault policy write secure-demo-read - <<'EOF'
path "secret/data/secure-demo" {
  capabilities = ["read"]
}
EOF
```

**Simplest injection that always works in class:** read from Vault on your laptop/VM and apply a Secret (still better than putting the password in Git):

```bash
PW=$(vault kv get -field=db_password secret/secure-demo)
kubectl -n secure-demo create secret generic secure-demo-db \
  --from-literal=POSTGRES_PASSWORD="$PW" \
  --from-literal=DATABASE_URL="postgres://secure_demo:${PW}@postgres:5432/secure_demo" \
  --dry-run=client -o yaml | kubectl apply -f -
kubectl -n secure-demo rollout restart deploy/api
```

Document in notes: production uses Vault Agent, CSI driver, or External Secrets — **not** a human copying tokens.

### In production / cloud

Argo CD still syncs Git; the remote is GitHub/GitLab instead of in-cluster Gitea. Vault **dev** becomes HA Vault or cloud IAM (IRSA / Workload Identity / Azure Workload ID). Same lesson: the password is not in the Helm chart. [`docs/02-lab-to-cloud.md`](../../docs/02-lab-to-cloud.md).

AppRole (optional extra): `vault auth enable approle` then a role bound to the policy. Do not check in `role_id` / `secret_id`.

---

## Exercise — rotate

Put a new password in Vault, update the Kubernetes Secret, restart API, confirm `/health/ready` still `db: ok` (or skipped if you have no Postgres in that namespace).

## Security habit

Vault **dev** root token is disposable. Never put `VAULT_TOKEN` in the Helm chart. Audit: `vault token lookup` shows TTL in non-dev; in dev, talk about what production would log.

## Debug challenge

Argo cannot clone Gitea: `repository not accessible`. Network path: Argo pods must use `http://gitea.<ns>.svc:3000` or an Ingress URL, not `localhost`.

[`solutions/README.md`](solutions/README.md)

## Self-check

- [ ] Argo Application exists and can Sync
- [ ] Drift demo done
- [ ] Password not in git (`git grep lab-rotated` should not hit Helm values)
- [ ] API restarted after rotate
