import type { ProviderInput, ProviderOutput, TranslationProvider } from "../types.js";
import { fetchJson } from "../utils/http.js";

interface DeepLResponse {
  translations?: Array<{ text: string }>;
}

const DEEPL_SOURCE_CODES: Record<string, string> = {
  en: "EN",
  pt: "PT",
  fr: "FR",
  ar: "AR",
  es: "ES"
};

const DEEPL_TARGET_CODES: Record<string, string> = {
  en: "EN-GB",
  pt: "PT-PT",
  fr: "FR",
  ar: "AR",
  es: "ES"
};

export class DeepLProvider implements TranslationProvider {
  async translate(input: ProviderInput): Promise<ProviderOutput> {
    const apiKey = process.env.DEEPL_API_KEY;
    if (!apiKey) throw new Error("DEEPL_API_KEY não está configurada no servidor.");
    const url = process.env.DEEPL_API_URL || "https://api-free.deepl.com/v2/translate";
    const sourceLang = DEEPL_SOURCE_CODES[input.sourceCode.toLowerCase()] || input.sourceCode.toUpperCase();
    const targetLang = DEEPL_TARGET_CODES[input.targetCode.toLowerCase()] || input.targetCode.toUpperCase();

    const response = await fetchJson<DeepLResponse>(url, {
      method: "POST",
      headers: {
        "Authorization": `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: input.items.map((item) => item.text),
        source_lang: sourceLang,
        target_lang: targetLang,
        preserve_formatting: true
      })
    });

    if (!Array.isArray(response.translations) || response.translations.length !== input.items.length) {
      throw new Error("A resposta do DeepL não corresponde ao número de textos enviados.");
    }

    return {
      provider: "deepl",
      translations: input.items.map((item, index) => ({
        id: item.id,
        text: response.translations?.[index]?.text || item.text
      }))
    };
  }
}
