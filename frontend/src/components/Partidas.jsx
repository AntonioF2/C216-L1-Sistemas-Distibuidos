import { times } from "../campeonato.js";
import { SeloTime } from "./Classificacao.jsx";
import SeletorRodada from "./SeletorRodada.jsx";

const catalogo = new Map(times.map((time) => [time.id, time]));

export default function Partidas({
  rodada,
  partidas,
  aoMudarRodada,
  aoEditar,
  aoExcluir,
  operacao,
  feedback,
}) {
  return (
    <section className="painel" aria-labelledby="titulo-partidas">
      <div className="partidas-topo">
        <h2 id="titulo-partidas">Partidas registradas</h2>
        <SeletorRodada
          rodada={rodada}
          aoMudarRodada={aoMudarRodada}
          ocupado={!!operacao}
        />
        <p className="nota">
          {partidas.length}{" "}
          {partidas.length === 1
            ? "partida registrada"
            : "partidas registradas"}{" "}
          na rodada
        </p>
      </div>
      {feedback?.erro && (
        <p className="erro mx-5 mb-2" role="alert">
          {feedback.erro}
        </p>
      )}
      <div role="status">
        {(operacao === "excluir" || feedback?.aviso) && (
          <p className="rodape-painel">
            {operacao === "excluir" ? "Excluindo placar…" : feedback.aviso}
          </p>
        )}
      </div>
      {partidas.length === 0 ? (
        <p className="rodape-painel">Nenhum placar registrado nesta rodada.</p>
      ) : (
        <ul className="lista-partidas">
          {partidas.map((partida) => {
            const mandante = catalogo.get(partida.mandante_id);
            const visitante = catalogo.get(partida.visitante_id);
            return (
              <li className="partida" key={partida.id}>
                <span className="confronto">
                  <SeloTime time={mandante} />
                  <span className="sr-only">{mandante.nome}</span>
                  <strong className="placar">
                    {partida.gols_mandante} × {partida.gols_visitante}
                  </strong>
                  <SeloTime time={visitante} />
                  <span className="sr-only">{visitante.nome}</span>
                </span>
                <span className="acoes">
                  <button
                    type="button"
                    className="botao-secundario"
                    onClick={() => aoEditar(partida)}
                    disabled={!!operacao}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="botao-secundario excluir"
                    onClick={() => aoExcluir(partida)}
                    disabled={!!operacao}
                  >
                    Excluir
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
