"""Cria o cadastro persistente de serviços."""

import sqlalchemy as sa

from alembic import op

revision = "0001_create_servicos"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "servicos",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nome", sa.String(length=100), nullable=False),
        sa.Column("url", sa.Text(), nullable=False),
        sa.Column(
            "ativo", sa.Boolean(), server_default=sa.text("true"), nullable=False
        ),
        sa.CheckConstraint(
            "length(trim(nome)) > 0", name=op.f("ck_servicos_nome_nao_vazio")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_servicos")),
    )


def downgrade():
    op.drop_table("servicos")
