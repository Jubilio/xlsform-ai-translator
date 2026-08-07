import { afterEach, describe, expect, it, vi } from "vitest";
import { DeepLProvider } from "../server/providers/deepl";
import { MicrosoftProvider } from "../server/providers/microsoft";
import type { ProviderInput } from "../server/types";

const input: ProviderInput = {
  sourceLanguage: "Detect automatically",
  sourceCode: "auto",
  targetLanguage: "Portuguese",
  targetCode: "pt",
  localeStyle: "Português de Moçambique",
  glossary: {},
  items: [{ id: "A1", text: "Water" }]
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("automatic source detection", () => {
  it("omits source_lang for DeepL", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      translations: [{ text: "Água", detected_source_language: "EN" }]
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await new DeepLProvider("test-key").translate(input);
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body).not.toHaveProperty("source_lang");
    expect(body.target_lang).toBe("PT-PT");
  });

  it("omits the from query parameter for Microsoft Translator", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([
      { detectedLanguage: { language: "en" }, translations: [{ text: "Água", to: "pt" }] }
    ]), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await new MicrosoftProvider({ apiKey: "test-key", region: "test-region" }).translate(input);
    const url = String(fetchMock.mock.calls[0]?.[0]);
    expect(url).toContain("api-version=3.0");
    expect(url).toContain("to=pt");
    expect(url).not.toContain("from=");
  });
});
