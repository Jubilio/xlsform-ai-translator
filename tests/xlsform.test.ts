import { describe, expect, it } from "vitest";
import { isTranslatableHeader, targetHeaderFor } from "../src/services/xlsform.service";

 describe("XLSForm headers", () => {
  it("identifica apenas colunas de conteúdo traduzível", () => {
    expect(isTranslatableHeader("label::English", "English")).toBe(true);
    expect(isTranslatableHeader("hint::English", "English")).toBe(true);
    expect(isTranslatableHeader("constraint", "English")).toBe(false);
    expect(isTranslatableHeader("name", "English")).toBe(false);
  });

  it("cria o cabeçalho de destino", () => {
    expect(targetHeaderFor("label::English", "Portuguese")).toBe("label::Portuguese");
  });
});
