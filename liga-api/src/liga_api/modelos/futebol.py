from dataclasses import dataclass


@dataclass(frozen=True)
class Time:
    id: int
    nome: str
    sigla: str
    ativo: bool = True


@dataclass(frozen=True)
class Partida:
    id: int
    rodada: int
    mandante_id: int
    visitante_id: int
    gols_mandante: int
    gols_visitante: int
    chave_confronto: str | None = None


@dataclass(frozen=True)
class ResultadoPlacar:
    situacao: str
    pontos_mandante: int
    pontos_visitante: int
