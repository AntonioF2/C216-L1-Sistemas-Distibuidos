import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import App from "../src/App.jsx";

afterEach(() => vi.unstubAllGlobals());

it("guarda os rascunhos ao navegar e salva juntos os placares preenchidos", async () => {
  const pessoa = userEvent.setup();
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(Response.json([]))
    .mockImplementationOnce((_url, opcoes) => {
      const placares = JSON.parse(opcoes.body);
      return Promise.resolve(
        Response.json(
          placares.map((placar, indice) => ({
            id: 100 + indice,
            rodada: 1,
            mandante: { id: placar.mandante_id },
            visitante: { id: placar.visitante_id },
            gols_mandante: placar.gols_mandante,
            gols_visitante: placar.gols_visitante,
          })),
        ),
      );
    });
  vi.stubGlobal("fetch", fetchMock);
  render(<App />);

  const painel = within(
    await screen.findByRole("region", { name: "Confrontos" }),
  );
  const rodada = within(painel.getByRole("group", { name: "Rodada" }));
  const jogo = () =>
    within(painel.getByRole("group", { name: "Fluminense x Grêmio" }));
  const formulario = within(
    painel.getByRole("form", { name: "Placares da rodada" }),
  );

  expect(rodada.getByText("Rodada 1")).toBeInTheDocument();
  expect(
    rodada.getByRole("button", { name: "Rodada anterior" }),
  ).toBeDisabled();
  expect(formulario.getAllByRole("group")).toHaveLength(10);
  expect(jogo().getByLabelText("Gols do mandante")).toHaveValue(null);

  await pessoa.type(jogo().getByLabelText("Gols do mandante"), "3");

  await pessoa.click(rodada.getByRole("button", { name: "Próxima rodada" }));
  expect(rodada.getByText("Rodada 2")).toBeInTheDocument();
  expect(formulario.getAllByRole("group")).toHaveLength(10);
  expect(
    painel.getByRole("group", { name: "Flamengo x Internacional" }),
  ).toBeInTheDocument();
  expect(
    painel.queryByRole("group", { name: "Fluminense x Grêmio" }),
  ).toBeNull();

  await pessoa.click(rodada.getByRole("button", { name: "Rodada anterior" }));
  expect(jogo().getByLabelText("Gols do mandante")).toHaveValue(3);
  await pessoa.type(jogo().getByLabelText("Gols do visitante"), "0");

  const segundoJogo = within(
    painel.getByRole("group", { name: "Botafogo x Cruzeiro" }),
  );

  await pessoa.type(segundoJogo.getByLabelText("Gols do mandante"), "1");
  await pessoa.type(segundoJogo.getByLabelText("Gols do visitante"), "1");
  expect(formulario.getAllByRole("button")).toHaveLength(1);
  await pessoa.click(
    formulario.getByRole("button", { name: "Salvar placares da rodada" }),
  );

  expect(formulario.getByRole("status")).toHaveTextContent(
    "2 placares salvos na rodada.",
  );
  expect(fetchMock).toHaveBeenLastCalledWith(
    expect.stringMatching(/\/rodadas\/1\/placares$/),
    expect.objectContaining({ method: "PUT" }),
  );
  expect(JSON.parse(fetchMock.mock.lastCall[1].body)).toHaveLength(2);
  expect(painel.getByText("2 de 10 placares registrados")).toBeInTheDocument();
  const jogos = screen.getByRole("region", { name: "Partidas registradas" });
  expect(within(jogos).getByText("3 × 0")).toBeInTheDocument();
  expect(within(jogos).getByText("1 × 1")).toBeInTheDocument();
  const linha = screen
    .getByRole("rowheader", { name: "Fluminense" })
    .closest("tr");
  expect(within(linha).getAllByRole("cell")[1]).toHaveTextContent("3");
});

it("recupera os placares e filtra o histórico conforme a rodada dos dois painéis", async () => {
  const pessoa = userEvent.setup();
  const fetchMock = vi
    .fn()
    .mockRejectedValueOnce(new TypeError("Conexão recusada"))
    .mockResolvedValueOnce(
      Response.json([
        {
          id: 77,
          rodada: 1,
          mandante: { id: 14 },
          visitante: { id: 15 },
          gols_mandante: 2,
          gols_visitante: 2,
        },
        {
          id: 78,
          rodada: 2,
          mandante: { id: 13 },
          visitante: { id: 16 },
          gols_mandante: 4,
          gols_visitante: 0,
        },
      ]),
    );
  vi.stubGlobal("fetch", fetchMock);
  render(<App />);

  expect(screen.getByRole("status")).toHaveTextContent("Carregando placares");
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Não foi possível conectar à API.",
  );
  await pessoa.click(screen.getByRole("button", { name: "Tentar novamente" }));
  const lista = within(
    await screen.findByRole("region", { name: "Partidas registradas" }),
  );
  expect(lista.getByText("2 × 2")).toBeInTheDocument();
  expect(lista.queryByText("4 × 0")).not.toBeInTheDocument();

  await pessoa.click(lista.getByRole("button", { name: "Próxima rodada" }));
  const confrontos = within(screen.getByRole("region", { name: "Confrontos" }));
  expect(confrontos.getByText("Rodada 2")).toBeInTheDocument();
  expect(lista.getByText("Rodada 2")).toBeInTheDocument();
  expect(lista.getByText("4 × 0")).toBeInTheDocument();
  expect(lista.queryByText("2 × 2")).not.toBeInTheDocument();

  await pessoa.click(
    confrontos.getByRole("button", { name: "Rodada anterior" }),
  );
  expect(lista.getByText("Rodada 1")).toBeInTheDocument();
  expect(lista.getByText("2 × 2")).toBeInTheDocument();
});

it("exibe a falha da API e preserva o rascunho", async () => {
  const pessoa = userEvent.setup();
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(Response.json([]))
      .mockResolvedValueOnce(
        Response.json({ detail: "Falha ao gravar." }, { status: 503 }),
      ),
  );
  render(<App />);

  const formulario = within(
    await screen.findByRole("form", { name: "Placares da rodada" }),
  );
  const partida = within(
    formulario.getByRole("group", { name: "Fluminense x Grêmio" }),
  );
  const mandante = partida.getByLabelText("Gols do mandante");
  await pessoa.type(mandante, "2");
  await pessoa.type(partida.getByLabelText("Gols do visitante"), "0");
  await pessoa.click(
    formulario.getByRole("button", { name: "Salvar placares da rodada" }),
  );
  expect(await formulario.findByRole("alert")).toHaveTextContent(
    "Falha ao gravar.",
  );
  expect(mandante).toHaveValue(2);
  expect(screen.getByText("0 de 10 placares registrados")).toBeInTheDocument();
});
