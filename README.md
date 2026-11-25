# Mesa da Rodada

Projeto final da disciplina C216 — Sistemas Distribuídos. A proposta é desenvolver uma aplicação web para simular placares de partidas e acompanhar seus efeitos na classificação de um campeonato inspirado no Brasileirão.

## Estado atual

O desenvolvimento está na branch `projeto-final`. Já estão implementados a API mínima com `GET /saude`, seu teste automatizado e o ambiente Python gerenciado por Poetry.

A infraestrutura Docker desta etapa contém uma imagem própria para a API, PostgreSQL com volume persistente e verificações de saúde dos dois serviços. O Makefile oferece os comandos de preparação, execução e validação.

O workflow de integração contínua está definido em `.github/workflows/qualidade-mesa.yml` para executar as verificações do backend no GitHub Actions. A execução remota será confirmada após enviar esse arquivo ao GitHub e consultar os resultados da aba Actions.

As funcionalidades de times, partidas, classificação e CRUD de simulações descritas abaixo ainda são planejadas. A API ainda não executa consultas de negócio no banco: SQLAlchemy, Alembic, migrações e frontend React serão adicionados nas próximas etapas.

## Objetivo

Permitir que o usuário crie cenários de campeonato, informe os placares dos confrontos e visualize uma classificação calculada a partir desses resultados. Cada cenário deverá manter seus próprios resultados, permitindo comparar possibilidades sem alterar outras simulações.

A primeira versão terá uma única tela, com seleção da simulação, formulário de placar, listagem de partidas e tabela de classificação. Os placares serão informados pelo usuário; a simulação não dependerá de previsões automáticas ou de uma API de resultados ao vivo.

## Funcionalidades planejadas

- Criar uma simulação com nome próprio.
- Consultar e reabrir simulações salvas.
- Editar o nome de uma simulação e os resultados de suas partidas.
- Excluir uma simulação e seus dados associados.
- Selecionar os times mandante e visitante de cada partida.
- Registrar, consultar, editar e remover placares dentro de uma simulação.
- Identificar vitória, empate ou derrota com base nos gols de cada time.
- Recalcular a classificação após incluir, alterar ou remover um resultado.
- Salvar os dados no PostgreSQL e recuperá-los após atualizar a página.
- Exibir estados de carregamento, confirmação de operações e mensagens de erro na interface.

O CRUD principal será o de simulações, com todas as operações acessíveis pela interface. O catálogo de times será cadastrado inicialmente no projeto.

## Modelagem inicial

### Time

A classe `Time` representará um clube, com identificador, nome e sigla. Cada instância corresponderá a um time.

As estatísticas da classificação serão calculadas por time dentro de cada simulação. Elas não serão atributos globais do clube: um mesmo time poderá ter desempenhos diferentes em cenários distintos.

### Partida

A classe `Partida` representará um confronto associado a uma simulação. Terá identificador, time mandante, time visitante, rodada e os gols de cada lado. Uma partida poderá estar pendente, sem placar, ou concluída, com os dois valores preenchidos.

O vencedor e o resultado de cada time serão derivados do placar, sem informar vitória ou derrota separadamente.

### Simulacao

A classe `Simulacao` agrupará um cenário, seu nome e suas partidas. Os resultados pertencerão ao cenário em que foram registrados.

### Classificação por time

A tabela terá como referência as colunas principais da tabela oficial da CBF.

## Execução e configuração

Execute todos os comandos abaixo na raiz do repositório. Pré-requisitos: Python 3.14 ou superior, Poetry, GNU Make e Docker com suporte a contêineres Linux e ao comando `docker compose`.

O Dockerfile utiliza Python 3.14 em duas etapas: uma instala as dependências e o pacote com Poetry 2.4.2; a outra executa a API como usuário `mesa`, sem privilégios de root. O contexto de build é apenas `liga-api`, com exclusões definidas em `liga-api/.dockerignore`. O Poetry e as dependências de desenvolvimento não são copiados para a imagem de execução.

O Compose utiliza PostgreSQL 17. A API aguarda o healthcheck do banco e possui seu próprio healthcheck em `/saude`. Cada serviço é acessível pelo nome na rede do projeto. O banco não publica uma porta no computador; a API fica disponível apenas na interface local `127.0.0.1`.

