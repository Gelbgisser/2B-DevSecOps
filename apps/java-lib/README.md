# Java lab library — Day 5 only.

This module exists so Jenkins can demonstrate **Maven** and **Gradle** without turning the teaching API into a JVM app.

```bash
# Maven
cd apps/java-lib
mvn -q test

# Gradle (wrapper optional — class machines may use a packaged gradle)
gradle test
```

Publish the jar to Nexus (Day 5) or archive it as a Jenkins artifact.

Never put production secrets in `pom.xml` or `build.gradle`.
