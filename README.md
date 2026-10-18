# C216-L1 Sistemas Distribuídos

Repositório das práticas de Sistemas Distribuídos. A Prática 5 evolui o
cadastro de serviços da Prática 4 para persistência PostgreSQL com SQLAlchemy
e migrations Alembic, preservando os contratos HTTP e os testes anteriores.

## Arquitetura

```text
FastAPI / routers → services → repositories → SQLAlchemy → PostgreSQL
```

- `backend/src/backend/main.py`: inicialização e registro de routers.
- `routers/`: HTTP, códigos de resposta e injeção de dependências.
- `schemas/`: validação Pydantic, independente das tabelas ORM.
- `services/`: operações do cadastro e conversão para respostas.
- `repositories/`: consultas e gravações, com commit/rollback.
- `models/`: tabela ORM `servicos`.
- `database/`: base ORM, engine e sessão por requisição.
- `core/`: leitura de `DATABASE_URL` do ambiente.
- `backend/alembic/`: migrations versionadas; não se usa `create_all`.
- `backend/tests/unit/`: testes sem banco, com dublê de repository.
- `backend/tests/integration/`: HTTP, repository e migrations com PostgreSQL real.

## Ambiente Docker

Pré-requisitos: Docker com Compose. Para execução local: Python 3.14,
Poetry 2.4.x e, opcionalmente, Make.

```bash
make up-build
make ps
make db-current
```

Equivalentes sem Make:

```bash
docker compose up -d --build
docker compose ps
docker compose run --rm migrate python -m alembic current
```

O Compose inicia PostgreSQL, executa o serviço temporário `migrate` e só
inicia a API se as migrations terminarem com sucesso. O serviço `migrate`
encerrar com código 0 é normal. A imagem instala as versões de
`pyproject.toml` e `poetry.lock`.

API: http://localhost:8000
Swagger UI: http://localhost:8000/docs

O Compose usa valores didáticos locais para usuário, senha e banco. Para
personalizar, copie `.env.example` para `.env` na raiz e ajuste
`POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB`. O arquivo `.env`
não é versionado. As credenciais da URL precisam estar codificadas para URL
quando contiverem caracteres especiais. Alterar essas variáveis não modifica
usuários já existentes em um volume inicializado.

Dentro do Compose, o hostname do banco é `db`; fora dos containers, é
`localhost`. A URL deve usar o driver `postgresql+psycopg://`.

## Execução local da API

Inicie o banco com `docker compose up -d --wait db`. No PowerShell:

```powershell
$env:DATABASE_URL = "postgresql+psycopg://postgres:postgres@localhost:5432/c216"
cd backend
python -m poetry install --with dev
python -m poetry run python -m alembic upgrade head
python -m poetry run python -m uvicorn --app-dir src backend.main:app --reload
```

A aplicação e o Alembic leem a variável exportada no terminal; não carregam
`.env` automaticamente. Não inicie API local e container na mesma porta.
`python -m poetry` também pode ser usado quando o launcher `poetry.exe`
estiver indisponível.

## Endpoints

| Método | Caminho | Operação | Sucesso |
| --- | --- | --- | --- |
| GET | `/` | Relatório de saúde da aplicação | 200 |
| POST | `/servicos` | Criar serviço | 201 |
| GET | `/servicos?ativo=true` | Listar, com filtro opcional | 200 |
| GET | `/servicos/{servico_id}` | Buscar | 200 |
| PUT | `/servicos/{servico_id}` | Substituir todos os campos editáveis | 200 |
| PATCH | `/servicos/{servico_id}` | Alterar somente os campos enviados | 200 |
| DELETE | `/servicos/{servico_id}` | Excluir, sem corpo na resposta | 204 |

O ID é gerado pelo PostgreSQL. Nome: 1 a 100 caracteres, removendo espaços
nas extremidades. URL: HTTP ou HTTPS. Campos desconhecidos são rejeitados.
IDs inexistentes retornam 404; dados inválidos e IDs não positivos, 422.

POST permite omitir `ativo` (padrão `true`). PUT exige todos os campos
editáveis. PATCH preserva campos omitidos, rejeita `null` e aceita `{}`
como atualização sem mudanças.

Corpo de POST/PUT:

```json
{"nome": "Catálogo", "url": "https://example.com/", "ativo": true}
```

Corpo de PATCH:

```json
{"ativo": false}
```

## Migrations

A migration inicial `0001_create_servicos` reproduz a tabela a partir de
um banco vazio. Os comandos de inspeção/aplicação usam o banco do Compose:

```bash
make db-upgrade
make db-current
make db-history
```

Para alterar o modelo e gerar uma nova migration, exporte `DATABASE_URL`
local como acima e, na raiz, execute:

```bash
make db-migration msg="adiciona descricao"
```

Sem Make, dentro de `backend`:

```bash
python -m poetry run python -m alembic revision --autogenerate -m "adiciona descricao"
python -m poetry run python -m alembic upgrade head
python -m poetry run python -m alembic current
python -m poetry run python -m alembic history
python -m poetry run python -m alembic check
```

Revise o arquivo gerado antes de aplicar. Versione modelo e migration juntos.
Após editar arquivos, reconstrua as imagens com `make up-build` para que
o container receba as novas migrations. Não apague o banco para atualizar
sua estrutura.

## Testes e CI

Inicie o banco exclusivo de testes (porta 5433):

```bash
make test-db-up
make install
make lint
make test-unit
make test-integration
make test
```

Sem Make, na raiz:

```powershell
docker compose --profile test up -d --wait db-test
cd backend
python -m poetry install --with dev
python -m poetry run python -m ruff check .
python -m poetry run python -m pytest -v
```

Por padrão, os testes de integração usam
`postgresql+psycopg://postgres:postgres@127.0.0.1:5433/c216_test`.
Para outro ambiente, exporte `TEST_DATABASE_URL` apontando para um banco
exclusivo com nome terminado em `_test`. Nunca use o banco da aplicação.

Cada teste cria um schema aleatório, aplica as migrations, executa as
operações com commits reais e remove apenas seu próprio schema no final.
A conta de testes precisa de permissão para criar schemas. O banco indisponível
faz os testes falharem; eles não são silenciosamente ignorados.

Os testes verificam endpoints, validação, commit visível em outra sessão,
rollback após falha, exclusão persistida e upgrade/downgrade das migrations.
Os testes unitários continuam independentes do PostgreSQL.

Para rodar a suíte dentro do backend já iniciado:

```bash
make test-db-up
make docker-test
```

O workflow `ci-backend.yml` fornece PostgreSQL de teste, aplica e verifica
migrations, executa lint e toda a suíte em `push` e `pull_request`.

## Comprovar a persistência após reiniciar

1. Inicie o ambiente e crie um serviço em `/docs`.
2. Anote o ID e confirme GET `/servicos/{id}`.
3. Execute `docker compose restart backend`.
4. Repita o GET: o mesmo registro deve continuar disponível.
5. Opcionalmente confira no banco:

```bash
docker compose exec db psql -U postgres -d c216 -c "SELECT * FROM servicos;"
```

`make down` preserva o volume `postgres_data`. Não use `down -v` se quiser
manter os registros. O banco de testes é descartável e usa tmpfs.

## Limites da prática

O cadastro não monitora as URLs informadas. A rota `/` é um relatório de
saúde da aplicação, não uma checagem de conectividade PostgreSQL. A API é
didática, sem autenticação; as credenciais de exemplo são para uso local.
