from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from liga_api.main import criar_app
from liga_api.repositorios.memoria import CatalogoTimes, RepositorioPartidasEmMemoria
from liga_api.servicos.partidas import ServicoPartidas


def criar_app_de_teste():
    return criar_app(ServicoPartidas(CatalogoTimes(), RepositorioPartidasEmMemoria()))


@pytest.fixture
def cliente_api() -> Iterator[TestClient]:
    with TestClient(criar_app_de_teste()) as cliente:
        yield cliente
