export type ProviderName = "auto" | "openai" | "deepl" | "microsoft" | "google" | "mock";

export interface LanguageOption {
  name: string;
  code: string;
  headerName: string;
}

export interface TranslationItem {
  id: string;
  text: string;
}

export interface UserCredentials {
  apiKey: string;
  region?: string;
}

export interface TranslationRequest {
  provider: ProviderName;
  sourceLanguage: string;
  sourceCode: string;
  targetLanguage: string;
  targetCode: string;
  localeStyle: string;
  glossary: Record<string, string>;
  items: TranslationItem[];
  userCredentials?: UserCredentials;
}

export interface TranslationResponseItem {
  id: string;
  text: string;
}

export interface TranslationResponse {
  provider: string;
  model?: string;
  credentialSource?: "server" | "user";
  translations: TranslationResponseItem[];
}

export interface ColumnPlan {
  sheetName: string;
  sourceColumnIndex: number;
  targetColumnIndex: number;
  sourceHeader: string;
  targetHeader: string;
  rowCount: number;
  createTargetColumn: boolean;
}

export interface PendingTranslation {
  id: string;
  sheetName: string;
  sourceRowIndex: number;
  sourceColumnIndex: number;
  targetRowIndex: number;
  targetColumnIndex: number;
  original: string;
  protectedText?: string;
  translated: string;
  warnings: string[];
  sourceHeader?: string;
  targetHeader?: string;
}

export interface TranslationPlan {
  mode: "selection" | "xlsform";
  columns: ColumnPlan[];
  jobs: PendingTranslation[];
  skipped: number;
}

export interface ApplyMetadata {
  sourceLanguage: string;
  targetLanguage: string;
  provider: string;
}

export type XLSFormSheetName = "survey" | "choices" | "settings";

export interface XLSFormSheetData {
  name: XLSFormSheetName;
  rows: unknown[][];
}

export interface XLSFormData {
  survey?: XLSFormSheetData;
  choices?: XLSFormSheetData;
  settings?: XLSFormSheetData;
}

export type ValidationCheck =
  | "structure"
  | "question_names"
  | "list_names"
  | "survey_list_names"
  | "choices"
  | "question_types";

export interface XLSFormValidationIssue {
  check: ValidationCheck;
  severity: "error" | "warning" | "info";
  sheetName: XLSFormSheetName;
  name: string;
  listName?: string;
  detail: string;
  rowNumber?: number;
  columnNumber?: number;
}

export interface XLSFormValidationOptions {
  checks: ValidationCheck[];
  passingLists: string[];
  language: "pt" | "en";
}
