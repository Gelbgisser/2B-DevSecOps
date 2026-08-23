# Hello image — smallest useful Dockerfile
#
# Docker runs this file TOP TO BOTTOM. Each line is usually a cached "layer".
# Build from THIS folder (the context), not from the repo root:
#   docker build -t lab-a-hello:1 .

# FROM = starting filesystem + Node binary. "alpine" = small Linux.
# Tag "22-alpine" can move; production often pins @sha256:...
FROM node:22-alpine

# WORKDIR = cd for later instructions. Created if missing.
WORKDIR /usr/src/app

# COPY from context → image. "server.js" is next to this Dockerfile.
# "." means current WORKDIR (/usr/src/app/server.js).
COPY server.js .

# EXPOSE is documentation + hint for tools. It does NOT publish localhost.
# You still need: docker run -p 3000:3000
EXPOSE 3000

# CMD = default process. JSON form = no /bin/sh wrapper.
CMD ["node", "server.js"]
