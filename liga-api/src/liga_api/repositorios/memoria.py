from dataclasses import replace
from itertools import count
from threading import Lock

from liga_api.modelos.futebol import Partida, Time


class CatalogoTimes:
    """Catálogo mínimo para testes sem banco."""

    def __init__(self) -> None:
        self._times = {
            time.id: time
            for time in (
                Time(1, "Mandante de teste", "MDT"),
                Time(2, "Visitante de teste", "VST"),
                Time(3, "Terceiro time de teste", "TTT"),
                Time(4, "Quarto time de teste", "QTT"),
            )
        }

    def listar(self) -> list[Time]:
        return list(self._times.values())

    def obter(self, time_id: int) -> Time | None:
        return self._times.get(time_id)


class RepositorioPartidasEmMemoria:
    def __init__(self) -> None:
        self._partidas: dict[int, Partida] = {}
        self._sequencia = count(1)
        self._lock = Lock()

    def listar(
        self, rodada: int | None = None, *, calendario: bool = False
    ) -> list[Partida]:
        with self._lock:
            return [
                partida
                for partida in self._partidas.values()
                if (rodada is None or partida.rodada == rodada)
                and (not calendario or partida.chave_confronto is not None)
            ]

    def obter(self, partida_id: int) -> Partida | None:
        with self._lock:
            return self._partidas.get(partida_id)

    def adicionar(self, partida: Partida) -> Partida:
        with self._lock:
            registrada = replace(partida, id=next(self._sequencia))
            self._partidas[registrada.id] = registrada
            return registrada

    def salvar_lote(self, partidas: list[Partida]) -> list[Partida]:
        with self._lock:
            ids = {
                partida.chave_confronto: partida.id
                for partida in self._partidas.values()
                if partida.chave_confronto is not None
            }
            salvas = []
            for partida in partidas:
                partida_id = ids.get(partida.chave_confronto)
                registrada = replace(partida, id=partida_id or next(self._sequencia))
                self._partidas[registrada.id] = registrada
                salvas.append(registrada)
            return salvas

    def substituir(self, partida: Partida) -> bool:
        with self._lock:
            if partida.id not in self._partidas:
                return False
            self._partidas[partida.id] = partida
            return True

    def remover(self, partida_id: int) -> bool:
        with self._lock:
            return self._partidas.pop(partida_id, None) is not None
