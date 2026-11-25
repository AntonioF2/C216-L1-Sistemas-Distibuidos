from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field

Identificador = Annotated[int, Field(strict=True, gt=0)]
QuantidadeGols = Annotated[int, Field(strict=True, ge=0)]


class TimeSaida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    sigla: str


class PartidaEntrada(BaseModel):
    model_config = ConfigDict(extra="forbid")

    mandante_id: Identificador
    visitante_id: Identificador
    gols_mandante: QuantidadeGols
    gols_visitante: QuantidadeGols
    rodada: Annotated[int, Field(strict=True, gt=0)] = 1


class PartidaSaida(BaseModel):
    id: int
    rodada: int
    mandante: TimeSaida
    visitante: TimeSaida
    gols_mandante: int
    gols_visitante: int
    resultado: Literal["vitoria_mandante", "empate", "vitoria_visitante"]
    vencedor_id: int | None
    pontos_mandante: int
    pontos_visitante: int
