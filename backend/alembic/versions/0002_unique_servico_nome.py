"""Impede cadastro de serviços com o mesmo nome."""

from alembic import op

revision = "0002_unique_servico_nome"
down_revision = "0001_create_servicos"
branch_labels = None
depends_on = None


def upgrade():
    op.create_unique_constraint("uq_servicos_nome", "servicos", ["nome"])


def downgrade():
    op.drop_constraint("uq_servicos_nome", "servicos", type_="unique")
