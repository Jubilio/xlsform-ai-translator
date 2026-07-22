import type { ProviderName, TranslationRequest, TranslationResponse, UserCredentials } from "../types";

interface ErrorPayload {
  error?: string;
  details?: string;
  code?: string;
  provider?: ProviderName;
  allowUserKey?: boolean;
}

function readUserCredentials(provider: ProviderName | undefined): UserCredentials | undefined {
  if (!provider || provider === "auto" || provider === "mock") return undefined;
  try {
    const apiKey = window.sessionStorage.getItem(`xlsform-api-key-${provider}`)?.trim() || "";
    const region = provider === "microsoft"
      ? window.sessionStorage.getItem("xlsform-api-region-microsoft")?.trim() || ""
      : "";
    if (!apiKey) return undefined;
    return { apiKey, region: region || undefined };
  } catch {
    return undefined;
  }
}

async function postTranslation(request: TranslationRequest): Promise<Response> {
  return fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request)
  });
}

async function parseResponse(response: Response): Promise<TranslationResponse> {
  const payload = await response.json().catch(() => ({})) as ErrorPayload & Partial<TranslationResponse>;
  if (!response.ok) {
    const error = new Error(payload.error || `HTTP ${response.status}`) as Error & { payload?: ErrorPayload };
    error.payload = payload;
    throw error;
  }
  if (!Array.isArray(payload.translations)) {
    throw new Error("O servidor devolveu uma resposta de tradução inválida.");
  }
  return payload as TranslationResponse;
}

export async function translateBatch(request: TranslationRequest): Promise<TranslationResponse> {
  try {
    return await parseResponse(await postTranslation(request));
  } catch (error) {
    const payload = (error as Error & { payload?: ErrorPayload }).payload;
    if (!payload?.allowUserKey) throw error;

    const credentials = readUserCredentials(payload.provider);
    if (!credentials) {
      window.dispatchEvent(new CustomEvent("xlsform-api-key-required", {
        detail: { provider: payload.provider, message: payload.error }
      }));
      throw new Error(payload.error || "A chave do servidor falhou. Configure uma chave pessoal nas definições e tente novamente.");
    }

    return await parseResponse(await postTranslation({
      ...request,
      provider: payload.provider || request.provider,
      userCredentials: credentials
    }));
  }
}

export async function getProviderStatus(): Promise<Record<string, boolean>> {
  const response = await fetch("/api/providers");
  if (!response.ok) return {};
  const payload = await response.json() as { configured?: Record<string, boolean> };
  return payload.configured || {};
}
