from fastapi.testclient import TestClient


def test_endpoint_saude_retorna_identificacao_do_projeto(cliente_api: TestClient):
    resposta = cliente_api.get("/saude")

    assert resposta.status_code == 200
    assert resposta.json() == {
        "status": "ok",
        "projeto": "Mesa da Rodada",
    }
