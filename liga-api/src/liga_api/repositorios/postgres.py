from dataclasses import asdict

from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session

from liga_api.modelos.futebol import Partida, Time
from liga_api.modelos.persistencia import PartidaORM, TimeORM


def _para_partida(registro: PartidaORM) -> Partida:
    return Partida(
        id=registro.id,
        rodada=registro.rodada,
        mandante_id=registro.mandante_id,
        visitante_id=registro.visitante_id,
        gols_mandante=registro.gols_mandante,
        gols_visitante=registro.gols_visitante,
    )


class CatalogoPostgres:
    def __init__(self, sessao: Session) -> None:
        self._sessao = sessao

    def listar(self) -> list[Time]:
        registros = self._sessao.scalars(select(TimeORM).order_by(TimeORM.id))
        return [
            Time(registro.id, registro.nome, registro.sigla) for registro in registros
        ]

    def obter(self, time_id: int) -> Time | None:
        registro = self._sessao.get(TimeORM, time_id)
        if registro is None:
            return None
        return Time(registro.id, registro.nome, registro.sigla)


class PartidasPostgres:
    def __init__(self, sessao: Session) -> None:
        self._sessao = sessao

    def listar(self, rodada: int | None = None) -> list[Partida]:
        consulta = select(PartidaORM).order_by(PartidaORM.id)
        if rodada is not None:
            consulta = consulta.where(PartidaORM.rodada == rodada)
        return [_para_partida(registro) for registro in self._sessao.scalars(consulta)]

    def obter(self, partida_id: int) -> Partida | None:
        registro = self._sessao.get(PartidaORM, partida_id)
        return _para_partida(registro) if registro is not None else None

    def adicionar(self, partida: Partida) -> Partida:
        dados = asdict(partida)
        del dados["id"]
        registro = PartidaORM(**dados)
        self._sessao.add(registro)
        self._sessao.flush()
        criada = _para_partida(registro)
        self._sessao.commit()
        return criada

    def substituir(self, partida: Partida) -> bool:
        dados = asdict(partida)
        del dados["id"]
        alterada = self._sessao.scalar(
            update(PartidaORM)
            .where(PartidaORM.id == partida.id)
            .values(**dados)
            .returning(PartidaORM.id)
        )
        self._sessao.commit()
        return alterada is not None

    def remover(self, partida_id: int) -> bool:
        removida = self._sessao.scalar(
            delete(PartidaORM)
            .where(PartidaORM.id == partida_id)
            .returning(PartidaORM.id)
        )
        self._sessao.commit()
        return removida is not None
