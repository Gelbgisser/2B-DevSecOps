# Multi-stage: builder has compilers; final image is tiny.
FROM golang:1.22-alpine AS builder
WORKDIR /src
COPY main.go .
RUN go build -ldflags="-s -w" -o /hello main.go

FROM alpine:3.20
RUN adduser -D -H -u 10001 app
COPY --from=builder /hello /hello
USER 10001
CMD ["/hello"]
