# Mesa da Rodada

O Mesa da Rodada é um simulador do Brasileirão Série A de 2026 desenvolvido para o projeto final de C216 — Sistemas Distribuídos. A ideia é preencher os placares dos jogos e acompanhar como eles mudam a classificação.

A tela abre na Rodada 1. Use as setas para navegar pelos confrontos e **Salvar placares da rodada** para gravar os jogos preenchidos de uma vez. Em **Partidas registradas**, dá para editar e excluir resultados. Os placares voltam ao recarregar a página, e o botão **Zerar simulação** apaga os resultados de todas as rodadas após a confirmação.

Os jogos seguem o calendário oficial da Série A. [Tabela da CBF](https://stcbfsiteprdimgbrs.blob.core.windows.net/img-site/cdn/Tabela_BA_sica_Brasileiro_SA_rie_A_2026_d64996b4d8.pdf) · [Escudos dos clubes no ge](https://ge.globo.com/futebol/brasileirao-serie-a/simulador-do-brasileirao-2026/)

## Arquitetura

- O [frontend](frontend/) usa JavaScript, React, Vite e Tailwind. Ele carrega e envia os placares por HTTP e calcula a classificação com os resultados salvos.
- A [API](liga-api/) usa FastAPI. As rotas recebem as requisições, os schemas validam os dados, os serviços aplicam as regras do placar e os repositórios acessam o banco com SQLAlchemy.
- O PostgreSQL guarda os clubes e os placares. As [migrações do Alembic](liga-api/migracoes/) são aplicadas quando a API inicia. O Docker Compose sobe a interface, a API e o banco em três contêineres.

## Como rodar

Você vai precisar de Python 3.14, GNU Make e Docker com Compose v2 e suporte a contêineres Linux.

1. Inicie o Docker. No Windows, abra o **Docker Desktop** e aguarde o motor ficar pronto.
2. No terminal, abra a raiz do repositório na branch `projeto-final`.
3. Rode `make docker-configurar` para criar o `.env` local.
4. Rode `make docker-subir` e aguarde os três serviços iniciarem.
5. Abra o [simulador](http://127.0.0.1:5173/). Os endpoints da API ficam no [Swagger](http://127.0.0.1:8000/docs).

Na primeira execução, `make docker-configurar` gera a senha do banco e cria o `.env`. É nele que você pode ajustar as portas, as origens permitidas pelo CORS (`MESA_ORIGENS_FRONTEND`) e o endereço da API usado pelo frontend (`VITE_MESA_API_URL`). [Modelo de configuração](.env.example)

Para conferir os contêineres, rode `make docker-estado`. Para verificar a revisão do Alembic, use `make banco-revisao`. Ao terminar, `make docker-parar` encerra os serviços e preserva os dados.

## Testes

Para rodar os testes localmente, instale também Poetry e Node.js 24. Execute na raiz do projeto.

```text
make preparar
make frontend-preparar
make frontend-instalar-navegador
make verificar-tudo
```

O Pytest verifica as regras e os endpoints da API. O Vitest com Testing Library testa a interface. O Playwright usa um ambiente Docker separado para conferir se os placares persistem após recarregar a página. A CI roda nos pushes para `projeto-final` e nos PRs para `main`. [Workflow do GitHub Actions](.github/workflows/qualidade-mesa.yml)
