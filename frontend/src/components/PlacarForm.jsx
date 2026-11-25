import { useState } from "react";
import { times, validarPlacar } from "../campeonato.js";
import { confrontosDaRodada, TOTAL_RODADAS } from "../confrontos.js";
import { SeloTime } from "./Classificacao.jsx";

const catalogo = new Map(times.map((time) => [time.id, time]));
const placarVazio = { gols_mandante: "", gols_visitante: "" };

function JogoDaRodada({
  confronto,
  registrado,
  rascunho,
  aoAlterar,
  aoSalvar,
}) {
  const [erro, definirErro] = useState("");
  const mandante = catalogo.get(confronto.mandante_id);
  const visitante = catalogo.get(confronto.visitante_id);
  const placar = rascunho ?? registrado ?? placarVazio;
  const erroId = `erro-placar-${confronto.id}`;

  function alterar(evento) {
    const { name, value } = evento.target;
    aoAlterar(confronto.id, {
      gols_mandante: placar.gols_mandante,
      gols_visitante: placar.gols_visitante,
      [name]: value,
    });
    definirErro("");
  }

  function salvar(evento) {
    evento.preventDefault();
    const mensagem = validarPlacar({ ...confronto, ...placar });
    definirErro(mensagem);
    if (mensagem) return;

    aoSalvar({
      ...confronto,
      gols_mandante: Number(placar.gols_mandante),
      gols_visitante: Number(placar.gols_visitante),
    });
  }

  return (
    <form
      className="jogo-da-rodada"
      aria-label={`${mandante.nome} x ${visitante.nome}`}
      aria-describedby={erro ? erroId : undefined}
      onSubmit={salvar}
      noValidate
    >
      <div className="times-do-jogo">
        <label className="time-do-jogo">
          <SeloTime time={mandante} />
          <span>{mandante.nome}</span>
          <input
            id={`gols-mandante-${confronto.id}`}
            aria-label="Gols do mandante"
            aria-describedby={erro ? erroId : undefined}
            name="gols_mandante"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={placar.gols_mandante}
            onChange={alterar}
            required
          />
        </label>
        <label className="time-do-jogo">
          <SeloTime time={visitante} />
          <span>{visitante.nome}</span>
          <input
            aria-label="Gols do visitante"
            aria-describedby={erro ? erroId : undefined}
            name="gols_visitante"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={placar.gols_visitante}
            onChange={alterar}
            required
          />
        </label>
      </div>
      <button
        className={
          registrado ? "botao-secundario placar-registrado" : "botao-primario"
        }
        type="submit"
      >
        {registrado ? "Atualizar" : "Salvar"}
      </button>
      {erro && (
        <p id={erroId} className="erro" role="alert">
          {erro}
        </p>
      )}
    </form>
  );
}

export default function PlacarForm({
  rodada,
  partidas,
  rascunhos,
  aoMudarRodada,
  aoAlterarPlacar,
  aoSalvar,
}) {
  const confrontos = confrontosDaRodada(rodada);
  const placares = new Map(
    partidas
      .filter((partida) => partida.rodada === rodada)
      .map((partida) => [partida.id, partida]),
  );

  return (
    <section className="painel confrontos" aria-labelledby="titulo-confrontos">
      <div className="confrontos-topo">
        <h2 id="titulo-confrontos">Confrontos</h2>
        <fieldset aria-label="Rodada">
          <div className="seletor">
            <button
              type="button"
              aria-label="Rodada anterior"
              onClick={() => aoMudarRodada(rodada - 1)}
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
              onClick={() => aoMudarRodada(rodada + 1)}
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
      <ul className="lista-confrontos">
        {confrontos.map((confronto) => (
          <li key={confronto.id}>
            <JogoDaRodada
              confronto={confronto}
              registrado={placares.get(confronto.id)}
              rascunho={rascunhos.get(confronto.id)}
              aoAlterar={aoAlterarPlacar}
              aoSalvar={aoSalvar}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
