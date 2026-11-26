import { useState } from "react";
import { calcularClassificacao, times } from "../campeonato.js";

export function SeloTime({ time }) {
  return (
    <img
      className="escudo"
      src={`${import.meta.env.BASE_URL}escudos/${time.sigla.toLowerCase()}.png`}
      alt=""
      width="32"
      height="32"
    />
  );
}

const percentual = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

const colunas = [
  ["#", "Posição na tabela"],
  ["Clube"],
  ["PTS", "Pontos"],
  ["J", "Jogos disputados"],
  ["V", "Vitórias"],
  ["E", "Empates"],
  ["D", "Derrotas"],
  ["GP", "Gols pró (marcados)"],
  ["GC", "Gols contra (sofridos)"],
  ["SG", "Saldo de gols (GP − GC)"],
  ["%", "Aproveitamento dos pontos possíveis"],
];

export default function Classificacao({ partidas }) {
  const [expandida, definirExpandida] = useState(false);
  const tabela = calcularClassificacao(times, partidas);
  const rotuloExpansao = expandida
    ? "Recolher classificação"
    : "Expandir classificação";

  return (
    <section className="painel" aria-labelledby="titulo-classificacao">
      <div className="cabecalho-painel flex items-center justify-between gap-4">
        <h2 id="titulo-classificacao">Classificação</h2>
        <div className="flex items-center gap-3">
          <span className="nota">{times.length} clubes</span>
          <button
            className="expandir-classificacao"
            type="button"
            title={rotuloExpansao}
            aria-label={rotuloExpansao}
            aria-expanded={expandida}
            aria-controls="tabela-classificacao"
            onClick={() => definirExpandida((anterior) => !anterior)}
          >
            <span aria-hidden="true">{expandida ? "↑" : "↓"}</span>
          </button>
        </div>
      </div>
      <div
        id="tabela-classificacao"
        className={
          expandida ? "tabela-rolavel tabela-expandida" : "tabela-rolavel"
        }
      >
        <table className="classificacao" aria-labelledby="titulo-classificacao">
          <thead>
            <tr>
              {colunas.map(([sigla, significado]) => (
                <th
                  key={sigla}
                  scope="col"
                  className={sigla === "PTS" ? "pontos" : undefined}
                >
                  {significado ? (
                    <abbr title={significado}>{sigla}</abbr>
                  ) : (
                    sigla
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tabela.map((time, indice) => (
              <tr key={time.id}>
                <td className="posicao">{indice + 1}</td>
                <th scope="row">
                  <span className="flex items-center gap-3">
                    <SeloTime time={time} />
                    {time.nome}
                  </span>
                </th>
                <td className="pontos">{time.pontos}</td>
                <td>{time.jogos}</td>
                <td>{time.vitorias}</td>
                <td>{time.empates}</td>
                <td>{time.derrotas}</td>
                <td>{time.gp}</td>
                <td>{time.gc}</td>
                <td>
                  {time.saldo > 0 ? "+" : ""}
                  {time.saldo}
                </td>
                <td>{percentual.format(time.aproveitamento)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rodape-painel space-y-2">
        <h3 className="text-sm font-bold">Legenda da classificação</h3>
        <dl className="flex flex-wrap gap-x-4 gap-y-1.5">
          {colunas
            .filter(([, significado]) => significado)
            .map(([sigla, significado]) => (
              <div key={sigla} className="flex items-baseline gap-1.5">
                <dt className="font-bold">{sigla}</dt>
                <dd>{significado}</dd>
              </div>
            ))}
        </dl>
        <p>Vitória vale 3 pontos, empate vale 1 e derrota vale 0.</p>
      </div>
    </section>
  );
}
