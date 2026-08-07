import "./taskpane.css";
import { translateBatch } from "../services/api.service";
import {
  addLanguagesToXLSForm,
  applyTranslationPlan,
  collectSelectionPlan,
  collectXLSFormPlan,
  createXLSFormTemplate
} from "../services/excel.service";
import { validateTranslation } from "../services/validation.service";
import { getBuiltInGlossary } from "../utils/glossary";
import { protectText, restoreText } from "../utils/protection";
import type {
  LanguageOption,
  ProviderName,
  TranslationPlan
} from "../types";

const LANGUAGES: LanguageOption[] = [
  { name: "English", code: "en", headerName: "English" },
  { name: "Portuguese", code: "pt", headerName: "Portuguese" },
  { name: "French", code: "fr", headerName: "French" },
  { name: "Arabic", code: "ar", headerName: "Arabic" },
  { name: "Spanish", code: "es", headerName: "Spanish" },
  { name: "Swahili", code: "sw", headerName: "Swahili" }
];

type InterfaceLanguage = "pt" | "en";
type TranslationDictionary = Record<string, string>;

const STORAGE_KEY = "xlsform-translator-interface-language";
const BATCH_SIZE = 30;

const I18N: Record<InterfaceLanguage, TranslationDictionary> = {
  pt: {
    tagline: "Traduza labels e hints sem alterar a lógica do formulário.",
    settingsTitle: "Configurações",
    interfaceLanguage: "Idioma da interface",
    languageSaved: "A preferência é guardada neste dispositivo.",
    officeWarning: "Abra este painel dentro do Microsoft Excel.",
    languagesTitle: "Idiomas",
    source: "Origem",
    target: "Destino",
    languageVariant: "Variante linguística",
    localeMozambique: "Português de Moçambique",
    localeNeutralPortuguese: "Português neutro",
    localeProfessional: "Neutra/profissional",
    provider: "Provedor",
    providerServer: "Configurado no servidor",
    providerDemo: "Demonstração sem API",
    xlsformOptions: "Opções XLSForm",
    useGlossary: "Usar glossário humanitário",
    overwriteExisting: "Substituir traduções existentes",
    previewBeforeApply: "Rever antes de aplicar",
    translateSelection: "Traduzir selecção",
    translateXlsform: "Traduzir XLSForm",
    analyseStructure: "Analisar estrutura",
    templateBuilder: "Criar modelo XLSForm",
    templateTitle: "Criar modelo XLSForm",
    templateIntro: "Crie as folhas e cabeçalhos ou adicione idiomas sem substituir dados.",
    primaryLanguage: "Idioma principal",
    headerFormat: "Formato dos cabeçalhos",
    headerNameCode: "Nome + código",
    headerNameOnly: "Apenas nome",
    templateLanguages: "Idiomas do modelo",
    formTitle: "Título do formulário",
    formId: "ID do formulário",
    createTemplate: "Criar modelo",
    addLanguages: "Adicionar idiomas",
    creatingTemplate: "A criar o modelo XLSForm…",
    addingLanguages: "A adicionar idiomas…",
    templateCreated: "Modelo XLSForm criado com sucesso.",
    languagesAdded: "Idiomas adicionados com sucesso.",
    sheetsCreated: "Folhas criadas: {sheets}.",
    columnsAdded: "{count} cabeçalhos adicionados.",
    columnsSkipped: "{count} cabeçalhos existentes foram preservados.",
    invalidFormTitle: "Introduza o título do formulário.",
    invalidFormId: "O ID deve conter apenas letras, números, hífen e sublinhado, sem espaços.",
    preparing: "A preparar…",
    previewTitle: "Pré-visualização",
    applyTranslations: "Aplicar traduções",
    resultTitle: "Resultado",
    developedBy: "Desenvolvido por",
    settingsButton: "Configurações",
    close: "Fechar",
    invalidElement: "Elemento não encontrado: {id}",
    invalidLanguage: "Idioma inválido.",
    selectDifferentLanguages: "Seleccione idiomas diferentes.",
    noEligibleCells: "Não foram encontradas células elegíveis para tradução.",
    translating: "A traduzir…",
    providerMissingTranslation: "O provedor não devolveu esta tradução.",
    couldNotRestore: "Não foi possível repor: {items}",
    translationComplete: "Tradução concluída.",
    previewSummary: "{translations} traduções; {skipped} células ignoradas; {warnings} com aviso.",
    translationLabel: "Tradução",
    noPreparedTranslation: "Não existe uma tradução preparada.",
    writingExcel: "A escrever no Excel…",
    appliedSuccessfully: "Aplicado com sucesso.",
    translatedCells: "{count} células traduzidas.",
    skippedCells: "{count} células ignoradas.",
    warningsLogged: "{count} traduções com avisos registados.",
    logUpdated: "Foi actualizado o registo oculto <code>_translation_log</code>.",
    readingSelection: "A ler a selecção…",
    error: "Erro",
    selectSheet: "Seleccione pelo menos uma folha.",
    analysingXlsform: "A analisar o XLSForm…",
    structureAnalysed: "Estrutura analisada.",
    languageColumns: "{count} colunas de idioma reconhecidas.",
    targetColumns: "{count} colunas de destino seriam criadas.",
    readyCells: "{count} células estão prontas para tradução.",
    wouldSkipCells: "{count} células seriam ignoradas.",
    languageEnglish: "Inglês",
    languagePortuguese: "Português",
    languageFrench: "Francês",
    languageArabic: "Árabe",
    languageSpanish: "Espanhol",
    languageSwahili: "Suaíli",
    warningMissingProtected: "Elementos protegidos ausentes: {items}",
    warningAddedProtected: "Elementos protegidos adicionais: {items}",
    warningEmpty: "A tradução está vazia.",
    warningSame: "A tradução é igual ao texto original."
  },
  en: {
    tagline: "Translate labels and hints without changing the form logic.",
    settingsTitle: "Settings",
    interfaceLanguage: "Interface language",
    languageSaved: "This preference is saved on this device.",
    officeWarning: "Open this panel inside Microsoft Excel.",
    languagesTitle: "Languages",
    source: "Source",
    target: "Target",
    languageVariant: "Language variant",
    localeMozambique: "Mozambican Portuguese",
    localeNeutralPortuguese: "Neutral Portuguese",
    localeProfessional: "Neutral/professional",
    provider: "Provider",
    providerServer: "Configured on the server",
    providerDemo: "Demo without API",
    xlsformOptions: "XLSForm options",
    useGlossary: "Use humanitarian glossary",
    overwriteExisting: "Replace existing translations",
    previewBeforeApply: "Review before applying",
    translateSelection: "Translate selection",
    translateXlsform: "Translate XLSForm",
    analyseStructure: "Analyse structure",
    templateBuilder: "Create XLSForm template",
    templateTitle: "Create XLSForm template",
    templateIntro: "Create worksheets and headers or add languages without replacing data.",
    primaryLanguage: "Primary language",
    headerFormat: "Header format",
    headerNameCode: "Name + code",
    headerNameOnly: "Name only",
    templateLanguages: "Template languages",
    formTitle: "Form title",
    formId: "Form ID",
    createTemplate: "Create template",
    addLanguages: "Add languages",
    creatingTemplate: "Creating XLSForm template…",
    addingLanguages: "Adding languages…",
    templateCreated: "XLSForm template created successfully.",
    languagesAdded: "Languages added successfully.",
    sheetsCreated: "Worksheets created: {sheets}.",
    columnsAdded: "{count} headers added.",
    columnsSkipped: "{count} existing headers were preserved.",
    invalidFormTitle: "Enter the form title.",
    invalidFormId: "The ID may contain only letters, numbers, hyphens, and underscores, with no spaces.",
    preparing: "Preparing…",
    previewTitle: "Preview",
    applyTranslations: "Apply translations",
    resultTitle: "Result",
    developedBy: "Developed by",
    settingsButton: "Settings",
    close: "Close",
    invalidElement: "Element not found: {id}",
    invalidLanguage: "Invalid language.",
    selectDifferentLanguages: "Select two different languages.",
    noEligibleCells: "No eligible cells were found for translation.",
    translating: "Translating…",
    providerMissingTranslation: "The provider did not return this translation.",
    couldNotRestore: "Could not restore: {items}",
    translationComplete: "Translation completed.",
    previewSummary: "{translations} translations; {skipped} cells skipped; {warnings} with warnings.",
    translationLabel: "Translation",
    noPreparedTranslation: "There is no prepared translation.",
    writingExcel: "Writing to Excel…",
    appliedSuccessfully: "Applied successfully.",
    translatedCells: "{count} cells translated.",
    skippedCells: "{count} cells skipped.",
    warningsLogged: "{count} translations with recorded warnings.",
    logUpdated: "The hidden <code>_translation_log</code> was updated.",
    readingSelection: "Reading the selection…",
    error: "Error",
    selectSheet: "Select at least one worksheet.",
    analysingXlsform: "Analysing the XLSForm…",
    structureAnalysed: "Structure analysed.",
    languageColumns: "{count} language columns recognised.",
    targetColumns: "{count} target columns would be created.",
    readyCells: "{count} cells are ready for translation.",
    wouldSkipCells: "{count} cells would be skipped.",
    languageEnglish: "English",
    languagePortuguese: "Portuguese",
    languageFrench: "French",
    languageArabic: "Arabic",
    languageSpanish: "Spanish",
    languageSwahili: "Swahili",
    warningMissingProtected: "Missing protected elements: {items}",
    warningAddedProtected: "Additional protected elements: {items}",
    warningEmpty: "The translation is empty.",
    warningSame: "The translation is identical to the original text."
  }
};

