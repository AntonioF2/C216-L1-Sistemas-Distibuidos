import os

from sqlalchemy.engine import make_url


def get_cors_origins() -> list[str]:
    value = os.environ.get(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    )
    return [origin.strip() for origin in value.split(",") if origin.strip()]


def get_database_url() -> str:
    value = os.environ.get("DATABASE_URL")
    if not value:
        raise RuntimeError(
            "Defina DATABASE_URL antes de acessar o banco ou executar migrations."
        )
    if make_url(value).drivername != "postgresql+psycopg":
        raise ValueError("DATABASE_URL deve usar postgresql+psycopg://")
    return value
