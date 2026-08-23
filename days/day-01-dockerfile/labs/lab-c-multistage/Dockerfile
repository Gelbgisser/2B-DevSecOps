# Multi-stage: compile in a fat image, ship a tiny image.
#
# Stage name "builder" — discarded except for files we COPY --from.
FROM golang:1.22-alpine AS builder
WORKDIR /src
COPY main.go .
# -ldflags="-s -w"  strip debug symbols (smaller binary)
RUN go build -ldflags="-s -w" -o /hello main.go

# Fresh small OS. No Go compiler in the final image.
FROM alpine:3.20
# -D  no password, -H  no home, -u 10001  stable uid for K8s runAsUser later
RUN adduser -D -H -u 10001 app
COPY --from=builder /hello /hello
USER 10001
CMD ["/hello"]
