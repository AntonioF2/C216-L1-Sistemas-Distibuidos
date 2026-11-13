export const NOME_MAX_LENGTH = 100;

export function validateServico({ nome, url, ativo }) {
  const errors = {};
  const nomeNormalizado = nome.trim();
  const urlNormalizada = url.trim();

  if (!nomeNormalizado) {
    errors.nome = "O nome é obrigatório.";
  } else if (nomeNormalizado.length > NOME_MAX_LENGTH) {
    errors.nome = `O nome deve ter no máximo ${NOME_MAX_LENGTH} caracteres.`;
  }

  if (!urlNormalizada) {
    errors.url = "A URL é obrigatória.";
  } else if (!urlHttpValida(urlNormalizada)) {
    errors.url = "Informe uma URL HTTP ou HTTPS válida.";
  }

  return {
    errors,
    values: { nome: nomeNormalizado, url: urlNormalizada, ativo },
  };
}

function urlHttpValida(url) {
  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}
