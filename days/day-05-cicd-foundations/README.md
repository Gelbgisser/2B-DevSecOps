# Day 5 — CI foundations (Gitea, Jenkins, registry / Nexus)

**Timebox:** ~7 hours  
**Where:** Linux VM **or** WSL if you skip k3s today (Compose profiles). Prefer the VM so Day 6 Argo CD can reuse the same cluster.  
**RAM:** lite profile ~8 GB; `--profile cicd-full` (Nexus) wants **12+ GB**.

## Learning objectives

- Push application Git to a local Gitea
- Run a Jenkins declarative pipeline: checkout → test → SBOM → image → push
- Store credentials in Jenkins, not in the Jenkinsfile
- See Maven **and** Gradle on the tiny Java module
- Fail the pipeline when tests fail
- Generate a first SBOM (Syft) as a security habit

## Public ports (lite)

| Service | Host port (`.env`) | URL |
|---------|--------------------|-----|
| Gitea | `GITEA_HTTP_PORT=3000` | `http://<vm-ip>:3000` |
| Jenkins | `JENKINS_HTTP_PORT=8090` | `http://<vm-ip>:8090` |
| Registry | `REGISTRY_HTTP_PORT=5000` | `localhost:5000` on the VM |
| Nexus (optional) | `NEXUS_HTTP_PORT=8081` | `http://<vm-ip>:8081` |

These are **lab consoles**, not the Secure Demo edge. The shop still goes through `APP_URL` (Ingress or NGINX 3080).

---

## Lab 1 — Start CI (lite)

On the VM, repo root:

```bash
cp -n .env.example .env
docker compose -f platform/compose/docker-compose.yml --env-file .env --profile cicd up -d
docker compose -f platform/compose/docker-compose.yml --env-file .env --profile cicd ps
```

First Jenkins boot can take several minutes. Gitea uses the admin user from `.env` (`GITEA_ADMIN_USER`).

**Lite vs full:** omit Nexus unless you have RAM. The Docker registry service is enough to teach “push an artifact”.

---

## Lab 2 — Create a Gitea repo

1. Open Gitea in the browser (VM IP + port 3000).
2. Create repository `secure-demo` (not public on the internet — lab LAN only).
3. On the VM:

```bash
git remote add gitea http://localhost:3000/<you>/secure-demo.git
# or http://<vm-ip>:3000/...
git push -u gitea lab/$USER-day05
```

Use a **Gitea token** or the lab password from `.env`. Do not put the password in the remote URL that you later commit (`.git/config` is local).

---

## Lab 3 — Jenkins job

1. Jenkins → New Item → Pipeline.
2. Definition: **Pipeline script from SCM**, Git, Gitea clone URL.
3. Script path: `platform/cicd/Jenkinsfile`.
4. Credentials: add username/password **in Jenkins** named `registry-lab` (even a dummy user if the registry is open). Add `lab-app-url` as a secret text `http://<vm-ip>` (your real `APP_URL`).

Run the job. Expected: **Test API** green.

Install Node on the Jenkins controller if the image has no `node` (Day 5 stretch: use a Jenkins agent with Node, or wrap tests in a Docker agent). **Pragmatic class path:**

```groovy
// temporary in a branch — tests inside a node container
docker.image('node:22-alpine').inside {
  dir('apps/secure-demo/api') {
    sh 'npm install && npm test'
  }
}
```

Prefer fixing the agent over skipping tests.

---

## Lab 4 — Fail on tests

In a branch, break `apps/secure-demo/api/test/api.test.js` (wrong expected message). Push. Job must go **red**. Revert.

---

## Lab 5 — Maven and Gradle

```bash
cd apps/java-lib
# if Maven/Gradle exist on the VM:
mvn -q test
gradle test --no-daemon || true
```

Jenkinsfiles:

- `platform/cicd/Jenkinsfile.maven`
- `platform/cicd/Jenkinsfile.gradle`

Create two **freestyle or pipeline** jobs pointing at those files. Archive `target/*.jar` when Maven works.

Nexus (full profile): create a raw or maven2 hosted repo and `mvn deploy` using credentials stored in Jenkins (`nexus-lab`). Never paste the Nexus admin password into `pom.xml`.

---

## Exercise

Fork/push **your** tree to Gitea and get a **green** Jenkins build for the Node API. Screenshot or paste the console URL in your notes (not into git).

## Security habit

- Lockfiles: `package-lock.json` / Maven coordinates. Class debate: `npm ci` vs `npm install`; do not `--ignore-scripts` blindly in CI (you want to know what install scripts do — pin and review instead).
- Syft in the Jenkinsfile writes `security/reports/sbom-api.json` (gitignored). Keep the **script** in git, not the report with host paths if they contain secrets.

## Debug challenge

Jenkins cannot clone Gitea: `connection refused`. Which hostname should the **Jenkins container** use — `localhost:3000` or `gitea:3000`?

[`solutions/README.md`](solutions/README.md)

## Self-check

- [ ] Gitea holds my branch
- [ ] Jenkins credentials, not passwords in Jenkinsfile
- [ ] Red build on failed tests
- [ ] I know where Maven vs Gradle files live
- [ ] SBOM stage ran or I documented why Syft is missing
