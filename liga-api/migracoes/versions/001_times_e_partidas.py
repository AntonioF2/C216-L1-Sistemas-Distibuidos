"""Cria o catálogo de times e a tabela de partidas."""

import sqlalchemy as sa
from alembic import op

revision = "001_times_e_partidas"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    times = op.create_table(
        "times",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=False),
        sa.Column("nome", sa.String(100), nullable=False),
        sa.Column("sigla", sa.String(3), nullable=False, unique=True),
    )
    op.create_table(
        "partidas",
        sa.Column("id", sa.Integer, sa.Identity(), primary_key=True),
        sa.Column("rodada", sa.Integer, nullable=False),
        sa.Column("mandante_id", sa.Integer, sa.ForeignKey("times.id"), nullable=False),
        sa.Column(
            "visitante_id", sa.Integer, sa.ForeignKey("times.id"), nullable=False
        ),
        sa.Column("gols_mandante", sa.Integer, nullable=False),
        sa.Column("gols_visitante", sa.Integer, nullable=False),
    )
    op.bulk_insert(
        times,
        [
            {"id": 1, "nome": "Aurora Futebol Clube", "sigla": "AUR"},
            {"id": 2, "nome": "Uniao da Serra", "sigla": "USE"},
            {"id": 3, "nome": "Atletico do Vale", "sigla": "AVA"},
            {"id": 4, "nome": "Estrela do Sul", "sigla": "ESU"},
        ],
    )


def downgrade() -> None:
    op.drop_table("partidas")
    op.drop_table("times")
