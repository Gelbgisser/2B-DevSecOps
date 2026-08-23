# Unprivileged nginx listens on 8080. Internal-only — the edge publishes the host port.
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY index.html /usr/share/nginx/html/index.html
EXPOSE 8080
