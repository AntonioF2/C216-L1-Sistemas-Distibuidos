# Mesa da Rodada

Projeto final da disciplina C216 — Sistemas Distribuídos. A proposta é desenvolver uma aplicação web para simular placares de partidas e acompanhar seus efeitos na classificação de um campeonato inspirado no Brasileirão.

## Estado atual

O projeto está na etapa de definição das tecnologias e preparação do repositório, na branch `projeto-final`. Neste momento, estão disponíveis apenas a documentação inicial e as configurações de versionamento.

As funcionalidades e tecnologias descritas a seguir representam o planejamento do projeto.

## Objetivo

Permitir que o usuário crie cenários de campeonato, informe os placares dos confrontos e visualize uma classificação calculada a partir desses resultados. Cada cenário deverá manter seus próprios resultados, permitindo comparar possibilidades sem alterar outras simulações.

A primeira versão terá uma única tela, com seleção da simulação, formulário de placar, listagem de partidas e tabela de classificação. Os placares serão informados pelo usuário; a simulação não dependerá de previsões automáticas ou de uma API de resultados ao vivo.

## Funcionalidades planejadas

- Criar uma simulação com nome próprio.
- Consultar e reabrir simulações salvas.
- Editar o nome de uma simulação e os resultados de suas partidas.
- Excluir uma simulação e seus dados associados.
- Selecionar os times mandante e visitante de cada partida.
- Registrar, consultar, editar e remover placares dentro de uma simulação.
- Identificar vitória, empate ou derrota com base nos gols de cada time.
- Recalcular a classificação após incluir, alterar ou remover um resultado.
- Salvar os dados no PostgreSQL e recuperá-los após atualizar a página.
- Exibir estados de carregamento, confirmação de operações e mensagens de erro na interface.

O CRUD principal será o de simulações, com todas as operações acessíveis pela interface. O catálogo de times será cadastrado inicialmente no projeto.

## Modelagem inicial

### Time

A classe `Time` representará um clube, com identificador, nome e sigla. Cada instância corresponderá a um time.

As estatísticas da classificação serão calculadas por time dentro de cada simulação. Elas não serão atributos globais do clube: um mesmo time poderá ter desempenhos diferentes em cenários distintos.

### Partida

A classe `Partida` representará um confronto associado a uma simulação. Terá identificador, time mandante, time visitante, rodada e os gols de cada lado. Uma partida poderá estar pendente, sem placar, ou concluída, com os dois valores preenchidos.

O vencedor e o resultado de cada time serão derivados do placar, sem informar vitória ou derrota separadamente.

### Simulacao

A classe `Simulacao` agrupará um cenário, seu nome e suas partidas. Os resultados pertencerão ao cenário em que foram registrados.

### Classificação por time

A tabela terá como referência as colunas principais da tabela oficial da CBF.

## Execução e configuração

Ainda não existem comandos para instalar ou executar a aplicação. Os pré-requisitos, as versões utilizadas, as variáveis de ambiente e os comandos de preparação serão documentados conforme forem configurados e verificados.

Quando houver configurações por ambiente, seus nomes e valores de exemplo serão disponibilizados em `.env.example`. Arquivos `.env` com configurações locais não serão versionados.

Os comandos de execução, migrações, testes e manutenção serão centralizados no Makefile à medida que essas etapas forem implementadas.

## Preparação do ambiente Python

Pré-requisitos: Python compatível com o `pyproject.toml`, Poetry e GNU Make.

Execute os comandos na raiz do repositório:

- `make preparar`: instala as dependências.
- `make ambiente`: apresenta o ambiente virtual.
- `make verificar`: valida a configuração, o código e a formatação.
- `make formatar`: aplica a formatação Python.