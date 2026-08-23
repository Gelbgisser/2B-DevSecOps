# Day 5 solutions

> Try first.

Jenkins → Gitea: from **inside Compose**, `localhost:3000` is the Jenkins container, not Gitea. Use `http://gitea:3000/<org>/<repo>.git`. From the **Windows browser**, use `http://<vm-ip>:3000`.

Docker socket in Jenkins is a **lab shortcut** (Jenkins as root). Production uses agents without mounting `/var/run/docker.sock`.