let interfaceLanguage: InterfaceLanguage = readStoredLanguage();
let currentPlan: TranslationPlan | null = null;
let currentProvider = "";

function readStoredLanguage(): InterfaceLanguage {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "pt" || stored === "en") return stored;
  } catch {
    // Storage can be unavailable in restrictive Office environments.
  }
  return navigator.language.toLowerCase().startsWith("pt") ? "pt" : "en";
}

function saveLanguage(language: InterfaceLanguage): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // The interface still changes for the current session.
  }
}

function t(key: string, values: Record<string, string | number> = {}): string {
  const template = I18N[interfaceLanguage][key] ?? I18N.pt[key] ?? key;
  return Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template
  );
}

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(t("invalidElement", { id }));
  return found as T;
}

function selectedLanguage(selectId: string): LanguageOption {
  const code = element<HTMLSelectElement>(selectId).value;
  const language = LANGUAGES.find((item) => item.code === code);
  if (!language) throw new Error(t("invalidLanguage"));
  return language;
}

function languageDisplayName(code: string): string {
  const keys: Record<string, string> = {
    en: "languageEnglish",
    pt: "languagePortuguese",
    fr: "languageFrench",
    ar: "languageArabic",
    es: "languageSpanish",
    sw: "languageSwahili"
  };
  return t(keys[code] ?? code);
}

