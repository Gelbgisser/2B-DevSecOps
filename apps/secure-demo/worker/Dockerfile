FROM node:22-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S -G app -u 10001 app
COPY package.json ./
COPY src ./src
USER 10001
CMD ["node", "src/index.js"]
