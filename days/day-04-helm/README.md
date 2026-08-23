# Day 4 — Helm

**Timebox:** ~6 hours  
**Where:** Linux VM with k3s (Day 3)  
**Prerequisites:** `kubectl` talks to k3s; images imported

## Learning objectives

- Chart vs values vs templates vs release
- `helm lint`, `helm template`, `helm upgrade --install`
- Dev vs staging values (replicas, resources, ingress host)
- Rollback
- Value-gated ClamAV sidecar (annotation/sidecar flags)
- Never commit real secret values files

## Agenda

| Block | Minutes | What |
|------:|--------:|------|
| 1 | 40 | Chart tour |
| 2 | 50 | lint / template / install |
| 3 | 40 | values-dev vs values-staging |
| 4 | 40 | Break a template, `helm get manifest` |
| 5 | 30 | Rollback |
| Ex | 50 | ClamAV sidecar flag |
| Self-check | 15 | |

Chart path: [`platform/helm/secure-demo`](../../platform/helm/secure-demo).

---

## Lab 1 — Render locally (no cluster required for this step)

```bash
helm lint platform/helm/secure-demo
helm template demo platform/helm/secure-demo \
  -f platform/helm/secure-demo/values.yaml \
  -f platform/helm/secure-demo/values-dev.yaml \
  --set appUrl=http://$(hostname -I | awk '{print $1}')
```

Expected: YAML for Deployments, Services, Ingress, PVCs. No passwords in the rendered ConfigMap.

---

## Lab 2 — Install / upgrade

Secret must exist first (Helm does not create lab passwords by default):

```bash
kubectl apply -f platform/k8s/base/secret.example.yaml
helm upgrade --install secure-demo platform/helm/secure-demo \
  -n secure-demo --create-namespace \
  -f platform/helm/secure-demo/values.yaml \
  -f platform/helm/secure-demo/values-dev.yaml \
  --set appUrl="http://$(hostname -I | awk '{print $1}')" \
  --set existingSecret=secure-demo-db
kubectl -n secure-demo get pods
helm status secure-demo -n secure-demo
```

If you already applied raw manifests in Day 3, Helm may refuse ownership. Either `helm upgrade --install` into a **new** namespace (`secure-demo-helm`) or delete the Day 3 Deployments **after** you are sure PVCs should stay.

---

## Lab 3 — Staging values

```bash
helm upgrade secure-demo platform/helm/secure-demo -n secure-demo \
  -f platform/helm/secure-demo/values.yaml \
  -f platform/helm/secure-demo/values-staging.yaml \
  --set appUrl="http://$(hostname -I | awk '{print $1}')"
kubectl -n secure-demo get deploy api -o jsonpath='{.spec.replicas}{"\n"}'
```

Expected: `2` replicas from staging values.

---

## Lab 4 — Broken template

Temporarily rename a required field in `templates/api.yaml` (e.g. break `matchLabels`) and run `helm template`. Fix it using:

```bash
helm get manifest secure-demo -n secure-demo | head
helm get values secure-demo -n secure-demo
```

---

## Lab 5 — Rollback

```bash
helm history secure-demo -n secure-demo
helm rollback secure-demo 1 -n secure-demo
```

---

## Exercise — ClamAV sidecar flag

In `values.yaml`, `clamav.sidecar` is `false`. Set it `true` in a **personal** values file (do not commit a huge ClamAV image pull on a 8 GB VM unless RAM allows).

```bash
helm template demo platform/helm/secure-demo --set clamav.sidecar=true | grep -A2 'name: clamav'
```

Done when the rendered Deployment has a `clamav` container. Full virus-scan wiring is Day 7.

Optional: `--set clamav.annotation=true` and find the example WAF annotation in the API template.

## Security habit

`values-prod-secrets.yaml.example` exists so you **never** invent `values-prod-secrets.yaml` with real tokens. Day 6 uses Vault instead.

## Debug challenge

`helm upgrade` fails with `cannot patch ... field is immutable` on a Deployment selector. What did you change in `values` vs labels in `templates/api.yaml`? (Selectors are not values — they are template labels.)

[`solutions/README.md`](solutions/README.md)

## Self-check

- [ ] `helm lint` is clean
- [ ] I can switch replica counts via values files
- [ ] I rolled back a release
- [ ] I did not commit a filled secrets values file

### In production / cloud

You would keep this chart and swap values: `persistence.storageClass`, Ingress host + cert-manager, replica counts, and often `postgres.enabled=false` with `DATABASE_URL` pointing at a managed database. [`values-cloud.yaml.example`](../../platform/helm/secure-demo/values-cloud.yaml.example) and [`docs/02-lab-to-cloud.md`](../../docs/02-lab-to-cloud.md).
