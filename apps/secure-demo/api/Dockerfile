# syntax=docker/dockerfile:1
# Secure Demo API — reference image (Day 1 exercise).
# Build from apps/secure-demo/api :  docker build -t secure-demo-api:day1 .
#
# Three stages: deps (prod modules) → test (fail build on red tests) → runner (small runtime).

# ----- stage: production node_modules only -----
FROM node:22-alpine AS deps
WORKDIR /app
# package-lock.json*  = copy lockfile if present (wildcard so the line does not fail)
COPY package.json package-lock.json* ./
# npm ci  = clean install from lockfile (repeatable). Fallback if lock missing.
# --omit=dev  = do not install mocha/eslint into the runtime image
RUN npm ci --omit=dev || npm install --omit=dev

# ----- stage: run unit tests during "docker build" -----
FROM node:22-alpine AS test
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY src ./src
COPY test ./test
RUN npm test

# ----- stage: what actually runs in Compose / k3s -----
FROM node:22-alpine AS runner
WORKDIR /app
RUN addgroup -S app && adduser -S -G app -u 10001 app \
  && mkdir -p /data/quarantine /data/clean /data/meta \
  && chown -R app:app /data
# Copy artifacts from "deps", not from "test" (test has extra packages)
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
USER 10001
ENV NODE_ENV=production
ENV PORT=3001
ENV DATA_DIR=/data
# Documentation only — Compose/K8s still map ports explicitly
EXPOSE 3001
# Compose waits on this. Node alpine may lack wget; use fetch.
HEALTHCHECK --interval=15s --timeout=10s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3001/health/live').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/index.js"]
