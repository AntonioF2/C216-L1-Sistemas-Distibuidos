export const times = [
  { id: 1, nome: "Aurora Futebol Clube", sigla: "AUR", cor: "aurora" },
  { id: 2, nome: "União da Serra", sigla: "USE", cor: "uniao" },
  { id: 3, nome: "Atlético do Vale", sigla: "AVA", cor: "atletico" },
  { id: 4, nome: "Estrela do Sul", sigla: "ESU", cor: "estrela" },
];

export const partidasIniciais = [
  {
    id: 1,
    rodada: 1,
    mandante_id: 1,
    visitante_id: 2,
    gols_mandante: 2,
    gols_visitante: 1,
  },
  {
    id: 2,
    rodada: 1,
    mandante_id: 3,
    visitante_id: 4,
    gols_mandante: 1,
    gols_visitante: 1,
  },
  {
    id: 3,
    rodada: 2,
    mandante_id: 4,
    visitante_id: 2,
    gols_mandante: 2,
    gols_visitante: 0,
  },
];

export function calcularClassificacao(catalogo, partidas) {
  const tabela = new Map(
    catalogo.map((time) => [
      time.id,
      {
        ...time,
        pontos: 0,
        jogos: 0,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        gp: 0,
        gc: 0,
      },
    ]),
  );

  function somar(time, golsPro, golsContra) {
    time.jogos += 1;
    time.gp += golsPro;
    time.gc += golsContra;
    if (golsPro > golsContra) {
      time.vitorias += 1;
      time.pontos += 3;
    } else if (golsPro === golsContra) {
      time.empates += 1;
      time.pontos += 1;
    } else {
      time.derrotas += 1;
    }
  }

  for (const partida of partidas) {
    const mandante = tabela.get(partida.mandante_id);
    const visitante = tabela.get(partida.visitante_id);
    somar(mandante, partida.gols_mandante, partida.gols_visitante);
    somar(visitante, partida.gols_visitante, partida.gols_mandante);
  }

  return Array.from(tabela.values(), (time) => ({
    ...time,
    saldo: time.gp - time.gc,
    aproveitamento: time.jogos ? (time.pontos / (3 * time.jogos)) * 100 : 0,
  })).sort(
    (a, b) =>
      b.pontos - a.pontos ||
      b.vitorias - a.vitorias ||
      b.saldo - a.saldo ||
      b.gp - a.gp ||
      a.nome.localeCompare(b.nome, "pt-BR"),
  );
}

export function validarPlacar(dados) {
  if (!dados.mandante_id || !dados.visitante_id) {
    return "Selecione o mandante e o visitante.";
  }
  if (dados.mandante_id === dados.visitante_id) {
    return "Mandante e visitante devem ser times diferentes.";
  }
  if (
    ![dados.gols_mandante, dados.gols_visitante].every(
      (gols) => /^\d+$/.test(gols) && Number(gols) <= 2_147_483_647,
    )
  ) {
    return "Informe gols inteiros e não negativos para os dois times.";
  }
  if (
    !/^\d+$/.test(dados.rodada) ||
    Number(dados.rodada) < 1 ||
    Number(dados.rodada) > 2_147_483_647
  ) {
    return "Informe uma rodada com um número inteiro positivo.";
  }
  return "";
}
