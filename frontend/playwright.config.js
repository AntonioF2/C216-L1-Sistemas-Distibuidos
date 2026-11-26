import { defineConfig } from "@playwright/test";

const endereco = process.env.MESA_E2E_URL ?? "http://127.0.0.1:5174";

export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: endereco, browserName: "chromium" },
});
