import { describe, expect, it } from "vitest";
import { NOME_MAX_LENGTH, validateServico } from "../../src/validation";

const servico = {
  nome: "Autenticação",
  url: "https://example.com",
  ativo: true,
};

describe("validateServico", () => {
  it.each(["", "   "])("rejeita nome vazio ou só com espaços: %j", (nome) => {
    expect(validateServico({ ...servico, nome }).errors.nome).toBe(
      "O nome é obrigatório.",
    );
  });

  it("rejeita nome com mais de 100 caracteres", () => {
    expect(
      validateServico({ ...servico, nome: "a".repeat(NOME_MAX_LENGTH + 1) })
        .errors.nome,
    ).toBe("O nome deve ter no máximo 100 caracteres.");
  });

  it("aceita nome com 100 caracteres", () => {
    expect(
      validateServico({ ...servico, nome: "a".repeat(NOME_MAX_LENGTH) }).errors,
    ).toEqual({});
  });

  it("remove espaços nas extremidades do nome e da URL", () => {
    expect(
      validateServico({
        nome: " Autenticação ",
        url: " https://example.com ",
        ativo: false,
      }),
    ).toEqual({
      errors: {},
      values: {
        nome: "Autenticação",
        url: "https://example.com",
        ativo: false,
      },
    });
  });

  it("rejeita URL vazia", () => {
    expect(validateServico({ ...servico, url: " " }).errors.url).toBe(
      "A URL é obrigatória.",
    );
  });

  it.each(["endereco-invalido", "ftp://example.com"])(
    "rejeita URL inválida: %s",
    (url) => {
      expect(validateServico({ ...servico, url }).errors.url).toBe(
        "Informe uma URL HTTP ou HTTPS válida.",
      );
    },
  );

  it.each(["http://example.com", "https://example.com"])(
    "aceita URL HTTP ou HTTPS: %s",
    (url) => {
      expect(validateServico({ ...servico, url }).errors).toEqual({});
    },
  );
});
