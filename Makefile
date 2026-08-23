# Run these targets from WSL or Git Bash (not cmd.exe).
# Usage: make <target>

SHELL := /bin/bash
COMPOSE := docker compose
COMPOSE_FILE := platform/compose/docker-compose.yml
ENV_FILE := .env

.PHONY: help env-check up down logs ps scan lint-docs sbom clean-reports tf-fmt k3s-check

help:
	@echo "DevSecOps bootcamp — common targets"
	@echo "  make env-check      Copy .env.example -> .env if missing"
	@echo "  make up             Start Day 2 core stack (edge on \$$NGINX_HTTP_PORT)"
	@echo "  make down           Stop core stack (keeps named volumes)"
	@echo "  make down-v         Stop and DELETE volumes (data loss lesson)"
	@echo "  make logs           Follow compose logs"
	@echo "  make ps             Show compose services"
	@echo "  make scan           Run local scanner gate (Syft/Grype/Gitleaks)"
	@echo "  make sbom           Generate SBOM for the API image"
	@echo "  make lint-docs      Fail on leftover localhost:80 / obvious secrets"
	@echo "  make tf-fmt         terraform fmt on platform/terraform"
	@echo "  make clean-reports  Remove generated scanner reports"

env-check:
	@if [ ! -f $(ENV_FILE) ]; then cp .env.example $(ENV_FILE); echo "Created $(ENV_FILE) from example"; else echo "$(ENV_FILE) exists"; fi
	@grep -q 'NGINX_HTTP_PORT' $(ENV_FILE)
	@grep -q 'APP_URL' $(ENV_FILE)

up: env-check
	$(COMPOSE) -f $(COMPOSE_FILE) --env-file $(ENV_FILE) up -d --build
	@echo "Edge: $$(grep '^APP_URL=' $(ENV_FILE) | cut -d= -f2-)"

down:
	$(COMPOSE) -f $(COMPOSE_FILE) --env-file $(ENV_FILE) down

down-v:
	$(COMPOSE) -f $(COMPOSE_FILE) --env-file $(ENV_FILE) down -v

logs:
	$(COMPOSE) -f $(COMPOSE_FILE) --env-file $(ENV_FILE) logs -f --tail=100

ps:
	$(COMPOSE) -f $(COMPOSE_FILE) --env-file $(ENV_FILE) ps

scan:
	bash security/scripts/scan-local.sh

sbom:
	bash security/scripts/sbom.sh

lint-docs:
	bash security/scripts/lint-docs.sh

tf-fmt:
	terraform fmt -recursive platform/terraform

clean-reports:
	rm -rf security/reports/*
	touch security/reports/.gitkeep

k3s-check:
	kubectl get nodes
	kubectl get pvc -A
