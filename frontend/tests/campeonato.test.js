import { expect, it } from "vitest";
import {
  calcularClassificacao,
  times,
  validarPlacar,
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
  mandante_id: "13",
  visitante_id: "18",
  gols_mandante: "0",
  gols_visitante: "0",
  rodada: "1",
};

it.each([
  [{}, ""],
  [{ visitante_id: "13" }, "Mandante e visitante devem ser times diferentes."],
  [
    { gols_mandante: "" },
    "Informe gols inteiros e não negativos para os dois times.",
  ],
  [
    { gols_visitante: "-1" },
    "Informe gols inteiros e não negativos para os dois times.",
  ],
  [{ rodada: "0" }, "Informe uma rodada com um número inteiro positivo."],
])("valida o placar com alterações %j", (alteracao, mensagem) => {
  expect(validarPlacar({ ...placar, ...alteracao })).toBe(mensagem);
});
