import { calcularClassificacao, times } from "../campeonato.js";

export function SeloTime({ time }) {
  return (
    <span className={`selo selo--${time.cor}`} aria-hidden="true">
      {time.sigla}
    </span>
  );
}

const percentual = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

export default function Classificacao({ partidas }) {
  const tabela = calcularClassificacao(times, partidas);

  return (
    <section className="painel" aria-labelledby="titulo-classificacao">
      <div className="cabecalho-painel flex items-center justify-between gap-4">
        <h2 id="titulo-classificacao">Classificação</h2>
        <span className="nota">{times.length} clubes</span>
      </div>
      <div className="overflow-x-auto">
        <table className="classificacao" aria-labelledby="titulo-classificacao">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Clube</th>
              <th scope="col" className="pontos">
                PTS
              </th>
              <th scope="col">
                <abbr title="Jogos">J</abbr>
              </th>
              <th scope="col">
                <abbr title="Vitórias">V</abbr>
              </th>
              <th scope="col">
                <abbr title="Empates">E</abbr>
              </th>
              <th scope="col">
                <abbr title="Derrotas">D</abbr>
              </th>
              <th scope="col">
                <abbr title="Gols pró">GP</abbr>
              </th>
              <th scope="col">
                <abbr title="Gols contra">GC</abbr>
              </th>
              <th scope="col">
                <abbr title="Saldo de gols">SG</abbr>
              </th>
              <th scope="col">
                <abbr title="Aproveitamento">%</abbr>
              </th>
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
      <p className="rodape-painel">
        Vitória 3 pts · Empate 1 pt · Derrota 0 pts
      </p>
    </section>
  );
}
