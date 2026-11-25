import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import App from "../src/App.jsx";

it("guarda os rascunhos ao navegar e salva juntos os placares preenchidos", async () => {
  const pessoa = userEvent.setup();
  render(<App />);

  const painel = within(screen.getByRole("region", { name: "Confrontos" }));
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

  expect(screen.getByRole("status")).toHaveTextContent(
    "2 placares salvos na rodada.",
  );
  expect(painel.getByText("2 de 10 placares registrados")).toBeInTheDocument();
  const jogos = screen.getByRole("region", { name: "Partidas registradas" });
  expect(within(jogos).getByText("3 × 0")).toBeInTheDocument();
  expect(within(jogos).getByText("1 × 1")).toBeInTheDocument();
  const linha = screen
    .getByRole("rowheader", { name: "Fluminense" })
    .closest("tr");
  expect(within(linha).getAllByRole("cell")[1]).toHaveTextContent("3");
});
