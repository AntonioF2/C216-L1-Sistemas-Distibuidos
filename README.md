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