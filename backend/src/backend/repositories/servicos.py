from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.models.servico import Servico


class ServicoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar(self, ativo: bool | None = None) -> list[Servico]:
        consulta = select(Servico).order_by(Servico.id)
        if ativo is not None:
            consulta = consulta.where(Servico.ativo == ativo)
        return list(self.db.scalars(consulta))

    def buscar(self, servico_id: int) -> Servico | None:
        return self.db.get(Servico, servico_id)

    def salvar(self, servico: Servico) -> Servico:
        try:
            self.db.add(servico)
            self.db.commit()
            self.db.refresh(servico)
        except Exception:
            self.db.rollback()
            raise
        return servico

    def excluir(self, servico: Servico) -> None:
        try:
            self.db.delete(servico)
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise
