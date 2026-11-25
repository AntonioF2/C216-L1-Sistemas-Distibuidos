from liga_api.modelos.futebol import Partida, ResultadoPlacar, Time
from liga_api.repositorios.contratos import RepositorioPartidas, RepositorioTimes
from liga_api.servicos.erros import RecursoNaoEncontrado, RegraPartidaInvalida


def apurar_placar(gols_mandante: int, gols_visitante: int) -> ResultadoPlacar:
    for gols in (gols_mandante, gols_visitante):
        if type(gols) is not int or gols < 0:
            raise RegraPartidaInvalida("Os gols devem ser inteiros nao negativos.")
    if gols_mandante > gols_visitante:
        return ResultadoPlacar("vitoria_mandante", 3, 0)
    if gols_mandante < gols_visitante:
        return ResultadoPlacar("vitoria_visitante", 0, 3)
    return ResultadoPlacar("empate", 1, 1)


class ServicoPartidas:
    def __init__(
        self, catalogo: RepositorioTimes, repositorio: RepositorioPartidas
    ) -> None:
        self._catalogo = catalogo
        self._repositorio = repositorio

    def listar_times(self) -> list[Time]:
        return self._catalogo.listar()

    def _obter_time(self, time_id: int) -> Time:
        time = self._catalogo.obter(time_id)
        if time is None:
            raise RecursoNaoEncontrado(f"Time {time_id} nao encontrado.")
        return time

    def _validar(self, partida: Partida) -> None:
        if type(partida.rodada) is not int or partida.rodada < 1:
            raise RegraPartidaInvalida("A rodada deve ser um inteiro positivo.")
        for time_id in (partida.mandante_id, partida.visitante_id):
            if type(time_id) is not int or time_id < 1:
                raise RegraPartidaInvalida(
                    "Os identificadores dos times devem ser positivos."
                )
        if partida.mandante_id == partida.visitante_id:
            raise RegraPartidaInvalida("Um time nao pode enfrentar a si mesmo.")
        for time_id in (partida.mandante_id, partida.visitante_id):
            if not self._obter_time(time_id).ativo:
                raise RecursoNaoEncontrado(f"Time {time_id} fora do catalogo ativo.")
        apurar_placar(partida.gols_mandante, partida.gols_visitante)

    def _detalhar(self, partida: Partida) -> dict[str, object]:
        resultado = apurar_placar(partida.gols_mandante, partida.gols_visitante)
        vencedor_id = None
        if resultado.situacao == "vitoria_mandante":
            vencedor_id = partida.mandante_id
        elif resultado.situacao == "vitoria_visitante":
            vencedor_id = partida.visitante_id
        return {
            "id": partida.id,
            "rodada": partida.rodada,
            "mandante": self._obter_time(partida.mandante_id),
            "visitante": self._obter_time(partida.visitante_id),
            "gols_mandante": partida.gols_mandante,
            "gols_visitante": partida.gols_visitante,
            "resultado": resultado.situacao,
            "vencedor_id": vencedor_id,
            "pontos_mandante": resultado.pontos_mandante,
            "pontos_visitante": resultado.pontos_visitante,
        }

    def criar(
        self,
        *,
        mandante_id: int,
        visitante_id: int,
        gols_mandante: int,
        gols_visitante: int,
        rodada: int = 1,
    ) -> dict[str, object]:
        partida = Partida(
            0, rodada, mandante_id, visitante_id, gols_mandante, gols_visitante
        )
        self._validar(partida)
        return self._detalhar(self._repositorio.adicionar(partida))

    def listar(self, rodada: int | None = None) -> list[dict[str, object]]:
        return [self._detalhar(partida) for partida in self._repositorio.listar(rodada)]

    def obter(self, partida_id: int) -> dict[str, object]:
        partida = self._repositorio.obter(partida_id)
        if partida is None:
            raise RecursoNaoEncontrado(f"Partida {partida_id} nao encontrada.")
        return self._detalhar(partida)

    def atualizar(
        self,
        partida_id: int,
        *,
        mandante_id: int,
        visitante_id: int,
        gols_mandante: int,
        gols_visitante: int,
        rodada: int = 1,
    ) -> dict[str, object]:
        self.obter(partida_id)
        partida = Partida(
            partida_id, rodada, mandante_id, visitante_id, gols_mandante, gols_visitante
        )
        self._validar(partida)
        if not self._repositorio.substituir(partida):
            raise RecursoNaoEncontrado(f"Partida {partida_id} nao encontrada.")
        return self._detalhar(partida)

    def excluir(self, partida_id: int) -> None:
        if not self._repositorio.remover(partida_id):
            raise RecursoNaoEncontrado(f"Partida {partida_id} nao encontrada.")
