from typing import Annotated

from fastapi import APIRouter, Depends, Path, Response, status
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.repositories.servicos import ServicoRepository
from backend.schemas.servico import (
    ServicoCreate,
    ServicoPatch,
    ServicoReplace,
    ServicoResponse,
)
from backend.services.servicos import ServicoService

router = APIRouter(prefix="/servicos", tags=["Serviços"])


def get_servico_service(db: Annotated[Session, Depends(get_db)]) -> ServicoService:
    return ServicoService(ServicoRepository(db))


Service = Annotated[ServicoService, Depends(get_servico_service)]
ServicoId = Annotated[int, Path(gt=0)]


@router.post("", response_model=ServicoResponse, status_code=status.HTTP_201_CREATED)
def criar(dados: ServicoCreate, service: Service):
    return service.criar(dados)


@router.get("", response_model=list[ServicoResponse])
def listar(service: Service, ativo: bool | None = None):
    return service.listar(ativo)


@router.get("/{servico_id}", response_model=ServicoResponse)
def buscar(servico_id: ServicoId, service: Service):
    return service.buscar(servico_id)


@router.put("/{servico_id}", response_model=ServicoResponse)
def substituir(servico_id: ServicoId, dados: ServicoReplace, service: Service):
    return service.substituir(servico_id, dados)


@router.patch("/{servico_id}", response_model=ServicoResponse)
def atualizar(servico_id: ServicoId, dados: ServicoPatch, service: Service):
    return service.atualizar(servico_id, dados)


@router.delete("/{servico_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir(servico_id: ServicoId, service: Service):
    service.excluir(servico_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
