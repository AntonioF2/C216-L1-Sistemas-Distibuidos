from fastapi import APIRouter

router = APIRouter(tags=["Saúde"])


@router.get("/saude")
def consultar_saude() -> dict[str, str]:
    return {
        "status": "ok",
        "projeto": "Mesa da Rodada",
    }
