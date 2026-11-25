from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, Request, Response, status

from liga_api.schemas.partida import PartidaEntrada, PartidaSaida, TimeSaida
from liga_api.servicos.partidas import ServicoPartidas


def obter_servico(requisicao: Request) -> ServicoPartidas:
    return requisicao.app.state.servico_partidas


ServicoDaRodada = Annotated[ServicoPartidas, Depends(obter_servico)]
IdPartida = Annotated[int, Path(gt=0)]

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
    rodada: Annotated[int | None, Query(gt=0)] = None,
):
    return servico.listar(rodada)


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
