# Backend — C216 Sistemas Distribuídos

API FastAPI para cadastro de serviços com PostgreSQL, SQLAlchemy e Alembic.
O fluxo é router → service → repository → banco. Schemas Pydantic validam
HTTP; modelos SQLAlchemy definem as tabelas.

## Instalação e execução local

Python 3.14 e Poetry 2.4.x. Com PostgreSQL do Compose iniciado, dentro de
`backend`, no PowerShell:

```powershell
$env:DATABASE_URL = "postgresql+psycopg://postgres:postgres@localhost:5432/c216"
python -m poetry install --with dev
python -m poetry run python -m alembic upgrade head
python -m poetry run python -m uvicorn --app-dir src backend.main:app --reload
```

No Compose a URL usa `db` como hostname. O serviço `migrate` aplica as
migrations antes da inicialização da API. Não usamos criação automática
de tabelas via `create_all`.

API: http://localhost:8000; documentação: http://localhost:8000/docs.

## Testes

Na raiz, inicie `docker compose --profile test up -d --wait db-test`.
Depois, dentro de `backend`:

```bash
python -m poetry run python -m pytest tests/unit -v
python -m poetry run python -m pytest tests/integration -v
python -m poetry run python -m pytest -v
python -m poetry run python -m ruff check .
python -m poetry run python -m ruff format .
```

Os unitários utilizam um dublê de repository. Os testes de integração
utilizam PostgreSQL real em `127.0.0.1:5433/c216_test`, com um schema
descartável por teste e migrations. Outra conexão pode ser configurada
por `TEST_DATABASE_URL`; o banco deve terminar em `_test`.

## Estrutura

- `src/backend/routers/`: endpoints e injeção da sessão.
- `src/backend/schemas/`: entrada/saída Pydantic.
- `src/backend/services/`: operações do cadastro.
- `src/backend/repositories/`: SQLAlchemy e transações.
- `src/backend/models/`: modelos ORM.
- `src/backend/database/`: base, engine e sessão.
- `src/backend/core/`: configuração por ambiente.
- `alembic/versions/`: histórico de alterações do banco.
- `tests/unit/` e `tests/integration/`: testes separados.
- `pyproject.toml` e `poetry.lock`: dependências reproduzíveis.

O CRUD de `/servicos` mantém GET, POST, PUT, PATCH e DELETE. Registros agora
sobrevivem ao reinício da API. Consulte o README da raiz para contratos,
exemplos, comandos de migrations e validação manual da persistência.