function populateLanguages(): void {
  const source = element<HTMLSelectElement>("source-language");
  const target = element<HTMLSelectElement>("target-language");
  const sourceValue = source.value || "en";
  const targetValue = target.value || "pt";
  source.replaceChildren();
  target.replaceChildren();
  for (const language of LANGUAGES) {
    source.add(new Option(languageDisplayName(language.code), language.code));
    target.add(new Option(languageDisplayName(language.code), language.code));
  }
  source.value = sourceValue;
  target.value = targetValue;
}

function populateTemplateLanguages(): void {
  const primary = element<HTMLSelectElement>("template-primary-language");
  const primaryValue = primary.value || "pt";
  primary.replaceChildren();
  for (const language of LANGUAGES) {
    primary.add(new Option(languageDisplayName(language.code), language.code));
  }
  primary.value = LANGUAGES.some((language) => language.code === primaryValue)
    ? primaryValue
    : "pt";

  const options = element("template-language-options");
  options.replaceChildren();
  for (const language of LANGUAGES) {
    const label = document.createElement("label");
    label.className = "check";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `template-language-${language.code}`;
    checkbox.value = language.code;
    checkbox.checked = language.code === "pt" || language.code === "en";
    const text = document.createElement("span");
    text.textContent = languageDisplayName(language.code);
    label.append(checkbox, text);
    options.appendChild(label);
  }
  updateTemplatePrimaryLanguage();
}

