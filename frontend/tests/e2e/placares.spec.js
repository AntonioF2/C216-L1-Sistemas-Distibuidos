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

test("expande a classificação completa e restaura a altura compacta", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const painel = page.getByRole("region", { name: "Classificação" });
  const tabela = painel.locator("#tabela-classificacao");
  const expandir = painel.getByRole("button", {
    name: "Expandir classificação",
  });
  const recolher = painel.getByRole("button", {
    name: "Recolher classificação",
  });
  const rolagemVertical = () =>
    tabela.evaluate(
      (elemento) => elemento.scrollHeight - elemento.clientHeight,
    );

  await expect(expandir).toHaveAttribute("aria-expanded", "false");
  await expect.poll(rolagemVertical).toBeGreaterThan(0);
  await expandir.click();
  await expect(recolher).toHaveAttribute("aria-expanded", "true");
  await expect.poll(rolagemVertical).toBe(0);
  await expect(tabela.getByRole("rowheader")).toHaveCount(20);
  expect(
    await tabela.evaluate(
      (elemento) => elemento.scrollWidth > elemento.clientWidth,
    ),
  ).toBe(true);

  await recolher.click();
  await expect(expandir).toHaveAttribute("aria-expanded", "false");
  await expect.poll(rolagemVertical).toBeGreaterThan(0);
});

test("persiste dez placares em PostgreSQL, edita e exclui pela interface", async ({
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

  const confrontos = formulario.getByRole("group");
  await expect(confrontos).toHaveCount(10);
  for (const confronto of await confrontos.all()) {
    await confronto.getByLabel("Gols do mandante").fill("0");
    await confronto.getByLabel("Gols do visitante").fill("0");
  }
  await mandante.fill("2");
  await visitante.fill("1");
  await salvar.click();
  await expect(formulario.getByRole("status")).toHaveText(
    "10 placares salvos na rodada.",
  );
  await expect(lista.getByRole("listitem")).toHaveCount(10);
  await expect(painel.getByText("10 de 10 placares registrados")).toBeVisible();
  await page.reload();
  await expect(mandante).toHaveValue("2");
  await expect(visitante).toHaveValue("1");
  await expect(lista.getByRole("listitem")).toHaveCount(10);
  const linhaFluminense = page.getByRole("row").filter({
    has: page.getByRole("rowheader", { name: "Fluminense" }),
  });
  await expect(linhaFluminense.getByRole("cell").nth(1)).toHaveText("3");
  await lista.getByRole("button", { name: "Próxima rodada" }).click();
  await expect(painel.getByText("Rodada 2")).toBeVisible();
  await expect(jogo).toHaveCount(0);
  await expect(
    lista.getByText("Nenhum placar registrado nesta rodada."),
  ).toBeVisible();
  await painel.getByRole("button", { name: "Rodada anterior" }).click();
  await expect(lista.getByText("Rodada 1")).toBeVisible();
  await expect(lista.getByRole("listitem")).toHaveCount(10);

  const resultado = (placar) =>
    lista.getByRole("listitem").filter({ hasText: placar });
  await resultado("2 × 1").getByRole("button", { name: "Editar" }).click();
  await expect(mandante).toBeFocused();
  await expect(mandante).toHaveValue("2");
  await visitante.fill("3");
  await salvar.click();

  await expect(formulario.getByRole("status")).toHaveText(
    "1 placar salvo na rodada.",
  );
  await expect(lista.getByRole("listitem")).toHaveCount(10);
  await expect(resultado("2 × 1")).toHaveCount(0);
  await page.reload();
  await expect(lista.getByText("2 × 3")).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await resultado("2 × 3").getByRole("button", { name: "Excluir" }).click();
  await expect(lista.getByRole("listitem")).toHaveCount(9);
  await page.reload();
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
  await painel.getByRole("button", { name: "Próxima rodada" }).click();
  const formulario = painel.getByRole("form", { name: "Placares da rodada" });
  const salvar = formulario.getByRole("button", {
    name: "Salvar placares da rodada",
  });
  await expect(formulario.getByRole("group")).toHaveCount(10);
  await salvar.click();
  await expect(formulario.getByRole("alert")).toHaveText(
    "Preencha ou altere um placar para salvar.",
  );

  const jogo = formulario.getByRole("group", {
    name: "Flamengo x Internacional",
  });
  await jogo.getByLabel("Gols do mandante").fill("1");
  const segundoJogo = formulario.getByRole("group", {
    name: "Vasco da Gama x Chapecoense",
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
  await expect(painel.getByText("0 de 10 placares registrados")).toBeVisible();

  await jogo.getByLabel("Gols do visitante").fill("0");
  await salvar.click();
  await expect(formulario.getByRole("alert")).toHaveCount(0);
  await expect(painel.getByText("2 de 10 placares registrados")).toBeVisible();
  expect(
    await page.locator("body").evaluate((corpo) => corpo.scrollWidth),
  ).toBe(390);
});
