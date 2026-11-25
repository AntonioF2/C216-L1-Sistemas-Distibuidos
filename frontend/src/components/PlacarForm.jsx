import { useState } from "react";
import { times, validarPlacar } from "../campeonato.js";
import { confrontosDaRodada, TOTAL_RODADAS } from "../confrontos.js";
import { SeloTime } from "./Classificacao.jsx";

const catalogo = new Map(times.map((time) => [time.id, time]));
const placarVazio = { gols_mandante: "", gols_visitante: "" };

function JogoDaRodada({ confronto, placar, erro, aoAlterar }) {
  const mandante = catalogo.get(confronto.mandante_id);
  const visitante = catalogo.get(confronto.visitante_id);
  const erroId = `erro-placar-${confronto.id}`;

  function alterar(evento) {
    const { name, value } = evento.target;
    aoAlterar(confronto.id, {
      gols_mandante: placar.gols_mandante,
      gols_visitante: placar.gols_visitante,
      [name]: value,
    });
  }

  return (
    <fieldset
      className="jogo-da-rodada"
      aria-label={`${mandante.nome} x ${visitante.nome}`}
    >
      <div className="times-do-jogo">
        <label className="time-do-jogo">
          <SeloTime time={mandante} />
          <span>{mandante.nome}</span>
          <input
            id={`gols-mandante-${confronto.id}`}
            aria-label="Gols do mandante"
            aria-describedby={erro ? erroId : undefined}
            aria-invalid={erro ? true : undefined}
            name="gols_mandante"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={placar.gols_mandante}
            onChange={alterar}
          />
        </label>
        <label className="time-do-jogo">
          <SeloTime time={visitante} />
          <span>{visitante.nome}</span>
          <input
            aria-label="Gols do visitante"
            aria-describedby={erro ? erroId : undefined}
            aria-invalid={erro ? true : undefined}
            name="gols_visitante"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={placar.gols_visitante}
            onChange={alterar}
          />
        </label>
      </div>
      {erro && (
        <p id={erroId} className="erro mt-2">
          {erro}
        </p>
      )}
    </fieldset>
  );
}

export default function PlacarForm({
  rodada,
  partidas,
  rascunhos,
  aviso,
  aoMudarRodada,
  aoAlterarPlacar,
  aoSalvar,
}) {
  const [rodadaValidada, definirRodadaValidada] = useState(null);
  const confrontos = confrontosDaRodada(rodada);
  const placares = new Map(
    partidas
      .filter((partida) => partida.rodada === rodada)
      .map((partida) => [partida.id, partida]),
  );

  const resultados = [];
  const erros = new Map();

  for (const confronto of confrontos) {
    const rascunho = rascunhos.get(confronto.id);
    const registrado = placares.get(confronto.id);
    if (
      !rascunho ||
      (!registrado &&
        rascunho.gols_mandante === "" &&
        rascunho.gols_visitante === "")
    )
      continue;

    const erro = validarPlacar({ ...confronto, ...rascunho });
    if (erro) {
      erros.set(confronto.id, erro);
      continue;
    }

    const gols_mandante = Number(rascunho.gols_mandante);
    const gols_visitante = Number(rascunho.gols_visitante);
    if (
      registrado?.gols_mandante === gols_mandante &&
      registrado.gols_visitante === gols_visitante
    )
      continue;
    resultados.push({ ...confronto, gols_mandante, gols_visitante });
  }

  const mostrarValidacao = rodadaValidada === rodada;
  let mensagem = "";
  if (mostrarValidacao) {
    if (erros.size)
      mensagem = "Confira os placares destacados antes de salvar.";
    else if (!resultados.length)
      mensagem = "Preencha ou altere um placar para salvar.";
  }

  function mudarRodada(numero) {
    definirRodadaValidada(null);
    aoMudarRodada(numero);
  }

  function salvar(evento) {
    evento.preventDefault();
    if (erros.size || !resultados.length) {
      definirRodadaValidada(rodada);
      return;
    }
    definirRodadaValidada(null);
    aoSalvar(resultados);
  }

  return (
    <section className="painel confrontos" aria-labelledby="titulo-confrontos">
      <div className="confrontos-topo">
        <h2 id="titulo-confrontos">Confrontos</h2>
        <fieldset aria-label="Rodada">
          <div className="seletor">
            <button
              type="button"
              aria-label="Rodada anterior"
              onClick={() => mudarRodada(rodada - 1)}
              disabled={rodada === 1}
            >
              <span aria-hidden="true">←</span>
            </button>
            <span className="seletor-valor" aria-live="polite">
              Rodada {rodada}
            </span>
            <button
              type="button"
              aria-label="Próxima rodada"
              onClick={() => mudarRodada(rodada + 1)}
              disabled={rodada === TOTAL_RODADAS}
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </fieldset>
        <p className="confrontos-contagem">
          {placares.size} de {confrontos.length} placares registrados
        </p>
      </div>
      <form aria-label="Placares da rodada" onSubmit={salvar} noValidate>
        <ul className="lista-confrontos">
          {confrontos.map((confronto) => (
            <li key={confronto.id}>
              <JogoDaRodada
                confronto={confronto}
                placar={
                  rascunhos.get(confronto.id) ??
                  placares.get(confronto.id) ??
                  placarVazio
                }
                erro={mostrarValidacao ? erros.get(confronto.id) : undefined}
                aoAlterar={aoAlterarPlacar}
              />
            </li>
          ))}
        </ul>
        <div className="confrontos-acoes">
          {mensagem && (
            <p className="erro mb-2" role="alert">
              {mensagem}
            </p>
          )}
          <button className="botao-primario w-full" type="submit">
            Salvar placares da rodada
          </button>
          <p className="confrontos-aviso" role="status">
            {mensagem ? "" : aviso}
          </p>
        </div>
      </form>
    </section>
  );
}
