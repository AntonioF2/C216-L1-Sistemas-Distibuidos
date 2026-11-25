# Mesa da Rodada

Projeto final da disciplina C216 — Sistemas Distribuídos. A proposta é desenvolver uma aplicação web para simular placares de partidas e acompanhar seus efeitos na classificação de um campeonato inspirado no Brasileirão.

## Estado atual

O desenvolvimento está na branch `projeto-final`. A API possui consulta de saúde, catálogo de times de demonstração e operações de criação, consulta, edição e exclusão de placares de partidas. Cada placar informa o vencedor ou empate e os pontos dos dois times.

A infraestrutura Docker desta etapa contém uma imagem própria para a API, PostgreSQL com volume persistente e verificações de saúde dos dois serviços. O Makefile oferece os comandos de preparação, execução e validação.

O workflow de integração contínua está definido em `.github/workflows/qualidade-mesa.yml` para executar as verificações do backend no GitHub Actions. A execução remota será confirmada após enviar esse arquivo ao GitHub e consultar os resultados da aba Actions.

A API armazena o catálogo e as partidas no PostgreSQL com SQLAlchemy e psycopg. Alembic cria e versiona as tabelas. Os placares registrados permanecem disponíveis após reiniciar a API.

O agrupamento em simulações, a classificação acumulada e o frontend React são etapas posteriores.

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

A classe `Time` representa um clube, com identificador, nome e sigla. O catálogo atual contém quatro times fictícios para demonstração: Aurora Futebol Clube, União da Serra, Atlético do Vale e Estrela do Sul. Eles não representam o cadastro oficial de uma edição do Brasileirão.

As estatísticas da classificação serão calculadas por time dentro de cada simulação. Elas não serão atributos globais do clube: um mesmo time poderá ter desempenhos diferentes em cenários distintos.

### Partida

A classe `Partida` representa um confronto com identificador, rodada, mandante, visitante e gols dos dois lados. Nesta versão, somente partidas com placar completo podem ser registradas. O vínculo com uma simulação e o suporte a partidas pendentes ficam para etapas posteriores.

O vencedor e o resultado de cada time serão derivados do placar, sem informar vitória ou derrota separadamente.

### Simulacao

A classe `Simulacao` ainda não foi implementada. Ela agrupará um cenário, seu nome e suas partidas. Os resultados pertencerão ao cenário em que forem registrados.

### Classificação por time

A tabela terá como referência as colunas principais da tabela oficial da CBF.

## Arquitetura básica da API

| Camada | Diretório | Responsabilidade |
| --- | --- | --- |
| Rotas | `liga-api/src/liga_api/rotas` | Receber HTTP, declarar métodos e respostas e traduzir erros de domínio |
| Schemas | `liga-api/src/liga_api/schemas` | Validar a entrada com Pydantic e definir a resposta pública |
| Serviços | `liga-api/src/liga_api/servicos` | Validar confrontos e calcular resultado e pontuação |
| Repositórios | `liga-api/src/liga_api/repositorios` | Consultar times e executar o CRUD de partidas com SQLAlchemy |
| Modelos | `liga-api/src/liga_api/modelos` | Representar o domínio e mapear as tabelas em classes ORM separadas |
| Banco e migrações | `liga-api/src/liga_api/banco` e `liga-api/migracoes` | Configurar a conexão e versionar a estrutura do PostgreSQL |

`main.py` monta a aplicação e configura o acesso ao banco. Cada requisição às rotas de times ou partidas recebe uma sessão de banco própria, encerrada ao fim do atendimento. Os testes isolados injetam repositórios em memória. O teste de integração usa os repositórios PostgreSQL.

## Endpoints disponíveis

