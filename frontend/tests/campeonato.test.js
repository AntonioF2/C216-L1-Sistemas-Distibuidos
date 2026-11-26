import { expect, it } from "vitest";
import {
  calcularClassificacao,
  times,
  validarGolsDoPlacar,
} from "../src/campeonato.js";

it("atualiza pontos, saldo e aproveitamento de uma vitória e um empate", () => {
  const partidas = [
    { mandante_id: 13, visitante_id: 18, gols_mandante: 2, gols_visitante: 0 },
    { mandante_id: 15, visitante_id: 13, gols_mandante: 1, gols_visitante: 1 },
  ];
  const tabela = calcularClassificacao(times, partidas);

  expect(tabela[0]).toMatchObject({
    id: 13,
    pontos: 4,
    jogos: 2,
    saldo: 2,
    gp: 3,
    gc: 1,
  });
  expect(tabela[0].aproveitamento).toBeCloseTo(66.667);
  expect(tabela.find(({ id }) => id === 23)).toMatchObject({
    pontos: 0,
    jogos: 0,
    aproveitamento: 0,
  });
});

const placar = {
  gols_mandante: "0",
  gols_visitante: "0",
};

it.each([
  [{}, ""],
  [
    { gols_mandante: "" },
    "Informe gols inteiros e não negativos para os dois times.",
  ],
  [
    { gols_visitante: "-1" },
    "Informe gols inteiros e não negativos para os dois times.",
  ],
  [
    { gols_mandante: "1.5" },
    "Informe gols inteiros e não negativos para os dois times.",
  ],
  [
    { gols_visitante: "2147483648" },
    "Informe gols inteiros e não negativos para os dois times.",
  ],
])("valida os gols com alterações %j", (alteracao, mensagem) => {
  expect(validarGolsDoPlacar({ ...placar, ...alteracao })).toBe(mensagem);
});
