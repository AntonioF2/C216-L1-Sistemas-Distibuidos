import pytest

from backend.core.config import get_cors_origins, get_database_url


def test_cors_origens_padrao(monkeypatch):
    monkeypatch.delenv("CORS_ORIGINS", raising=False)
    assert get_cors_origins() == ["http://localhost:5173", "http://127.0.0.1:5173"]


def test_cors_origens_do_ambiente(monkeypatch):
    monkeypatch.setenv("CORS_ORIGINS", " http://localhost:5174, http://127.0.0.1:5174 ")
    assert get_cors_origins() == ["http://localhost:5174", "http://127.0.0.1:5174"]


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
