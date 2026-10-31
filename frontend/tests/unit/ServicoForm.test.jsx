import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { ServicoForm } from "../../src/components/ServicoForm";

it("mostra erro e não chama onAdd com nome vazio", async () => {
  const user = userEvent.setup();
  const onAdd = vi.fn();
  render(<ServicoForm onAdd={onAdd} />);
  await user.type(screen.getByLabelText("URL"), "https://example.com");
  await user.click(screen.getByRole("button", { name: "Adicionar serviço" }));
  expect(screen.getByRole("alert")).toHaveTextContent("O nome é obrigatório.");
  expect(onAdd).not.toHaveBeenCalled();
});

it("envia os valores válidos e restaura os campos", async () => {
  const user = userEvent.setup();
  const onAdd = vi.fn();
  render(<ServicoForm onAdd={onAdd} />);
  await user.type(screen.getByLabelText("Nome"), " Autenticação ");
  await user.type(screen.getByLabelText("URL"), "https://example.com");
  await user.click(screen.getByLabelText("Serviço ativo"));
  await user.click(screen.getByRole("button", { name: "Adicionar serviço" }));
  expect(onAdd).toHaveBeenCalledExactlyOnceWith({
    nome: "Autenticação",
    url: "https://example.com",
    ativo: false,
  });
  expect(screen.getByLabelText("Nome")).toHaveValue("");
  expect(screen.getByLabelText("URL")).toHaveValue("");
  expect(screen.getByLabelText("Serviço ativo")).toBeChecked();
});
