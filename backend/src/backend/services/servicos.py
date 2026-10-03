from threading import RLock

from backend.schemas.servico import (
    ServicoCreate,
    ServicoPatch,
    ServicoReplace,
    ServicoResponse,
)


class ServicoNaoEncontrado(Exception):
    pass


class ServicoService:
    def __init__(self):
        self._servicos: dict[int, ServicoResponse] = {}
        self._proximo_id = 1
        self._lock = RLock()

    def criar(self, dados: ServicoCreate) -> ServicoResponse:
        with self._lock:
            servico = ServicoResponse(id=self._proximo_id, **dados.model_dump())
            self._servicos[servico.id] = servico
            self._proximo_id += 1
            return servico.model_copy(deep=True)

    def listar(self, ativo: bool | None = None) -> list[ServicoResponse]:
        with self._lock:
            return [
                servico.model_copy(deep=True)
                for servico in self._servicos.values()
                if ativo is None or servico.ativo == ativo
            ]

    def buscar(self, servico_id: int) -> ServicoResponse:
        with self._lock:
            if servico_id not in self._servicos:
                raise ServicoNaoEncontrado("Serviço não encontrado")
            return self._servicos[servico_id].model_copy(deep=True)

    def substituir(self, servico_id: int, dados: ServicoReplace) -> ServicoResponse:
        with self._lock:
            self.buscar(servico_id)
            servico = ServicoResponse(id=servico_id, **dados.model_dump())
            self._servicos[servico_id] = servico
            return servico.model_copy(deep=True)

    def atualizar(self, servico_id: int, dados: ServicoPatch) -> ServicoResponse:
        with self._lock:
            atual = self.buscar(servico_id).model_dump()
            atual.update(dados.model_dump(exclude_unset=True))
            servico = ServicoResponse.model_validate(atual)
            self._servicos[servico_id] = servico
            return servico.model_copy(deep=True)

    def excluir(self, servico_id: int) -> None:
        with self._lock:
            self.buscar(servico_id)
            del self._servicos[servico_id]
