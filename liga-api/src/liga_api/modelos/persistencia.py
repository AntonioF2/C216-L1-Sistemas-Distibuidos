from sqlalchemy import ForeignKey, Identity, String, true
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class TimeORM(Base):
    __tablename__ = "times"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=False)
    nome: Mapped[str] = mapped_column(String(100))
    sigla: Mapped[str] = mapped_column(String(3), unique=True)
    ativo: Mapped[bool] = mapped_column(server_default=true())


class PartidaORM(Base):
    __tablename__ = "partidas"

    id: Mapped[int] = mapped_column(Identity(), primary_key=True)
    rodada: Mapped[int]
    mandante_id: Mapped[int] = mapped_column(ForeignKey("times.id"))
    visitante_id: Mapped[int] = mapped_column(ForeignKey("times.id"))
    gols_mandante: Mapped[int]
    gols_visitante: Mapped[int]
