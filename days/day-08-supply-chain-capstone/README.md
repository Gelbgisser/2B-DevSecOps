# Day 8 — Supply chain, CIS themes, capstone

**Timebox:** 6–8 hours (capstone 4–6 hours)  
**Where:** Your laptop + VM as you actually have them.

## Learning objectives

- Run Syft → Grype (fail on CRITICAL) → Gitleaks → Semgrep (Trivy optional)
- Use a written exception process, not silent scanner deletion
- Map CIS-style families (identity, encryption, logging, least privilege) to **this** lab
- Deploy the full path yourself (definition of done in the root README)

## Lab 1 — Scanner gate

Install tools in WSL or the VM (any missing tool: document and install one):

```bash
# examples — pick current install docs if URLs move
curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b ~/.local/bin
curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b ~/.local/bin
```

```bash
export PATH="$HOME/.local/bin:$PATH"
make sbom
make scan
```

Reports land in `security/reports/` (gitignored). Thresholds: [`security/policies/thresholds.yaml`](../../security/policies/thresholds.yaml). Exceptions: [`security/policies/exceptions.md`](../../security/policies/exceptions.md).

If Grype fails on CRITICAL in `node_modules`, that is a **real** teaching moment: pin, patch, or exception with expiry — do not delete the stage.

Gitleaks:

```bash
gitleaks detect --source . --no-git -c security/policies/gitleaks.toml || true
```

Semgrep:

```bash
semgrep --config security/policies/semgrep-rules.yaml apps/secure-demo/api
```

---

## Lab 2 — CIS / hardening themes (discussion + light demo)

| Family | What you already did | Stretch |
|--------|----------------------|---------|
| Identity | Mock header is **not** authz; RBAC Role is read-only | Real OIDC later |
| Encryption | Lab is HTTP; HSTS commented until TLS | Traefik TLS |
| Logging | JSON access logs + `X-Request-Id` | Ship to a SIEM |
| Least privilege | non-root UID, dropped caps, no DB host ports | NetworkPolicies |
| Secrets | `.env` gitignored; Vault on Day 6 | Short-lived creds |
| Supply chain | SBOM + Grype | Sign images (cosign) — mention only |
| Kubernetes CIS | `local-path` not hostPath for DB | `kube-bench` if RAM allows |

kube-bench (optional):

```bash
kubectl apply -f https://raw.githubusercontent.com/aquasecurity/kube-bench/main/job.yaml
# then kubectl logs job/kube-bench
```

NGINX/F5 CIS control families: TLS, logging, WAF policy, least-privilege listeners — map them to `headers.conf` and the example Ingress annotations. You are not installing F5.

---

## Capstone (4–6 h)

Work from the [root definition of done](../../README.md#capstone-definition-of-done). Pick **one** runtime:

**Track A — Compose (RAM-safe):** Dockerfile + `make up` + ClamAV profile + `make scan` + Jenkins lite if possible.

**Track B — k3s:** Helm on k3s + PVC still Bound after restart + Argo sync + Vault-updated Secret + Ingress `APP_URL`.

Instructor rubric: [`instructor/answer-keys.md`](../../instructor/answer-keys.md).

### Back at work (one pager)

Write 10–15 lines in your notes (not required in git):

1. What we will stop doing (secrets in images, DB on host ports, `latest` tags).
2. What we will start doing (edge as trust boundary, SBOM in CI, GitOps for k8s).
3. Who owns exceptions when Grype goes red.

## Debug challenge

`make scan` fails because Grype cannot download its DB (air-gapped VM). What is the official offline DB workflow at a high level (no need to complete it)? See troubleshooting.

## Self-check

- [ ] SBOM file exists locally
- [ ] I can explain fail-on CRITICAL
- [ ] Capstone checklist ticked honestly
- [ ] I did not force-push secrets to Gitea
