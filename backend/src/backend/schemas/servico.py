from typing import Annotated

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    HttpUrl,
    StringConstraints,
    model_validator,
)

NomeServico = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)
]


class ServicoBase(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ServicoCreate(ServicoBase):
    nome: NomeServico
    url: HttpUrl
    ativo: bool = True


class ServicoReplace(ServicoBase):
    nome: NomeServico
    url: HttpUrl
    ativo: bool


class ServicoPatch(ServicoBase):
    nome: NomeServico | None = None
    url: HttpUrl | None = None
    ativo: bool | None = None

    @model_validator(mode="after")
    def rejeitar_nulos(self):
        for campo in self.model_fields_set:
            if getattr(self, campo) is None:
                raise ValueError(f"O campo {campo} não aceita null")
        return self


class ServicoResponse(ServicoReplace):
    id: int = Field(gt=0)
