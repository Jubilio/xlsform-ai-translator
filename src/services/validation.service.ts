import { extractProtectedSegments } from "../utils/protection";

export function validateTranslation(original: string, translated: string): string[] {
  const warnings: string[] = [];
  const before = extractProtectedSegments(original);
  const after = extractProtectedSegments(translated);

  const missing = before.filter((item) => !after.includes(item));
  const added = after.filter((item) => !before.includes(item));

  if (missing.length > 0) {
    warnings.push(`Elementos protegidos ausentes: ${missing.join(", ")}`);
  }
  if (added.length > 0) {
    warnings.push(`Elementos protegidos adicionais: ${added.join(", ")}`);
  }
  if (!translated.trim()) {
    warnings.push("A tradução está vazia.");
  }
  if (translated.trim() === original.trim()) {
    warnings.push("A tradução é igual ao texto original.");
  }
  return warnings;
}
