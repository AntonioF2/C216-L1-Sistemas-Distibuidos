import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.models.servico import Servico
from backend.repositories.servicos import ServicoRepository


def test_post_duplicado_retorna_409(client, dados_servico):
    primeiro = client.post("/servicos", json=dados_servico).json()
    response = client.post("/servicos", json=dados_servico)
    assert response.status_code == 409
    assert response.json() == {"detail": "Já existe um serviço com esse nome"}
    assert client.get("/servicos").json() == [primeiro]


@pytest.mark.parametrize("metodo", ["PUT", "PATCH"])
def test_edicao_nome_duplicado_preserva_dados(client, dados_servico, metodo):
    client.post("/servicos", json=dados_servico)
    segundo = client.post("/servicos", json={**dados_servico, "nome": "Segundo"}).json()
    response = client.request(metodo, f"/servicos/{segundo['id']}", json=dados_servico)
    assert response.status_code == 409
    assert client.get(f"/servicos/{segundo['id']}").json() == segundo


def test_banco_impede_nomes_duplicados(db_engine, dados_servico):
    with Session(db_engine) as db:
        repository = ServicoRepository(db)
        repository.salvar(Servico(**dados_servico))
        with pytest.raises(IntegrityError):
            repository.salvar(Servico(**dados_servico))
        assert len(repository.listar()) == 1
