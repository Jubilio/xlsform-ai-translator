export type ProviderName = "openai" | "deepl" | "microsoft" | "mock";

export interface TranslationItem {
  id: string;
  text: string;
}

export interface ProviderInput {
  sourceLanguage: string;
  sourceCode: string;
  targetLanguage: string;
  targetCode: string;
  localeStyle: string;
  glossary: Record<string, string>;
  items: TranslationItem[];
}

export interface ProviderOutput {
  provider: ProviderName;
  model?: string;
  translations: TranslationItem[];
}

export interface TranslationProvider {
  translate(input: ProviderInput): Promise<ProviderOutput>;
}
