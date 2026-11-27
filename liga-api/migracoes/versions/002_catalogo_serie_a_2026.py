"""Atualiza o catálogo para os participantes do Brasileirão Série A de 2026."""

import sqlalchemy as sa
from alembic import op

revision = "002_catalogo_serie_a_2026"
down_revision = "001_times_e_partidas"
branch_labels = None
depends_on = None

# https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026
CLUBES = (
    (5, "Athletico Paranaense", "CAP"),
    (6, "Atlético Mineiro", "CAM"),
    (7, "Bahia", "BAH"),
    (8, "Botafogo", "BOT"),
    (9, "Chapecoense", "CHA"),
    (10, "Corinthians", "COR"),
    (11, "Coritiba", "CFC"),
    (12, "Cruzeiro", "CRU"),
    (13, "Flamengo", "FLA"),
    (14, "Fluminense", "FLU"),
    (15, "Grêmio", "GRE"),
    (16, "Internacional", "INT"),
    (17, "Mirassol", "MIR"),
    (18, "Palmeiras", "PAL"),
    (19, "Red Bull Bragantino", "RBB"),
    (20, "Remo", "REM"),
    (21, "Santos", "SAN"),
    (22, "São Paulo", "SAO"),
    (23, "Vasco da Gama", "VAS"),
    (24, "Vitória", "VIT"),
)


def upgrade() -> None:
    op.add_column(
        "times",
        sa.Column("ativo", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    times = sa.table(
        "times",
        sa.column("id", sa.Integer()),
        sa.column("nome", sa.String(100)),
        sa.column("sigla", sa.String(3)),
        sa.column("ativo", sa.Boolean()),
    )
    op.execute(times.update().where(times.c.id.in_((1, 2, 3, 4))).values(ativo=False))
    op.bulk_insert(
        times,
        [
            {"id": clube_id, "nome": nome, "sigla": sigla, "ativo": True}
            for clube_id, nome, sigla in CLUBES
        ],
    )


def downgrade() -> None:
    # A chave estrangeira impede apagar clubes que já tenham partidas.
    times = sa.table("times", sa.column("id", sa.Integer()))
    op.execute(times.delete().where(times.c.id.in_([clube[0] for clube in CLUBES])))
    op.drop_column("times", "ativo")