function updateTemplatePrimaryLanguage(): void {
  const primaryCode = element<HTMLSelectElement>("template-primary-language").value;
  for (const language of LANGUAGES) {
    const checkbox = element<HTMLInputElement>(`template-language-${language.code}`);
    checkbox.disabled = language.code === primaryCode;
    if (checkbox.disabled) checkbox.checked = true;
  }
}

function applyInterfaceLanguage(language: InterfaceLanguage): void {
  interfaceLanguage = language;
  saveLanguage(language);
  document.documentElement.lang = language;

  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (key) node.textContent = t(key);
  });

  const settingsButton = element<HTMLButtonElement>("settings-button");
  settingsButton.title = t("settingsButton");
  settingsButton.setAttribute("aria-label", t("settingsButton"));

  for (const id of ["close-settings", "close-template-builder", "clear-preview"]) {
    const button = element<HTMLButtonElement>(id);
    button.title = t("close");
    button.setAttribute("aria-label", t("close"));
  }

  element<HTMLSelectElement>("interface-language").value = language;
  populateLanguages();
  if (document.getElementById("template-primary-language")) populateTemplateLanguages();

  if (currentPlan && !element("preview-card").classList.contains("hidden")) {
    renderPreview(currentPlan);
  }
}

function toggleSettings(forceOpen?: boolean): void {
  const panel = element("settings-panel");
  const button = element<HTMLButtonElement>("settings-button");
  const shouldOpen = forceOpen ?? panel.classList.contains("hidden");
  panel.classList.toggle("hidden", !shouldOpen);
  panel.setAttribute("aria-hidden", String(!shouldOpen));
  button.setAttribute("aria-expanded", String(shouldOpen));
}

function setBusy(isBusy: boolean): void {
  for (const id of [
    "translate-selection",
    "translate-xlsform",
    "validate-xlsform",
    "apply-translations",
    "create-template",
    "add-template-languages"
  ]) {
    const button = document.getElementById(id) as HTMLButtonElement | null;
    if (button) button.disabled = isBusy;
  }
}

function toggleTemplateBuilder(forceOpen?: boolean): void {
  const panel = element("template-builder");
  const shouldOpen = forceOpen ?? panel.classList.contains("hidden");
  panel.classList.toggle("hidden", !shouldOpen);
  panel.setAttribute("aria-hidden", String(!shouldOpen));
}

function selectedTemplateLanguages(): LanguageOption[] {
  const primaryCode = element<HTMLSelectElement>("template-primary-language").value;
  const selected = LANGUAGES.filter((language) =>
    element<HTMLInputElement>(`template-language-${language.code}`).checked
  );
  return [
    ...selected.filter((language) => language.code === primaryCode),
    ...selected.filter((language) => language.code !== primaryCode)
  ];
}

function templateInputs(): {
  languages: LanguageOption[];
  primaryLanguage: LanguageOption;
  headerStyle: "name" | "name-code";
  formTitle: string;
  formId: string;
} {
  const primaryLanguage = selectedLanguage("template-primary-language");
  const languages = selectedTemplateLanguages();
  const headerStyle = element<HTMLSelectElement>("template-header-style").value;
  const formTitle = element<HTMLInputElement>("template-form-title").value.trim();
  const formId = element<HTMLInputElement>("template-form-id").value.trim();
  if (!formTitle) throw new Error(t("invalidFormTitle"));
  if (!/^[A-Za-z0-9_-]+$/.test(formId)) throw new Error(t("invalidFormId"));
  return {
    languages,
    primaryLanguage,
    headerStyle: headerStyle === "name" ? "name" : "name-code",
    formTitle,
    formId
  };
}

async function handleCreateTemplate(): Promise<void> {
  setBusy(true);
  clearResult();
  try {
    const options = templateInputs();
    showProgress(t("creatingTemplate"), 0, 1);
    const result = await createXLSFormTemplate(options);
    showProgress(t("appliedSuccessfully"), 1, 1);
    showResult(
      `<strong>${t("templateCreated")}</strong><ul class="result-list">` +
      `<li>${t("sheetsCreated", { sheets: result.createdSheets.join(", ") || "survey, choices, settings" })}</li>` +
      `<li>${t("columnsAdded", { count: result.addedColumns })}</li></ul>`
    );
    window.setTimeout(hideProgress, 800);
  } catch (error) {
    showError(error);
  } finally {
    setBusy(false);
  }
}

