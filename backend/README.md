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

## Cadastro de serviços — Prática 4

`main.py` apenas inicializa a aplicação e registra os routers. As pastas
`routers`, `schemas` e `services` separam HTTP, validação Pydantic e operações.

O recurso `/servicos` aceita POST e GET; `/servicos/{servico_id}` aceita GET,
PUT, PATCH e DELETE. A listagem aceita o filtro opcional `ativo`.
PUT substitui todos os campos editáveis; PATCH altera apenas os enviados.
IDs inexistentes geram 404 e dados inválidos geram 422.

Os registros ficam em memória e são perdidos ao reiniciar o processo.
O cadastro ainda não utiliza PostgreSQL e não verifica a saúde das URLs.

Execute separadamente, dentro de `backend`:

```bash
poetry run pytest tests/unit -v
poetry run pytest tests/integration -v
```

`poetry run pytest -v` executa todas as categorias, inclusive no CI.
Consulte o README da raiz para exemplos dos corpos JSON e comandos Make.
