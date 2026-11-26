"""Executa o Playwright com banco e portas isolados do ambiente de desenvolvimento."""

import os
import shutil
import socket
import subprocess
from pathlib import Path
from secrets import token_hex
from tempfile import TemporaryDirectory

RAIZ = Path(__file__).resolve().parents[1]


def portas_de_teste() -> tuple[int, int]:
    with socket.socket() as api, socket.socket() as web:
        api.bind(("127.0.0.1", 0))
        web.bind(("127.0.0.1", 0))
        return api.getsockname()[1], web.getsockname()[1]


def preparar_ambiente_de_teste() -> dict[str, str]:
    porta_api, porta_web = portas_de_teste()
    origem = f"http://127.0.0.1:{porta_web}"
    return {
        **os.environ,
        "MESA_DB_NOME": "rodada_e2e",
        "MESA_DB_USUARIO": "teste_mesa",
        "MESA_DB_SENHA": token_hex(24),
        "MESA_API_PORTA": str(porta_api),
        "MESA_FRONTEND_PORTA": str(porta_web),
        "MESA_ORIGENS_FRONTEND": origem,
        "VITE_MESA_API_URL": f"http://127.0.0.1:{porta_api}",
        "MESA_E2E_URL": origem,
    }


def executar_comando(
    comando: list[str], ambiente: dict[str, str], *, exigir_sucesso: bool = True
) -> None:
    subprocess.run(comando, cwd=RAIZ, env=ambiente, check=exigir_sucesso)


def main() -> None:
    npm = shutil.which("npm")
    if npm is None:
        raise SystemExit("Instale Node.js e npm antes de executar o E2E.")

    projeto = f"mesa-rodada-e2e-{token_hex(4)}"
    ambiente = preparar_ambiente_de_teste()
    with TemporaryDirectory(prefix=projeto) as temporario:
        arquivo_env = Path(temporario) / "compose.env"
        arquivo_env.touch()
        compose = ["docker", "compose", "--env-file", str(arquivo_env), "-p", projeto]
        try:
            executar_comando(
                [*compose, "up", "-d", "--build", "--wait", "--wait-timeout", "120"],
                ambiente,
            )
            executar_comando(
                [npm, "--prefix", "frontend", "run", "test:e2e"],
                ambiente,
            )
        except subprocess.CalledProcessError:
            executar_comando(
                [*compose, "logs", "--tail", "40"], ambiente, exigir_sucesso=False
            )
            raise
        finally:
            executar_comando(
                [*compose, "down", "--volumes", "--rmi", "local"], ambiente
            )


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as erro:
        raise SystemExit(erro.returncode) from erro
