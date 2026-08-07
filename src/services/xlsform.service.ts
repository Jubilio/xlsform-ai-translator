const TRANSLATABLE_PREFIXES = [
  "label",
  "hint",
  "guidance_hint",
  "required_message",
  "constraint_message"
];

const LANGUAGE_CODES: Record<string, string> = {
  english: "en",
  portuguese: "pt",
  french: "fr",
  arabic: "ar",
  spanish: "es",
  swahili: "sw"
};

export const PROTECTED_HEADERS = [
  "type",
  "name",
  "list_name",
  "relevant",
  "constraint",
  "calculation",
  "choice_filter",
  "appearance",
  "repeat_count",
  "default",
  "parameters"
];

export function isFormula(value: unknown): boolean {
  return typeof value === "string" && value.trimStart().startsWith("=");
}

export function isTranslatableValue(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && !isFormula(value);
}

export function normaliseHeader(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function languageSuffixPattern(language: string, code?: string): RegExp {
  const escapedLanguage = language.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const resolvedCode = code?.trim() || LANGUAGE_CODES[language.trim().toLowerCase()];
  const optionalCode = resolvedCode
    ? `(?:\\s*\\(${resolvedCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\))?`
    : "";
  return new RegExp(`::\\s*${escapedLanguage}${optionalCode}\\s*$`, "i");
}

export function isTranslatableHeader(
  header: string,
  sourceHeaderLanguage: string,
  sourceLanguageCode?: string
): boolean {
  const suffix = languageSuffixPattern(sourceHeaderLanguage, sourceLanguageCode);
  const match = header.trim().match(suffix);
  if (!match || match.index === undefined) return false;
  const prefix = header.trim().slice(0, match.index).toLowerCase();
  return TRANSLATABLE_PREFIXES.includes(prefix);
}

export function targetHeaderFor(
  sourceHeader: string,
  targetHeaderLanguage: string,
  targetLanguageCode?: string
): string {
  const separatorIndex = sourceHeader.indexOf("::");
  const prefix = separatorIndex >= 0 ? sourceHeader.slice(0, separatorIndex) : sourceHeader;
  const sourceUsesCode = /\s*\([a-z]{2,3}(?:-[a-z0-9]+)?\)\s*$/i.test(sourceHeader);
  const resolvedCode = targetLanguageCode?.trim()
    || LANGUAGE_CODES[targetHeaderLanguage.trim().toLowerCase()];
  const codeSuffix = sourceUsesCode && resolvedCode ? ` (${resolvedCode})` : "";
  return `${prefix}::${targetHeaderLanguage}${codeSuffix}`;
}

export function equivalentTargetHeaders(
  sourceHeader: string,
  targetHeaderLanguage: string,
  targetLanguageCode?: string
): string[] {
  const preferred = targetHeaderFor(sourceHeader, targetHeaderLanguage, targetLanguageCode);
  const separatorIndex = sourceHeader.indexOf("::");
  const prefix = separatorIndex >= 0 ? sourceHeader.slice(0, separatorIndex) : sourceHeader;
  const resolvedCode = targetLanguageCode?.trim()
    || LANGUAGE_CODES[targetHeaderLanguage.trim().toLowerCase()];
  const alternatives = [`${prefix}::${targetHeaderLanguage}`];
  if (resolvedCode) alternatives.push(`${prefix}::${targetHeaderLanguage} (${resolvedCode})`);
  return [...new Set([preferred, ...alternatives])];
}

export function shouldNeverTranslateHeader(header: string): boolean {
  const normalised = header.trim().toLowerCase();
  return PROTECTED_HEADERS.includes(normalised)
    || normalised.startsWith("bind::")
    || normalised.startsWith("instance::");
}
