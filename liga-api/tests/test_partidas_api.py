import pytest
from fastapi.testclient import TestClient

from liga_api.main import criar_app


@pytest.fixture
def dados_partida():
    return {
        "mandante_id": 1,
        "visitante_id": 2,
        "gols_mandante": 2,
        "gols_visitante": 1,
        "rodada": 1,
    }


@pytest.fixture
def partida_registrada(cliente_api, dados_partida):
    resposta = cliente_api.post("/partidas", json=dados_partida)
    assert resposta.status_code == 201
    return resposta.json()


def test_catalogo_disponibiliza_times_para_selecao(cliente_api):
    resposta = cliente_api.get("/times")

    assert resposta.status_code == 200
    assert [time["id"] for time in resposta.json()] == [1, 2, 3, 4]
    assert all(time["nome"] and time["sigla"] for time in resposta.json())


def test_cria_placar_com_vencedor_e_pontos(cliente_api, dados_partida):
    resposta = cliente_api.post("/partidas", json=dados_partida)
    partida = resposta.json()

    assert resposta.status_code == 201
    assert partida["mandante"]["id"] == 1
    assert partida["visitante"]["id"] == 2
    assert partida["gols_mandante"] == 2
    assert partida["gols_visitante"] == 1
    assert partida["vencedor_id"] == 1
    assert partida["resultado"] == "vitoria_mandante"
    assert (partida["pontos_mandante"], partida["pontos_visitante"]) == (3, 0)


def test_consulta_partida_por_identificador(cliente_api, partida_registrada):
    resposta = cliente_api.get(f"/partidas/{partida_registrada['id']}")

    assert resposta.status_code == 200
    assert resposta.json() == partida_registrada


def test_filtra_partidas_pela_rodada(cliente_api, dados_partida):
    cliente_api.post("/partidas", json=dados_partida)
    cliente_api.post("/partidas", json={**dados_partida, "rodada": 2})

    resposta = cliente_api.get("/partidas", params={"rodada": 2})

    assert resposta.status_code == 200
    assert len(resposta.json()) == 1
    assert resposta.json()[0]["rodada"] == 2
    assert len(cliente_api.get("/partidas").json()) == 2


def test_edita_placar_e_recalcula_resultado_sem_criar_outra_partida(
    cliente_api, dados_partida, partida_registrada
):
    resposta = cliente_api.put(
        f"/partidas/{partida_registrada['id']}",
        json={**dados_partida, "gols_mandante": 0, "gols_visitante": 3},
    )
    partida = resposta.json()

    assert resposta.status_code == 200
    assert partida["id"] == partida_registrada["id"]
    assert partida["resultado"] == "vitoria_visitante"
    assert partida["vencedor_id"] == 2
    assert (partida["pontos_mandante"], partida["pontos_visitante"]) == (0, 3)
    assert len(cliente_api.get("/partidas").json()) == 1


def test_exclui_partida_e_retorna_resposta_sem_corpo(cliente_api, partida_registrada):
    caminho = f"/partidas/{partida_registrada['id']}"
    resposta = cliente_api.delete(caminho)

    assert resposta.status_code == 204
    assert resposta.content == b""
    assert cliente_api.get(caminho).status_code == 404
    assert cliente_api.get("/partidas").json() == []


@pytest.mark.parametrize(
    "alteracao",
    [
        {"gols_mandante": -1},
        {"gols_visitante": 1.5},
        {"gols_mandante": True},
        {"gols_visitante": None},
        {"rodada": 0},
        {"mandante_id": "1"},
        {"campo_extra": "nao permitido"},
    ],
)
def test_rejeita_corpo_invalido_sem_registrar_partida(
    cliente_api, dados_partida, alteracao
):
    resposta = cliente_api.post("/partidas", json={**dados_partida, **alteracao})

    assert resposta.status_code == 422
    assert cliente_api.get("/partidas").json() == []


def test_rejeita_confronto_do_mesmo_time(cliente_api, dados_partida):
    resposta = cliente_api.post("/partidas", json={**dados_partida, "visitante_id": 1})

    assert resposta.status_code == 422
    assert "si mesmo" in resposta.json()["detail"]


def test_referencia_a_time_desconhecido_retorna_404(cliente_api, dados_partida):
    resposta = cliente_api.post("/partidas", json={**dados_partida, "visitante_id": 99})

    assert resposta.status_code == 404
    assert resposta.json() == {"detail": "Time 99 nao encontrado."}


@pytest.mark.parametrize("metodo", ["GET", "PUT", "DELETE"])
def test_operacao_em_partida_inexistente_retorna_404(
    cliente_api, dados_partida, metodo
):
    resposta = cliente_api.request(
        metodo, "/partidas/999", json=dados_partida if metodo == "PUT" else None
    )

    assert resposta.status_code == 404
    assert resposta.json() == {"detail": "Partida 999 nao encontrada."}


@pytest.mark.parametrize(
    "caminho", ["/partidas/0", "/partidas/abc", "/partidas?rodada=0"]
)
def test_valida_parametros_de_caminho_e_consulta(cliente_api, caminho):
    assert cliente_api.get(caminho).status_code == 422


def test_nova_instancia_da_api_nao_herda_partidas_de_outra_instancia(
    cliente_api, partida_registrada
):
    assert cliente_api.get("/partidas").json() == [partida_registrada]

    with TestClient(criar_app()) as outra_api:
        assert outra_api.get("/partidas").json() == []
