import type { ProviderInput, ProviderOutput, TranslationProvider } from "../types.js";

const DEMO_DICTIONARY: Record<string, string> = {
  "What is your age?": "Qual é a sua idade?",
  "What is your gender?": "Qual é o seu género?",
  "What is the name of the respondent?": "Qual é o nome do inquirido?",
  "Food Security": "Segurança alimentar",
  "Household": "Agregado familiar",
  "Water Point": "Fonte de água",
  "Yes": "Sim",
  "No": "Não",
  "Other, specify": "Outro, especifique"
};

export class MockProvider implements TranslationProvider {
  async translate(input: ProviderInput): Promise<ProviderOutput> {
    const glossary = new Map(
      Object.entries(input.glossary).map(([key, value]) => [key.toLowerCase(), value])
    );
    return {
      provider: "mock",
      model: "demo-dictionary",
      translations: input.items.map((item) => {
        const exact = DEMO_DICTIONARY[item.text]
          || glossary.get(item.text.toLowerCase());
        return {
          id: item.id,
          text: exact || `[DEMO ${input.targetCode.toUpperCase()}] ${item.text}`
        };
      })
    };
  }
}
