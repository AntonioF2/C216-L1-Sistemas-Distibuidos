import pytest


def test_criar(client, dados_servico):
    response = client.post("/servicos", json=dados_servico)
    assert response.status_code == 201
    assert response.json() == {"id": 1, **dados_servico}


def test_listar_e_filtrar(client, dados_servico):
    assert client.get("/servicos").json() == []
    ativo = client.post("/servicos", json=dados_servico).json()
    inativo = client.post("/servicos", json={**dados_servico, "ativo": False}).json()
    response = client.get("/servicos")
    assert response.status_code == 200
    assert response.json() == [ativo, inativo]
    assert client.get("/servicos?ativo=true").json() == [ativo]
    assert client.get("/servicos?ativo=false").json() == [inativo]


def test_buscar(client, dados_servico):
    criado = client.post("/servicos", json=dados_servico).json()
    response = client.get(f"/servicos/{criado['id']}")
    assert response.status_code == 200
    assert response.json() == criado


def test_put(client, dados_servico):
    criado = client.post("/servicos", json=dados_servico).json()
    novos = {"nome": "Novo", "url": "https://novo.example.com/", "ativo": False}
    response = client.put(f"/servicos/{criado['id']}", json=novos)
    assert response.status_code == 200
    assert response.json() == {"id": criado["id"], **novos}
    assert client.get(f"/servicos/{criado['id']}").json() == response.json()


def test_patch(client, dados_servico):
    criado = client.post("/servicos", json=dados_servico).json()
    response = client.patch(f"/servicos/{criado['id']}", json={"ativo": False})
    assert response.status_code == 200
    assert response.json() == {**criado, "ativo": False}
    assert client.get(f"/servicos/{criado['id']}").json() == response.json()


def test_delete(client, dados_servico):
    criado = client.post("/servicos", json=dados_servico).json()
    response = client.delete(f"/servicos/{criado['id']}")
    assert response.status_code == 204
    assert response.content == b""
    assert client.get(f"/servicos/{criado['id']}").status_code == 404


@pytest.mark.parametrize("metodo", ["get", "put", "patch", "delete"])
def test_id_inexistente(client, dados_servico, metodo):
    kwargs = {"json": dados_servico} if metodo in {"put", "patch"} else {}
    response = client.request(metodo, "/servicos/999", **kwargs)
    assert response.status_code == 404


@pytest.mark.parametrize("metodo", ["get", "put", "patch", "delete"])
@pytest.mark.parametrize("identificador", ["0", "-1", "abc"])
def test_id_invalido(client, dados_servico, metodo, identificador):
    kwargs = {"json": dados_servico} if metodo in {"put", "patch"} else {}
    assert (
        client.request(metodo, f"/servicos/{identificador}", **kwargs).status_code
        == 422
    )


@pytest.mark.parametrize(
    "alteracoes", [{"nome": " "}, {"url": "invalida"}, {"id": 42}, {"ativo": None}]
)
def test_post_invalido(client, dados_servico, alteracoes):
    response = client.post("/servicos", json={**dados_servico, **alteracoes})
    assert response.status_code == 422
    assert client.get("/servicos").json() == []


@pytest.mark.parametrize("campo", ["nome", "url", "ativo"])
def test_put_exige_todos_campos(client, dados_servico, campo):
    criado = client.post("/servicos", json=dados_servico).json()
    incompleto = {k: v for k, v in dados_servico.items() if k != campo}
    assert client.put(f"/servicos/{criado['id']}", json=incompleto).status_code == 422
    assert client.get(f"/servicos/{criado['id']}").json() == criado


@pytest.mark.parametrize(
    "dados",
    [
        {"nome": None},
        {"url": None},
        {"ativo": None},
        {"nome": " "},
        {"url": "ftp://example.com"},
        {"id": 2},
    ],
)
def test_patch_invalido_preserva_registro(client, dados_servico, dados):
    criado = client.post("/servicos", json=dados_servico).json()
    assert client.patch(f"/servicos/{criado['id']}", json=dados).status_code == 422
    assert client.get(f"/servicos/{criado['id']}").json() == criado


def test_patch_vazio_preserva_registro(client, dados_servico):
    criado = client.post("/servicos", json=dados_servico).json()
    response = client.patch(f"/servicos/{criado['id']}", json={})
    assert response.status_code == 200
    assert response.json() == criado


def test_filtro_invalido(client):
    assert client.get("/servicos?ativo=invalido").status_code == 422
