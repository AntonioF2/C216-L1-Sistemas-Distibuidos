# Backend — C216 Sistemas Distribuídos

Backend desenvolvido nas atividades da disciplina C216 — Sistemas Distribuídos, utilizando Python e FastAPI.

## Tecnologias

- Python 3.14
- Poetry para gerenciamento de dependências
- FastAPI e Uvicorn para execução da API
- Pytest para testes automatizados
- Ruff para lint e formatação
- Docker e Docker Compose para containerização

## Instalação

Dentro da pasta `backend`, execute:

```bash
poetry install --with dev
```

## Executar a aplicação

```bash
poetry run uvicorn --app-dir src backend.main:app --reload
```

A API estará disponível em http://localhost:8000 e a documentação interativa em http://localhost:8000/docs.

## Executar os testes

```bash
poetry run pytest -v
```

## Verificar e formatar o código

```bash
poetry run ruff check .
poetry run ruff format .
```

## Estrutura

- `src/backend/`: código da aplicação.
- `tests/`: testes automatizados.
- `pyproject.toml`: configuração do projeto e dependências.
- `poetry.lock`: versões das dependências resolvidas pelo Poetry.
- `Dockerfile`: definição da imagem Docker do backend.