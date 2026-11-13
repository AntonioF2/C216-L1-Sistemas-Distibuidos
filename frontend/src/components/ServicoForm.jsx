import { useState } from "react";
import { validateServico } from "../validation";

export function ServicoForm({ onSave, servico = null, onCancel }) {
  const [nome, setNome] = useState(servico?.nome ?? "");
  const [url, setUrl] = useState(servico?.url ?? "");
  const [ativo, setAtivo] = useState(servico?.ativo ?? true);
  const [errosCampos, setErrosCampos] = useState({});
  const [erroEnvio, setErroEnvio] = useState("");
  const [salvando, setSalvando] = useState(false);

  return (
    <form onSubmit={enviarFormulario} noValidate className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="servico-nome"
          className="block text-sm font-medium text-slate-700"
        >
          Nome
        </label>
        <input
          id="servico-nome"
          disabled={salvando}
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
          aria-invalid={errosCampos.nome ? "true" : "false"}
          aria-describedby={errosCampos.nome ? "servico-nome-error" : undefined}
          placeholder="Ex.: Serviço de autenticação"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-[#00613C] focus:outline-2 focus:outline-[#00613C]"
        />
        {errosCampos.nome && (
          <p
            id="servico-nome-error"
            role="alert"
            className="text-sm text-[#7A192D]"
          >
            {errosCampos.nome}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <label
          htmlFor="servico-url"
          className="block text-sm font-medium text-slate-700"
        >
          URL
        </label>
        <input
          id="servico-url"
          disabled={salvando}
          type="url"
          value={url}
          onChange={(evento) => setUrl(evento.target.value)}
          aria-invalid={errosCampos.url ? "true" : "false"}
          aria-describedby={errosCampos.url ? "servico-url-error" : undefined}
          placeholder="https://exemplo.com"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-[#00613C] focus:outline-2 focus:outline-[#00613C]"
        />
        {errosCampos.url && (
          <p
            id="servico-url-error"
            role="alert"
            className="text-sm text-[#7A192D]"
          >
            {errosCampos.url}
          </p>
        )}
      </div>
      <label className="flex items-center gap-3 rounded-lg bg-[#00613C]/5 p-3 text-sm text-slate-700">
        <input
          type="checkbox"
          disabled={salvando}
          checked={ativo}
          onChange={(evento) => setAtivo(evento.target.checked)}
          className="size-4 accent-[#00613C]"
        />
        Serviço ativo
      </label>
      {erroEnvio && (
        <p role="alert" className="text-sm text-[#7A192D]">
          {erroEnvio}
        </p>
      )}
      <button
        type="submit"
        disabled={salvando}
        className="w-full rounded-lg bg-[#7A192D] px-4 py-3 font-semibold text-white hover:bg-[#5C1322] disabled:opacity-60"
      >
        {salvando
          ? "Salvando..."
          : servico
            ? "Salvar alterações"
            : "Adicionar serviço"}
      </button>
      {servico && (
        <button
          type="button"
          disabled={salvando}
          onClick={onCancel}
          className="w-full text-sm text-[#7A192D] underline"
        >
          Cancelar edição
        </button>
      )}
    </form>
  );

  async function enviarFormulario(evento) {
    evento.preventDefault();
    setErroEnvio("");
    const validacao = validateServico({ nome, url, ativo });
    setErrosCampos(validacao.errors);
    if (Object.keys(validacao.errors).length > 0) return;

    setSalvando(true);
    try {
      await onSave(validacao.values);
      setNome("");
      setUrl("");
      setAtivo(true);
    } catch (erro) {
      setErroEnvio(erro.message);
    } finally {
      setSalvando(false);
    }
  }
}
