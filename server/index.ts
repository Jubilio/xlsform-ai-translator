import "dotenv/config";
import path from "node:path";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { configuredProviders, resolveProvider } from "./providers/index.js";
import type { ProviderInput } from "./types.js";

const app = express();
const port = Number(process.env.PORT || 3001);
const maxBatchItems = Number(process.env.MAX_BATCH_ITEMS || 40);
const maxTextLength = Number(process.env.MAX_TEXT_LENGTH || 5000);

app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false
}));
app.use(express.json({ limit: "1mb" }));
app.use("/api", rateLimit({
  windowMs: 60_000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false
}));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "xlsform-ai-translator" });
});

app.get("/api/providers", (_request, response) => {
  response.json({
    defaultProvider: process.env.TRANSLATION_PROVIDER || "mock",
    configured: configuredProviders()
  });
});

app.post("/api/translate", async (request, response) => {
  try {
    const body = request.body as Partial<ProviderInput> & { provider?: string };
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return response.status(400).json({ error: "A lista items é obrigatória." });
    }
    if (body.items.length > maxBatchItems) {
      return response.status(400).json({ error: `Máximo de ${maxBatchItems} textos por pedido.` });
    }
    if (!body.sourceLanguage || !body.targetLanguage || !body.sourceCode || !body.targetCode) {
      return response.status(400).json({ error: "Os idiomas de origem e destino são obrigatórios." });
    }

    const ids = new Set<string>();
    for (const item of body.items) {
      if (!item || typeof item.id !== "string" || typeof item.text !== "string") {
        return response.status(400).json({ error: "Cada item deve conter id e text." });
      }
      if (ids.has(item.id)) return response.status(400).json({ error: `ID duplicado: ${item.id}` });
      ids.add(item.id);
      if (item.text.length > maxTextLength) {
        return response.status(400).json({ error: `O texto ${item.id} excede ${maxTextLength} caracteres.` });
      }
    }

    const provider = resolveProvider(body.provider || "auto");
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
    if (missingIds.length > 0) {
      throw new Error(`O provedor não devolveu: ${missingIds.join(", ")}`);
    }
    return response.json(output);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[translate] ${message}`);
    return response.status(500).json({ error: message });
  }
});

const distPath = path.resolve(process.cwd(), "dist");
app.use(express.static(distPath));

app.listen(port, () => {
  console.log(`XLSForm AI Translator backend: http://localhost:${port}`);
  console.log(`Provider default: ${process.env.TRANSLATION_PROVIDER || "mock"}`);
});
