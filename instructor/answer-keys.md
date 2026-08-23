# Answer keys & capstone rubric

Share **after** learners attempt the day. Daily `solutions/` folders are the technical spoilers.

## Capstone rubric (100 pts)

| Evidence | Points | Notes |
|----------|-------:|-------|
| Non-root image, no secrets in layers | 10 | `docker history` / `USER` |
| Browser via **edge** `APP_URL` | 10 | Not `:3001` on the host |
| Named volume or PVC survives restart | 15 | Show `SELECT` or file still there |
| CI green from Gitea (lite registry OK) | 15 | Jenkins console |
| Argo CD synced **or** documented Git apply | 10 | Screenshot or `argocd app get` |
| Secret from Vault (or Secret + written Vault plan) | 10 | No password in Git |
| Security headers on `curl -I` | 5 | At least nosniff + frame deny |
| Upload quarantine → ClamAV allow/deny | 10 | EICAR streamed, not a Windows file |
| SBOM + Grype artifact | 10 | `security/reports/` or Jenkins |
| Honest CIS / “back at work” notes | 5 | Verbal OK |

**Pass:** 70+. **Honors:** 90+ and Track B (k3s) or WAF profile.

## Day debug answers (short)

| Day | Challenge | Answer |
|-----|-----------|--------|
| 1 | Broken Dockerfile | WORKDIR/COPY mismatch; `EXPOSE` does not publish |
| 2 | 502 after rebuild | Startup DNS vs `resolver 127.0.0.11` |
| 3 | Empty endpoints | Selector ≠ pod labels |
| 4 | Immutable selector | Cannot change Deployment selector in-place |
| 5 | Jenkins clone fails | Use Compose DNS `gitea:3000`, not localhost |
| 6 | Argo cannot clone | In-cluster URL, not localhost |
| 7 | WAF blocks upload | Tune one CRS rule, not disable engine |
| 8 | Grype DB | Offline DB cache; do not drop the gate |
| 9 | Phone `Network request failed` | `localhost` is the phone; Windows Firewall / Public profile; cleartext/ATS blocked |

## Git push rejected

`git pull --rebase` then push. Never `--force` on `main`.
