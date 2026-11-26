from functools import cache

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


def _detalhar_partida(
    partida: Partida, mandante: Time, visitante: Time
) -> dict[str, object]:
    resultado = apurar_placar(partida.gols_mandante, partida.gols_visitante)
    vencedor_id = None
    if resultado.situacao == "vitoria_mandante":
        vencedor_id = mandante.id
    elif resultado.situacao == "vitoria_visitante":
        vencedor_id = visitante.id

    return {
        "id": partida.id,
        "rodada": partida.rodada,
        "mandante": mandante,
        "visitante": visitante,
        "gols_mandante": partida.gols_mandante,
        "gols_visitante": partida.gols_visitante,
        "resultado": resultado.situacao,
        "vencedor_id": vencedor_id,
        "pontos_mandante": resultado.pontos_mandante,
        "pontos_visitante": resultado.pontos_visitante,
    }


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

    def _obter_time_ativo(self, time_id: int) -> Time:
        time = self._obter_time(time_id)
        if not time.ativo:
            raise RecursoNaoEncontrado(f"Time {time_id} fora do catalogo ativo.")
        return time

    def _obter_partida(self, partida_id: int) -> Partida:
        partida = self._repositorio.obter(partida_id)
        if partida is None:
            raise RecursoNaoEncontrado(f"Partida {partida_id} nao encontrada.")
        return partida

    def _preparar_placar_para_gravacao(self, partida: Partida) -> dict[str, object]:
        if type(partida.rodada) is not int or partida.rodada < 1:
            raise RegraPartidaInvalida("A rodada deve ser um inteiro positivo.")
        for time_id in (partida.mandante_id, partida.visitante_id):
            if type(time_id) is not int or time_id < 1:
                raise RegraPartidaInvalida(
                    "Os identificadores dos times devem ser positivos."
                )
        if partida.mandante_id == partida.visitante_id:
            raise RegraPartidaInvalida("Um time nao pode enfrentar a si mesmo.")
        mandante = self._obter_time_ativo(partida.mandante_id)
        visitante = self._obter_time_ativo(partida.visitante_id)
        return _detalhar_partida(partida, mandante, visitante)

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
        detalhes_placar = self._preparar_placar_para_gravacao(partida)
        partida_salva = self._repositorio.adicionar(partida)
        return {**detalhes_placar, "id": partida_salva.id}

    def listar(
        self, rodada: int | None = None, *, calendario: bool = False
    ) -> list[dict[str, object]]:
        partidas = self._repositorio.listar(rodada, calendario=calendario)
        obter_time_por_id = cache(self._obter_time)
        return [
            _detalhar_partida(
                partida,
                obter_time_por_id(partida.mandante_id),
                obter_time_por_id(partida.visitante_id),
            )
            for partida in partidas
        ]

    def salvar_rodada(
        self, rodada: int, placares: list[dict[str, int]]
    ) -> list[dict[str, object]]:
        partidas_da_rodada = []
        detalhes_por_confronto = {}
        for placar in placares:
            chave = f"{rodada}:{placar['mandante_id']}:{placar['visitante_id']}"
            if chave in detalhes_por_confronto:
                raise RegraPartidaInvalida("Envie apenas um placar por confronto.")
            partida = Partida(id=0, rodada=rodada, chave_confronto=chave, **placar)
            detalhes_por_confronto[chave] = self._preparar_placar_para_gravacao(partida)
            partidas_da_rodada.append(partida)

        partidas_salvas = self._repositorio.salvar_lote(partidas_da_rodada)
        return [
            {**detalhes_por_confronto[partida.chave_confronto], "id": partida.id}
            for partida in partidas_salvas
        ]

    def obter(self, partida_id: int) -> dict[str, object]:
        partida = self._obter_partida(partida_id)
        return _detalhar_partida(
            partida,
            self._obter_time(partida.mandante_id),
            self._obter_time(partida.visitante_id),
        )

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
        anterior = self._obter_partida(partida_id)
        if anterior.chave_confronto and (rodada, mandante_id, visitante_id) != (
            anterior.rodada,
            anterior.mandante_id,
            anterior.visitante_id,
        ):
            raise RegraPartidaInvalida("Um placar do calendário mantém seu confronto.")
        partida = Partida(
            partida_id,
            rodada,
            mandante_id,
            visitante_id,
            gols_mandante,
            gols_visitante,
            anterior.chave_confronto,
        )
        detalhes_placar = self._preparar_placar_para_gravacao(partida)
        if not self._repositorio.substituir(partida):
            raise RecursoNaoEncontrado(f"Partida {partida_id} nao encontrada.")
        return detalhes_placar

    def excluir(self, partida_id: int) -> None:
        if not self._repositorio.remover(partida_id):
            raise RecursoNaoEncontrado(f"Partida {partida_id} nao encontrada.")

    def zerar_simulacao(self) -> None:
        self._repositorio.limpar_calendario()