async function handleAddTemplateLanguages(): Promise<void> {
  setBusy(true);
  clearResult();
  try {
    const options = templateInputs();
    showProgress(t("addingLanguages"), 0, 1);
    const result = await addLanguagesToXLSForm(options.languages, options.headerStyle);
    showProgress(t("appliedSuccessfully"), 1, 1);
    showResult(
      `<strong>${t("languagesAdded")}</strong><ul class="result-list">` +
      `<li>${t("columnsAdded", { count: result.addedColumns })}</li>` +
      `<li>${t("columnsSkipped", { count: result.skippedColumns })}</li></ul>`
    );
    window.setTimeout(hideProgress, 800);
  } catch (error) {
    showError(error);
  } finally {
    setBusy(false);
  }
}

function showProgress(text: string, done = 0, total = 1): void {
  element("progress-card").classList.remove("hidden");
  element("progress-text").textContent = text;
  element("progress-count").textContent = total > 1 ? `${done}/${total}` : "";
  const progress = element<HTMLProgressElement>("progress");
  progress.value = total > 0 ? Math.round((done / total) * 100) : 0;
}

function hideProgress(): void {
  element("progress-card").classList.add("hidden");
}

function showResult(html: string, isError = false): void {
  element("results-card").classList.remove("hidden");
  const message = element("results-message");
  message.className = isError ? "error" : "success";
  message.innerHTML = html;
}

function clearResult(): void {
  element("results-card").classList.add("hidden");
  element("results-message").textContent = "";
}

function localizeWarning(warning: string): string {
  const mappings: Array<[string, string]> = [
    ["Elementos protegidos ausentes: ", "warningMissingProtected"],
    ["Elementos protegidos adicionais: ", "warningAddedProtected"]
  ];
  for (const [prefix, key] of mappings) {
    if (warning.startsWith(prefix)) return t(key, { items: warning.slice(prefix.length) });
  }
  if (warning === "A tradução está vazia.") return t("warningEmpty");
  if (warning === "A tradução é igual ao texto original.") return t("warningSame");
  return warning;
}

async function translatePlan(plan: TranslationPlan): Promise<void> {
  const source = selectedLanguage("source-language");
  const target = selectedLanguage("target-language");
  if (source.code === target.code) throw new Error(t("selectDifferentLanguages"));
  if (plan.jobs.length === 0) throw new Error(t("noEligibleCells"));

  const provider = element<HTMLSelectElement>("provider").value as ProviderName;
  const useGlossary = element<HTMLInputElement>("use-glossary").checked;
  const glossary = useGlossary ? getBuiltInGlossary(source.code, target.code) : {};
  const localeStyle = element<HTMLSelectElement>("locale-style").value;

  const tokenMaps = new Map<string, Record<string, string>>();
  for (const job of plan.jobs) {
    const protectedValue = protectText(job.original);
    job.protectedText = protectedValue.text;
    tokenMaps.set(job.id, protectedValue.tokens);
  }

  let translatedCount = 0;
  for (let start = 0; start < plan.jobs.length; start += BATCH_SIZE) {
    const batch = plan.jobs.slice(start, start + BATCH_SIZE);
    showProgress(t("translating"), translatedCount, plan.jobs.length);
    const response = await translateBatch({
      provider,
      sourceLanguage: source.name,
      sourceCode: source.code,
      targetLanguage: target.name,
      targetCode: target.code,
      localeStyle,
      glossary,
      items: batch.map((job) => ({ id: job.id, text: job.protectedText || job.original }))
    });
    currentProvider = response.model ? `${response.provider}/${response.model}` : response.provider;

    const byId = new Map(response.translations.map((item) => [item.id, item.text]));
    for (const job of batch) {
      const rawTranslation = byId.get(job.id);
      if (typeof rawTranslation !== "string") {
        job.translated = job.original;
        job.warnings = [t("providerMissingTranslation")];
        continue;
      }
      const restored = restoreText(rawTranslation, tokenMaps.get(job.id) || {});
      job.translated = restored.text;
      job.warnings = validateTranslation(job.original, job.translated);
      if (restored.missing.length > 0) {
        job.warnings.push(t("couldNotRestore", { items: restored.missing.join(", ") }));
      }
      translatedCount++;
    }
  }

  showProgress(t("translationComplete"), plan.jobs.length, plan.jobs.length);
  currentPlan = plan;

  if (element<HTMLInputElement>("preview-before-apply").checked) {
    renderPreview(plan);
    hideProgress();
  } else {
    await applyCurrentPlan();
  }
}

