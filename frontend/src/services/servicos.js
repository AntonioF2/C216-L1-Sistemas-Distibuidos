export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const SERVICOS_URL = `${API_URL.replace(/\/$/, "")}/servicos`;

export function listarServicos() {
  return requisitar(SERVICOS_URL, undefined, "Erro ao carregar os serviços.");
}

export function buscarServico(servicoId) {
  return requisitar(
    `${SERVICOS_URL}/${servicoId}`,
    undefined,
    "Erro ao consultar o serviço.",
  );
}

export function criarServico(dadosServico) {
  return requisitar(
    SERVICOS_URL,
    criarOpcoesJson("POST", dadosServico),
    "Erro ao cadastrar o serviço.",
  );
}

export function substituirServico(servicoId, dadosServico) {
  return requisitar(
    `${SERVICOS_URL}/${servicoId}`,
    criarOpcoesJson("PUT", dadosServico),
    "Erro ao editar o serviço.",
  );
}

export function atualizarServico(servicoId, alteracoes) {
  return requisitar(
    `${SERVICOS_URL}/${servicoId}`,
    criarOpcoesJson("PATCH", alteracoes),
    "Erro ao atualizar o serviço.",
  );
}

export function excluirServico(servicoId) {
  return requisitar(
    `${SERVICOS_URL}/${servicoId}`,
    { method: "DELETE" },
    "Erro ao excluir o serviço.",
  );
}

function criarOpcoesJson(metodo, dados) {
  return {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  };
}

async function requisitar(url, opcoes, mensagemErro) {
  let resposta;
  try {
    resposta = await fetch(url, opcoes);
  } catch {
    throw new Error("Não foi possível conectar à API.");
  }
  if (!resposta.ok) {
    const dadosErro = await resposta.json().catch(() => ({}));
    throw new Error(
      typeof dadosErro.detail === "string" ? dadosErro.detail : mensagemErro,
    );
  }
  if (resposta.status === 204) return;
  return resposta.json();
}
