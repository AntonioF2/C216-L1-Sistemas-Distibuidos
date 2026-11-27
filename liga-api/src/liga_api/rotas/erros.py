from fastapi import Request
from fastapi.responses import JSONResponse

from liga_api.servicos.erros import RecursoNaoEncontrado


async def tratar_erro_de_dominio(_requisicao: Request, erro: Exception) -> JSONResponse:
    codigo = 404 if isinstance(erro, RecursoNaoEncontrado) else 422
    return JSONResponse(status_code=codigo, content={"detail": str(erro)})
