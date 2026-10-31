import { useState } from "react";
import { ServicoForm } from "./components/ServicoForm";
import { ServicoList } from "./components/ServicoList";

export default function App() {
  const [servicos, setServicos] = useState([]);

  function addServico({ nome, url, ativo }) {
    setServicos((current) => [
      ...current,
      { id: crypto.randomUUID(), nome, url, ativo },
    ]);
  }

  return (
    <main className="min-h-screen bg-stone-50 text-slate-900">
      <header className="border-b-8 border-[#7A192D] bg-[#00613C] text-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
            Catálogo de serviços
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Gerenciador de Serviços
          </h1>
          <p className="mt-3 max-w-xl text-white/80">
            Cadastre e consulte os serviços em um só lugar.
          </p>
        </div>
      </header>
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-2">
        <section
          aria-labelledby="cadastro-heading"
          className="self-start rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 id="cadastro-heading" className="text-xl font-semibold">
            Novo serviço
          </h2>
          <p className="mb-6 mt-2 text-sm text-slate-500">
            Informe o nome, o endereço e a situação do serviço.
          </p>
          <ServicoForm onAdd={addServico} />
        </section>
        <section aria-labelledby="servicos-heading" className="space-y-4">
          <h2 id="servicos-heading" className="text-xl font-semibold">
            Serviços cadastrados
          </h2>
          <ServicoList servicos={servicos} />
        </section>
      </div>
    </main>
  );
}