function renderPreview(plan: TranslationPlan): void {
  const card = element("preview-card");
  const list = element("preview-list");
  list.replaceChildren();
  const warningCount = plan.jobs.filter((job) => job.warnings.length > 0).length;
  element("preview-summary").textContent = t("previewSummary", {
    translations: plan.jobs.length,
    skipped: plan.skipped,
    warnings: warningCount
  });

  plan.jobs.forEach((job, index) => {
    const item = document.createElement("article");
    item.className = "preview-item";

    const address = document.createElement("div");
    address.className = "preview-address";
    address.textContent = job.id;

    const original = document.createElement("div");
    original.className = "preview-original";
    original.textContent = job.original;

    const label = document.createElement("label");
    label.textContent = t("translationLabel");
    const textarea = document.createElement("textarea");
    textarea.value = job.translated;
    textarea.dataset.index = String(index);
    textarea.addEventListener("input", () => {
      const jobIndex = Number(textarea.dataset.index);
      const currentJob = currentPlan?.jobs[jobIndex];
      if (currentJob) {
        currentJob.translated = textarea.value;
        currentJob.warnings = validateTranslation(currentJob.original, currentJob.translated);
      }
    });
    label.appendChild(textarea);

    item.append(address, original, label);
    if (job.warnings.length > 0) {
      const warnings = document.createElement("ul");
      warnings.className = "warning-list";
      for (const warning of job.warnings) {
        const li = document.createElement("li");
        li.textContent = localizeWarning(warning);
        warnings.appendChild(li);
      }
      item.appendChild(warnings);
    }
    list.appendChild(item);
  });
  card.classList.remove("hidden");
}

async function applyCurrentPlan(): Promise<void> {
  if (!currentPlan) throw new Error(t("noPreparedTranslation"));
  const source = selectedLanguage("source-language");
  const target = selectedLanguage("target-language");
  showProgress(t("writingExcel"), 0, 1);
  await applyTranslationPlan(currentPlan, {
    sourceLanguage: source.name,
    targetLanguage: target.name,
    provider: currentProvider || element<HTMLSelectElement>("provider").value
  });
  showProgress(t("appliedSuccessfully"), 1, 1);
  const warningCount = currentPlan.jobs.filter((job) => job.warnings.length > 0).length;
  showResult(
    `<strong>${t("translatedCells", { count: currentPlan.jobs.length })}</strong>` +
    `<ul class="result-list"><li>${t("skippedCells", { count: currentPlan.skipped })}</li>` +
    `<li>${t("warningsLogged", { count: warningCount })}</li>` +
    `<li>${t("logUpdated")}</li></ul>`
  );
  currentPlan = null;
  element("preview-card").classList.add("hidden");
  window.setTimeout(hideProgress, 800);
}

function showError(error: unknown): void {
  hideProgress();
  showResult(`<strong>${t("error")}:</strong> ${escapeHtml(errorMessage(error))}`, true);
}

async function handleSelection(): Promise<void> {
  setBusy(true);
  clearResult();
  try {
    showProgress(t("readingSelection"), 0, 1);
    const plan = await collectSelectionPlan();
    await translatePlan(plan);
  } catch (error) {
    showError(error);
  } finally {
    setBusy(false);
  }
}

