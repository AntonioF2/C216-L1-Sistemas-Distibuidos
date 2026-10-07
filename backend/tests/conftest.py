import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.routers.servicos import get_servico_service
from backend.services.servicos import ServicoService


@pytest.fixture
def nome_servico():
    return "backend"


@pytest.fixture
def servico_service():
    return ServicoService()


@pytest.fixture
def dados_servico():
    return {"nome": "Catálogo", "url": "https://example.com/", "ativo": True}


@pytest.fixture
def client(servico_service):
    anteriores = app.dependency_overrides.copy()
    app.dependency_overrides[get_servico_service] = lambda: servico_service
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
        app.dependency_overrides.update(anteriores)
