# From this laptop lab to real Kubernetes / cloud

Class runs on **one Windows PC + one Linux VM**. You do **not** need a cloud account. The *objects* you already typed (Deployment, Service, Ingress, PVC, Helm values) are the same APIs on EKS, GKE, AKS, or on-prem OpenShift.

Use this page whenever a lab says “in production / cloud.”

## Data that must survive a restart

| Lab | Production equivalent |
|-----|------------------------|
| Compose **named volume** (`pgdata`, `redisdata`, `uploads_data`) | A disk (or a managed service) that outlives the container |
| k3s **PVC** + StorageClass `local-path` | CSI volume: AWS EBS (`gp3`), Azure Disk (`managed-csi`), GCP Persistent Disk, Longhorn, Portworx |
| `hostPath` (we avoid it for Postgres) | Node-local hack; data dies if the pod moves node |

**Rules that stay true in cloud:**

- Databases use **ReadWriteOnce** block storage (one node at a time). Do not put Postgres on a shared `hostPath` or on NFS unless you know the engine supports it.
- Take **snapshots** (VolumeSnapshot / cloud snapshot) before `helm uninstall` or `compose down -v`.
- App pods stay **stateless**. Session files and user uploads go to **object storage** (S3 / GCS / Azure Blob) in real shops. The lab uses an uploads PVC so you can see persistence without an AWS account.
- `reclaimPolicy: Retain` on disks you care about; `Delete` wipes the cloud disk when the PVC goes.
- `allowVolumeExpansion: true` on the StorageClass lets you grow a PVC in place (gp3, many CSI drivers). k3s `local-path` is fine for class; cloud storage classes are the same YAML field: `persistence.storageClass`.

k3s `local-path` writes under `/var/lib/rancher/k3s/storage` on **that VM**. A cloud cluster would set `storageClassName: gp3` (example) instead of `local-path`. See [`platform/helm/secure-demo/values-cloud.yaml.example`](../platform/helm/secure-demo/values-cloud.yaml.example).

**Managed database (typical production):** RDS, Cloud SQL, or Azure Database instead of Postgres-in-the-cluster. Then you have **no** Postgres PVC. You still keep Redis/uploads decisions explicit. The Helm chart’s `postgres.enabled` flag is the teaching version of “swap the engine for a connection string.”

## Network and “public origin”

| Lab | Cloud |
|-----|--------|
| `NGINX_HTTP_PORT=3080` + `APP_URL=http://localhost:3080` | HTTPS on 443, `APP_URL=https://shop.example.com` |
| Compose: only nginx publishes a host port | Security group / NSG: **443** to the load balancer only; data stores have no public IP |
| k3s Traefik on node :80 | Ingress + cloud LoadBalancer (ALB, Azure App Gateway, GCP HTTP(S) LB) or an API gateway |
| Cloudflare Tunnel (optional Day 7) | Same idea as a managed tunnel / Zero Trust connector / PrivateLink |

Browsers, OIDC, and **phones** still need the **real origin** (scheme + host + port). Inventing `:80` or using `localhost` on a device that is not the API host breaks login and mobile the same way. [Day 9](../days/day-09-mobile/README.md) is the mobile version of this rule.

`ClusterIP` names (`api:3001`, `postgres:5432`) never leave the cluster. Mobile apps, partner webhooks, and IdPs only see Ingress / API gateway hostnames.

## Compute

| Lab | Cloud |
|-----|--------|
| `docker compose up` | ECS/Fargate, Cloud Run, or still Kubernetes |
| k3s Deployment | Same Deployment API on EKS/GKE/AKS |
| Helm `values-dev` / `values-staging` | `values-prod`: more replicas, requests/limits, PDB, HPA, topology spread |
| Jenkins in Compose | Jenkins / GitHub Actions / GitLab CI **outside** the app namespace (often a shared platform cluster) |

A **StatefulSet** is what many teams use for in-cluster databases (stable network id + volume claim templates). We use a Deployment + PVC in class so the persistence lesson stays small. In cloud, prefer a **managed database** unless you have a documented reason to run Postgres yourself (operators, backups, failover).

## Secrets

| Lab | Cloud |
|-----|--------|
| `.env` gitignored | CI variables, or a cloud secret manager |
| Vault **dev** token | Vault HA, AWS IAM Roles for Service Accounts (IRSA), GKE Workload Identity, Azure Workload ID, Key Vault CSI |
| Kubernetes Secret from a file | Sealed Secrets / External Secrets Operator — still not plaintext in git |

Mobile binaries can be unpacked. Tokens that protect data live on the **server** (Vault / IAM), not in the APK/IPA.

## GitOps

Argo CD in class syncs one app from Git. In cloud you typically have:

- A **platform** Argo (or Flux) that bootstraps clusters.
- Per-environment folders or Helm value files (`dev` / `staging` / `prod`).
- Sync windows and automated vs manual sync on production.

The Application YAML shape does not change. The Git remote becomes GitHub/GitLab instead of in-cluster Gitea.

## Mobile clients (Day 9 → stores)

| Lab | Production |
|-----|------------|
| Phone → `http://192.168.x.x:3080` | Phone → `https://api.example.com` (Ingress TLS, cert-manager, or cloud cert) |
| Cleartext allowed in Expo/Flutter manifests | Store review expects HTTPS; drop ATS / cleartext exceptions |
| Windows Firewall on 3080 | Security groups: 443 to the load balancer |
| Store **does not** host Postgres | PVCs / RDS live in the cluster or the cloud account |

Updating the API (Helm/GitOps) does **not** need a store review. Changing UI in the binary **does**. CI is split: Jenkins (Day 5) builds **API images**; Codemagic / Bitrise / GitHub Actions with Fastlane build **AAB/IPA**.

## What we keep identical on purpose

- One **edge** (Ingress / gateway) in front of APIs.
- Health probes (`/health/live`, `/health/ready`).
- Non-root images.
- Git as desired state (Argo CD / Flux) in any cloud.
- Persistent data on volumes or managed services — never “the container’s writable layer.”
