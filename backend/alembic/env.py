from sqlalchemy import create_engine, pool

from alembic import context
from backend.core.config import get_database_url
from backend.database.base import Base
from backend.models import Servico  # noqa: F401 - registra os modelos no metadata

config = context.config
target_metadata = Base.metadata


def executar(connection):
    context.configure(
        connection=connection, target_metadata=target_metadata, compare_type=True
    )
    with context.begin_transaction():
        context.run_migrations()


if context.is_offline_mode():
    context.configure(
        url=get_database_url(), target_metadata=target_metadata, literal_binds=True
    )
    with context.begin_transaction():
        context.run_migrations()
elif config.attributes.get("connection") is not None:
    executar(config.attributes["connection"])
else:
    engine = create_engine(get_database_url(), poolclass=pool.NullPool)
    try:
        with engine.connect() as connection:
            executar(connection)
    finally:
        engine.dispose()
