# Glossary

| Term | Meaning in this course |
|------|------------------------|
| **Edge** | The only process that publishes a host port (NGINX, Traefik Ingress, or Cloudflare Tunnel). |
| **APP_URL** | Browser origin **including port** if not 80/443. Never invent `:80`. |
| **Compose DNS** | Names like `api`, `postgres` on the Docker network. Browsers cannot use them. |
| **PVC** | PersistentVolumeClaim. k3s `local-path` stores data on the **VM disk**. |
| **hostPath** | Bind a node folder into a pod. We avoid it for databases in class. |
| **GitOps** | Cluster state matches a Git path (Argo CD). kubectl edits are drift. |
| **SBOM** | Software bill of materials (Syft). What you shipped, in a file. |
| **CRS** | OWASP Core Rule Set for ModSecurity. High false-positive rate until tuned. |
| **Quarantine** | Upload storage before a CLEAN scan. Not a public bucket prefix. |
| **Lite mode** | Skip Nexus UI and WAF image; use `registry:2`. |
| **Lab secret** | Password in `.env.example`. Burned for production use. |
| **k3s** | Lightweight Kubernetes on the Linux VM (Days 3+). |
| **WSL** | Windows Subsystem for Linux. Default shell for Days 1–2 commands. |
