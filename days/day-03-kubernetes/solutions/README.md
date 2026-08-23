# Day 3 solutions

> Try the labs first.

## Empty endpoints

`spec.selector` must match **pod template labels**, not the Deployment name. `app: api-typo` matches nothing → `Endpoints: <none>`.

```bash
kubectl -n secure-demo get pods --show-labels
kubectl -n secure-demo get ep api
```

## Wrong kubeconfig

Laptop Docker Desktop / leftover kind context vs k3s on the VM. Always `kubectl config current-context` and `kubectl get nodes` **on the VM**.

## Persistence

If the row vanished, the pod used `emptyDir` or a new PVC name. Check `claimName` on the Deployment.
