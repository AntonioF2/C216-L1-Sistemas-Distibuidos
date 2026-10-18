.PHONY: help hello install lint format test run clean build up down logs ps shell db-shell docker-test test-verbose test-unit test-integration
.PHONY: up-build logs-api test-db-up db-upgrade db-migration db-current db-history

BACKEND_DIR := backend
POETRY := poetry
COMPOSE := docker compose
BACKEND_SERVICE := backend

help:
	@echo "Alvos disponíveis:"
	@echo "  make hello       - verifica se o Make está funcionando"
	@echo "  make install     - instala as dependências locais"
	@echo "  make lint        - verifica o código com Ruff"
	@echo "  make format      - formata o código com Ruff"
	@echo "  make test        - executa os testes locais"
	@echo "  make run         - inicia a API FastAPI localmente"
	@echo "  make clean       - remove caches do Python e das ferramentas"
	@echo "  make build       - cria as imagens Docker"
	@echo "  make up          - inicia backend e banco de dados"
	@echo "  make down        - para os serviços Docker"
	@echo "  make logs        - acompanha os logs dos serviços"
	@echo "  make ps          - lista os serviços em execução"
	@echo "  make shell       - abre um terminal no container backend"
	@echo "  make db-shell    - abre o terminal do PostgreSQL"
	@echo "  make docker-test - executa os testes no container"
	@echo "  make test-verbose - executa os testes com detalhes"
	@echo "  make test-unit - executa os testes unitários"
	@echo "  make test-integration - executa os testes HTTP"
	@echo "  make test-db-up - inicia PostgreSQL isolado de testes (porta 5433)"
	@echo "  make up-build - inicia ambiente e aplica migrations"
	@echo "  make logs-api - acompanha logs do backend"
	@echo "  make db-upgrade - aplica migrations no banco do Compose"
	@echo "  make db-migration msg=descricao - gera migration local para revisao"
	@echo "  make db-current - mostra versao atual do banco do Compose"
	@echo "  make db-history - mostra historico de migrations"

hello:
	@echo "Make esta funcionando!"

install:
	cd $(BACKEND_DIR) && $(POETRY) install --with dev

lint:
	cd $(BACKEND_DIR) && $(POETRY) run ruff check .

format:
	cd $(BACKEND_DIR) && $(POETRY) run ruff format .

test:
	cd $(BACKEND_DIR) && $(POETRY) run pytest

test-verbose:
	cd $(BACKEND_DIR) && $(POETRY) run pytest -v

test-unit:
	cd $(BACKEND_DIR) && $(POETRY) run pytest tests/unit -v

test-integration:
	cd $(BACKEND_DIR) && $(POETRY) run pytest tests/integration -v

run:
	cd $(BACKEND_DIR) && $(POETRY) run uvicorn --app-dir src backend.main:app --reload

clean:
	cd $(BACKEND_DIR) && python -c "from pathlib import Path; import shutil; [shutil.rmtree(path, ignore_errors=True) for path in Path('.').rglob('__pycache__')]; [shutil.rmtree(path, ignore_errors=True) for path in (Path('.pytest_cache'), Path('.ruff_cache'))]"

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

shell:
	$(COMPOSE) exec $(BACKEND_SERVICE) sh

db-shell:
	$(COMPOSE) exec db psql -U postgres -d c216

docker-test:
	$(COMPOSE) exec $(BACKEND_SERVICE) pytest

up-build: up

logs-api:
	$(COMPOSE) logs -f $(BACKEND_SERVICE)

test-db-up:
	$(COMPOSE) --profile test up -d --wait db-test

db-upgrade:
	$(COMPOSE) run --rm migrate

db-migration:
	cd $(BACKEND_DIR) && $(POETRY) run alembic revision --autogenerate -m "$(msg)"

db-current:
	$(COMPOSE) run --rm migrate python -m alembic current

db-history:
	cd $(BACKEND_DIR) && $(POETRY) run alembic history
