from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from backend.core.config import get_database_url


@lru_cache
def get_engine():
    return create_engine(
        get_database_url(), pool_pre_ping=True, connect_args={"connect_timeout": 5}
    )


def get_db():
    # Uma sessão por requisição; nenhuma conexão é aberta durante o import.
    with Session(get_engine(), autoflush=False, expire_on_commit=False) as db:
        try:
            yield db
        except Exception:
            db.rollback()
            raise
