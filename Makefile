.DEFAULT_GOAL := ajuda

POETRY := poetry -C liga-api

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

preparar:
	 $(POETRY) install

ambiente:
	 $(POETRY) env info

validar:
	 $(POETRY) check

lint:
	 $(POETRY) run ruff check src tests

formatar:
	 $(POETRY) run ruff format src tests

conferir-formato:
	 $(POETRY) run ruff format --check src tests


.PHONY: rodar testar

rodar:
	 $(POETRY) run python -m uvicorn liga_api.main:app --reload

testar:
	 $(POETRY) run python -m pytest -q

verificar: validar lint conferir-formato testar