import { expect, test } from "@playwright/test";

const uniqueName = () =>
  `E2E Serviço ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

async function cadastrar(page, nome) {
  await page.goto("/");
  await page.getByLabel("Nome", { exact: true }).fill(nome);
  await page
    .getByLabel("URL", { exact: true })
    .fill("https://example.com/auth");
  await page.getByRole("button", { name: "Adicionar serviço" }).click();
  return page.getByRole("listitem").filter({ hasText: nome });
}

test("carrega a interface e a listagem da API", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Gerenciador de Serviços" }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toBeHidden();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByLabel("Nome", { exact: true })).toBeVisible();
});

test("cadastra, persiste, consulta, edita, altera situação e exclui", async ({
  page,
}) => {
  const nome = uniqueName();
  let item = await cadastrar(page, nome);
  await expect(item).toBeVisible();
  await page.reload();
  item = page.getByRole("listitem").filter({ hasText: nome });
  await expect(item).toBeVisible();
  await item.getByRole("button", { name: "Detalhes" }).click();
  await expect(
    page.getByRole("region", { name: "Detalhes do serviço" }),
  ).toContainText(nome);
  await page.getByRole("button", { name: "Fechar detalhes" }).click();
  await item.getByRole("button", { name: "Editar", exact: true }).click();
  await expect(page.getByLabel("Nome", { exact: true })).toHaveValue(nome);
  const editado = `${nome} editado`;
  await page.getByLabel("Nome", { exact: true }).fill(editado);
  await page
    .getByLabel("URL", { exact: true })
    .fill("https://example.com/editado");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  item = page.getByRole("listitem").filter({ hasText: editado });
  await expect(item).toContainText("https://example.com/editado");
  await item.getByRole("button", { name: "Desativar" }).click();
  await expect(
    item.getByRole("button", { name: "Ativar", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(item).toContainText("Inativo");
  await item.getByRole("button", { name: "Ativar", exact: true }).click();
  await expect(item.getByRole("button", { name: "Desativar" })).toBeVisible();
  await item.getByRole("button", { name: "Excluir" }).click();
  await expect(item).toHaveCount(0);
  await page.reload();
  await expect(item).toHaveCount(0);
});

test("exibe erro real de nome duplicado sem apagar o formulário", async ({
  page,
}) => {
  const nome = uniqueName();
  const item = await cadastrar(page, nome);
  await expect(item).toBeVisible();
  await page.getByLabel("Nome", { exact: true }).fill(nome);
  await page
    .getByLabel("URL", { exact: true })
    .fill("https://example.com/outro");
  await page.getByRole("button", { name: "Adicionar serviço" }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Já existe um serviço com esse nome",
  );
  await expect(page.getByLabel("Nome", { exact: true })).toHaveValue(nome);
  await item.getByRole("button", { name: "Excluir" }).click();
  await expect(item).toHaveCount(0);
});

test("mostra validação de nome vazio", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("URL", { exact: true }).fill("https://example.com");
  await page.getByRole("button", { name: "Adicionar serviço" }).click();
  await expect(page.getByRole("alert")).toHaveText("O nome é obrigatório.");
});

test("cadastra serviço inativo em tela pequena", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const nome = uniqueName();
  await page.goto("/");
  await page.getByLabel("Nome", { exact: true }).fill(nome);
  await page
    .getByLabel("URL", { exact: true })
    .fill("https://example.com/mobile");
  await page.getByLabel("Serviço ativo").uncheck();
  await page.getByRole("button", { name: "Adicionar serviço" }).click();
  const item = page.getByRole("listitem").filter({ hasText: nome });
  await expect(item).toContainText("Inativo");
  await item.getByRole("button", { name: "Excluir" }).click();
  await expect(item).toHaveCount(0);
});
