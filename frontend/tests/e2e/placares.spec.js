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

test("salva os dez placares de uma rodada, edita e exclui um resultado", async ({
  page,
}) => {
  await page.goto("/");
  const painel = page.getByRole("region", { name: "Confrontos" });
  const formulario = painel.getByRole("form", { name: "Placares da rodada" });
  const jogo = formulario.getByRole("group", { name: "Fluminense x Grêmio" });
  const mandante = jogo.getByLabel("Gols do mandante");
  const visitante = jogo.getByLabel("Gols do visitante");
  const lista = page.getByRole("region", { name: "Partidas registradas" });
  const salvar = formulario.getByRole("button", {
    name: "Salvar placares da rodada",
  });

  for (const confronto of await formulario.getByRole("group").all()) {
    await confronto.getByLabel("Gols do mandante").fill("0");
    await confronto.getByLabel("Gols do visitante").fill("0");
  }
  await mandante.fill("2");
  await visitante.fill("1");
  await salvar.click();
  await expect(page.getByRole("status")).toHaveText(
    "10 placares salvos na rodada.",
  );
  await expect(lista.getByRole("listitem")).toHaveCount(10);
  await expect(painel.getByText("10 de 10 placares registrados")).toBeVisible();
  await painel.getByRole("button", { name: "Próxima rodada" }).click();
  await expect(jogo).toHaveCount(0);

  const resultado = (placar) =>
    lista.getByRole("listitem").filter({ hasText: placar });
  await resultado("2 × 1").getByRole("button", { name: "Editar" }).click();
  await expect(mandante).toBeFocused();
  await expect(mandante).toHaveValue("2");
  await visitante.fill("3");
  await salvar.click();

  await expect(page.getByRole("status")).toHaveText(
    "1 placar salvo na rodada.",
  );
  await expect(lista.getByRole("listitem")).toHaveCount(10);
  await expect(resultado("2 × 1")).toHaveCount(0);
  await expect(lista.getByText("2 × 3")).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await resultado("2 × 3").getByRole("button", { name: "Excluir" }).click();
  await expect(lista.getByRole("listitem")).toHaveCount(9);
  await expect(mandante).toHaveValue("");
  await expect(visitante).toHaveValue("");
});

test("orienta sobre uma rodada vazia e bloqueia o lote com placar incompleto na tela estreita", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const painel = page.getByRole("region", { name: "Confrontos" });
  const formulario = painel.getByRole("form", { name: "Placares da rodada" });
  const salvar = formulario.getByRole("button", {
    name: "Salvar placares da rodada",
  });
  await expect(formulario.getByRole("group")).toHaveCount(10);
  await salvar.click();
  await expect(formulario.getByRole("alert")).toHaveText(
    "Preencha ou altere um placar para salvar.",
  );

  const jogo = formulario.getByRole("group", { name: "Fluminense x Grêmio" });
  await jogo.getByLabel("Gols do mandante").fill("1");
  const segundoJogo = formulario.getByRole("group", {
    name: "Botafogo x Cruzeiro",
  });
  await segundoJogo.getByLabel("Gols do mandante").fill("0");
  await segundoJogo.getByLabel("Gols do visitante").fill("2");
  await salvar.click();

  await expect(formulario.getByRole("alert")).toHaveText(
    "Confira os placares destacados antes de salvar.",
  );
  await expect(jogo.getByLabel("Gols do visitante")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  const lista = page.getByRole("region", { name: "Partidas registradas" });
  await expect(lista.getByText("Nenhum placar registrado.")).toBeVisible();

  await jogo.getByLabel("Gols do visitante").fill("0");
  await salvar.click();
  await expect(formulario.getByRole("alert")).toHaveCount(0);
  await expect(lista.getByRole("listitem")).toHaveCount(2);
  expect(
    await page.locator("body").evaluate((corpo) => corpo.scrollWidth),
  ).toBe(390);
});
