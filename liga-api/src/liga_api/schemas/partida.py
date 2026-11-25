from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field

LIMITE_INTEIRO = 2_147_483_647
InteiroPositivo = Annotated[int, Field(strict=True, gt=0, le=LIMITE_INTEIRO)]
QuantidadeGols = Annotated[int, Field(strict=True, ge=0, le=LIMITE_INTEIRO)]


class TimeSaida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    sigla: str


class PartidaEntrada(BaseModel):
    model_config = ConfigDict(extra="forbid")

    mandante_id: InteiroPositivo
    visitante_id: InteiroPositivo
    gols_mandante: QuantidadeGols
    gols_visitante: QuantidadeGols
    rodada: InteiroPositivo = 1


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
