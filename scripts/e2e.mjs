import { spawnSync } from "node:child_process";

const argumentosCompose = [
  "compose",
  "-p", "lab-e2e",
  "-f", "docker-compose.yml",
  "-f", "docker-compose.e2e.yml",
];

executarTestes();

function executarTestes() {
  try {
    executarCompose(["up", "-d", "--build", "--wait", "--wait-timeout", "180"]);
    executarComando(
      process.execPath,
      ["node_modules/@playwright/test/cli.js", "test"],
      {
        cwd: "frontend",
        env: { ...process.env, E2E_BASE_URL: "http://localhost:5174" },
      },
    );
  } catch (erro) {
    process.exitCode = 1;
    console.error(erro.message);
    spawnSync("docker", [...argumentosCompose, "logs", "--tail", "60"], {
      stdio: "inherit",
    });
  } finally {
    limparAmbiente();
  }
}

function executarCompose(argumentos) {
  executarComando("docker", [...argumentosCompose, ...argumentos]);
}

function executarComando(comando, argumentos, opcoes = {}) {
  const resultado = spawnSync(comando, argumentos, { stdio: "inherit", ...opcoes });
  if (resultado.error) throw resultado.error;
  if (resultado.status !== 0) {
    throw new Error(`${comando} terminou com código ${resultado.status}`);
  }
}

function limparAmbiente() {
  try {
    // Remove somente os containers e o volume do projeto lab-e2e.
    executarCompose(["down", "-v", "--remove-orphans"]);
  } catch (erro) {
    process.exitCode = 1;
    console.error(erro.message);
  }
}
