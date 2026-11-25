import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import App from "../src/App.jsx";

it("registra um placar pelo formulário e recalcula a tabela na mesma tela", async () => {
  const pessoa = userEvent.setup();
  render(<App />);

  await pessoa.selectOptions(screen.getByLabelText("Mandante"), "2");
  await pessoa.selectOptions(screen.getByLabelText("Visitante"), "4");
  await pessoa.type(screen.getByLabelText("Gols do mandante"), "3");
  await pessoa.type(screen.getByLabelText("Gols do visitante"), "0");
  await pessoa.click(
    screen.getByRole("button", { name: "Registrar resultado" }),
  );

  expect(screen.getByRole("status")).toHaveTextContent("Placar registrado.");
  const jogos = screen.getByRole("region", { name: "Partidas registradas" });
  expect(within(jogos).getByText("3 × 0")).toBeInTheDocument();
  const linha = screen
    .getByRole("rowheader", { name: "União da Serra" })
    .closest("tr");
  expect(within(linha).getAllByRole("cell")[1]).toHaveTextContent("3");
});
