# Kubernetes manifests (k3s)

Primary cluster: **k3s on a Linux VM** ([`docs/00-linux-vm-k3s.md`](../../docs/00-linux-vm-k3s.md)).

```bash
kubectl apply -f platform/k8s/base/secret.example.yaml
./platform/k8s/base/apply.sh
```

- Services are ClusterIP. Traefik is the edge (host 80 on the VM).
- PVCs use StorageClass `local-path`. Do not switch Postgres to hostPath.
- Import locally built images with `docker save | sudo k3s ctr images import -`.

Helm chart: [`../helm/secure-demo`](../helm/secure-demo).  
F5/WAF annotation example: [`examples/f5-waf-ingress.example.yaml`](examples/f5-waf-ingress.example.yaml).
