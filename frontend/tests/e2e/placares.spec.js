import { expect, test } from "@playwright/test";

test("edita um placar e o exclui após confirmação", async ({ page }) => {
  await page.goto("/");
  const lista = page.getByRole("region", { name: "Partidas registradas" });
  const jogo = lista.getByRole("listitem").filter({ hasText: "2 × 1" });
  await jogo.getByRole("button", { name: "Editar" }).click();
  await page.getByLabel("Gols do visitante").fill("3");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page.getByRole("status")).toHaveText("Placar atualizado.");

  const alterado = lista.getByRole("listitem").filter({ hasText: "2 × 3" });
  await expect(alterado).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await alterado.getByRole("button", { name: "Excluir" }).click();
  await expect(alterado).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText("Placar excluído.");
});

test("mostra erro de validação na tela estreita", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Registrar resultado" }).click();

  await expect(page.getByRole("alert")).toHaveText(
    "Selecione o mandante e o visitante.",
  );
  expect(
    await page.locator("body").evaluate((corpo) => corpo.scrollWidth),
  ).toBe(390);
});
