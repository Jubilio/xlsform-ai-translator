import "dotenv/config";
import path from "node:path";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { configuredProviders, resolveProvider, selectedProviderName } from "./providers/index.js";
import type { ProviderInput } from "./types.js";

const app = express();
const port = Number(process.env.PORT || 3001);
const maxBatchItems = Number(process.env.MAX_BATCH_ITEMS || 40);
const maxTextLength = Number(process.env.MAX_TEXT_LENGTH || 5000);

type UserCredentials = { apiKey?: string; region?: string };

app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false }));
app.use(express.json({ limit: "1mb" }));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: "draft-8", legacyHeaders: false }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "xlsform-ai-translator", environment: process.env.NODE_ENV || "development" });
});

app.get("/api/providers", (_request, response) => {
  response.json({ defaultProvider: process.env.TRANSLATION_PROVIDER || "mock", configured: configuredProviders() });
});

function cleanCredentials(value: unknown): UserCredentials {
  if (!value || typeof value !== "object") return {};
  const raw = value as Record<string, unknown>;
  const apiKey = typeof raw.apiKey === "string" ? raw.apiKey.trim() : "";
  const region = typeof raw.region === "string" ? raw.region.trim() : "";
  if (apiKey.length > 500 || region.length > 100) throw new Error("Credenciais inválidas.");
  return { apiKey: apiKey || undefined, region: region || undefined };
}

app.post("/api/translate", async (request, response) => {
  const body = request.body as Partial<ProviderInput> & { provider?: string; userCredentials?: unknown };
  const selectedProvider = selectedProviderName(body.provider || "auto");
  let usingUserCredentials = false;

  try {
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return response.status(400).json({ error: "A lista items é obrigatória.", code: "INVALID_REQUEST" });
    }
    if (body.items.length > maxBatchItems) {
      return response.status(400).json({ error: `Máximo de ${maxBatchItems} textos por pedido.`, code: "INVALID_REQUEST" });
    }
    if (!body.sourceLanguage || !body.targetLanguage || !body.sourceCode || !body.targetCode) {
      return response.status(400).json({ error: "Os idiomas de origem e destino são obrigatórios.", code: "INVALID_REQUEST" });
    }

    const ids = new Set<string>();
    for (const item of body.items) {
      if (!item || typeof item.id !== "string" || typeof item.text !== "string") {
        return response.status(400).json({ error: "Cada item deve conter id e text.", code: "INVALID_REQUEST" });
      }
      if (ids.has(item.id)) return response.status(400).json({ error: `ID duplicado: ${item.id}`, code: "INVALID_REQUEST" });
      ids.add(item.id);
      if (item.text.length > maxTextLength) {
        return response.status(400).json({ error: `O texto ${item.id} excede ${maxTextLength} caracteres.`, code: "INVALID_REQUEST" });
      }
    }

    const credentials = cleanCredentials(body.userCredentials);
    usingUserCredentials = Boolean(credentials.apiKey);
    if (selectedProvider === "microsoft" && usingUserCredentials && !credentials.region) {
      return response.status(400).json({ error: "A região do Microsoft Translator é obrigatória.", code: "MISSING_REGION" });
    }

    const provider = resolveProvider(body.provider || "auto", credentials);
    const output = await provider.translate({
      sourceLanguage: body.sourceLanguage,
      sourceCode: body.sourceCode,
      targetLanguage: body.targetLanguage,
      targetCode: body.targetCode,
      localeStyle: body.localeStyle || "Tradução profissional neutra",
      glossary: body.glossary || {},
      items: body.items
    });

    const returnedIds = new Set(output.translations.map((item) => item.id));
    const missingIds = body.items.filter((item) => !returnedIds.has(item.id)).map((item) => item.id);
    if (missingIds.length > 0) throw new Error(`O provedor não devolveu: ${missingIds.join(", ")}`);
    return response.json({ ...output, credentialSource: usingUserCredentials ? "user" : "server" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[translate:${selectedProvider}] ${message}`);
    return response.status(502).json({
      error: usingUserCredentials
        ? "A tradução falhou com a chave fornecida. Confirme a chave, créditos, região e permissões do provedor."
        : "O provedor configurado no servidor não conseguiu concluir a tradução.",
      details: message,
      code: usingUserCredentials ? "USER_CREDENTIALS_FAILED" : "SERVER_PROVIDER_FAILED",
      provider: selectedProvider,
      allowUserKey: !usingUserCredentials && selectedProvider !== "mock"
    });
  }
});

const distPath = path.resolve(process.cwd(), "dist");
app.use(express.static(distPath, { extensions: ["html"], maxAge: process.env.NODE_ENV === "production" ? "1h" : 0 }));
app.get("/", (_request, response) => response.sendFile(path.join(distPath, "taskpane.html")));
app.get("/taskpane.html", (_request, response) => response.sendFile(path.join(distPath, "taskpane.html")));
app.use((_request, response) => response.status(404).json({ error: "Recurso não encontrado." }));

app.listen(port, "0.0.0.0", () => {
  console.log(`XLSForm AI Translator backend: http://0.0.0.0:${port}`);
  console.log(`Provider default: ${process.env.TRANSLATION_PROVIDER || "mock"}`);
});
