import { defineConfig } from "@playwright/test";

const endereco = "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: endereco, browserName: "chromium" },
  webServer: {
    command: "npm run dev -- --port 4173",
    url: endereco,
  },
});
