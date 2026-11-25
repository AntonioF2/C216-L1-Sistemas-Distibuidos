from pathlib import Path

DIRETORIO_ESCUDOS = Path(__file__).resolve().parent / "assets" / "escudos"
ROTA_ESCUDOS = "/escudos"


def url_escudo(sigla: str) -> str | None:
    nome = f"{sigla.lower()}.png"
    if (DIRETORIO_ESCUDOS / nome).is_file():
        return f"{ROTA_ESCUDOS}/{nome}"
    return None
