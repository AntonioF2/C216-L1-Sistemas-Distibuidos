import { useEffect, useState } from "react";
import Classificacao from "./components/Classificacao.jsx";
import Partidas from "./components/Partidas.jsx";
import PlacarForm from "./components/PlacarForm.jsx";

export default function App() {
  const [partidas, definirPartidas] = useState([]);
  const [rascunhos, definirRascunhos] = useState(() => new Map());
  const [rodada, definirRodada] = useState(1);
  const [foco, definirFoco] = useState(null);
  const [aviso, definirAviso] = useState("");

  useEffect(() => {
    if (foco) document.getElementById(`gols-mandante-${foco.id}`)?.focus();
  }, [foco]);

  function mudarRodada(numero) {
    definirRodada(numero);
    definirAviso("");
  }

  function atualizarRascunho(id, placar) {
    definirRascunhos((anteriores) => new Map(anteriores).set(id, placar));
    definirAviso("");
  }

  function limparRascunhos(ids) {
    definirRascunhos((anteriores) => {
      const restantes = new Map(anteriores);
      for (const id of ids) restantes.delete(id);
      return restantes;
    });
  }

  function salvar(resultados) {
    definirPartidas((anteriores) => {
      const placares = new Map(
        anteriores.map((partida) => [partida.id, partida]),
      );
      for (const resultado of resultados) placares.set(resultado.id, resultado);
      return [...placares.values()];
    });
    limparRascunhos(resultados.map(({ id }) => id));
    definirAviso(
      resultados.length === 1
        ? "1 placar salvo na rodada."
        : `${resultados.length} placares salvos na rodada.`,
    );
  }

  function editar(partida) {
    mudarRodada(partida.rodada);
    definirFoco({ id: partida.id });
  }

  function excluir(partida) {
    if (!window.confirm("Excluir este placar da simulação?")) return;
    definirPartidas((anteriores) =>
      anteriores.filter(({ id }) => id !== partida.id),
    );
    limparRascunhos([partida.id]);
    definirAviso("Placar excluído.");
  }

  return (
    <>
      <header className="barra">
        <div className="limite flex items-center">
          <div className="marca flex items-center gap-3">
            <span className="marca-campo" aria-hidden="true" />
            Mesa da Rodada
          </div>
        </div>
      </header>
      <main className="limite">
        <div className="intro">
          <h1>
            Simule a rodada<span>.</span>
          </h1>
          <p>
            Preencha os placares dos confrontos e acompanhe as mudanças na
            classificação.
          </p>
        </div>
        <div className="quadro">
          <div className="area-formulario">
            <PlacarForm
              rodada={rodada}
              partidas={partidas}
              rascunhos={rascunhos}
              aviso={aviso}
              aoMudarRodada={mudarRodada}
              aoAlterarPlacar={atualizarRascunho}
              aoSalvar={salvar}
            />
          </div>
          <div className="area-classificacao">
            <Classificacao partidas={partidas} />
            <Partidas
              partidas={partidas}
              aoEditar={editar}
              aoExcluir={excluir}
            />
          </div>
        </div>
      </main>
    </>
  );
}
