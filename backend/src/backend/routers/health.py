from fastapi import APIRouter

from backend.health import criar_relatorio_saude

router = APIRouter(tags=["Saúde"])


@router.get("/")
def health_check() -> dict[str, str]:
    return criar_relatorio_saude("backend")
