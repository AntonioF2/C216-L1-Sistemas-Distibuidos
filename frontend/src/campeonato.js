export const times = [
  { id: 5, nome: "Athletico Paranaense", sigla: "CAP" },
  { id: 6, nome: "Atlético Mineiro", sigla: "CAM" },
  { id: 7, nome: "Bahia", sigla: "BAH" },
  { id: 8, nome: "Botafogo", sigla: "BOT" },
  { id: 9, nome: "Chapecoense", sigla: "CHA" },
  { id: 10, nome: "Corinthians", sigla: "COR" },
  { id: 11, nome: "Coritiba", sigla: "CFC" },
  { id: 12, nome: "Cruzeiro", sigla: "CRU" },
  { id: 13, nome: "Flamengo", sigla: "FLA" },
  { id: 14, nome: "Fluminense", sigla: "FLU" },
  { id: 15, nome: "Grêmio", sigla: "GRE" },
  { id: 16, nome: "Internacional", sigla: "INT" },
  { id: 17, nome: "Mirassol", sigla: "MIR" },
  { id: 18, nome: "Palmeiras", sigla: "PAL" },
  { id: 19, nome: "Red Bull Bragantino", sigla: "RBB" },
  { id: 20, nome: "Remo", sigla: "REM" },
  { id: 21, nome: "Santos", sigla: "SAN" },
  { id: 22, nome: "São Paulo", sigla: "SAO" },
  { id: 23, nome: "Vasco da Gama", sigla: "VAS" },
  { id: 24, nome: "Vitória", sigla: "VIT" },
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
