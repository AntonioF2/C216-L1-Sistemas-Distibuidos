from dataclasses import asdict

from sqlalchemy import delete, select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from liga_api.modelos.futebol import Partida, Time
from liga_api.modelos.persistencia import PartidaORM, TimeORM


def _partida_do_registro(registro: PartidaORM) -> Partida:
    return Partida(
        id=registro.id,
        rodada=registro.rodada,
        mandante_id=registro.mandante_id,
        visitante_id=registro.visitante_id,
        gols_mandante=registro.gols_mandante,
        gols_visitante=registro.gols_visitante,
        chave_confronto=registro.chave_confronto,
    )


def _dados_para_gravar(partida: Partida) -> dict[str, object]:
    dados_partida = asdict(partida)
    del dados_partida["id"]
    return dados_partida


class CatalogoPostgres:
    def __init__(self, sessao: Session) -> None:
        self._sessao = sessao

    def listar(self) -> list[Time]:
        registros = self._sessao.scalars(
            select(TimeORM).where(TimeORM.ativo.is_(True)).order_by(TimeORM.id)
        )
        return [
            Time(registro.id, registro.nome, registro.sigla) for registro in registros
        ]

    def obter(self, time_id: int) -> Time | None:
        registro = self._sessao.get(TimeORM, time_id)
        if registro is None:
            return None
        return Time(registro.id, registro.nome, registro.sigla, registro.ativo)


class PartidasPostgres:
    def __init__(self, sessao: Session) -> None:
        self._sessao = sessao

    def listar(
        self, rodada: int | None = None, *, calendario: bool = False
    ) -> list[Partida]:
        consulta = select(PartidaORM).order_by(PartidaORM.id)
        if rodada is not None:
            consulta = consulta.where(PartidaORM.rodada == rodada)
        if calendario:
            consulta = consulta.where(PartidaORM.chave_confronto.is_not(None))
        return [
            _partida_do_registro(registro)
            for registro in self._sessao.scalars(consulta)
        ]

    def obter(self, partida_id: int) -> Partida | None:
        registro = self._sessao.get(PartidaORM, partida_id)
        return _partida_do_registro(registro) if registro is not None else None

    def adicionar(self, partida: Partida) -> Partida:
        registro = PartidaORM(**_dados_para_gravar(partida))
        self._sessao.add(registro)
        self._sessao.flush()
        partida_criada = _partida_do_registro(registro)
        self._sessao.commit()
        return partida_criada

    def salvar_lote(self, partidas: list[Partida]) -> list[Partida]:
        partidas_ordenadas = sorted(
            partidas, key=lambda partida: (partida.mandante_id, partida.visitante_id)
        )
        insercao = insert(PartidaORM).values(
            [_dados_para_gravar(partida) for partida in partidas_ordenadas]
        )
        gravar_placares = insercao.on_conflict_do_update(
            index_elements=[PartidaORM.chave_confronto],
            set_={
                "gols_mandante": insercao.excluded.gols_mandante,
                "gols_visitante": insercao.excluded.gols_visitante,
            },
        ).returning(PartidaORM)
        partidas_salvas = [
            _partida_do_registro(registro)
            for registro in self._sessao.scalars(gravar_placares)
        ]
        self._sessao.commit()
        return partidas_salvas

    def substituir(self, partida: Partida) -> bool:
        id_alterado = self._sessao.scalar(
            update(PartidaORM)
            .where(PartidaORM.id == partida.id)
            .values(**_dados_para_gravar(partida))
            .returning(PartidaORM.id)
        )
        self._sessao.commit()
        return id_alterado is not None

    def remover(self, partida_id: int) -> bool:
        id_removido = self._sessao.scalar(
            delete(PartidaORM)
            .where(PartidaORM.id == partida_id)
            .returning(PartidaORM.id)
        )
        self._sessao.commit()
        return id_removido is not None
