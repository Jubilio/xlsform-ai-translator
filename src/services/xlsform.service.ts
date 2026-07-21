const TRANSLATABLE_PREFIXES = [
  "label",
  "hint",
  "guidance_hint",
  "required_message",
  "constraint_message"
];

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

export function isTranslatableHeader(header: string, sourceHeaderLanguage: string): boolean {
  const normalised = header.trim().toLowerCase();
  const suffix = `::${sourceHeaderLanguage.trim().toLowerCase()}`;
  if (!normalised.endsWith(suffix)) return false;
  const prefix = normalised.slice(0, -suffix.length);
  return TRANSLATABLE_PREFIXES.includes(prefix);
}

export function targetHeaderFor(sourceHeader: string, targetHeaderLanguage: string): string {
  const separatorIndex = sourceHeader.indexOf("::");
  const prefix = separatorIndex >= 0 ? sourceHeader.slice(0, separatorIndex) : sourceHeader;
  return `${prefix}::${targetHeaderLanguage}`;
}

export function shouldNeverTranslateHeader(header: string): boolean {
  const normalised = header.trim().toLowerCase();
  return PROTECTED_HEADERS.includes(normalised)
    || normalised.startsWith("bind::")
    || normalised.startsWith("instance::");
}
