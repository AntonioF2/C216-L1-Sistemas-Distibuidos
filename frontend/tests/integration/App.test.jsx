import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import App from "../../src/App";

const servico = {
  id: 7,
  nome: "Autenticação",
  url: "https://example.com/auth",
  ativo: true,
};
const jsonResponse = (data, status = 200) => ({
  ok: status < 400,
  status,
  json: async () => data,
});
beforeEach(() =>
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse([]))),
);

it("mostra carregamento enquanto aguarda a API", () => {
  fetch.mockImplementation(() => new Promise(() => {}));
  render(<App />);
  expect(screen.getByRole("status")).toHaveTextContent(
    "Carregando serviços...",
  );
});

it("mostra lista vazia recebida da API", async () => {
  render(<App />);
  expect(
    await screen.findByText("Nenhum serviço cadastrado."),
  ).toBeInTheDocument();
});

it("mostra serviços já persistidos", async () => {
  fetch.mockResolvedValue(jsonResponse([servico]));
  render(<App />);
  expect(await screen.findByRole("listitem")).toHaveTextContent(servico.nome);
});

it("informa erro de conexão na listagem", async () => {
  fetch.mockRejectedValue(new TypeError("Failed to fetch"));
  render(<App />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Não foi possível conectar à API.",
  );
});

it("cadastra serviço usando resposta do POST e limpa o formulário", async () => {
  fetch
    .mockResolvedValueOnce(jsonResponse([]))
    .mockResolvedValueOnce(jsonResponse(servico, 201));
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText("Nenhum serviço cadastrado.");
  await user.type(screen.getByLabelText("Nome"), servico.nome);
  await user.type(screen.getByLabelText("URL"), servico.url);
  await user.click(screen.getByRole("button", { name: "Adicionar serviço" }));
  expect(await screen.findByRole("listitem")).toHaveTextContent(servico.nome);
  expect(screen.getByLabelText("Nome")).toHaveValue("");
  expect(fetch.mock.calls[1][1].method).toBe("POST");
});

it("preserva campos e exibe erro de nome duplicado", async () => {
  fetch
    .mockResolvedValueOnce(jsonResponse([]))
    .mockResolvedValueOnce(
      jsonResponse({ detail: "Já existe um serviço com esse nome" }, 409),
    );
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText("Nenhum serviço cadastrado.");
  await user.type(screen.getByLabelText("Nome"), servico.nome);
  await user.type(screen.getByLabelText("URL"), servico.url);
  await user.click(screen.getByRole("button", { name: "Adicionar serviço" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Já existe um serviço com esse nome",
  );
  expect(screen.getByLabelText("Nome")).toHaveValue(servico.nome);
  expect(screen.getByLabelText("URL")).toHaveValue(servico.url);
});

it("não envia dados inválidos à API", async () => {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText("Nenhum serviço cadastrado.");
  await user.type(screen.getByLabelText("Nome"), servico.nome);
  await user.type(screen.getByLabelText("URL"), "invalida");
  await user.click(screen.getByRole("button", { name: "Adicionar serviço" }));
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Informe uma URL HTTP ou HTTPS válida.",
  );
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("consulta detalhes pelo ID", async () => {
  fetch
    .mockResolvedValueOnce(jsonResponse([servico]))
    .mockResolvedValueOnce(jsonResponse(servico));
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole("listitem");
  await user.click(screen.getByRole("button", { name: "Detalhes" }));
  const details = await screen.findByRole("region", {
    name: "Detalhes do serviço",
  });
  expect(within(details).getByText("ID: 7")).toBeInTheDocument();
  expect(fetch.mock.calls[1][0]).toMatch(/\/servicos\/7$/);
});

it("edita todos os campos com PUT", async () => {
  fetch
    .mockResolvedValueOnce(jsonResponse([servico]))
    .mockResolvedValueOnce(jsonResponse(servico))
    .mockResolvedValueOnce(jsonResponse({ ...servico, nome: "Atualizado" }));
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole("listitem");
  await user.click(screen.getByRole("button", { name: "Editar", exact: true }));
  await waitFor(() =>
    expect(screen.getByLabelText("Nome")).toHaveValue(servico.nome),
  );
  await user.clear(screen.getByLabelText("Nome"));
  await user.type(screen.getByLabelText("Nome"), "Atualizado");
  await user.click(screen.getByRole("button", { name: "Salvar alterações" }));
  await waitFor(() =>
    expect(screen.getByRole("listitem")).toHaveTextContent("Atualizado"),
  );
  expect(fetch.mock.calls[2][1].method).toBe("PUT");
});

it("altera somente a situação com PATCH", async () => {
  fetch
    .mockResolvedValueOnce(jsonResponse([servico]))
    .mockResolvedValueOnce(jsonResponse({ ...servico, ativo: false }));
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole("listitem");
  await user.click(screen.getByRole("button", { name: "Desativar" }));
  await waitFor(() =>
    expect(screen.getByRole("listitem")).toHaveTextContent("Inativo"),
  );
  expect(fetch.mock.calls[1][1]).toMatchObject({
    method: "PATCH",
    body: JSON.stringify({ ativo: false }),
  });
});

it("exclui com DELETE e atualiza a lista", async () => {
  fetch
    .mockResolvedValueOnce(jsonResponse([servico]))
    .mockResolvedValueOnce(jsonResponse(undefined, 204));
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole("listitem");
  await user.click(screen.getByRole("button", { name: "Excluir" }));
  expect(
    await screen.findByText("Nenhum serviço cadastrado."),
  ).toBeInTheDocument();
  expect(fetch.mock.calls[1][1].method).toBe("DELETE");
});

it("preserva o registro e mostra falha de exclusão", async () => {
  fetch
    .mockResolvedValueOnce(jsonResponse([servico]))
    .mockRejectedValueOnce(new TypeError("Failed to fetch"));
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole("listitem");
  await user.click(screen.getByRole("button", { name: "Excluir" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Não foi possível conectar à API.",
  );
  expect(screen.getByRole("listitem")).toHaveTextContent(servico.nome);
});
