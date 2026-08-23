# Day 6 solutions

Argo → Gitea: use the **in-cluster DNS name** or an Ingress host, never `localhost` from a pod.

Vault Secret not updating pods: Kubernetes does not hot-reload env vars. `rollout restart` is required unless you use a file-mounted agent.

Root token in `.env` is gitignored. If someone committed it, rotate and `git filter` is out of scope — treat as burned.
