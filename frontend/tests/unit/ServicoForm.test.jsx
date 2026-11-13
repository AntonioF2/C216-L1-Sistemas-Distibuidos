import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { ServicoForm } from "../../src/components/ServicoForm";

it("mostra erro e não chama onSave com nome vazio", async () => {
  const user = userEvent.setup();
  const onSave = vi.fn();
  render(<ServicoForm onSave={onSave} />);
  await user.type(screen.getByLabelText("URL"), "https://example.com");
  await user.click(screen.getByRole("button", { name: "Adicionar serviço" }));
  expect(screen.getByRole("alert")).toHaveTextContent("O nome é obrigatório.");
  expect(onSave).not.toHaveBeenCalled();
});

it("desabilita envio enquanto aguarda e preserva campos quando a API falha", async () => {
  const user = userEvent.setup();
  let rejectSave;
  const onSave = vi.fn(
    () =>
      new Promise((_, reject) => {
        rejectSave = reject;
      }),
  );
  render(<ServicoForm onSave={onSave} />);
  await user.type(screen.getByLabelText("Nome"), "API");
  await user.type(screen.getByLabelText("URL"), "https://example.com");
  await user.click(screen.getByRole("button", { name: "Adicionar serviço" }));
  expect(screen.getByRole("button", { name: "Salvando..." })).toBeDisabled();
  await act(async () =>
    rejectSave(new Error("Não foi possível conectar à API.")),
  );
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Não foi possível conectar à API.",
  );
  expect(screen.getByLabelText("Nome")).toHaveValue("API");
  expect(
    screen.getByRole("button", { name: "Adicionar serviço" }),
  ).toBeEnabled();
});

it("envia os valores válidos e restaura os campos", async () => {
  const user = userEvent.setup();
  const onSave = vi.fn();
  render(<ServicoForm onSave={onSave} />);
  await user.type(screen.getByLabelText("Nome"), " Autenticação ");
  await user.type(screen.getByLabelText("URL"), "https://example.com");
  await user.click(screen.getByLabelText("Serviço ativo"));
  await user.click(screen.getByRole("button", { name: "Adicionar serviço" }));
  expect(onSave).toHaveBeenCalledExactlyOnceWith({
    nome: "Autenticação",
    url: "https://example.com",
    ativo: false,
  });
  expect(screen.getByLabelText("Nome")).toHaveValue("");
  expect(screen.getByLabelText("URL")).toHaveValue("");
  expect(screen.getByLabelText("Serviço ativo")).toBeChecked();
});
