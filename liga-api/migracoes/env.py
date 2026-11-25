from alembic import context

from liga_api.banco.conexao import criar_motor
from liga_api.modelos.persistencia import Base

motor = criar_motor()
try:
    if context.is_offline_mode():
        context.configure(url=motor.url, target_metadata=Base.metadata)
        with context.begin_transaction():
            context.run_migrations()
    else:
        with motor.connect() as conexao:
            context.configure(connection=conexao, target_metadata=Base.metadata)
            with context.begin_transaction():
                context.run_migrations()
finally:
    motor.dispose()
