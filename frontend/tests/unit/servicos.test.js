import { beforeEach, expect, it, vi } from "vitest";
import {
  API_URL,
  atualizarServico,
  buscarServico,
  criarServico,
  excluirServico,
  listarServicos,
  substituirServico,
} from "../../src/services/servicos";

const servico = {
  id: 1,
  nome: "API",
  url: "https://example.com/",
  ativo: true,
};
beforeEach(() => vi.stubGlobal("fetch", vi.fn()));

it("lista serviços vindos da API", async () => {
  fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => [servico],
  });
  expect(await listarServicos()).toEqual([servico]);
  expect(fetch).toHaveBeenCalledWith(`${API_URL}/servicos`, undefined);
});

it("consulta um serviço pelo ID", async () => {
  fetch.mockResolvedValue({ ok: true, status: 200, json: async () => servico });
  expect(await buscarServico(1)).toEqual(servico);
  expect(fetch).toHaveBeenCalledWith(`${API_URL}/servicos/1`, undefined);
});

it.each([
  ["POST", criarServico],
  ["PUT", (data) => substituirServico(1, data)],
  ["PATCH", (data) => atualizarServico(1, data)],
])("envia JSON por %s", async (method, operation) => {
  fetch.mockResolvedValue({ ok: true, status: 200, json: async () => servico });
  const data = { nome: "API", url: "https://example.com/", ativo: true };
  expect(await operation(data)).toEqual(servico);
  expect(fetch).toHaveBeenCalledWith(expect.any(String), {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
});

it("exclui sem tentar ler JSON em resposta 204", async () => {
  const json = vi.fn();
  fetch.mockResolvedValue({ ok: true, status: 204, json });
  expect(await excluirServico(1)).toBeUndefined();
  expect(json).not.toHaveBeenCalled();
  expect(fetch).toHaveBeenCalledWith(`${API_URL}/servicos/1`, {
    method: "DELETE",
  });
});

it("informa falha de conexão", async () => {
  fetch.mockRejectedValue(new TypeError("Failed to fetch"));
  await expect(listarServicos()).rejects.toThrow(
    "Não foi possível conectar à API.",
  );
});

it("exibe detail retornado em erro HTTP", async () => {
  fetch.mockResolvedValue({
    ok: false,
    status: 409,
    json: async () => ({ detail: "Já existe um serviço com esse nome" }),
  });
  await expect(criarServico(servico)).rejects.toThrow(
    "Já existe um serviço com esse nome",
  );
});

it("usa mensagem padrão em erro de validação estruturado", async () => {
  fetch.mockResolvedValue({
    ok: false,
    status: 422,
    json: async () => ({ detail: [{ msg: "Inválido" }] }),
  });
  await expect(criarServico(servico)).rejects.toThrow(
    "Erro ao cadastrar o serviço.",
  );
});

it("usa mensagem padrão quando erro não é JSON", async () => {
  fetch.mockResolvedValue({
    ok: false,
    status: 500,
    json: async () => {
      throw new Error("HTML");
    },
  });
  await expect(listarServicos()).rejects.toThrow(
    "Erro ao carregar os serviços.",
  );
});
