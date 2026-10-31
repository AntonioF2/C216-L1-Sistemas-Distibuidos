import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { ServicoList } from "../../src/components/ServicoList";

it("mostra o estado vazio", () => {
  render(<ServicoList servicos={[]} />);
  expect(screen.getByText("Nenhum serviço cadastrado.")).toBeInTheDocument();
});

it("lista os dados de serviços ativos e inativos", () => {
  render(
    <ServicoList
      servicos={[
        {
          id: "1",
          nome: "Autenticação",
          url: "https://example.com/auth",
          ativo: true,
        },
        {
          id: "2",
          nome: "Notificações",
          url: "https://example.com/notificacoes",
          ativo: false,
        },
      ]}
    />,
  );
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  expect(screen.getByText("Autenticação")).toBeInTheDocument();
  expect(screen.getByText("Notificações")).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "https://example.com/auth" }),
  ).toHaveAttribute("href", "https://example.com/auth");
  expect(screen.getByText("Ativo")).toBeInTheDocument();
  expect(screen.getByText("Inativo")).toBeInTheDocument();
});
