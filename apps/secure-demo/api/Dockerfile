# syntax=docker/dockerfile:1
# Reference Dockerfile for the Secure Demo API (Day 1 exercise solution lives
# in days/day-01-dockerfile/solutions/). Pin by digest in class when you can.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev

FROM node:22-alpine AS test
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY src ./src
COPY test ./test
RUN npm test

FROM node:22-alpine AS runner
WORKDIR /app
RUN addgroup -S app && adduser -S -G app -u 10001 app \
  && mkdir -p /data/quarantine /data/clean /data/meta \
  && chown -R app:app /data
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
USER 10001
ENV NODE_ENV=production
ENV PORT=3001
ENV DATA_DIR=/data
EXPOSE 3001
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3001/health/live').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/index.js"]
