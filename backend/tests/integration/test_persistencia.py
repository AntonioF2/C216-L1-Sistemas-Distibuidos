from pathlib import Path

import pytest
from alembic.config import Config
from sqlalchemy import inspect, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from alembic import command
from backend.models.servico import Servico
from backend.repositories.servicos import ServicoRepository
from backend.schemas.servico import ServicoCreate
from backend.services.servicos import ServicoService


def test_registro_visivel_em_nova_sessao(client, db_engine, dados_servico):
    response = client.post("/servicos", json=dados_servico)
    assert response.status_code == 201
    with Session(db_engine) as db:
        registro = db.get(Servico, response.json()["id"])
        assert registro.nome == dados_servico["nome"]
        assert registro.url == dados_servico["url"]
        assert registro.ativo is True


def test_servico_recriado_le_dados_persistidos(db_engine, dados_servico):
    with Session(db_engine) as db:
        service = ServicoService(ServicoRepository(db))
        criado = service.criar(ServicoCreate(**dados_servico))
    db_engine.dispose()
    with Session(db_engine) as nova_sessao:
        outro_service = ServicoService(ServicoRepository(nova_sessao))
        assert outro_service.buscar(criado.id) == criado


def test_repository_rollback_apos_erro(db_engine, dados_servico):
    with Session(db_engine) as db:
        repository = ServicoRepository(db)
        with pytest.raises(IntegrityError):
            repository.salvar(Servico(nome=" ", url=dados_servico["url"], ativo=True))
        valido = repository.salvar(Servico(**dados_servico))
        assert valido.id > 0
        assert len(repository.listar()) == 1


def test_exclusao_persistida(client, db_engine, dados_servico):
    criado = client.post("/servicos", json=dados_servico).json()
    assert client.delete(f"/servicos/{criado['id']}").status_code == 204
    with Session(db_engine) as db:
        assert db.scalar(select(Servico).where(Servico.id == criado["id"])) is None


def test_migration_reversivel_e_modelo_sincronizado(db_engine):
    config = Config(str(Path(__file__).resolve().parents[2] / "alembic.ini"))
    with db_engine.begin() as connection:
        config.attributes["connection"] = connection
        command.check(config)
        command.downgrade(config, "base")
        assert "servicos" not in inspect(connection).get_table_names()
        command.upgrade(config, "head")
        assert "servicos" in inspect(connection).get_table_names()
