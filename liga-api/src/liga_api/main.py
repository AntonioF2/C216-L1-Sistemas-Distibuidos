from fastapi import FastAPI

from liga_api.repositorios.memoria import CatalogoTimes, RepositorioPartidasEmMemoria
from liga_api.rotas.erros import tratar_erro_de_dominio
from liga_api.rotas.partidas import router as partidas_router
from liga_api.rotas.saude import router as saude_router
from liga_api.servicos.erros import RecursoNaoEncontrado, RegraPartidaInvalida
from liga_api.servicos.partidas import ServicoPartidas


def criar_app() -> FastAPI:
    aplicacao = FastAPI(
        title="Mesa da Rodada",
        description="API para simular partidas e classificações.",
        version="0.1.0",
    )
    aplicacao.state.servico_partidas = ServicoPartidas(
        CatalogoTimes(), RepositorioPartidasEmMemoria()
    )
    aplicacao.add_exception_handler(RecursoNaoEncontrado, tratar_erro_de_dominio)
    aplicacao.add_exception_handler(RegraPartidaInvalida, tratar_erro_de_dominio)
    aplicacao.include_router(saude_router)
    aplicacao.include_router(partidas_router)
    return aplicacao


app = criar_app()
