import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import App from "../../src/App";

it("cadastra um serviço e o exibe na lista", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByLabelText("Nome"), "Autenticação");
  await user.type(screen.getByLabelText("URL"), "https://example.com/auth");
  await user.click(screen.getByRole("button", { name: "Adicionar serviço" }));
  expect(screen.getByRole("listitem")).toHaveTextContent("Autenticação");
  expect(screen.getByRole("listitem")).toHaveTextContent(
    "https://example.com/auth",
  );
  expect(screen.getByRole("listitem")).toHaveTextContent("Ativo");
  expect(
    screen.queryByText("Nenhum serviço cadastrado."),
  ).not.toBeInTheDocument();
});

it("permite cadastrar um serviço inativo", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByLabelText("Nome"), "Notificações");
  await user.type(
    screen.getByLabelText("URL"),
    "https://example.com/notificacoes",
  );
  await user.click(screen.getByLabelText("Serviço ativo"));
  await user.click(screen.getByRole("button", { name: "Adicionar serviço" }));
  expect(screen.getByRole("listitem")).toHaveTextContent("Notificações");
  expect(screen.getByRole("listitem")).toHaveTextContent("Inativo");
});

it("não adiciona um serviço quando a URL é inválida", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.type(screen.getByLabelText("Nome"), "Autenticação");
  await user.type(screen.getByLabelText("URL"), "endereco-invalido");
  await user.click(screen.getByRole("button", { name: "Adicionar serviço" }));
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Informe uma URL HTTP ou HTTPS válida.",
  );
  expect(screen.getByText("Nenhum serviço cadastrado.")).toBeInTheDocument();
});
