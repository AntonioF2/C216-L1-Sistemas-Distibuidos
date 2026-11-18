from fastapi import FastAPI

from liga_api.rotas.saude import router as saude_router

app = FastAPI(
    title="Mesa da Rodada",
    description="API para simular partidas e classificações.",
    version="0.1.0",
)

app.include_router(saude_router)
