import { useRef, useState } from "react";
import { partidasIniciais } from "./campeonato.js";
import Classificacao from "./components/Classificacao.jsx";
import Partidas from "./components/Partidas.jsx";
import PlacarForm from "./components/PlacarForm.jsx";

export default function App() {
  const [partidas, definirPartidas] = useState(partidasIniciais);
  const [edicao, definirEdicao] = useState(null);
  const [aviso, definirAviso] = useState("");
  const proximoId = useRef(
    Math.max(...partidasIniciais.map(({ id }) => id)) + 1,
  );

  function salvar(dados) {
    if (edicao) {
      definirPartidas((anteriores) =>
        anteriores.map((partida) =>
          partida.id === edicao.id ? { id: partida.id, ...dados } : partida,
        ),
      );
      definirEdicao(null);
      definirAviso("Placar atualizado.");
      return;
    }
    const id = proximoId.current++;
    definirPartidas((anteriores) => [...anteriores, { id, ...dados }]);
    definirAviso("Placar registrado.");
  }

  function editar(partida) {
    definirEdicao(partida);
    definirAviso("");
    document.getElementById("placar")?.scrollIntoView?.({ block: "nearest" });
  }

  function excluir(partida) {
    if (!window.confirm("Excluir este placar da simulação?")) return;
    definirPartidas((anteriores) =>
      anteriores.filter(({ id }) => id !== partida.id),
    );
    if (edicao?.id === partida.id) definirEdicao(null);
    definirAviso("Placar excluído.");
  }

  return (
    <>
      <header className="barra">
        <div className="limite flex items-center justify-between gap-4">
          <div className="marca flex items-center gap-3">
            <span className="marca-campo" aria-hidden="true" />
            Mesa da Rodada
          </div>
          <span className="ambiente">
            <span aria-hidden="true" />
            Demonstração
          </span>
        </div>
      </header>
      <main className="limite">
        <div className="intro">
          <h1>
            Simule a rodada<span>.</span>
          </h1>
          <p>
            Registre placares e veja como cada partida muda a classificação.
          </p>
        </div>
        <div className="quadro">
          <Classificacao partidas={partidas} />
          <div className="area-formulario">
            <PlacarForm
              key={edicao?.id ?? "novo"}
              partida={edicao}
              aoSalvar={salvar}
              aoCancelar={() => definirEdicao(null)}
            />
            <p className="mensagem-sucesso" role="status">
              {aviso}
            </p>
          </div>
          <Partidas partidas={partidas} aoEditar={editar} aoExcluir={excluir} />
        </div>
      </main>
    </>
  );
}
