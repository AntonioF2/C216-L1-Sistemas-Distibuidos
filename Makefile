.DEFAULT_GOAL := ajuda

POETRY := poetry -C liga-api
COMPOSE := docker compose

.PHONY: ajuda preparar ambiente validar lint formatar conferir-formato verificar

ajuda:
	@echo "Comandos do Mesa da Rodada:"
	@echo "  make preparar         - instala as dependencias Python"
	@echo "  make ambiente         - mostra o ambiente virtual"
	@echo "  make validar          - valida o projeto Poetry"
	@echo "  make lint             - verifica o codigo Python"
	@echo "  make formatar         - formata o codigo Python"
	@echo "  make conferir-formato - verifica a formatacao"
	@echo "  make verificar        - executa as verificacoes iniciais"
	@echo "  make rodar            - inicia a API em desenvolvimento"
	@echo "  make testar           - executa os testes do backend"
	@echo "  make docker-configurar - cria .env local sem sobrescrever o existente"
	@echo "  make docker-validar   - valida a configuracao do Compose"
	@echo "  make docker-construir - constroi a imagem da API"
	@echo "  make docker-subir     - constroi e inicia os servicos"
	@echo "  make docker-estado    - mostra os containers"
	@echo "  make docker-logs      - mostra os logs recentes"
	@echo "  make docker-checar    - verifica API, rede e banco"
	@echo "  make docker-verificar-volume - testa dados apos recriar containers"
	@echo "  make docker-parar     - encerra os servicos e preserva o volume"

preparar:
	 $(POETRY) install

ambiente:
	 $(POETRY) env info

validar:
	 $(POETRY) check

lint:
	 $(POETRY) run ruff check src tests ../scripts

formatar:
	 $(POETRY) run ruff format src tests ../scripts

conferir-formato:
	 $(POETRY) run ruff format --check src tests ../scripts


.PHONY: rodar testar

rodar:
	 $(POETRY) run python -m uvicorn liga_api.main:app --reload

testar:
	 $(POETRY) run python -m pytest -q

verificar: validar lint conferir-formato testar

.PHONY: docker-configurar docker-validar docker-construir docker-subir docker-estado docker-logs docker-checar docker-verificar-volume docker-parar

docker-configurar:
	python -c "from pathlib import Path; import secrets; destino = Path('.env'); modelo = Path('.env.example').read_text(encoding='utf-8'); conteudo = modelo.replace('MESA_DB_SENHA=', 'MESA_DB_SENHA=' + secrets.token_hex(24), 1); print('.env existente preservado.') if destino.exists() else (destino.write_text(conteudo, encoding='utf-8'), print('.env local criado com senha aleatoria.'))"

docker-validar:
	$(COMPOSE) config --quiet

docker-construir: docker-validar
	$(COMPOSE) build api-mesa

docker-subir: docker-validar
	$(COMPOSE) up --detach --build --wait --wait-timeout 120

docker-estado:
	$(COMPOSE) ps --all

docker-logs:
	$(COMPOSE) logs --tail 80

docker-checar:
	python scripts/verificar_docker.py

docker-verificar-volume:
	python scripts/verificar_docker.py --persistencia

docker-parar:
	$(COMPOSE) down
