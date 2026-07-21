import "./taskpane.css";
import { getProviderStatus, translateBatch } from "../services/api.service";
import {
  applyTranslationPlan,
  collectSelectionPlan,
  collectXLSFormPlan
} from "../services/excel.service";
import { validateTranslation } from "../services/validation.service";
import { getBuiltInGlossary } from "../utils/glossary";
import { protectText, restoreText } from "../utils/protection";
import type {
  LanguageOption,
  PendingTranslation,
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

const BATCH_SIZE = 30;
let currentPlan: TranslationPlan | null = null;
let currentProvider = "";

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Elemento não encontrado: ${id}`);
  return found as T;
}

function selectedLanguage(selectId: string): LanguageOption {
  const code = element<HTMLSelectElement>(selectId).value;
  const language = LANGUAGES.find((item) => item.code === code);
  if (!language) throw new Error("Idioma inválido.");
  return language;
}

function populateLanguages(): void {
  const source = element<HTMLSelectElement>("source-language");
  const target = element<HTMLSelectElement>("target-language");
  for (const language of LANGUAGES) {
    source.add(new Option(language.name, language.code));
    target.add(new Option(language.name, language.code));
  }
  source.value = "en";
  target.value = "pt";
}

function setBusy(isBusy: boolean): void {
  for (const id of ["translate-selection", "translate-xlsform", "validate-xlsform", "apply-translations"]) {
    const button = document.getElementById(id) as HTMLButtonElement | null;
    if (button) button.disabled = isBusy;
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

async function loadProviderStatus(): Promise<void> {
  const status = await getProviderStatus();
  const configured = Object.entries(status)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name)
    .join(", ");
  element("provider-status").textContent = configured
    ? `Disponíveis no backend: ${configured}.`
    : "Não foi possível consultar o backend.";
}

async function translatePlan(plan: TranslationPlan): Promise<void> {
  const source = selectedLanguage("source-language");
  const target = selectedLanguage("target-language");
  if (source.code === target.code) throw new Error("Seleccione idiomas diferentes.");
  if (plan.jobs.length === 0) throw new Error("Não foram encontradas células elegíveis para tradução.");

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
    showProgress("A traduzir…", translatedCount, plan.jobs.length);
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
        job.warnings = ["O provedor não devolveu esta tradução."];
        continue;
      }
      const restored = restoreText(rawTranslation, tokenMaps.get(job.id) || {});
      job.translated = restored.text;
      job.warnings = validateTranslation(job.original, job.translated);
      if (restored.missing.length > 0) {
        job.warnings.push(`Não foi possível repor: ${restored.missing.join(", ")}`);
      }
      translatedCount++;
    }
  }

  showProgress("Tradução concluída.", plan.jobs.length, plan.jobs.length);
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
  element("preview-summary").textContent = `${plan.jobs.length} traduções; ${plan.skipped} células ignoradas; ${warningCount} com aviso.`;

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
    label.textContent = "Tradução";
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
        li.textContent = warning;
        warnings.appendChild(li);
      }
      item.appendChild(warnings);
    }
    list.appendChild(item);
  });
  card.classList.remove("hidden");
}

async function applyCurrentPlan(): Promise<void> {
  if (!currentPlan) throw new Error("Não existe uma tradução preparada.");
  const source = selectedLanguage("source-language");
  const target = selectedLanguage("target-language");
  showProgress("A escrever no Excel…", 0, 1);
  await applyTranslationPlan(currentPlan, {
    sourceLanguage: source.name,
    targetLanguage: target.name,
    provider: currentProvider || element<HTMLSelectElement>("provider").value
  });
  showProgress("Aplicado com sucesso.", 1, 1);
  const warningCount = currentPlan.jobs.filter((job) => job.warnings.length > 0).length;
  showResult(
    `<strong>${currentPlan.jobs.length} células traduzidas.</strong>` +
    `<ul class="result-list"><li>${currentPlan.skipped} células ignoradas.</li>` +
    `<li>${warningCount} traduções com avisos registados.</li>` +
    `<li>Foi actualizado o registo oculto <code>_translation_log</code>.</li></ul>`
  );
  currentPlan = null;
  element("preview-card").classList.add("hidden");
  window.setTimeout(hideProgress, 800);
}

async function handleSelection(): Promise<void> {
  setBusy(true);
  clearResult();
  try {
    showProgress("A ler a selecção…", 0, 1);
    const plan = await collectSelectionPlan();
    await translatePlan(plan);
  } catch (error) {
    hideProgress();
    showResult(`<strong>Erro:</strong> ${escapeHtml(errorMessage(error))}`, true);
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
    if (sheetNames.length === 0) throw new Error("Seleccione pelo menos uma folha.");

    showProgress("A analisar o XLSForm…", 0, 1);
    const plan = await collectXLSFormPlan({
      sheetNames,
      sourceHeaderLanguage: source.headerName,
      targetHeaderLanguage: target.headerName,
      overwriteExisting: element<HTMLInputElement>("overwrite-existing").checked
    });
    await translatePlan(plan);
  } catch (error) {
    hideProgress();
    showResult(`<strong>Erro:</strong> ${escapeHtml(errorMessage(error))}`, true);
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
    const sheetNames = ["survey", "choices"];
    const plan = await collectXLSFormPlan({
      sheetNames,
      sourceHeaderLanguage: source.headerName,
      targetHeaderLanguage: target.headerName,
      overwriteExisting: false
    });
    const newColumns = plan.columns.filter((column) => column.createTargetColumn).length;
    showResult(
      `<strong>Estrutura analisada.</strong><ul class="result-list">` +
      `<li>${plan.columns.length} colunas de idioma reconhecidas.</li>` +
      `<li>${newColumns} colunas de destino seriam criadas.</li>` +
      `<li>${plan.jobs.length} células estão prontas para tradução.</li>` +
      `<li>${plan.skipped} células seriam ignoradas.</li></ul>`
    );
  } catch (error) {
    showResult(`<strong>Erro:</strong> ${escapeHtml(errorMessage(error))}`, true);
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
  element<HTMLButtonElement>("translate-selection").addEventListener("click", handleSelection);
  element<HTMLButtonElement>("translate-xlsform").addEventListener("click", handleXLSForm);
  element<HTMLButtonElement>("validate-xlsform").addEventListener("click", analyseXLSForm);
  element<HTMLButtonElement>("apply-translations").addEventListener("click", async () => {
    setBusy(true);
    try {
      await applyCurrentPlan();
    } catch (error) {
      hideProgress();
      showResult(`<strong>Erro:</strong> ${escapeHtml(errorMessage(error))}`, true);
    } finally {
      setBusy(false);
    }
  });
  element<HTMLButtonElement>("clear-preview").addEventListener("click", clearPreview);

  if (info.host !== Office.HostType.Excel) {
    element("office-warning").classList.remove("hidden");
  }
  void loadProviderStatus();
});
