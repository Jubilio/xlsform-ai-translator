import type { TranslationRequest, TranslationResponse } from "../types";

export async function translateBatch(request: TranslationRequest): Promise<TranslationResponse> {
  const response = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request)
  });

  const payload = await response.json().catch(() => ({})) as { error?: string } & Partial<TranslationResponse>;
  if (!response.ok) {
    throw new Error(payload.error || `Erro HTTP ${response.status}`);
  }
  if (!Array.isArray(payload.translations)) {
    throw new Error("O servidor devolveu uma resposta de tradução inválida.");
  }
  return payload as TranslationResponse;
}

export async function getProviderStatus(): Promise<Record<string, boolean>> {
  const response = await fetch("/api/providers");
  if (!response.ok) return {};
  const payload = await response.json() as { configured?: Record<string, boolean> };
  return payload.configured || {};
}
