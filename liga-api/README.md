# API do Mesa da Rodada

Pacote Python responsável pela API e pelas regras de negócio do simulador.

Nesta etapa, o ambiente possui FastAPI, Uvicorn, Pytest e Ruff.
A API disponibiliza o catálogo dos 20 clubes do Brasileirão Série A de 2026 e o CRUD de placares, com cálculo de resultado e pontuação. A arquitetura separa rotas, schemas Pydantic, serviços, repositórios e modelos de domínio.

O PostgreSQL armazena o catálogo e os placares por meio do SQLAlchemy. O Alembic aplica as migrações antes do início da API no Compose. O simulador usa `PUT /rodadas/{rodada}/placares` para gravar um lote em uma transação, `GET /partidas?calendario=true` para restaurar os resultados e `DELETE /partidas/{partida_id}` para excluir um placar. A classificação acumulada é calculada na interface.

Os comandos de preparação e validação ficam no Makefile da raiz do repositório.
