from os import environ
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient

from liga_api.main import criar_app

pytestmark = pytest.mark.skipif(
    environ.get("MESA_TESTE_POSTGRES") != "1",
    reason="Requer PostgreSQL de teste configurado com DB_*.",
)


@pytest.fixture(scope="module")
def banco_migrado():
    arquivo = Path(__file__).resolve().parents[1] / "alembic.ini"
    command.upgrade(Config(str(arquivo)), "head")


def test_placar_persiste_entre_instancias_da_api(banco_migrado):
    dados = {
        "mandante_id": 13,
        "visitante_id": 18,
        "gols_mandante": 2,
        "gols_visitante": 1,
        "rodada": 3,
    }
    caminho = None
    try:
        with TestClient(criar_app()) as cliente:
            resposta_times = cliente.get("/times")
            assert resposta_times.status_code == 200
            times = resposta_times.json()
            assert {time["sigla"] for time in times} == {
                "CAP",
                "CAM",
                "BAH",
                "BOT",
                "CHA",
                "COR",
                "CFC",
                "CRU",
                "FLA",
                "FLU",
                "GRE",
                "INT",
                "MIR",
                "PAL",
                "RBB",
                "REM",
                "SAN",
                "SAO",
                "VAS",
                "VIT",
            }
            assert len(times) == 20
            for time in times:
                escudo_url = f"/escudos/{time['sigla'].lower()}.png"
                assert time["escudo_url"] == escudo_url
                escudo = cliente.get(escudo_url)
                assert escudo.status_code == 200
                assert escudo.headers["content-type"] == "image/png"
                assert escudo.content.startswith(b"\x89PNG\r\n\x1a\n")
            assert (
                cliente.post("/partidas", json={**dados, "mandante_id": 1}).status_code
                == 404
            )
            criacao = cliente.post("/partidas", json=dados)
            assert criacao.status_code == 201
            caminho = f"/partidas/{criacao.json()['id']}"

        with TestClient(criar_app()) as cliente:
            consulta = cliente.get(caminho)
            assert consulta.status_code == 200
            assert consulta.json()["vencedor_id"] == dados["mandante_id"]
            assert consulta.json()["mandante"]["escudo_url"] == "/escudos/fla.png"
            assert criacao.json()["id"] in {
                partida["id"]
                for partida in cliente.get("/partidas", params={"rodada": 3}).json()
            }
            alteracao = cliente.put(caminho, json={**dados, "gols_visitante": 2})
            assert alteracao.status_code == 200
            assert alteracao.json()["resultado"] == "empate"

        with TestClient(criar_app()) as cliente:
            assert cliente.get(caminho).json()["pontos_visitante"] == 1
            assert cliente.delete(caminho).status_code == 204
            assert cliente.get(caminho).status_code == 404
            caminho = None
    finally:
        if caminho is not None:
            with TestClient(criar_app()) as cliente:
                cliente.delete(caminho)
