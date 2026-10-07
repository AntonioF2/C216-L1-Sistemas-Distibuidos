from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Response, status

from backend.schemas.servico import (
    ServicoCreate,
    ServicoPatch,
    ServicoReplace,
    ServicoResponse,
)
from backend.services.servicos import ServicoNaoEncontrado, ServicoService

router = APIRouter(prefix="/servicos", tags=["Serviços"])
_service = ServicoService()


def get_servico_service() -> ServicoService:
    return _service


Service = Annotated[ServicoService, Depends(get_servico_service)]
ServicoId = Annotated[int, Path(gt=0)]


def verificar_existencia(service: ServicoService, servico_id: int) -> ServicoResponse:
    try:
        return service.buscar(servico_id)
    except ServicoNaoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc


@router.post("", response_model=ServicoResponse, status_code=status.HTTP_201_CREATED)
def criar(dados: ServicoCreate, service: Service):
    return service.criar(dados)


@router.get("", response_model=list[ServicoResponse])
def listar(service: Service, ativo: bool | None = None):
    return service.listar(ativo)


@router.get("/{servico_id}", response_model=ServicoResponse)
def buscar(servico_id: ServicoId, service: Service):
    return verificar_existencia(service, servico_id)


@router.put("/{servico_id}", response_model=ServicoResponse)
def substituir(servico_id: ServicoId, dados: ServicoReplace, service: Service):
    try:
        return service.substituir(servico_id, dados)
    except ServicoNaoEncontrado as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.patch("/{servico_id}", response_model=ServicoResponse)
def atualizar(servico_id: ServicoId, dados: ServicoPatch, service: Service):
    try:
        return service.atualizar(servico_id, dados)
    except ServicoNaoEncontrado as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.delete("/{servico_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir(servico_id: ServicoId, service: Service):
    try:
        service.excluir(servico_id)
    except ServicoNaoEncontrado as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)
