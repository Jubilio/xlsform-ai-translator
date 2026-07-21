export async function fetchJson<T>(url: string, init: RequestInit, timeoutMs = 60000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const text = await response.text();
    let payload: unknown = {};
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = { raw: text };
    }
    if (!response.ok) {
      const errorPayload = payload as { error?: { message?: string }; message?: string };
      throw new Error(
        errorPayload.error?.message || errorPayload.message || `Erro HTTP ${response.status}`
      );
    }
    return payload as T;
  } finally {
    clearTimeout(timer);
  }
}
