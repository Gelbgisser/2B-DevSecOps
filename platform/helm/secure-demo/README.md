# Helm chart — secure-demo

Same app as `platform/k8s/base`, parameterized.

```bash
helm lint platform/helm/secure-demo
helm template demo platform/helm/secure-demo -f platform/helm/secure-demo/values-dev.yaml
```

| Values file | Use |
|-------------|-----|
| `values.yaml` | Lab defaults (`local-path` PVCs) |
| `values-dev.yaml` / `values-staging.yaml` | Replica and host knobs |
| `values-cloud.yaml.example` | **Not for class** — shows `gp3`, TLS annotations, managed DB switch |
| `values-prod-secrets.yaml.example` | Reminder: never commit real secrets |

Persistence and Ingress mapping: [`docs/02-lab-to-cloud.md`](../../../docs/02-lab-to-cloud.md).
