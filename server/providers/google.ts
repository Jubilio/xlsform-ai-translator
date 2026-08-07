import type { ProviderInput, ProviderOutput, TranslationProvider } from "../types.js";
import { fetchJson } from "../utils/http.js";

interface GoogleTranslation {
  translatedText?: string;
  detectedSourceLanguage?: string;
  model?: string;
}

interface GoogleResponse {
  data?: { translations?: GoogleTranslation[] };
}

function decodeHtmlEntities(value: string): string {
  const named: Record<string, string> = {
    amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#39": "'"
  };
  return value.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|#39);/gi, (match, entity: string) => {
    if (entity.toLowerCase().startsWith("#x")) {
      return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    }
    if (entity.startsWith("#") && entity !== "#39") {
      return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    }
    return named[entity.toLowerCase()] || match;
  });
}

export class GoogleProvider implements TranslationProvider {
  constructor(private readonly userApiKey?: string) {}

  async translate(input: ProviderInput): Promise<ProviderOutput> {
    const apiKey = this.userApiKey || process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_TRANSLATE_API_KEY não está configurada no servidor.");
    const url = process.env.GOOGLE_TRANSLATE_API_URL
      || "https://translation.googleapis.com/language/translate/v2";
    const body: Record<string, unknown> = {
      q: input.items.map((item) => item.text),
      target: input.targetCode,
      format: "text"
    };
    if (input.sourceCode.toLowerCase() !== "auto") body.source = input.sourceCode;

    const response = await fetchJson<GoogleResponse>(url, {
      method: "POST",
      headers: {
        "X-Goog-Api-Key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const translations = response.data?.translations;
    if (!Array.isArray(translations) || translations.length !== input.items.length) {
      throw new Error("A resposta do Google Cloud Translation não corresponde ao número de textos enviados.");
    }
    return {
      provider: "google",
      model: translations[0]?.model || "nmt",
      translations: input.items.map((item, index) => ({
        id: item.id,
        text: decodeHtmlEntities(translations[index]?.translatedText || item.text)
      }))
    };
  }
}
