import fs from "node:fs";
import path from "node:path";

const rawBaseUrl = process.argv[2] || process.env.APP_BASE_URL;

if (!rawBaseUrl) {
  console.error("Uso: npm run manifest:production -- https://seu-app.onrender.com");
  console.error("Também pode definir APP_BASE_URL no ambiente.");
  process.exit(1);
}

let baseUrl;
try {
  const parsed = new URL(rawBaseUrl);
  if (parsed.protocol !== "https:") {
    throw new Error("O endereço de produção deve usar HTTPS.");
  }
  parsed.pathname = parsed.pathname.replace(/\/$/, "");
  parsed.search = "";
  parsed.hash = "";
  baseUrl = parsed.toString().replace(/\/$/, "");
} catch (error) {
  console.error(`APP_BASE_URL inválido: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

const root = process.cwd();
const sourcePath = path.join(root, "manifest.xml");
const outputPath = path.join(root, "manifest.production.xml");

if (!fs.existsSync(sourcePath)) {
  console.error(`Manifesto não encontrado: ${sourcePath}`);
  process.exit(1);
}

const source = fs.readFileSync(sourcePath, "utf8");
const production = source.replaceAll("https://localhost:3000", baseUrl);

if (production === source) {
  console.error("Nenhuma URL local foi encontrada no manifest.xml.");
  process.exit(1);
}

fs.writeFileSync(outputPath, production, "utf8");
console.log(`Manifesto de produção criado: ${outputPath}`);
console.log(`Base URL: ${baseUrl}`);
