import os

from sqlalchemy.engine import make_url


def get_database_url() -> str:
    value = os.environ.get("DATABASE_URL")
    if not value:
        raise RuntimeError(
            "Defina DATABASE_URL antes de acessar o banco ou executar migrations."
        )
    if make_url(value).drivername != "postgresql+psycopg":
        raise ValueError("DATABASE_URL deve usar postgresql+psycopg://")
    return value
