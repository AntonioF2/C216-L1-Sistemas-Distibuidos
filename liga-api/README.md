# API do Mesa da Rodada

Pacote Python responsável pela API e pelas regras de negócio do simulador.

Nesta etapa, o ambiente possui FastAPI, Uvicorn, Pytest e Ruff.
A API disponibiliza o catálogo dos 20 clubes do Brasileirão Série A de 2026 e o CRUD de placares, com cálculo de resultado e pontuação. A arquitetura separa rotas, schemas Pydantic, serviços, repositórios e modelos de domínio.

O catálogo e as partidas são armazenados no PostgreSQL com SQLAlchemy. Alembic aplica a migração inicial antes da inicialização da API pelo Compose. O agrupamento em simulações e a classificação acumulada ficam para as próximas etapas.

Os comandos de preparação e validação ficam no Makefile da raiz do repositório.
