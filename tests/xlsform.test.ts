import { describe, expect, it } from "vitest";
import {
  equivalentTargetHeaders,
  isTranslatableHeader,
  targetHeaderFor
} from "../src/services/xlsform.service";
import {
  buildChoicesHeaders,
  buildSettingsHeaders,
  buildSurveyHeaders,
  isEquivalentLanguageHeader,
  missingLanguageHeaders
} from "../src/services/template.service";

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

describe("XLSForm template headers", () => {
  const english = { name: "English", code: "en" };
  const portuguese = { name: "Portuguese", code: "pt" };

  it("cria as folhas com idiomas e códigos na ordem esperada", () => {
    expect(buildSurveyHeaders([portuguese, english], "name-code")).toEqual([
      "Module", "type", "name",
      "label::Portuguese (pt)", "label::English (en)",
      "hint::Portuguese (pt)", "hint::English (en)",
      "relevant", "required", "constraint",
      "constraint_message::Portuguese (pt)", "constraint_message::English (en)",
      "repeat", "calculation", "choice_filter", "parameters", "appearance"
    ]);
    expect(buildChoicesHeaders([portuguese], "name-code")).toEqual([
      "list_name", "name", "label::Portuguese (pt)",
      "filter_admin1", "filter_admin2", "order", "visible", "filter_2"
    ]);
    expect(buildSettingsHeaders()).toEqual([
      "form_title", "form_id", "version", "default_language"
    ]);
  });

  it("não duplica idiomas quando a outra convenção já existe", () => {
    expect(isEquivalentLanguageHeader("label::Portuguese", "label", portuguese)).toBe(true);
    expect(isEquivalentLanguageHeader("label::Portuguese (pt)", "label", portuguese)).toBe(true);
    expect(missingLanguageHeaders(
      ["label::Portuguese", "hint::Portuguese (pt)"],
      ["label", "hint"],
      [portuguese, english],
      "name-code"
    )).toEqual([
      "label::English (en)",
      "hint::English (en)"
    ]);
  });
});
