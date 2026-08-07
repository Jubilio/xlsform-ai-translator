import { describe, expect, it } from "vitest";
import {
  equivalentTargetHeaders,
  isTranslatableHeader,
  targetHeaderFor
} from "../src/services/xlsform.service";

 describe("XLSForm headers", () => {
  it("identifica apenas colunas de conteúdo traduzível", () => {
    expect(isTranslatableHeader("label::English", "English")).toBe(true);
    expect(isTranslatableHeader("hint::English", "English")).toBe(true);
    expect(isTranslatableHeader("label::English (en)", "English", "en")).toBe(true);
    expect(isTranslatableHeader("constraint_message::English (en)", "English", "en")).toBe(true);
    expect(isTranslatableHeader("label::Portuguese (pt)", "English", "en")).toBe(false);
    expect(isTranslatableHeader("constraint", "English")).toBe(false);
    expect(isTranslatableHeader("name", "English")).toBe(false);
  });

  it("cria o cabeçalho de destino", () => {
    expect(targetHeaderFor("label::English", "Portuguese")).toBe("label::Portuguese");
    expect(targetHeaderFor("label::English (en)", "Portuguese", "pt"))
      .toBe("label::Portuguese (pt)");
  });

  it("reconhece as duas convenções como destinos equivalentes", () => {
    expect(equivalentTargetHeaders("label::English (en)", "Portuguese", "pt"))
      .toEqual(expect.arrayContaining(["label::Portuguese", "label::Portuguese (pt)"]));
  });
});
