# Pedagogy map — outcomes to DevSec skills

| Day | Learner outcome | DevSec skill |
|-----|-----------------|--------------|
| 1 Git + Dockerfile | Repeatable image, non-root, no secrets in context | Supply-chain hygiene at build |
| 2 Compose + Terraform | Edge as only host port; named volumes | Trust boundary; data durability; IaC |
| 3 k3s on Linux VM | Deployments, Services, Ingress, PVC | No hostPath for data; RBAC intro |
| 4 Helm | Values per env; rollback | Config vs secret; gated sidecars |
| 5 CI | Gitea → Jenkins → registry | Credentials in the CI system; SBOM start |
| 6 GitOps + Vault | Git is desired state; secrets elsewhere | Drift; short-lived lab tokens |
| 7 Edge + malware | Headers, CRS/F5 concepts, ClamAV | WAF ≠ authz; CLEAN ≠ ACL |
| 8 Capstone | Run the path and scanners | Policy as code; CIS families |
| 9 Mobile | Phone hits the published origin | Device ≠ cluster; TLS; secrets stay server-side |

**Instructor move:** ask “where is the trust boundary?” every time someone publishes a port or copies a secret.

**Assessment:** Day 8 rubric in [`instructor/answer-keys.md`](../instructor/answer-keys.md). Daily self-checks are formative, not graded unless you say so.

**Compression:** Days 5–6 merge (CI morning, GitOps afternoon). Days 7–8 merge (headers + ClamAV morning, scanners + capstone afternoon). Day 9 is an optional workshop (Expo only if timeboxed). See [`instructor/schedule-5-day-compress.md`](../instructor/schedule-5-day-compress.md) and [`instructor/schedule-9-day.md`](../instructor/schedule-9-day.md).
