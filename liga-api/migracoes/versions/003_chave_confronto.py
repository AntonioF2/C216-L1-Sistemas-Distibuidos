"""Identifica placares salvos pelo calendário sem alterar as partidas antigas."""

import sqlalchemy as sa
from alembic import op

revision = "003_chave_confronto"
down_revision = "002_catalogo_serie_a_2026"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "partidas", sa.Column("chave_confronto", sa.String(32), nullable=True)
    )
    op.create_unique_constraint(
        "partidas_chave_confronto_key", "partidas", ["chave_confronto"]
    )


def downgrade() -> None:
    op.drop_constraint("partidas_chave_confronto_key", "partidas", type_="unique")
    op.drop_column("partidas", "chave_confronto")
