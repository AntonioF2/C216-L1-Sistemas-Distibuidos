from fastapi import FastAPI

from backend.routers.health import router as health_router
from backend.routers.servicos import router as servicos_router

app = FastAPI(title="Cadastro de serviços")
app.include_router(health_router)
app.include_router(servicos_router)
