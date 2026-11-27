from contextlib import asynccontextmanager
from os import getenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import sessionmaker

from liga_api.banco.conexao import criar_motor
from liga_api.escudos import DIRETORIO_ESCUDOS, ROTA_ESCUDOS
from liga_api.rotas.erros import tratar_erro_de_dominio
from liga_api.rotas.partidas import router as partidas_router
from liga_api.rotas.saude import router as saude_router
from liga_api.servicos.erros import RecursoNaoEncontrado, RegraPartidaInvalida
from liga_api.servicos.partidas import ServicoPartidas


def _configurar_cors(aplicacao: FastAPI) -> None:
    origens_configuradas = getenv(
        "MESA_ORIGENS_FRONTEND", "http://127.0.0.1:5173,http://localhost:5173"
    )
    origens_frontend = [
        origem.strip().rstrip("/")
        for origem in origens_configuradas.split(",")
        if origem.strip()
    ]
    aplicacao.add_middleware(
        CORSMiddleware,
        allow_origins=origens_frontend,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["Content-Type"],
    )


def criar_app(servico: ServicoPartidas | None = None) -> FastAPI:
    @asynccontextmanager
    async def ciclo_de_vida(aplicacao: FastAPI):
        if servico is not None:
            aplicacao.state.servico_partidas = servico
            yield
            return

        motor_banco = criar_motor()
        aplicacao.state.sessoes = sessionmaker(bind=motor_banco)
        try:
            yield
        finally:
            motor_banco.dispose()

    aplicacao = FastAPI(
        title="Mesa da Rodada",
        description="API para simular partidas e classificações.",
        version="0.1.0",
        lifespan=ciclo_de_vida,
    )
    _configurar_cors(aplicacao)
    aplicacao.add_exception_handler(RecursoNaoEncontrado, tratar_erro_de_dominio)
    aplicacao.add_exception_handler(RegraPartidaInvalida, tratar_erro_de_dominio)
    aplicacao.include_router(saude_router)
    aplicacao.include_router(partidas_router)
    aplicacao.mount(
        ROTA_ESCUDOS, StaticFiles(directory=DIRETORIO_ESCUDOS), name="escudos"
    )
    return aplicacao


app = criar_app()
