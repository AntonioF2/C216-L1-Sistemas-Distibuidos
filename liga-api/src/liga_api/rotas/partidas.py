from collections.abc import Iterator
from typing import Annotated

from fastapi import APIRouter, Body, Depends, Path, Query, Request, Response, status

from liga_api.repositorios.postgres import CatalogoPostgres, PartidasPostgres
from liga_api.schemas.partida import (
    LIMITE_INTEIRO,
    PartidaEntrada,
    PartidaSaida,
    PlacarEntrada,
    TimeSaida,
)
from liga_api.servicos.partidas import ServicoPartidas


def obter_servico(requisicao: Request) -> Iterator[ServicoPartidas]:
    estado = requisicao.app.state
    servico = getattr(estado, "servico_partidas", None)
    if servico is not None:
        yield servico
        return
    with estado.sessoes() as sessao:
        yield ServicoPartidas(CatalogoPostgres(sessao), PartidasPostgres(sessao))


ServicoDaRodada = Annotated[ServicoPartidas, Depends(obter_servico)]
IdPartida = Annotated[int, Path(gt=0, le=LIMITE_INTEIRO)]

router = APIRouter(tags=["Mesa da Rodada"])


@router.get("/times", response_model=list[TimeSaida])
def listar_times(servico: ServicoDaRodada):
    return servico.listar_times()


@router.post(
    "/partidas", response_model=PartidaSaida, status_code=status.HTTP_201_CREATED
)
def registrar_partida(dados: PartidaEntrada, servico: ServicoDaRodada):
    return servico.criar(**dados.model_dump())


@router.get("/partidas", response_model=list[PartidaSaida])
def listar_partidas(
    servico: ServicoDaRodada,
    rodada: Annotated[int | None, Query(gt=0, le=LIMITE_INTEIRO)] = None,
    calendario: bool = False,
):
    return servico.listar(rodada, calendario=calendario)


@router.put("/rodadas/{rodada}/placares", response_model=list[PartidaSaida])
def salvar_placares(
    rodada: Annotated[int, Path(ge=1, le=38)],
    placares: Annotated[list[PlacarEntrada], Body(min_length=1, max_length=10)],
    servico: ServicoDaRodada,
):
    return servico.salvar_rodada(rodada, [placar.model_dump() for placar in placares])


@router.get("/partidas/{partida_id}", response_model=PartidaSaida)
def consultar_partida(partida_id: IdPartida, servico: ServicoDaRodada):
    return servico.obter(partida_id)


@router.put("/partidas/{partida_id}", response_model=PartidaSaida)
def atualizar_partida(
    partida_id: IdPartida, dados: PartidaEntrada, servico: ServicoDaRodada
):
    return servico.atualizar(partida_id, **dados.model_dump())


@router.delete("/partidas/{partida_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_partida(partida_id: IdPartida, servico: ServicoDaRodada) -> Response:
    servico.excluir(partida_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/simulacao/placares", status_code=status.HTTP_204_NO_CONTENT)
def zerar_simulacao(servico: ServicoDaRodada) -> Response:
    servico.zerar_simulacao()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
