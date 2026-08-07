export interface TemplateLanguage {
  name: string;
  code: string;
}

export type HeaderStyle = "name" | "name-code";

const SURVEY_TEXT_FIELDS = ["label", "hint"];
const SURVEY_CONSTRAINT_FIELD = "constraint_message";

export function languageDisplay(language: TemplateLanguage, style: HeaderStyle): string {
  return style === "name-code" ? `${language.name} (${language.code})` : language.name;
}

export function languageHeader(
  field: string,
  language: TemplateLanguage,
  style: HeaderStyle
): string {
  return `${field}::${languageDisplay(language, style)}`;
}

export function buildSurveyHeaders(
  languages: TemplateLanguage[],
  style: HeaderStyle
): string[] {
  return [
    "Module",
    "type",
    "name",
    ...SURVEY_TEXT_FIELDS.flatMap((field) =>
      languages.map((language) => languageHeader(field, language, style))
    ),
    "relevant",
    "required",
    "constraint",
    ...languages.map((language) => languageHeader(SURVEY_CONSTRAINT_FIELD, language, style)),
    "repeat",
    "calculation",
    "choice_filter",
    "parameters",
    "appearance"
  ];
}

export function buildChoicesHeaders(
  languages: TemplateLanguage[],
  style: HeaderStyle
): string[] {
  return [
    "list_name",
    "name",
    ...languages.map((language) => languageHeader("label", language, style)),
    "filter_admin1",
    "filter_admin2",
    "order",
    "visible",
    "filter_2"
  ];
}

export function buildSettingsHeaders(): string[] {
  return ["form_title", "form_id", "version", "default_language"];
}

export function isEquivalentLanguageHeader(
  header: string,
  field: string,
  language: TemplateLanguage
): boolean {
  const escapedField = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedName = language.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedCode = language.code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `^${escapedField}::\\s*${escapedName}(?:\\s*\\(${escapedCode}\\))?\\s*$`,
    "i"
  ).test(header.trim());
}

export function missingLanguageHeaders(
  existingHeaders: string[],
  fields: string[],
  languages: TemplateLanguage[],
  style: HeaderStyle
): string[] {
  return fields.flatMap((field) =>
    languages
      .filter((language) =>
        !existingHeaders.some((header) => isEquivalentLanguageHeader(header, field, language))
      )
      .map((language) => languageHeader(field, language, style))
  );
}
