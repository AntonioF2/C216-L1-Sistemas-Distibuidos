import pytest

from backend.core.config import get_database_url


def test_url_obrigatoria(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    with pytest.raises(RuntimeError, match="Defina DATABASE_URL"):
        get_database_url()


def test_driver_correto(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql://localhost/c216")
    with pytest.raises(ValueError, match="psycopg"):
        get_database_url()


def test_url_do_ambiente(monkeypatch):
    url = "postgresql+psycopg://localhost/c216"
    monkeypatch.setenv("DATABASE_URL", url)
    assert get_database_url() == url
