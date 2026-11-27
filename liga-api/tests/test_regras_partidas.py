import pytest

from liga_api.repositorios.memoria import CatalogoTimes, RepositorioPartidasEmMemoria
from liga_api.servicos.erros import RecursoNaoEncontrado, RegraPartidaInvalida
from liga_api.servicos.partidas import ServicoPartidas, apurar_placar


@pytest.mark.parametrize(
    "mandante,visitante,situacao,pontos",
    [
        (2, 1, "vitoria_mandante", (3, 0)),
        (0, 2, "vitoria_visitante", (0, 3)),
        (0, 0, "empate", (1, 1)),
        (3, 3, "empate", (1, 1)),
        (10, 0, "vitoria_mandante", (3, 0)),
    ],
)
def test_apura_resultado_e_pontos_dos_dois_times(mandante, visitante, situacao, pontos):
    resultado = apurar_placar(mandante, visitante)

    assert resultado.situacao == situacao
    assert (resultado.pontos_mandante, resultado.pontos_visitante) == pontos


@pytest.mark.parametrize(
    "mandante,visitante",
    [(-1, 0), (0, -1), (1.5, 0), (0, True), ("2", 0), (None, 0)],
)
def test_regra_rejeita_gols_invalidos(mandante, visitante):
    with pytest.raises(RegraPartidaInvalida, match="inteiros nao negativos"):
        apurar_placar(mandante, visitante)


@pytest.fixture
def servico_partidas():
    return ServicoPartidas(CatalogoTimes(), RepositorioPartidasEmMemoria())


def test_servico_impede_time_de_enfrentar_a_si_mesmo(servico_partidas):
    with pytest.raises(RegraPartidaInvalida, match="si mesmo"):
        servico_partidas.criar(
            mandante_id=1, visitante_id=1, gols_mandante=1, gols_visitante=0
        )
    assert servico_partidas.listar() == []


def test_servico_exige_time_do_catalogo(servico_partidas):
    with pytest.raises(RecursoNaoEncontrado, match="Time 99"):
        servico_partidas.criar(
            mandante_id=1, visitante_id=99, gols_mandante=1, gols_visitante=0
        )
    assert servico_partidas.listar() == []


def test_edicao_invalida_preserva_placar_anterior(servico_partidas):
    partida = servico_partidas.criar(
        mandante_id=1, visitante_id=2, gols_mandante=2, gols_visitante=0
    )

    with pytest.raises(RegraPartidaInvalida):
        servico_partidas.atualizar(
            partida["id"],
            mandante_id=1,
            visitante_id=2,
            gols_mandante=-1,
            gols_visitante=0,
        )

    assert servico_partidas.obter(partida["id"]) == partida
