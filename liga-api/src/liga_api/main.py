from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import sessionmaker

from liga_api.banco.conexao import criar_motor
from liga_api.escudos import DIRETORIO_ESCUDOS, ROTA_ESCUDOS
from liga_api.rotas.erros import tratar_erro_de_dominio
from liga_api.rotas.partidas import router as partidas_router
from liga_api.rotas.saude import router as saude_router
from liga_api.servicos.erros import RecursoNaoEncontrado, RegraPartidaInvalida
from liga_api.servicos.partidas import ServicoPartidas


def criar_app(servico: ServicoPartidas | None = None) -> FastAPI:
    @asynccontextmanager
    async def lifespan(aplicacao: FastAPI):
        if servico is not None:
            aplicacao.state.servico_partidas = servico
            yield
            return

        motor = criar_motor()
        aplicacao.state.sessoes = sessionmaker(bind=motor)
        try:
            yield
        finally:
            motor.dispose()

    aplicacao = FastAPI(
        title="Mesa da Rodada",
        description="API para simular partidas e classificações.",
        version="0.1.0",
        lifespan=lifespan,
    )
    aplicacao.add_exception_handler(RecursoNaoEncontrado, tratar_erro_de_dominio)
    aplicacao.add_exception_handler(RegraPartidaInvalida, tratar_erro_de_dominio)
    aplicacao.include_router(saude_router)
    aplicacao.include_router(partidas_router)
    aplicacao.mount(
        ROTA_ESCUDOS, StaticFiles(directory=DIRETORIO_ESCUDOS), name="escudos"
    )
    return aplicacao


app = criar_app()
