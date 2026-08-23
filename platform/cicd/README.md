# Jenkinsfiles

| File | Use |
|------|-----|
| `Jenkinsfile` | Node API tests, Syft, image build/push |
| `Jenkinsfile.maven` | `apps/java-lib` Maven |
| `Jenkinsfile.gradle` | `apps/java-lib` Gradle |

Point Jenkins “Pipeline script from SCM” at this directory. Credentials IDs `registry-lab` and `lab-app-url` are created in the Jenkins UI (Day 5) — never committed.
