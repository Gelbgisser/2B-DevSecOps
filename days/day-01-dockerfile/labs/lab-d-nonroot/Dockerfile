FROM node:22-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S -G app -u 10001 app
COPY server.js .
USER 10001
EXPOSE 3000
CMD ["node", "server.js"]
