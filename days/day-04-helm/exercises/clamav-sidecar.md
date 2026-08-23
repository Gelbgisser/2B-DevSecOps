# Exercise — value-gated sidecar

Create `values-me.yaml` (gitignored if you put it next to `.env`):

```yaml
clamav:
  sidecar: true
```

Render, then decide if your VM has RAM to `helm upgrade`. If not, paste the rendered snippet into your notes and keep sidecar false on the cluster.
