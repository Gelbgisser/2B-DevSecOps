FROM node:22-alpine
WORKDIR /app
# -S  system user/group (no login shell). uid 10001 is conventional for "app".
RUN addgroup -S app && adduser -S -G app -u 10001 app
COPY server.js .
# Drop root BEFORE the process starts.
USER 10001
EXPOSE 3000
CMD ["node", "server.js"]
