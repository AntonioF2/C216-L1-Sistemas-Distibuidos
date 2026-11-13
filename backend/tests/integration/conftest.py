import os
from pathlib import Path
from uuid import uuid4

import pytest
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session
from sqlalchemy.schema import CreateSchema, DropSchema

from alembic import command
from backend.database.session import get_db
from backend.main import app


@pytest.fixture(scope="session")
def test_database_url():
    url = os.environ.get(
        "TEST_DATABASE_URL",
        "postgresql+psycopg://postgres:postgres@127.0.0.1:5433/c216_test",
    )
    parsed = make_url(url)
    if parsed.drivername != "postgresql+psycopg" or not (
        parsed.database or ""
    ).endswith("_test"):
        pytest.fail(
            "TEST_DATABASE_URL deve apontar para PostgreSQL e um banco terminado em _test."
        )
    if url == os.environ.get("DATABASE_URL"):
        pytest.fail("O banco de teste deve ser diferente do banco da aplicação.")
    return url


@pytest.fixture
def db_engine(test_database_url):
    # Apenas este schema aleatório é removido; nenhuma tabela do cadastro é tocada.
    schema = "pytest_" + uuid4().hex
    admin = create_engine(test_database_url, connect_args={"connect_timeout": 5})
    try:
        with admin.begin() as connection:
            connection.execute(CreateSchema(schema))
    except Exception:
        admin.dispose()
        raise
    engine = create_engine(
        test_database_url,
        connect_args={"options": f"-csearch_path={schema}", "connect_timeout": 5},
    )
    try:
        config = Config(str(Path(__file__).resolve().parents[2] / "alembic.ini"))
        with engine.begin() as connection:
            config.attributes["connection"] = connection
            command.upgrade(config, "head")
        yield engine
    finally:
        engine.dispose()
        try:
            with admin.begin() as connection:
                connection.execute(DropSchema(schema, cascade=True))
        finally:
            admin.dispose()


@pytest.fixture
def client(db_engine):
    def override_db():
        with Session(db_engine, expire_on_commit=False) as db:
            try:
                yield db
            except Exception:
                db.rollback()
                raise

    anteriores = app.dependency_overrides.copy()
    app.dependency_overrides[get_db] = override_db
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
        app.dependency_overrides.update(anteriores)
