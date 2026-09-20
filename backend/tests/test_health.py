import pytest
from fastapi.testclient import TestClient

from backend.health import criar_relatorio_saude
from backend.main import app


def test_relatorio_identifica_servico(nome_servico):
    resultado = criar_relatorio_saude(nome_servico)

    assert resultado["service"] == nome_servico


def test_status_padrao_e_ok(nome_servico):
    resultado = criar_relatorio_saude(nome_servico)

    assert resultado["status"] == "ok"


def test_remove_espacos_do_nome():
    resultado = criar_relatorio_saude("  backend  ")

    assert resultado["service"] == "backend"


def test_health_check():
    with TestClient(app) as client:
        response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "service": "backend",
        "status": "ok",
    }


@pytest.mark.parametrize("nome", ["", " ", "\t", "\n"])
def test_rejeita_nome_vazio(nome):
    with pytest.raises(
        ValueError,
        match="O nome do serviço é obrigatório",
    ):
        criar_relatorio_saude(nome)


@pytest.mark.parametrize("status", ["ok", "degraded", "error"])
def test_aceita_status_validos(nome_servico, status):
    resultado = criar_relatorio_saude(nome_servico, status)

    assert resultado["status"] == status


@pytest.mark.parametrize("status", ["", "unknown", "OK"])
def test_rejeita_status_invalido(nome_servico, status):
    with pytest.raises(ValueError, match="Status de saúde inválido"):
        criar_relatorio_saude(nome_servico, status)
