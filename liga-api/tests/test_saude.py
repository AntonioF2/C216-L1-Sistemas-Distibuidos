from fastapi.testclient import TestClient

from liga_api.main import app


def test_endpoint_saude_retorna_identificacao_do_projeto():
    with TestClient(app) as cliente:
        resposta = cliente.get("/saude")

    assert resposta.status_code == 200
    assert resposta.json() == {
        "status": "ok",
        "projeto": "Mesa da Rodada",
    }