| Método | Caminho | Comportamento |
| --- | --- | --- |
| GET | `/saude` | Verifica a disponibilidade da API |
| GET | `/times` | Lista os quatro times de demonstração |
| POST | `/partidas` | Cria um placar e retorna HTTP 201 |
| GET | `/partidas` | Lista as partidas; aceita o filtro opcional `rodada` |
| GET | `/partidas/{partida_id}` | Consulta uma partida pelo identificador |
| PUT | `/partidas/{partida_id}` | Substitui os dados da partida e recalcula o resultado |
| DELETE | `/partidas/{partida_id}` | Exclui a partida e retorna HTTP 204 sem corpo |

Para experimentar, execute `make docker-configurar` e `make docker-subir` na raiz e abra <http://127.0.0.1:8000/docs>. Consulte `/times` e envie em `POST /partidas`:

```json
{
  "mandante_id": 1,
  "visitante_id": 2,
  "gols_mandante": 2,
  "gols_visitante": 1,
  "rodada": 1
}
```

A resposta identifica o mandante como vencedor, com 3 pontos, e o visitante com 0. Um empate atribui 1 ponto a cada lado. `GET /partidas?rodada=1` consulta somente aquela rodada. Ao editar, envie os dois times e os dois gols; a rodada tem valor padrão 1 quando omitida.

Os identificadores e a rodada devem ser inteiros positivos. Os gols devem ser inteiros não negativos: números fracionários, textos, booleanos e valores nulos são rejeitados. Campos desconhecidos no corpo também são rejeitados. Um clube não pode jogar contra si mesmo. Dados inválidos retornam HTTP 422; referências a times ou partidas inexistentes retornam HTTP 404.

As partidas são armazenadas em um cenário único. O CRUD de simulações e a classificação geral ficam para as próximas etapas.

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

O Compose fornece `DB_HOST=banco-mesa`, `DB_PORT=5432`, `DB_NAME`, `DB_USER` e `DB_PASSWORD` à API e às migrações. A API usa essas configurações para se conectar ao PostgreSQL.

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

Após o banco ficar pronto, o contêiner da API aplica a revisão Alembic vigente antes de iniciar o Uvicorn. A primeira revisão cria `times` e `partidas`, liga os dois times da partida ao catálogo por chaves estrangeiras e insere os quatro clubes de demonstração.

```text
make banco-revisao
make banco-migrar
```

Com a API em execução no Compose, o primeiro comando mostra a revisão aplicada e o segundo reaplica as migrações pendentes. Ao iniciar com `make docker-subir`, essa aplicação é automática. Para conferir a persistência, registre uma partida pelo Swagger, anote o ID, execute `make docker-parar` seguido de `make docker-subir` e consulte `GET /partidas/{partida_id}`.

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

O diagnóstico de volume verifica a infraestrutura. O teste PostgreSQL da suíte verifica a persistência dos placares pela API.

## Preparação do ambiente Python

Pré-requisitos: Python compatível com o `pyproject.toml`, Poetry e GNU Make.

Execute os comandos na raiz do repositório:

- `make preparar`: instala as dependências.
- `make ambiente`: apresenta o ambiente virtual.
- `make rodar`: inicia a API fora do Docker. Requer um PostgreSQL acessível e migrado. Defina `DB_HOST`, `DB_NAME`, `DB_USER` e `DB_PASSWORD` no ambiente do processo e `DB_PORT` se a porta diferir de 5432. Para usar o PostgreSQL do Compose, execute `make docker-subir`.
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

O workflow é disparado por pushes para `projeto-final`, conforme a configuração atual do projeto. Ele utiliza os mesmos comandos Make executados localmente; abrir um PR não dispara uma execução adicional.

A suíte inclui os 41 casos de regras e API em memória e um teste de integração com PostgreSQL. Esse teste aplica a migração e verifica criação, consulta, edição e exclusão entre novas instâncias da API. O GitHub Actions fornece um PostgreSQL descartável. Para executar o teste localmente, configure `DB_*` para um PostgreSQL de teste e defina `MESA_TESTE_POSTGRES=1` antes de executar `make verificar`. Sem essa opção os 41 casos isolados são executados.
