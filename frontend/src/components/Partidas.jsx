import { times } from "../campeonato.js";
import { SeloTime } from "./Classificacao.jsx";

const catalogo = new Map(times.map((time) => [time.id, time]));

export default function Partidas({ partidas, aoEditar, aoExcluir }) {
  return (
    <section className="painel" aria-labelledby="titulo-partidas">
      <div className="cabecalho-painel flex items-center justify-between gap-4">
        <h2 id="titulo-partidas">Partidas registradas</h2>
        <span className="nota">
          {partidas.length} {partidas.length === 1 ? "partida" : "partidas"}
        </span>
      </div>
      {partidas.length === 0 ? (
        <p className="rodape-painel">Nenhum placar registrado.</p>
      ) : (
        <ul className="lista-partidas">
          {partidas.map((partida) => {
            const mandante = catalogo.get(partida.mandante_id);
            const visitante = catalogo.get(partida.visitante_id);
            return (
              <li className="partida" key={partida.id}>
                <span className="rodada">Rodada {partida.rodada}</span>
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
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="botao-secundario excluir"
                    onClick={() => aoExcluir(partida)}
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
