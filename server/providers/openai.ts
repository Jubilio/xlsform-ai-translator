import type { ProviderInput, ProviderOutput, TranslationProvider } from "../types.js";
import { fetchJson } from "../utils/http.js";

interface OpenAIResponse {
  output?: Array<{
    content?: Array<{ type?: string; text?: string }>;
  }>;
}

function extractOutputText(response: OpenAIResponse): string {
  return (response.output || [])
    .flatMap((item) => item.content || [])
    .filter((content) => content.type === "output_text" && typeof content.text === "string")
    .map((content) => content.text)
    .join("");
}

export class OpenAIProvider implements TranslationProvider {
  async translate(input: ProviderInput): Promise<ProviderOutput> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY não está configurada no servidor.");
    const model = process.env.OPENAI_MODEL || "gpt-5-mini";
    const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");

    const glossaryLines = Object.entries(input.glossary)
      .map(([source, target]) => `${source} => ${target}`)
      .join("\n");

    const system = [
      "You are a professional humanitarian questionnaire translator.",
      `Translate from ${input.sourceLanguage} to ${input.targetLanguage}.`,
      `Style: ${input.localeStyle}.`,
      "Return one translation for every supplied id and preserve the id exactly.",
      "Do not translate or alter tokens shaped like __XLF_PROTECTED_0000__.",
      "Do not add explanations, quotation marks, numbering, or commentary.",
      "Use concise wording suitable for Kobo/XLSForm survey questions and response labels.",
      glossaryLines ? `Apply this glossary consistently:\n${glossaryLines}` : ""
    ].filter(Boolean).join("\n");

    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        translations: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              id: { type: "string" },
              text: { type: "string" }
            },
            required: ["id", "text"]
          }
        }
      },
      required: ["translations"]
    };

    const response = await fetchJson<OpenAIResponse>(`${baseUrl}/responses`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        store: false,
        input: [
          { role: "system", content: system },
          { role: "user", content: JSON.stringify({ items: input.items }) }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "xlsform_translations",
            description: "Translations keyed by the unchanged input id.",
            strict: true,
            schema
          }
        }
      })
    });

    const outputText = extractOutputText(response);
    if (!outputText) throw new Error("A OpenAI não devolveu texto na resposta.");
    const parsed = JSON.parse(outputText) as { translations?: Array<{ id: string; text: string }> };
    if (!Array.isArray(parsed.translations)) throw new Error("Formato de resposta OpenAI inválido.");

    return {
      provider: "openai",
      model,
      translations: parsed.translations
    };
  }
}
