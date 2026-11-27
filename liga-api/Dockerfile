FROM python:3.14-slim-bookworm AS montagem

ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    PIP_NO_CACHE_DIR=1

WORKDIR /opt/mesa

RUN python -m pip install "poetry==2.4.2"

COPY pyproject.toml poetry.lock README.md ./

RUN poetry install --only main --no-root --no-ansi

COPY src ./src

RUN poetry install --only-root --no-ansi


FROM python:3.14-slim-bookworm AS execucao

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/mesa/.venv/bin:$PATH"

WORKDIR /opt/mesa

RUN useradd --create-home --uid 10001 mesa

COPY --from=montagem --chown=mesa:mesa /opt/mesa /opt/mesa
COPY --chown=mesa:mesa alembic.ini ./
COPY --chown=mesa:mesa migracoes ./migracoes

USER mesa

EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head && exec python -m uvicorn liga_api.main:app --host 0.0.0.0 --port 8000"]
