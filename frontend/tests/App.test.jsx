import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import App from "../src/App.jsx";

it("mostra os jogos por rodada, guarda um rascunho e recalcula a classificação ao registrar", async () => {
  const pessoa = userEvent.setup();
  render(<App />);

  const painel = within(screen.getByRole("region", { name: "Confrontos" }));
  const rodada = within(painel.getByRole("group", { name: "Rodada" }));
  const jogo = () =>
    within(painel.getByRole("form", { name: "Fluminense x Grêmio" }));

  expect(rodada.getByText("Rodada 1")).toBeInTheDocument();
  expect(
    rodada.getByRole("button", { name: "Rodada anterior" }),
  ).toBeDisabled();
  expect(painel.getAllByRole("form")).toHaveLength(10);
  expect(jogo().getByLabelText("Gols do mandante")).toHaveValue(null);
  await pessoa.type(jogo().getByLabelText("Gols do mandante"), "3");

  await pessoa.click(rodada.getByRole("button", { name: "Próxima rodada" }));
  expect(rodada.getByText("Rodada 2")).toBeInTheDocument();
  expect(painel.getAllByRole("form")).toHaveLength(10);
  expect(
    painel.getByRole("form", { name: "Flamengo x Internacional" }),
  ).toBeInTheDocument();
  expect(
    painel.queryByRole("form", { name: "Fluminense x Grêmio" }),
  ).toBeNull();

  await pessoa.click(rodada.getByRole("button", { name: "Rodada anterior" }));
  expect(jogo().getByLabelText("Gols do mandante")).toHaveValue(3);
  await pessoa.type(jogo().getByLabelText("Gols do visitante"), "0");
  await pessoa.click(jogo().getByRole("button", { name: "Salvar" }));

  expect(screen.getByRole("status")).toHaveTextContent("Placar registrado.");
  expect(painel.getByText("1 de 10 placares registrados")).toBeInTheDocument();
  const jogos = screen.getByRole("region", { name: "Partidas registradas" });
  expect(within(jogos).getByText("3 × 0")).toBeInTheDocument();
  const linha = screen
    .getByRole("rowheader", { name: "Fluminense" })
    .closest("tr");
  expect(within(linha).getAllByRole("cell")[1]).toHaveTextContent("3");
});
