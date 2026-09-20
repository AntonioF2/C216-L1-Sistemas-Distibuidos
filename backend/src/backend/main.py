from fastapi import FastAPI

from backend.health import criar_relatorio_saude

app = FastAPI()


@app.get("/")
def health_check() -> dict[str, str]:
    return criar_relatorio_saude("backend")
