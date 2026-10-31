import pytest


@pytest.fixture
def nome_servico():
    return "backend"


@pytest.fixture
def dados_servico():
    return {"nome": "Catálogo", "url": "https://example.com/", "ativo": True}
