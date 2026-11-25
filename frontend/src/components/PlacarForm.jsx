import { useState } from "react";
import { times, validarPlacar } from "../campeonato.js";

const novo = {
  rodada: "1",
  mandante_id: "",
  visitante_id: "",
  gols_mandante: "",
  gols_visitante: "",
};

export default function PlacarForm({ partida, aoSalvar, aoCancelar }) {
  const [dados, definirDados] = useState(() =>
    partida
      ? {
          rodada: String(partida.rodada),
          mandante_id: String(partida.mandante_id),
          visitante_id: String(partida.visitante_id),
          gols_mandante: String(partida.gols_mandante),
          gols_visitante: String(partida.gols_visitante),
        }
      : novo,
  );
  const [erro, definirErro] = useState("");

  function alterar(evento) {
    const { name, value } = evento.target;
    definirDados((anteriores) => ({ ...anteriores, [name]: value }));
    definirErro("");
  }

  function salvar(evento) {
    evento.preventDefault();
    const mensagem = validarPlacar(dados);
    if (mensagem) {
      definirErro(mensagem);
      return;
    }
    aoSalvar(
      Object.fromEntries(
        Object.entries(dados).map(([chave, valor]) => [chave, Number(valor)]),
      ),
    );
    definirDados({ ...novo, rodada: dados.rodada });
  }

  return (
    <section
      className="painel formulario"
      id="placar"
      aria-labelledby="titulo-placar"
    >
      <div className="formulario-topo">
        <h2 id="titulo-placar">
          {partida ? "Editar placar" : "Registrar placar"}
        </h2>
      </div>
      <form className="formulario-corpo space-y-4" onSubmit={salvar} noValidate>
        <label className="campo campo-rodada">
          Rodada
          <input
            name="rodada"
            type="number"
            min="1"
            step="1"
            required
            value={dados.rodada}
            onChange={alterar}
          />
        </label>
        <div className="grade-placar">
          <label className="campo">
            Mandante
            <select
              name="mandante_id"
              required
              value={dados.mandante_id}
              onChange={alterar}
            >
              <option value="">Selecione</option>
              {times.map((time) => (
                <option key={time.id} value={time.id}>
                  {time.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="campo">
            Gols do mandante
            <input
              name="gols_mandante"
              type="number"
              min="0"
              step="1"
              required
              placeholder="0"
              value={dados.gols_mandante}
              onChange={alterar}
            />
          </label>
          <label className="campo">
            Visitante
            <select
              name="visitante_id"
              required
              value={dados.visitante_id}
              onChange={alterar}
            >
              <option value="">Selecione</option>
              {times.map((time) => (
                <option key={time.id} value={time.id}>
                  {time.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="campo">
            Gols do visitante
            <input
              name="gols_visitante"
              type="number"
              min="0"
              step="1"
              required
              placeholder="0"
              value={dados.gols_visitante}
              onChange={alterar}
            />
          </label>
        </div>
        {erro && (
          <p className="erro" role="alert">
            {erro}
          </p>
        )}
        <button className="botao-primario w-full" type="submit">
          {partida ? "Salvar alterações" : "Registrar resultado"}
        </button>
        {partida && (
          <button
            className="botao-secundario w-full"
            type="button"
            onClick={aoCancelar}
          >
            Cancelar edição
          </button>
        )}
      </form>
    </section>
  );
}
