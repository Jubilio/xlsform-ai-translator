import type { ProviderName, TranslationProvider } from "../types.js";
import { DeepLProvider } from "./deepl.js";
import { MicrosoftProvider } from "./microsoft.js";
import { MockProvider } from "./mock.js";
import { OpenAIProvider } from "./openai.js";

export interface UserCredentials {
  apiKey?: string;
  region?: string;
}

export function configuredProviders(): Record<ProviderName, boolean> {
  return {
    openai: Boolean(process.env.OPENAI_API_KEY),
    deepl: Boolean(process.env.DEEPL_API_KEY),
    microsoft: Boolean(process.env.AZURE_TRANSLATOR_KEY && process.env.AZURE_TRANSLATOR_REGION),
    mock: true
  };
}

export function selectedProviderName(requested: string): ProviderName {
  return (requested === "auto"
    ? process.env.TRANSLATION_PROVIDER || "mock"
    : requested).toLowerCase() as ProviderName;
}

export function resolveProvider(requested: string, credentials: UserCredentials = {}): TranslationProvider {
  const selected = selectedProviderName(requested);
  switch (selected) {
    case "openai": return new OpenAIProvider(credentials.apiKey);
    case "deepl": return new DeepLProvider(credentials.apiKey);
    case "microsoft": return new MicrosoftProvider(credentials);
    case "mock": return new MockProvider();
    default: throw new Error(`Provedor não suportado: ${selected}`);
  }
}