async function handleXLSForm(): Promise<void> {
  setBusy(true);
  clearResult();
  try {
    const source = selectedLanguage("source-language");
    const target = selectedLanguage("target-language");
    const sheetNames = [
      element<HTMLInputElement>("sheet-survey").checked ? "survey" : "",
      element<HTMLInputElement>("sheet-choices").checked ? "choices" : "",
      element<HTMLInputElement>("sheet-settings").checked ? "settings" : ""
    ].filter(Boolean);
    if (sheetNames.length === 0) throw new Error(t("selectSheet"));

    showProgress(t("analysingXlsform"), 0, 1);
    const plan = await collectXLSFormPlan({
      sheetNames,
      sourceHeaderLanguage: source.headerName,
      sourceLanguageCode: source.code,
      targetHeaderLanguage: target.headerName,
      targetLanguageCode: target.code,
      overwriteExisting: element<HTMLInputElement>("overwrite-existing").checked
    });
    await translatePlan(plan);
  } catch (error) {
    showError(error);
  } finally {
    setBusy(false);
  }
}

async function analyseXLSForm(): Promise<void> {
  setBusy(true);
  clearResult();
  try {
    const source = selectedLanguage("source-language");
    const target = selectedLanguage("target-language");
    const sheetNames = [
      element<HTMLInputElement>("sheet-survey").checked ? "survey" : "",
      element<HTMLInputElement>("sheet-choices").checked ? "choices" : "",
      element<HTMLInputElement>("sheet-settings").checked ? "settings" : ""
    ].filter(Boolean);
    if (sheetNames.length === 0) throw new Error(t("selectSheet"));
    const plan = await collectXLSFormPlan({
      sheetNames,
      sourceHeaderLanguage: source.headerName,
      sourceLanguageCode: source.code,
      targetHeaderLanguage: target.headerName,
      targetLanguageCode: target.code,
      overwriteExisting: false
    });
    const newColumns = plan.columns.filter((column) => column.createTargetColumn).length;
    showResult(
      `<strong>${t("structureAnalysed")}</strong><ul class="result-list">` +
      `<li>${t("languageColumns", { count: plan.columns.length })}</li>` +
      `<li>${t("targetColumns", { count: newColumns })}</li>` +
      `<li>${t("readyCells", { count: plan.jobs.length })}</li>` +
      `<li>${t("wouldSkipCells", { count: plan.skipped })}</li></ul>`
    );
  } catch (error) {
    showError(error);
  } finally {
    setBusy(false);
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[character] || character);
}

function clearPreview(): void {
  currentPlan = null;
  element("preview-card").classList.add("hidden");
  element("preview-list").replaceChildren();
}

Office.onReady((info) => {
  populateLanguages();
  applyInterfaceLanguage(interfaceLanguage);

  element<HTMLButtonElement>("settings-button").addEventListener("click", () => toggleSettings());
  element<HTMLButtonElement>("close-settings").addEventListener("click", () => toggleSettings(false));
  element<HTMLSelectElement>("interface-language").addEventListener("change", (event) => {
    const language = (event.target as HTMLSelectElement).value;
    if (language === "pt" || language === "en") applyInterfaceLanguage(language);
  });

  element<HTMLButtonElement>("translate-selection").addEventListener("click", handleSelection);
  element<HTMLButtonElement>("translate-xlsform").addEventListener("click", handleXLSForm);
  element<HTMLButtonElement>("validate-xlsform").addEventListener("click", analyseXLSForm);
  element<HTMLButtonElement>("toggle-template-builder").addEventListener("click", () => toggleTemplateBuilder());
  element<HTMLButtonElement>("close-template-builder").addEventListener("click", () => toggleTemplateBuilder(false));
  element<HTMLSelectElement>("template-primary-language").addEventListener("change", updateTemplatePrimaryLanguage);
  element<HTMLButtonElement>("create-template").addEventListener("click", handleCreateTemplate);
  element<HTMLButtonElement>("add-template-languages").addEventListener("click", handleAddTemplateLanguages);
  element<HTMLButtonElement>("apply-translations").addEventListener("click", async () => {
    setBusy(true);
    try {
      await applyCurrentPlan();
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  });
  element<HTMLButtonElement>("clear-preview").addEventListener("click", clearPreview);

  if (info.host !== Office.HostType.Excel) {
    element("office-warning").classList.remove("hidden");
  }
});
