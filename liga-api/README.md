# API do Mesa da Rodada

Pacote Python responsável pela API e pelas regras de negócio do simulador.

Nesta etapa, o ambiente possui FastAPI, Uvicorn, Pytest e Ruff.
A API já disponibiliza catálogo de times fictícios e CRUD de placares de partidas, com cálculo de resultado e pontuação. A arquitetura separa rotas, schemas Pydantic, serviços, repositórios e modelos de domínio.

Os registros são mantidos apenas em memória e desaparecem quando a aplicação reinicia. O agrupamento em simulações, a classificação acumulada e a persistência com PostgreSQL, SQLAlchemy e Alembic ainda serão implementados.

Os comandos de preparação e validação ficam no Makefile da raiz do repositório.
