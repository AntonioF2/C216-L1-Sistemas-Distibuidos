import pytest
from pydantic import ValidationError

from backend.schemas.servico import ServicoCreate, ServicoPatch, ServicoReplace
from backend.services.servicos import ServicoNaoEncontrado


def test_criar_ids_distintos(servico_service, dados_servico):
    primeiro = servico_service.criar(ServicoCreate(**dados_servico))
    segundo = servico_service.criar(ServicoCreate(**dados_servico))
    assert primeiro.id != segundo.id
    assert servico_service.buscar(primeiro.id) == primeiro


def test_filtrar_servicos(servico_service, dados_servico):
    ativo = servico_service.criar(ServicoCreate(**dados_servico))
    inativo = servico_service.criar(ServicoCreate(**{**dados_servico, "ativo": False}))
    assert servico_service.listar() == [ativo, inativo]
    assert servico_service.listar(True) == [ativo]
    assert servico_service.listar(False) == [inativo]


def test_buscar_inexistente(servico_service):
    with pytest.raises(ServicoNaoEncontrado):
        servico_service.buscar(99)


def test_substituir(servico_service, dados_servico):
    criado = servico_service.criar(ServicoCreate(**dados_servico))
    novos = ServicoReplace(nome="Novo", url="https://novo.example.com", ativo=False)
    resultado = servico_service.substituir(criado.id, novos)
    assert resultado.id == criado.id
    assert resultado.model_dump(exclude={"id"}) == novos.model_dump()


def test_patch_preserva_campos(servico_service, dados_servico):
    criado = servico_service.criar(ServicoCreate(**dados_servico))
    resultado = servico_service.atualizar(criado.id, ServicoPatch(ativo=False))
    assert resultado.ativo is False
    assert resultado.nome == criado.nome
    assert resultado.url == criado.url


def test_excluir(servico_service, dados_servico):
    criado = servico_service.criar(ServicoCreate(**dados_servico))
    servico_service.excluir(criado.id)
    assert servico_service.listar() == []
    with pytest.raises(ServicoNaoEncontrado):
        servico_service.buscar(criado.id)


@pytest.mark.parametrize(
    "campo,valor",
    [
        ("nome", " "),
        ("nome", "x" * 101),
        ("url", "invalida"),
        ("url", "ftp://example.com"),
        ("id", 42),
    ],
)
def test_rejeitar_dados_invalidos(dados_servico, campo, valor):
    with pytest.raises(ValidationError):
        ServicoCreate(**{**dados_servico, campo: valor})


@pytest.mark.parametrize("campo", ["nome", "url", "ativo"])
def test_patch_rejeita_null(campo):
    with pytest.raises(ValidationError):
        ServicoPatch(**{campo: None})


def test_normalizar_nome_e_status_padrao():
    dados = ServicoCreate(nome="  API  ", url="https://example.com")
    assert dados.nome == "API"
    assert dados.ativo is True


def test_resultado_nao_altera_armazenamento(servico_service, dados_servico):
    criado = servico_service.criar(ServicoCreate(**dados_servico))
    criado.nome = "Modificado externamente"
    assert servico_service.buscar(criado.id).nome == dados_servico["nome"]
