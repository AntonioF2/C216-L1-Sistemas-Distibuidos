from psycopg.errors import UniqueViolation
from sqlalchemy.exc import IntegrityError

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


class ServicoNomeDuplicado(Exception):
    pass


class ServicoService:
    def __init__(self, repository: ServicoRepository):
        self.repository = repository

    def criar(self, dados: ServicoCreate) -> ServicoResponse:
        self._verificar_nome(dados.nome)
        servico = Servico(**dados.model_dump(mode="json"))
        return self._salvar(servico)

    def listar(self, ativo: bool | None = None) -> list[ServicoResponse]:
        return [
            ServicoResponse.model_validate(servico)
            for servico in self.repository.listar(ativo)
        ]

    def buscar(self, servico_id: int) -> ServicoResponse:
        return ServicoResponse.model_validate(self._buscar_modelo(servico_id))

    def substituir(self, servico_id: int, dados: ServicoReplace) -> ServicoResponse:
        return self._atualizar(servico_id, dados.model_dump(mode="json"))

    def atualizar(self, servico_id: int, dados: ServicoPatch) -> ServicoResponse:
        return self._atualizar(
            servico_id, dados.model_dump(mode="json", exclude_unset=True)
        )

    def excluir(self, servico_id: int) -> None:
        self.repository.excluir(self._buscar_modelo(servico_id))

    def _buscar_modelo(self, servico_id: int) -> Servico:
        servico = self.repository.buscar(servico_id)
        if servico is None:
            raise ServicoNaoEncontrado("Serviço não encontrado")
        return servico

    def _verificar_nome(self, nome: str, servico_id: int | None = None):
        servico_existente = self.repository.buscar_por_nome(nome)
        if servico_existente is not None and servico_existente.id != servico_id:
            raise ServicoNomeDuplicado("Já existe um serviço com esse nome")

    def _atualizar(self, servico_id: int, alteracoes: dict) -> ServicoResponse:
        servico = self._buscar_modelo(servico_id)
        novo_nome = alteracoes.get("nome")
        if novo_nome is not None and novo_nome != servico.nome:
            self._verificar_nome(novo_nome, servico_id)
        for campo, valor in alteracoes.items():
            setattr(servico, campo, valor)
        return self._salvar(servico)

    def _salvar(self, servico: Servico) -> ServicoResponse:
        try:
            return ServicoResponse.model_validate(self.repository.salvar(servico))
        except IntegrityError as erro:
            if (
                isinstance(erro.orig, UniqueViolation)
                and erro.orig.diag.constraint_name == "uq_servicos_nome"
            ):
                raise ServicoNomeDuplicado(
                    "Já existe um serviço com esse nome"
                ) from erro
            raise
