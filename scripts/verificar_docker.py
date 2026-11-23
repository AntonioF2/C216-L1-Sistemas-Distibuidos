"""Verifica a infraestrutura local sem dependencias Python adicionais."""

import argparse
import json
import subprocess
from pathlib import Path
from urllib.request import urlopen
from uuid import uuid4

RAIZ = Path(__file__).resolve().parents[1]


def compose(*argumentos: str, entrada: str | None = None) -> str:
    resultado = subprocess.run(
        ["docker", "compose", *argumentos],
        cwd=RAIZ,
        input=entrada,
        text=True,
        capture_output=True,
        check=True,
    )
    return resultado.stdout.strip()


def consultar_banco(sql: str) -> str:
    return compose(
        "exec",
        "-T",
        "banco-mesa",
        "sh",
        "-c",
        'exec psql --username="$POSTGRES_USER" --dbname="$POSTGRES_DB" '
        "--no-psqlrc --set=ON_ERROR_STOP=1 --tuples-only --no-align --quiet",
        entrada=sql,
    )


def verificar_servicos() -> None:
    endereco = compose("port", "api-mesa", "8000")
    porta = int(endereco.rsplit(":", 1)[1])
    url = f"http://127.0.0.1:{porta}/saude"
    with urlopen(url, timeout=5) as resposta:
        corpo = json.load(resposta)
        if resposta.status != 200 or corpo != {
            "status": "ok",
            "projeto": "Mesa da Rodada",
        }:
            raise RuntimeError("Resposta inesperada no endpoint de saude.")
    print(f"OK: API HTTP 200 em {url}: {json.dumps(corpo)}")

    usuario = compose(
        "exec", "-T", "api-mesa", "python", "-c", "import os; print(os.getuid())"
    )
    if usuario == "0":
        raise RuntimeError("A API esta executando como root.")
    print(f"OK: API executando sem privilegios de root (UID {usuario}).")

    compose(
        "exec",
        "-T",
        "api-mesa",
        "python",
        "-c",
        "import socket; socket.create_connection(('banco-mesa', 5432), timeout=5).close()",
    )
    print("OK: API alcanca banco-mesa:5432 pela rede do Compose (conexao TCP).")

    banco = consultar_banco("SELECT current_database();")
    if not banco:
        raise RuntimeError("O PostgreSQL nao retornou o nome do banco.")
    print(f"OK: PostgreSQL respondeu a consulta SQL no banco {banco}.")


def verificar_persistencia() -> None:
    marcador = uuid4().hex
    schema = f"checagem_docker_{marcador}"
    consultar_banco(
        f"CREATE SCHEMA {schema};\n"
        f"CREATE TABLE {schema}.marcador (valor text NOT NULL);\n"
        f"INSERT INTO {schema}.marcador VALUES ('{marcador}');\n"
    )
    try:
        print(
            "Marcador SQL criado. Recriando apenas os containers deste projeto...",
            flush=True,
        )
        compose("down")
        compose("up", "--detach", "--wait", "--wait-timeout", "120")
        valor = consultar_banco(f"SELECT valor FROM {schema}.marcador;")
        if valor != marcador:
            raise RuntimeError(
                "O registro nao foi preservado apos recriar os containers."
            )
        print("OK: registro SQL preservado no volume apos docker compose down/up.")
        verificar_servicos()
    finally:
        consultar_banco(f"DROP SCHEMA {schema} CASCADE;")
        print("Schema temporario de verificacao removido.")


def main() -> None:
    argumentos = argparse.ArgumentParser(description=__doc__)
    argumentos.add_argument(
        "--persistencia",
        action="store_true",
        help="Recria os containers do projeto e verifica um registro no volume.",
    )
    opcoes = argumentos.parse_args()
    verificar_servicos()
    if opcoes.persistencia:
        verificar_persistencia()


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as erro:
        raise SystemExit(erro.stderr.strip() or str(erro)) from erro
