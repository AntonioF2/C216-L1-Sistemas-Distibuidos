# Mesa da Rodada

Projeto final da disciplina C216 — Sistemas Distribuídos. O Mesa da Rodada permite simular os resultados do Brasileirão Série A de 2026 e acompanhar como os placares mudam a classificação.

## Como usar

A tela começa na Rodada 1. Use as setas para navegar pelas 38 rodadas e encontrar os confrontos. Preencha os dois gols dos jogos que deseja simular e clique em **Salvar placares da rodada**. Jogos sem placar podem ficar em branco. A tabela usa os resultados salvos de todas as rodadas.

A lista **Partidas registradas** mostra os placares da rodada selecionada. As setas da lista e dos confrontos mudam os dois painéis juntos. Para editar, clique em **Editar**, ajuste os gols no confronto e use o mesmo botão de salvar. A lista também permite excluir placares. O lote é gravado em uma transação no PostgreSQL e pode ser reenviado sem duplicar o placar. Recarregar a página recupera os resultados salvos. A aplicação mantém um cenário compartilhado e os placares são informados pelo usuário.

A classificação ordena os 20 clubes por pontos, vitórias, saldo de gols e gols marcados. Use a seta no cabeçalho para expandir ou recolher a tabela. Empates nos critérios usam a ordem dos nomes. Uma vitória vale 3 pontos, um empate vale 1 e uma derrota vale 0.

