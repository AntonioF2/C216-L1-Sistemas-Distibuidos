import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: fileURLToPath(
    new URL("../liga-api/src/liga_api/assets", import.meta.url),
  ),
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{js,jsx}"],
    setupFiles: ["./tests/setup.js"],
  },
});
