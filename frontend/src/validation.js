export const NOME_MAX_LENGTH = 100;

export function validateServico({ nome, url, ativo }) {
  const errors = {};
  const trimmedNome = nome.trim();
  const trimmedUrl = url.trim();

  if (!trimmedNome) {
    errors.nome = "O nome é obrigatório.";
  } else if (trimmedNome.length > NOME_MAX_LENGTH) {
    errors.nome = `O nome deve ter no máximo ${NOME_MAX_LENGTH} caracteres.`;
  }

  if (!trimmedUrl) {
    errors.url = "A URL é obrigatória.";
  } else {
    try {
      const parsedUrl = new URL(trimmedUrl);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        errors.url = "Informe uma URL HTTP ou HTTPS válida.";
      }
    } catch {
      errors.url = "Informe uma URL HTTP ou HTTPS válida.";
    }
  }

  return {
    errors,
    values: { nome: trimmedNome, url: trimmedUrl, ativo },
  };
}
