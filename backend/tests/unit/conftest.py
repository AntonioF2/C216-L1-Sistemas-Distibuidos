from copy import deepcopy

import pytest

from backend.services.servicos import ServicoService


class RepositoryEmMemoria:
    """Dublê exclusivo dos testes unitários; não é usado pela aplicação."""

    def __init__(self):
        self.registros = {}
        self.proximo_id = 1

    def salvar(self, servico):
        if servico.id is None:
            servico.id = self.proximo_id
            self.proximo_id += 1
        self.registros[servico.id] = deepcopy(servico)
        return deepcopy(servico)

    def buscar(self, servico_id):
        return deepcopy(self.registros.get(servico_id))

    def listar(self, ativo=None):
        return [
            deepcopy(s)
            for s in self.registros.values()
            if ativo is None or s.ativo == ativo
        ]

    def excluir(self, servico):
        del self.registros[servico.id]


@pytest.fixture
def servico_service():
    return ServicoService(RepositoryEmMemoria())
