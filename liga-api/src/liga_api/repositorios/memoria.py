from dataclasses import replace
from itertools import count
from threading import Lock

from liga_api.modelos.futebol import Partida, Time


class CatalogoTimes:
    """Clubes ficticios para exercitar a API sem depender de dados externos."""

    def __init__(self) -> None:
        self._times = {
            time.id: time
            for time in (
                Time(1, "Aurora Futebol Clube", "AUR"),
                Time(2, "Uniao da Serra", "USE"),
                Time(3, "Atletico do Vale", "AVA"),
                Time(4, "Estrela do Sul", "ESU"),
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

    def listar(self, rodada: int | None = None) -> list[Partida]:
        with self._lock:
            return [
                partida
                for partida in self._partidas.values()
                if rodada is None or partida.rodada == rodada
            ]

    def obter(self, partida_id: int) -> Partida | None:
        with self._lock:
            return self._partidas.get(partida_id)

    def adicionar(self, partida: Partida) -> Partida:
        with self._lock:
            registrada = replace(partida, id=next(self._sequencia))
            self._partidas[registrada.id] = registrada
            return registrada

    def substituir(self, partida: Partida) -> bool:
        with self._lock:
            if partida.id not in self._partidas:
                return False
            self._partidas[partida.id] = partida
            return True

    def remover(self, partida_id: int) -> bool:
        with self._lock:
            return self._partidas.pop(partida_id, None) is not None
