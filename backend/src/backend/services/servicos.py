from backend.models.servico import Servico
from backend.repositories.servicos import ServicoRepository
from backend.schemas.servico import (
    ServicoCreate,
    ServicoPatch,
    ServicoReplace,
    ServicoResponse,
)


class ServicoNaoEncontrado(Exception):
    pass


class ServicoService:
    def __init__(self, repository: ServicoRepository):
        self.repository = repository

    def criar(self, dados: ServicoCreate) -> ServicoResponse:
        servico = Servico(**dados.model_dump(mode="json"))
        return ServicoResponse.model_validate(self.repository.salvar(servico))

    def listar(self, ativo: bool | None = None) -> list[ServicoResponse]:
        return [
            ServicoResponse.model_validate(s) for s in self.repository.listar(ativo)
        ]

    def _buscar_modelo(self, servico_id: int) -> Servico:
        servico = self.repository.buscar(servico_id)
        if servico is None:
            raise ServicoNaoEncontrado("Serviço não encontrado")
        return servico

    def buscar(self, servico_id: int) -> ServicoResponse:
        return ServicoResponse.model_validate(self._buscar_modelo(servico_id))

    def substituir(self, servico_id: int, dados: ServicoReplace) -> ServicoResponse:
        return self._atualizar(servico_id, dados.model_dump(mode="json"))

    def atualizar(self, servico_id: int, dados: ServicoPatch) -> ServicoResponse:
        return self._atualizar(
            servico_id, dados.model_dump(mode="json", exclude_unset=True)
        )

    def _atualizar(self, servico_id: int, alteracoes: dict) -> ServicoResponse:
        servico = self._buscar_modelo(servico_id)
        atual = ServicoResponse.model_validate(servico).model_dump(mode="json")
        atual.update(alteracoes)
        validado = ServicoResponse.model_validate(atual)
        for campo, valor in validado.model_dump(mode="json", exclude={"id"}).items():
            setattr(servico, campo, valor)
        return ServicoResponse.model_validate(self.repository.salvar(servico))

    def excluir(self, servico_id: int) -> None:
        self.repository.excluir(self._buscar_modelo(servico_id))
