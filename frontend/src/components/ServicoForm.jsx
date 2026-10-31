import { useState } from "react";
import { validateServico } from "../validation";

export function ServicoForm({ onAdd }) {
  const [nome, setNome] = useState("");
  const [url, setUrl] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [errors, setErrors] = useState({});

  function handleSubmit(event) {
    event.preventDefault();
    const result = validateServico({ nome, url, ativo });
    setErrors(result.errors);
    if (Object.keys(result.errors).length > 0) return;

    onAdd(result.values);
    setNome("");
    setUrl("");
    setAtivo(true);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="servico-nome"
          className="block text-sm font-medium text-slate-700"
        >
          Nome
        </label>
        <input
          id="servico-nome"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          aria-invalid={errors.nome ? "true" : "false"}
          aria-describedby={errors.nome ? "servico-nome-error" : undefined}
          placeholder="Ex.: Serviço de autenticação"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-[#00613C] focus:outline-2 focus:outline-[#00613C]"
        />
        {errors.nome && (
          <p
            id="servico-nome-error"
            role="alert"
            className="text-sm text-[#7A192D]"
          >
            {errors.nome}
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
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          aria-invalid={errors.url ? "true" : "false"}
          aria-describedby={errors.url ? "servico-url-error" : undefined}
          placeholder="https://exemplo.com"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-[#00613C] focus:outline-2 focus:outline-[#00613C]"
        />
        {errors.url && (
          <p
            id="servico-url-error"
            role="alert"
            className="text-sm text-[#7A192D]"
          >
            {errors.url}
          </p>
        )}
      </div>
      <label className="flex items-center gap-3 rounded-lg bg-[#00613C]/5 p-3 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={ativo}
          onChange={(event) => setAtivo(event.target.checked)}
          className="size-4 accent-[#00613C]"
        />
        Serviço ativo
      </label>
      <button
        type="submit"
        className="w-full rounded-lg bg-[#7A192D] px-4 py-3 font-semibold text-white hover:bg-[#5C1322]"
      >
        Adicionar serviço
      </button>
    </form>
  );
}
