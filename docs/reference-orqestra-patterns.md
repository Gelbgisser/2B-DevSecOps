# Orqestra patterns — teaching analogies only

**Product code stays out of this repo.** Re-implement miniatures. No private URLs, realms, or customer data.

| Pattern (org) | What you build here | Teaching point |
|---------------|---------------------|----------------|
| Compose-first; only NGINX publishes a host port | `platform/compose/docker-compose.yml` | Edge is the trust boundary |
| `NGINX_HTTP_PORT` + `APP_URL` | `.env.example` | Public origin; never assume `:80` |
| `$http_host` vs `$host` | `platform/docker/nginx/conf.d/default.conf` | Port-preserving headers for IdPs |
| Keycloak under `/auth`, invite gate | *Not installed* — mock `X-Demo-User` | Authn ≠ authz; IdP ≠ membership |
| Application authorization service | API 403 on cross-owner download | WAF ≠ authorization |
| Quarantine → ClamAV → trusted prefix | `/data/quarantine` vs `/data/clean` | Untrusted until CLEAN |
| Syft + Grype + Semgrep + Gitleaks | `security/scripts/scan-local.sh` | Supply chain + SAST + secrets in CI |
| `infra/nginx/security` headers + WAF placeholders | `platform/docker/nginx/security` + `waf/` | Edge hardening independent of the app |
| F5 / NGINX Ingress WAF annotations | `platform/k8s/examples/f5-waf-ingress.example.yaml` | Controller WAF vs sidecar |
| Compose → K8s (Ingress, Jobs, PVC not hostPath) | `platform/k8s/base` + Helm | Portable deployment |
| Cloudflare Tunnel | Day 7 optional | Expose lab without opening the home router |
| Vault | Compose profile `vault` / Day 6 | Secrets not in git; lab tokens only |
| Jenkins + Gitea + Argo CD + Nexus | Compose profiles + gitops | Classic CI + GitOps + artifacts |

If a lab disagrees with production Orqestra, **the lab wins for class** (RAM, no cloud). Take the *pattern* back to work, not the Compose passwords.
