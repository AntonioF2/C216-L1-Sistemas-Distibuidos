import { confrontosDaRodada, TOTAL_RODADAS } from "./confrontos.js";

const urlApi = (
  import.meta.env.VITE_MESA_API_URL ||
  `http://${window.location.hostname}:${import.meta.env.VITE_MESA_API_PORTA || 8000}`
).replace(/\/+$/, "");

function chave(rodada, mandante, visitante) {
  return `${rodada}:${mandante}:${visitante}`;
}

const confrontos = new Map();
for (let rodada = 1; rodada <= TOTAL_RODADAS; rodada += 1) {
  for (const jogo of confrontosDaRodada(rodada)) {
    confrontos.set(chave(rodada, jogo.mandante_id, jogo.visitante_id), jogo);
  }
}

function prepararPlacares(partidas) {
  return partidas.flatMap((partida) => {
    const confronto = confrontos.get(
      chave(partida.rodada, partida.mandante.id, partida.visitante.id),
    );
    return confronto
      ? [
          {
            ...confronto,
            partida_id: partida.id,
            gols_mandante: partida.gols_mandante,
            gols_visitante: partida.gols_visitante,
          },
        ]
      : [];
  });
}

async function requisitar(caminho, mensagem, opcoes) {
  let resposta;
  try {
    resposta = await fetch(`${urlApi}${caminho}`, opcoes);
  } catch {
    throw new Error("Não foi possível conectar à API. Tente novamente.");
  }
  if (!resposta.ok) {
    if (opcoes?.method === "DELETE" && resposta.status === 404) return;
    const erro = await resposta.json().catch(() => ({}));
    throw new Error(typeof erro?.detail === "string" ? erro.detail : mensagem);
  }
  if (resposta.status !== 204) return resposta.json();
}

export async function consultarPlacares(signal) {
  const partidas = await requisitar(
    "/partidas?calendario=true",
    "Não foi possível carregar os placares.",
    { signal },
  );
  return prepararPlacares(partidas);
}

export async function gravarRodada(rodada, confrontos) {
  const lote = confrontos.map(
    ({ mandante_id, visitante_id, gols_mandante, gols_visitante }) => ({
      mandante_id,
      visitante_id,
      gols_mandante,
      gols_visitante,
    }),
  );
  const partidas = await requisitar(
    `/rodadas/${rodada}/placares`,
    "Não foi possível salvar os placares da rodada.",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lote),
    },
  );
  return prepararPlacares(partidas);
}

export function removerPlacar(partidaId) {
  return requisitar(
    `/partidas/${partidaId}`,
    "Não foi possível excluir o placar.",
    { method: "DELETE" },
  );
}
