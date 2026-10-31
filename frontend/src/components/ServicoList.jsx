export function ServicoList({ servicos }) {
  if (servicos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#00613C]/30 bg-white px-6 py-12 text-center">
        <p className="font-medium text-slate-700">Nenhum serviço cadastrado.</p>
        <p className="mt-2 text-sm text-slate-500">
          Adicione um serviço pelo formulário para começar.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {servicos.map((servico) => (
        <li
          key={servico.id}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="min-w-0 break-words font-semibold text-slate-900">
              {servico.nome}
            </h3>
            <span
              className={
                servico.ativo
                  ? "rounded-full bg-[#00613C]/10 px-3 py-1 text-xs font-medium text-[#00613C]"
                  : "rounded-full bg-[#7A192D]/10 px-3 py-1 text-xs font-medium text-[#7A192D]"
              }
            >
              {servico.ativo ? "Ativo" : "Inativo"}
            </span>
          </div>
          <a
            href={servico.url}
            className="mt-3 block break-all text-sm text-[#00613C] underline underline-offset-4"
          >
            {servico.url}
          </a>
        </li>
      ))}
    </ul>
  );
}