### Configuração local

Crie o arquivo `.env` com uma senha aleatória local:

```text
make docker-configurar
```

O comando preserva um `.env` já existente e não imprime a senha. `.env.example` documenta as variáveis e pode ser versionado; `.env` fica ignorado pelo Git.

| Variável | Finalidade | Exemplo |
| --- | --- | --- |
| `MESA_API_PORTA` | Porta da API no computador | `8000` |
| `MESA_DB_NOME` | Banco criado na primeira inicialização | `mesa_rodada` |
| `MESA_DB_USUARIO` | Usuário inicial do PostgreSQL local | `operador_mesa` |
| `MESA_DB_SENHA` | Senha local obrigatória, gerada na preparação | Sem valor real no exemplo |

As configurações `DB_HOST=banco-mesa`, `DB_PORT=5432`, `DB_NAME`, `DB_USER` e `DB_PASSWORD` são entregues ao contêiner da API para a futura integração. Disponibilizar essas variáveis não implementa a conexão com o banco.

As variáveis `POSTGRES_*` inicializam um volume novo. Alterar usuário, banco ou senha no `.env` depois da primeira execução não altera automaticamente as credenciais já armazenadas no PostgreSQL.

### Execução com Docker Compose

```text
make docker-validar
make docker-construir
make docker-subir
make docker-estado
make docker-checar
```

`docker-validar` verifica a configuração sem exibir as credenciais. `docker-subir` constrói a imagem e aguarda os dois serviços ficarem saudáveis. O primeiro build precisa de acesso à internet para obter as imagens e dependências.

Com a porta padrão, acesse:

- Saúde da API: <http://127.0.0.1:8000/saude>
- Documentação interativa: <http://127.0.0.1:8000/docs>
- Especificação OpenAPI: <http://127.0.0.1:8000/openapi.json>

Resposta esperada em `/saude`:

```json
{"status": "ok", "projeto": "Mesa da Rodada"}
```

Para consultar os logs ou encerrar o ambiente:

```text
make docker-logs
make docker-parar
```

`docker-parar` remove os contêineres e a rede deste projeto, preservando o volume nomeado `dados-campeonato`. O comando não utiliza a opção de remoção de volumes.

### Verificação da infraestrutura e do volume

```text
make docker-checar
make docker-verificar-volume
```

O primeiro comando verifica a resposta HTTP, o usuário sem privilégios de root, a conexão TCP da API com `banco-mesa:5432` e uma consulta SQL no PostgreSQL. A conexão TCP confirma a rede entre serviços; não representa uma integração da aplicação com SQLAlchemy.

O segundo comando cria um schema temporário de diagnóstico com um registro SQL, encerra e recria os contêineres deste projeto, verifica que o registro permanece e remove o schema de diagnóstico.

Esse diagnóstico não cria tabelas do domínio nem substitui migrações Alembic. A persistência de simulações pela aplicação será implementada posteriormente.

## Preparação do ambiente Python

Pré-requisitos: Python compatível com o `pyproject.toml`, Poetry e GNU Make.

Execute os comandos na raiz do repositório:

- `make preparar`: instala as dependências.
- `make ambiente`: apresenta o ambiente virtual.
- `make rodar`: inicia a API localmente, fora do Docker, em desenvolvimento.
- `make testar`: executa os testes do backend.
- `make verificar`: valida a configuração, o código, a formatação e os testes.
- `make formatar`: aplica a formatação Python.

Execute `make preparar` antes das verificações locais em uma nova cópia do repositório. O lint e a formatação também incluem os scripts de infraestrutura. Os testes locais utilizam as dependências de desenvolvimento; a imagem Docker contém apenas as dependências de execução.

## Testes e integração contínua

Para executar a mesma sequencia utilizada pelo CI:

```text
make preparar
make verificar
```

O alvo `make verificar` valida a configuração do Poetry, o lint, a formatação e os testes Pytest. Uma falha em qualquer verificação reprova o job; o CI não aplica formatação automaticamente.

Os gatilhos são pushes para `projeto-final` e Pull Requests com destino à `main`.