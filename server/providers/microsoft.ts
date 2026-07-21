import { randomUUID } from "node:crypto";
import type { ProviderInput, ProviderOutput, TranslationProvider } from "../types.js";
import { fetchJson } from "../utils/http.js";

interface MicrosoftTranslation {
  translations?: Array<{ text: string; to: string }>;
}

export class MicrosoftProvider implements TranslationProvider {
  async translate(input: ProviderInput): Promise<ProviderOutput> {
    const key = process.env.AZURE_TRANSLATOR_KEY;
    const region = process.env.AZURE_TRANSLATOR_REGION;
    if (!key || !region) {
      throw new Error("AZURE_TRANSLATOR_KEY e AZURE_TRANSLATOR_REGION devem estar configuradas.");
    }
    const endpoint = (process.env.AZURE_TRANSLATOR_ENDPOINT || "https://api.cognitive.microsofttranslator.com").replace(/\/$/, "");
    const url = `${endpoint}/translate?api-version=3.0&from=${encodeURIComponent(input.sourceCode)}&to=${encodeURIComponent(input.targetCode)}`;

    const response = await fetchJson<MicrosoftTranslation[]>(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Ocp-Apim-Subscription-Region": region,
        "Content-Type": "application/json",
        "X-ClientTraceId": randomUUID()
      },
      body: JSON.stringify(input.items.map((item) => ({ Text: item.text })))
    });

    if (!Array.isArray(response) || response.length !== input.items.length) {
      throw new Error("A resposta do Microsoft Translator não corresponde ao número de textos enviados.");
    }

    return {
      provider: "microsoft",
      translations: input.items.map((item, index) => ({
        id: item.id,
        text: response[index]?.translations?.[0]?.text || item.text
      }))
    };
  }
}
