# C216-L1 Sistemas Distibuidos
Repositório dedicado a disciplina de sistemas distribuidos


## Testes e integração contínua

Pré-requisitos: Python 3.14, Poetry 2.4.2 e Make.

### Execução local

Na raiz do projeto:

```bash
make install
make test
```

Para visualizar cada caso:

```bash
make test-verbose
```

Sem Make:

```bash
cd backend
poetry install --with dev
poetry run pytest -v
```

### Comportamentos testados

Os testes unitários verificam a criação do relatório de saúde:

- identificação do serviço;
- status padrão;
- remoção de espaços nas extremidades do nome;
- rejeição de nomes vazios;
- aceitação dos status permitidos;
- rejeição de status inválidos.

A suíte utiliza assert, fixture, parametrização e verificação de exceções.

Também existe um teste HTTP da rota GET /.

O relatório identifica o serviço e seu status informado.
Ele ainda não verifica a disponibilidade do banco de dados.

### GitHub Actions

O workflow CI Backend instala as dependências com Poetry e executa
Pytest automaticamente nos eventos push e pull_request.

Os testes não dependem de Docker nem de PostgreSQL.

## Prática 4 — Cadastro de serviços

A API cadastra serviços com `id`, `nome`, `url` e `ativo`. O cadastro não
consulta as URLs nem monitora a disponibilidade dos serviços.

### Organização

- `backend/src/backend/main.py`: inicialização e registro de routers.
- `backend/src/backend/routers/`: endpoints e tratamento HTTP.
- `backend/src/backend/schemas/`: validação Pydantic das entradas e respostas.
- `backend/src/backend/services/`: operações e armazenamento em memória.
- `backend/src/backend/health.py`: regras do relatório de saúde existente.
- `backend/tests/unit/`: testes diretos das regras, modelos e operações.
- `backend/tests/integration/`: testes dos endpoints com TestClient.

### Endpoints

| Método | Caminho | Operação | Sucesso |
| --- | --- | --- | --- |
| GET | `/` | Relatório de saúde | 200 |
| POST | `/servicos` | Criar serviço | 201 |
| GET | `/servicos?ativo=true` | Listar, com filtro opcional | 200 |
| GET | `/servicos/{servico_id}` | Buscar serviço | 200 |
| PUT | `/servicos/{servico_id}` | Substituir todos os campos editáveis | 200 |
| PATCH | `/servicos/{servico_id}` | Atualizar os campos enviados | 200 |
| DELETE | `/servicos/{servico_id}` | Excluir, sem corpo de resposta | 204 |

IDs inexistentes retornam 404; IDs não positivos, entradas inválidas e
campos desconhecidos retornam 422. O nome é normalizado e deve ter de 1 a
100 caracteres; a URL deve usar HTTP ou HTTPS. O ID é gerado pelo backend.

POST aceita omitir `ativo`, que assume `true`. PUT exige `nome`, `url` e
`ativo`. PATCH preserva campos omitidos, rejeita valores `null` e aceita
`{}` como atualização sem mudanças.

### Executar e experimentar

Na raiz, execute `make install` e `make run`. Acesse
[Swagger UI](http://localhost:8000/docs) para experimentar os endpoints.

Exemplo de corpo de POST (também válido para PUT):

```json
{"nome": "Catálogo", "url": "https://example.com/", "ativo": true}
```

Exemplo de PATCH:

```json
{"ativo": false}
```

### Validação e testes

```bash
make format
make lint
make test-unit
make test-integration
make test
```

`make test` e o CI executam ambas as categorias. Cada teste recebe uma
instância vazia do cadastro; a fixture HTTP substitui a dependência e
restaura os overrides ao terminar. Nenhum teste depende da ordem de execução.

### Limitações

O armazenamento é em memória, por processo. Reiniciar a aplicação perde
os registros, e múltiplos workers não compartilham dados. Use um único
worker nesta prática. O PostgreSQL do Compose permanece disponível, mas
ainda não é utilizado pelo cadastro. Não há autenticação; a API é didática.
