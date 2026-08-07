import { afterEach, describe, expect, it, vi } from "vitest";
import { GoogleProvider } from "../server/providers/google";
import type { ProviderInput } from "../server/types";

const baseInput: ProviderInput = {
  sourceLanguage: "Detect automatically",
  sourceCode: "auto",
  targetLanguage: "Portuguese",
  targetCode: "pt",
  localeStyle: "Português de Moçambique",
  glossary: {},
  items: [
    { id: "survey!A2", text: "Water & sanitation" },
    { id: "survey!A3", text: "It's safe" }
  ]
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GoogleProvider", () => {
  it("uses the API key header and lets Google detect the source language", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      data: {
        translations: [
          { translatedText: "Água &amp; saneamento", detectedSourceLanguage: "en" },
          { translatedText: "É seguro", detectedSourceLanguage: "en" }
        ]
      }
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await new GoogleProvider("test-key").translate(baseInput);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;

    expect(url).toBe("https://translation.googleapis.com/language/translate/v2");
    expect((init.headers as Record<string, string>)["X-Goog-Api-Key"]).toBe("test-key");
    expect(body).not.toHaveProperty("source");
    expect(body.target).toBe("pt");
    expect(body.q).toEqual(["Water & sanitation", "It's safe"]);
    expect(result.translations).toEqual([
      { id: "survey!A2", text: "Água & saneamento" },
      { id: "survey!A3", text: "É seguro" }
    ]);
  });

  it("sends an explicit source language when one is selected", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      data: { translations: [{ translatedText: "Água" }, { translatedText: "Seguro" }] }
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await new GoogleProvider("test-key").translate({
      ...baseInput,
      sourceLanguage: "English",
      sourceCode: "en"
    });
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(String(init.body)).source).toBe("en");
  });
});
