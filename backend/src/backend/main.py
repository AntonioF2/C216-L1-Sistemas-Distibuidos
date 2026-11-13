from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.core.config import get_cors_origins
from backend.routers.health import router as health_router
from backend.routers.servicos import router as servicos_router
from backend.services.servicos import ServicoNaoEncontrado, ServicoNomeDuplicado

app = FastAPI(title="Cadastro de serviços")
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type"],
)
app.include_router(health_router)
app.include_router(servicos_router)


@app.exception_handler(ServicoNaoEncontrado)
async def servico_nao_encontrado(request: Request, erro: ServicoNaoEncontrado):
    return JSONResponse(status_code=404, content={"detail": str(erro)})


@app.exception_handler(ServicoNomeDuplicado)
async def nome_duplicado(request: Request, erro: ServicoNomeDuplicado):
    return JSONResponse(status_code=409, content={"detail": str(erro)})
