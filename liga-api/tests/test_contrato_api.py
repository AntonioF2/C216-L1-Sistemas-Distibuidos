import pytest
from fastapi.testclient import TestClient


@pytest.mark.parametrize(
    ("caminho", "tipo_conteudo"),
    [
        pytest.param("/docs", "text/html", id="documentacao-interativa"),
        pytest.param("/openapi.json", "application/json", id="especificacao-json"),
    ],
)
def test_documentacao_disponivel_no_formato_esperado(
    cliente_api: TestClient, caminho: str, tipo_conteudo: str
):
    resposta = cliente_api.get(caminho)

    assert resposta.status_code == 200
    assert resposta.headers["content-type"].split(";", 1)[0] == tipo_conteudo


def test_especificacao_identifica_projeto_e_publica_consulta_de_saude(
    cliente_api: TestClient,
):
    resposta = cliente_api.get("/openapi.json")
    especificacao = resposta.json()

    assert resposta.status_code == 200
    assert especificacao["info"]["title"] == "Mesa da Rodada"
    assert "get" in especificacao["paths"]["/saude"]


def test_consulta_de_saude_rejeita_envio_por_post(cliente_api: TestClient):
    resposta = cliente_api.post("/saude", json={"status": "alterado"})

    assert resposta.status_code == 405
    assert resposta.json() == {"detail": "Method Not Allowed"}
    metodos_permitidos = {
        metodo.strip() for metodo in resposta.headers["allow"].split(",")
    }
    assert "GET" in metodos_permitidos
    assert "POST" not in metodos_permitidos


@pytest.mark.parametrize(
    ("origem", "status"),
    [("http://127.0.0.1:5173", 200), ("https://outra-origem.example", 400)],
)
def test_cors_verifica_a_origem_do_frontend(cliente_api, origem, status):
    resposta = cliente_api.options(
        "/rodadas/1/placares",
        headers={
            "Origin": origem,
            "Access-Control-Request-Method": "PUT",
            "Access-Control-Request-Headers": "content-type",
        },
    )

    assert resposta.status_code == status
    assert resposta.headers.get("access-control-allow-origin") == (
        origem if status == 200 else None
    )
