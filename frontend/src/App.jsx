import { useEffect, useState } from "react";
import Classificacao from "./components/Classificacao.jsx";
import Partidas from "./components/Partidas.jsx";
import PlacarForm from "./components/PlacarForm.jsx";
import {
  consultarPlacares,
  gravarRodada,
  removerPlacar,
  zerarSimulacao,
} from "./placaresApi.js";

export default function App() {
  const [partidas, definirPartidas] = useState([]);
  const [rascunhos, definirRascunhos] = useState(() => new Map());
  const [rodada, definirRodada] = useState(1);
  const [foco, definirFoco] = useState(null);
  const [carregando, definirCarregando] = useState(true);
  const [erroCarga, definirErroCarga] = useState("");
  const [operacao, definirOperacao] = useState(null);
  const [feedback, definirFeedback] = useState(null);
  const [versaoFormulario, definirVersaoFormulario] = useState(0);
  const partidasDaRodada = partidas.filter(
    (partida) => partida.rodada === rodada,
  );

  useEffect(() => {
    if (!carregando) return;
    const controle = new AbortController();
    consultarPlacares(controle.signal)
      .then((dados) => {
        if (!controle.signal.aborted) definirPartidas(dados);
      })
      .catch((erro) => {
        if (!controle.signal.aborted) definirErroCarga(erro.message);
      })
      .finally(() => {
        if (!controle.signal.aborted) definirCarregando(false);
      });
    return () => controle.abort();
  }, [carregando]);

  useEffect(() => {
    if (foco) document.getElementById(`gols-mandante-${foco.id}`)?.focus();
  }, [foco]);

  function mudarRodada(numero) {
    definirRodada(numero);
    definirFeedback(null);
  }

  function recarregar() {
    definirCarregando(true);
    definirErroCarga("");
  }

  function atualizarRascunho(id, placar) {
    definirRascunhos((anteriores) => new Map(anteriores).set(id, placar));
    definirFeedback(null);
  }

  function limparRascunhos(ids) {
    definirRascunhos((anteriores) => {
      const restantes = new Map(anteriores);
      for (const id of ids) restantes.delete(id);
      return restantes;
    });
  }

  async function salvar(resultados) {
    if (operacao) return;
    definirOperacao("salvar");
    definirFeedback(null);
    try {
      const salvos = await gravarRodada(rodada, resultados);
      definirPartidas((anteriores) => {
        const placares = new Map(
          anteriores.map((partida) => [partida.id, partida]),
        );
        for (const resultado of salvos) placares.set(resultado.id, resultado);
        return [...placares.values()];
      });
      limparRascunhos(salvos.map(({ id }) => id));
      definirFeedback({
        operacao: "salvar",
        aviso:
          salvos.length === 1
            ? "1 placar salvo na rodada."
            : `${salvos.length} placares salvos na rodada.`,
      });
    } catch (erro) {
      definirFeedback({ operacao: "salvar", erro: erro.message });
    } finally {
      definirOperacao(null);
    }
  }

  function editar(partida) {
    mudarRodada(partida.rodada);
    definirFoco({ id: partida.id });
  }

  async function excluir(partida) {
    if (operacao || !window.confirm("Excluir este placar da simulação?"))
      return;
    definirOperacao("excluir");
    definirFeedback(null);
    try {
      await removerPlacar(partida.partida_id);
      definirPartidas((anteriores) =>
        anteriores.filter(({ id }) => id !== partida.id),
      );
      limparRascunhos([partida.id]);
      definirFeedback({ operacao: "excluir", aviso: "Placar excluído." });
    } catch (erro) {
      definirFeedback({ operacao: "excluir", erro: erro.message });
    } finally {
      definirOperacao(null);
    }
  }

  async function reiniciarSimulacao() {
    if (
      operacao ||
      !window.confirm(
        "Zerar a simulação? Todos os placares salvos e rascunhos serão apagados.",
      )
    )
      return;

    definirOperacao("zerar");
    definirFeedback(null);
    try {
      await zerarSimulacao();
      definirPartidas([]);
      definirRascunhos(new Map());
      definirRodada(1);
      definirFoco(null);
      definirVersaoFormulario((anterior) => anterior + 1);
      definirFeedback({ operacao: "zerar", aviso: "Simulação zerada." });
    } catch (erro) {
      definirFeedback({ operacao: "zerar", erro: erro.message });
    } finally {
      definirOperacao(null);
    }
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
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1>
                Simule a rodada<span>.</span>
              </h1>
              <p>
                Preencha os placares dos confrontos e acompanhe as mudanças na
                classificação.
              </p>
            </div>
            {!carregando && !erroCarga && (
              <button
                className="botao-secundario excluir border border-current disabled:opacity-60"
                type="button"
                disabled={!!operacao}
                onClick={reiniciarSimulacao}
              >
                {operacao === "zerar"
                  ? "Zerando simulação…"
                  : "Zerar simulação"}
              </button>
            )}
          </div>
          {feedback?.operacao === "zerar" && feedback.erro && (
            <p className="erro" role="alert">
              {feedback.erro}
            </p>
          )}
          {feedback?.operacao === "zerar" && feedback.aviso && (
            <p role="status">{feedback.aviso}</p>
          )}
        </div>
        {carregando && <p role="status">Carregando placares…</p>}
        {erroCarga && (
          <div className="erro space-y-2" role="alert">
            <p>{erroCarga}</p>
            <button
              className="botao-primario"
              type="button"
              onClick={recarregar}
            >
              Tentar novamente
            </button>
          </div>
        )}
        {!carregando && !erroCarga && (
          <div className="quadro">
            <div className="area-formulario">
              <PlacarForm
                key={versaoFormulario}
                rodada={rodada}
                partidas={partidasDaRodada}
                rascunhos={rascunhos}
                feedback={feedback?.operacao === "salvar" ? feedback : null}
                operacao={operacao}
                aoMudarRodada={mudarRodada}
                aoAlterarPlacar={atualizarRascunho}
                aoSalvar={salvar}
              />
            </div>
            <div className="area-classificacao">
              <Classificacao partidas={partidas} />
              <Partidas
                rodada={rodada}
                partidas={partidasDaRodada}
                aoMudarRodada={mudarRodada}
                aoEditar={editar}
                aoExcluir={excluir}
                operacao={operacao}
                feedback={feedback?.operacao === "excluir" ? feedback : null}
              />
            </div>
          </div>
        )}
      </main>
    </>
  );
}
