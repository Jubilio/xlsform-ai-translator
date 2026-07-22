import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "manifest.production.xml");
const requiredFiles = [
  "manifest.production.xml",
  "docs/MARKETPLACE_SUBMISSION.md",
  "USER_GUIDE_WINDOWS.md",
  "SECURITY.md"
];

const errors = [];

for (const relativePath of requiredFiles) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    errors.push(`Missing required file: ${relativePath}`);
  }
}

if (fs.existsSync(manifestPath)) {
  const manifest = fs.readFileSync(manifestPath, "utf8");
  const requiredText = [
    "<ProviderName>NexoVibe</ProviderName>",
    "<DefaultLocale>en-US</DefaultLocale>",
    "https://xlsform-ai-translator.onrender.com/taskpane.html",
    "https://nexovibe.netlify.app/xlsform-translator/support",
    "<Permissions>ReadWriteDocument</Permissions>",
    "Locale=\"pt-PT\""
  ];

  for (const text of requiredText) {
    if (!manifest.includes(text)) errors.push(`Production manifest is missing: ${text}`);
  }

  if (/localhost|127\.0\.0\.1/i.test(manifest)) {
    errors.push("Production manifest contains a local address.");
  }

  const secretPatterns = [
    /sk-[A-Za-z0-9_-]{20,}/,
    /OPENAI_API_KEY\s*=\s*[^\s]+/,
    /DEEPL_API_KEY\s*=\s*[^\s]+/,
    /AZURE_TRANSLATOR_KEY\s*=\s*[^\s]+/
  ];

  for (const pattern of secretPatterns) {
    if (pattern.test(manifest)) errors.push(`Potential secret detected in production manifest: ${pattern}`);
  }
}

if (errors.length > 0) {
  console.error("Marketplace readiness check failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Marketplace readiness static checks passed.");
console.log("Run typecheck, tests, production build, and Microsoft manifest validation before submission.");
