import { expect, test } from "@playwright/test";

test("carrega os PNGs dos 20 times na classificação", async ({ page }) => {
  await page.goto("/");
  const escudos = page
    .getByRole("table", { name: "Classificação" })
    .locator("img");
  await expect(escudos).toHaveCount(20);
  await expect
    .poll(() =>
      escudos.evaluateAll((imagens) =>
        imagens.every(
          (imagem) => imagem.complete && imagem.naturalWidth === 128,
        ),
      ),
    )
    .toBe(true);
});

test("registra, edita e exclui um placar do calendário", async ({ page }) => {
  await page.goto("/");
  const painel = page.getByRole("region", { name: "Confrontos" });
  const jogo = painel.getByRole("form", { name: "Fluminense x Grêmio" });
  const mandante = jogo.getByLabel("Gols do mandante");
  const visitante = jogo.getByLabel("Gols do visitante");
  const lista = page.getByRole("region", { name: "Partidas registradas" });

  await mandante.fill("2");
  await visitante.fill("1");
  await jogo.getByRole("button", { name: "Salvar" }).click();
  await painel.getByRole("button", { name: "Próxima rodada" }).click();
  await expect(jogo).toHaveCount(0);

  await lista.getByRole("button", { name: "Editar" }).click();
  await expect(mandante).toBeFocused();
  await expect(mandante).toHaveValue("2");
  await visitante.fill("3");
  await jogo.getByRole("button", { name: "Atualizar" }).click();

  await expect(page.getByRole("status")).toHaveText("Placar atualizado.");
  await expect(lista.getByRole("listitem")).toHaveCount(1);
  await expect(lista.getByText("2 × 3")).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await lista.getByRole("button", { name: "Excluir" }).click();
  await expect(lista.getByText("Nenhum placar registrado.")).toBeVisible();
  await expect(mandante).toHaveValue("");
  await expect(visitante).toHaveValue("");
});

test("mostra erro de validação na tela estreita", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const painel = page.getByRole("region", { name: "Confrontos" });
  await expect(painel.getByRole("form")).toHaveCount(10);
  const jogo = painel.getByRole("form", { name: "Fluminense x Grêmio" });
  await jogo.getByRole("button", { name: "Salvar" }).click();

  await expect(jogo.getByRole("alert")).toHaveText(
    "Informe gols inteiros e não negativos para os dois times.",
  );
  expect(
    await page.locator("body").evaluate((corpo) => corpo.scrollWidth),
  ).toBe(390);
});
