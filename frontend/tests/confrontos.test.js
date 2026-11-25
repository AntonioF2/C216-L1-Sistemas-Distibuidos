import { expect, it } from "vitest";
import { times } from "../src/campeonato.js";
import { confrontosDaRodada, TOTAL_RODADAS } from "../src/confrontos.js";

it("contém os 380 jogos de ida e volta e escala cada clube uma vez por rodada", () => {
  expect(TOTAL_RODADAS).toBe(38);

  const clubeIds = new Set(times.map(({ id }) => id));
  const pares = new Set();
  const jogoIds = new Set();
  for (let rodada = 1; rodada <= TOTAL_RODADAS; rodada++) {
    const jogos = confrontosDaRodada(rodada);
    expect(jogos).toHaveLength(10);
    expect(
      new Set(
        jogos.flatMap(({ mandante_id, visitante_id }) => [
          mandante_id,
          visitante_id,
        ]),
      ),
    ).toEqual(clubeIds);

    for (const { id, mandante_id, visitante_id } of jogos) {
      jogoIds.add(id);
      pares.add(`${mandante_id}-${visitante_id}`);
    }
  }
  expect(jogoIds.size).toBe(380);
  expect(pares.size).toBe(380);
});
