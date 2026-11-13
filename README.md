# C216-L1 Sistemas Distribuídos

Repositório das práticas de Sistemas Distribuídos. Na Prática 7, o frontend
React consome a API FastAPI e persiste o cadastro de serviços no PostgreSQL.
É possível cadastrar, listar, consultar detalhes, editar, ativar/desativar e excluir.
Os dados permanecem após recarregar a página.

## Arquitetura

```text
React → fetch → FastAPI / routers → services → repositories → SQLAlchemy → PostgreSQL
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

Pré-requisitos: Docker com Compose 2.24.4 ou superior. Para os testes locais:
Python 3.14, Poetry 2.4.x, Node.js 22.12 ou superior, npm e Make.

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
inicia a API se as migrations terminarem com sucesso. O frontend inicia
após o healthcheck da API. O serviço `migrate`
encerrar com código 0 é normal. A imagem instala as versões de
`pyproject.toml` e `poetry.lock`.

Frontend: http://localhost:5173
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
Nomes repetidos retornam 409 com a mensagem "Já existe um serviço com esse nome".
Essa regra também vale para PUT e PATCH; manter o próprio nome é permitido.

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
um banco vazio. A migration `0002_unique_servico_nome` acrescenta a restrição
de nome único, sem apagar ou renomear registros existentes. Se um banco antigo
contiver nomes repetidos, eles devem ser resolvidos antes dessa migration.
Os comandos de inspeção/aplicação usam o banco do Compose:

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

Na primeira execução, instale as dependências e o navegador dos testes:

```bash
make install
make frontend-install
cd frontend
npx playwright install chromium
cd ..
make check-all
```

`make check-all` verifica Ruff, Pytest, Biome, Vitest, build e E2E.
Ele inicia o banco de testes do backend e exige Docker em execução.
O Makefile utiliza `python -m poetry` por padrão para também funcionar
quando o Windows bloqueia o launcher `poetry.exe`.

Os testes Vitest simulam `fetch`; não dependem da API nem do banco.
`make e2e` sobe a stack Compose isolada `lab-e2e`, aplica migrations,
executa o Playwright em `http://localhost:5174` (API na porta 8001) e
remove containers e volume exclusivos dessa stack ao terminar, inclusive em falhas.
O volume de desenvolvimento é preservado. `make frontend-test-e2e` usa uma
stack já iniciada, com `E2E_BASE_URL` opcional (padrão `http://localhost:5173`).

O workflow `ci-frontend.yml` mantém lint/formatação em um job e os testes
em outro que depende do primeiro, executando `make e2e` para a validação full-stack.

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

## Frontend e CORS

O frontend concentra GET, POST, PUT, PATCH e DELETE em
`frontend/src/services/servicos.js`. O estado e as operações da tela ficam em
`frontend/src/hooks/useServicos.js`. O formulário aguarda a resposta e mantém
os campos se houver erro; o botão fica desabilitado durante o envio.
Carregamento, falhas de conexão e erros HTTP são apresentados na interface.

`VITE_API_URL` é o endereço da API acessível pelo navegador
(padrão `http://localhost:8000`), não o hostname interno `backend`.
Essa variável é pública e não deve conter segredos.
`CORS_ORIGINS` contém origens explícitas separadas por vírgulas; por padrão,
`http://localhost:5173,http://127.0.0.1:5173`. A API permite os cinco métodos
utilizados, sem wildcard. CORS não substitui autenticação.

`API_PORT` e `FRONTEND_PORT` configuram as portas publicadas. Se alterá-las,
ajuste também `VITE_API_URL` e `CORS_ORIGINS` no `.env`.
Os containers recebem essas variáveis pelo Compose.
Para iniciar apenas o Vite local, use `make frontend-dev` com a API já em execução;
um arquivo `frontend/.env.local` pode definir `VITE_API_URL` nesse modo.

Para validar manualmente: abra o frontend, cadastre um serviço e recarregue.
Confira que o registro permanece e que o mesmo nome retorna erro.
Use Detalhes (GET), Editar (PUT), Ativar/Desativar (PATCH) e Excluir (DELETE).
A aba Network deve mostrar as chamadas a `/servicos` e o preflight OPTIONS
nas operações que o exigem.

## Limites da prática

O cadastro não monitora as URLs informadas. A rota `/` é um relatório de
saúde da aplicação, não uma checagem de conectividade PostgreSQL. A API é
didática, sem autenticação; as credenciais de exemplo são para uso local.