Os 380 jogos seguem a [tabela básica da CBF para a Série A de 2026](https://stcbfsiteprdimgbrs.blob.core.windows.net/img-site/cdn/Tabela_BA_sica_Brasileiro_SA_rie_A_2026_d64996b4d8.pdf). Os escudos PNG identificam os clubes e têm como fonte o [simulador do ge de 2026](https://ge.globo.com/futebol/brasileirao-serie-a/simulador-do-brasileirao-2026/).

## Execução com Docker Compose

Execute os comandos na raiz do repositório, na branch `projeto-final`. Use Python 3.14, GNU Make e Docker com Compose v2 e suporte a contêineres Linux. A primeira construção baixa imagens e dependências.

```text
make docker-configurar
make docker-subir
make docker-estado
make docker-checar
```

- [Mesa da Rodada](http://127.0.0.1:5173/)
- [Swagger da API](http://127.0.0.1:8000/docs)
- [Verificação de saúde da API](http://127.0.0.1:8000/saude)

O Compose inicia o PostgreSQL, aguarda sua verificação de saúde e sobe o backend. A API aplica as migrações do Alembic antes de iniciar o Uvicorn. A interface é disponibilizada pelo serviço web depois que a API passa na verificação de saúde. A API usa `banco-mesa:5432` na rede Docker. O navegador faz requisições à porta publicada da API no computador.

| Comando | Uso |
| --- | --- |
| `make docker-validar` | Valida a configuração do Compose |
| `make docker-construir` | Constrói as imagens da API e da interface |
| `make banco-revisao` | Mostra a revisão do Alembic aplicada ao banco |
| `make banco-migrar` | Aplica revisões pendentes com a API em execução |
| `make docker-logs` | Mostra os logs recentes dos serviços |
| `make docker-checar` | Verifica as respostas da interface e da API e a conexão com o banco |
| `make docker-verificar-volume` | Recria os contêineres e verifica um registro de diagnóstico no volume |
| `make docker-parar` | Encerra os serviços e preserva o volume de dados |

### Variáveis de ambiente

`make docker-configurar` cria um `.env` local a partir de `.env.example`, gera uma senha e preserva um arquivo já existente. O Git ignora `.env`.

| Variável | Uso | Padrão |
| --- | --- | --- |
| `MESA_FRONTEND_PORTA` | Porta publicada da interface | `5173` |
| `MESA_API_PORTA` | Porta publicada da API | `8000` |
| `MESA_DB_NOME` | Nome do banco | `mesa_rodada` |
| `MESA_DB_USUARIO` | Usuário do banco | `operador_mesa` |
| `MESA_DB_SENHA` | Senha do banco local | Gerada na configuração |
| `MESA_ORIGENS_FRONTEND` | Origens permitidas pelo CORS, separadas por vírgulas | `127.0.0.1` e `localhost` via HTTP, na porta da interface |
| `VITE_MESA_API_URL` | URL pública da API usada pelo navegador | HTTP no mesmo host da interface, na porta publicada da API |

`VITE_MESA_API_URL` é pública e entra no build da interface. Após alterar o endereço da API, rode `make docker-subir` para reconstruir a imagem. O Compose fornece `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASSWORD` ao backend. As credenciais de inicialização do PostgreSQL são aplicadas quando o volume é criado.

## Arquitetura e tecnologias

| Diretório | Responsabilidade |
| --- | --- |
| `frontend/src` | React e JavaScript para os confrontos, formulários, histórico e classificação com Tailwind CSS. Vite gera o build servido pelo Nginx |
| `frontend/src/placaresApi.js` | Cliente HTTP com `fetch` para carregar, gravar e excluir placares |
| `liga-api/src/liga_api/rotas` e `schemas` | Endpoints FastAPI, parâmetros, contratos Pydantic e respostas HTTP |
| `liga-api/src/liga_api/servicos` | Validação de confrontos, cálculo de resultados e pontuação |
| `liga-api/src/liga_api/repositorios` e `modelos` | Domínio e persistência com SQLAlchemy e PostgreSQL |
| `liga-api/migracoes` | Migrações versionadas com Alembic |
| `liga-api/tests` e `frontend/tests` | Pytest, Vitest, Testing Library e Playwright |
| `.github/workflows` | Integração contínua com GitHub Actions |

O FastAPI permite as origens configuradas para os métodos GET, POST, PUT e DELETE. A migração `002_catalogo_serie_a_2026` atualiza o catálogo. A revisão `003_chave_confronto` identifica os placares do calendário por rodada, mandante e visitante. Registros avulsos criados pelo CRUD anterior continuam disponíveis pela API e ficam fora do cenário do simulador.

### API

| Método | Caminho | Uso |
| --- | --- | --- |
| GET | `/saude` | Disponibilidade da API |
| GET | `/times` | Catálogo dos 20 clubes ativos com URL do escudo |
| GET | `/escudos/{sigla}.png` | Escudo PNG do clube |
| GET | `/partidas` | Consulta resultados. Aceita `rodada` e o filtro `calendario=true` |
| PUT | `/rodadas/{rodada}/placares` | Cria ou atualiza até 10 placares da rodada em uma transação |
| DELETE | `/partidas/{partida_id}` | Exclui um placar e retorna HTTP 204 |
| POST | `/partidas` | Registra um placar avulso e retorna HTTP 201 |
| GET e PUT | `/partidas/{partida_id}` | Consulta ou atualiza uma partida por ID |

O lote recebe uma lista de objetos com `mandante_id`, `visitante_id`, `gols_mandante` e `gols_visitante`. Os gols são inteiros não negativos. O navegador mostra mensagens de carregamento, sucesso e erro, e mantém o rascunho se o salvamento falhar.

## Testes e integração contínua

Para executar as verificações locais, use Poetry e Node.js 24 além dos pré-requisitos do Docker. Instale as dependências e o Chromium uma vez antes de validar uma cópia nova:

```text
make preparar
make frontend-preparar
make frontend-instalar-navegador
make verificar-tudo
```

| Comando | Verificações |
| --- | --- |
| `make verificar` | Poetry, lint e formato com Ruff, regras e rotas com Pytest |
| `make frontend-verificar` | Lint e formato com Biome, Vitest com Testing Library e build Vite |
| `make frontend-e2e` | React, FastAPI e PostgreSQL reais com Playwright |
| `make verificar-tudo` | Executa as três verificações |

O Playwright usa um projeto Compose temporário, portas livres e um volume de teste próprio. Ele salva uma rodada pela interface, recarrega para conferir os placares e a classificação, e testa a persistência da edição e da exclusão. O ambiente temporário é removido ao final. Em Linux, use `make frontend-instalar-navegador-ci` para instalar também as dependências do Chromium.

A CI executa em pushes para `projeto-final` e em pull requests com destino a `main`. O job do backend também roda o teste Pytest de persistência com um PostgreSQL descartável. Na execução local padrão, o teste que requer esse banco de teste fica marcado como ignorado. O E2E integrado usa seu próprio banco Docker.
