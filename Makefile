.PHONY: help hello install lint format test run clean

BACKEND_DIR := backend
POETRY := poetry

help:
	@echo "Alvos disponíveis:"
	@echo "  make hello  - verifica se o Make está funcionando"
	@echo "  make install - instala as dependências do backend"
	@echo "  make lint    - verifica o código com Ruff"
	@echo "  make format  - formata o código com Ruff"
	@echo "  make test    - executa os testes"
	@echo "  make run     - inicia a API FastAPI"
	@echo "  make clean   - remove caches gerados"
	@echo "  make help    - exibe esta ajuda"

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

run:
	cd $(BACKEND_DIR) && $(POETRY) run uvicorn backend.main:app --reload

clean:
	cd $(BACKEND_DIR) && $(POETRY) run python -c "from pathlib import Path; import shutil; [shutil.rmtree(path, ignore_errors=True) for path in Path('.').rglob('__pycache__')]; [shutil.rmtree(path, ignore_errors=True) for path in (Path('.pytest_cache'), Path('.ruff_cache'))]"
