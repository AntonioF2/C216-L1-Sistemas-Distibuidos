from os import environ

from sqlalchemy import URL, Engine, create_engine


def criar_motor() -> Engine:
    url = URL.create(
        "postgresql+psycopg",
        username=environ["DB_USER"],
        password=environ["DB_PASSWORD"],
        host=environ["DB_HOST"],
        port=int(environ.get("DB_PORT", "5432")),
        database=environ["DB_NAME"],
    )
    return create_engine(url, pool_pre_ping=True)
