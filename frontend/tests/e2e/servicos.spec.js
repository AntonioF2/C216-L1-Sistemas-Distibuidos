import { expect, test } from "@playwright/test";

test("carrega a interface com a listagem vazia", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Gerenciador de Serviços" }),
  ).toBeVisible();
  await expect(page.getByLabel("Nome", { exact: true })).toBeVisible();
  await expect(page.getByLabel("URL", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Serviço ativo")).toBeChecked();
  await expect(page.getByText("Nenhum serviço cadastrado.")).toBeVisible();
});

test("cadastra um serviço e o exibe na listagem", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Nome", { exact: true }).fill("Autenticação");
  await page
    .getByLabel("URL", { exact: true })
    .fill("https://example.com/auth");
  await page.getByRole("button", { name: "Adicionar serviço" }).click();
  await expect(page.getByRole("listitem")).toContainText("Autenticação");
  await expect(page.getByRole("listitem")).toContainText(
    "https://example.com/auth",
  );
  await expect(page.getByRole("listitem")).toContainText("Ativo");
  await expect(page.getByText("Nenhum serviço cadastrado.")).toBeHidden();
  await page.reload();
  await expect(page.getByText("Nenhum serviço cadastrado.")).toBeVisible();
});

test("mostra erro quando o nome está vazio", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("URL", { exact: true }).fill("https://example.com");
  await page.getByRole("button", { name: "Adicionar serviço" }).click();
  await expect(page.getByRole("alert")).toHaveText("O nome é obrigatório.");
  await expect(page.getByText("Nenhum serviço cadastrado.")).toBeVisible();
});

test("cadastra um serviço inativo em tela pequena", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByLabel("Nome", { exact: true }).fill("Notificações");
  await page
    .getByLabel("URL", { exact: true })
    .fill("https://example.com/notificacoes");
  await page.getByLabel("Serviço ativo").uncheck();
  await page.getByRole("button", { name: "Adicionar serviço" }).click();
  await expect(page.getByRole("listitem")).toContainText("Notificações");
  await expect(page.getByRole("listitem")).toContainText("Inativo");
});
