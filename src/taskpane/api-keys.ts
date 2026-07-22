type SupportedProvider = "openai" | "deepl" | "microsoft";
type UiLanguage = "pt" | "en";

const TEXT = {
  pt: {
    title: "Chaves pessoais de fallback",
    intro: "As chaves do servidor são sempre usadas primeiro. Esta chave só será utilizada se o provedor do servidor falhar por falta de créditos, limite, chave inválida ou indisponibilidade.",
    provider: "Provedor da chave pessoal",
    key: "Chave de API",
    region: "Região do Azure",
    show: "Mostrar",
    hide: "Ocultar",
    clear: "Limpar chaves desta sessão",
    saved: "A chave permanece apenas nesta sessão do Excel/navegador. Não é gravada no ficheiro Excel nem guardada no servidor.",
    openai: "OpenAI: crie uma conta na plataforma, active a facturação quando exigida e gere uma secret key em API keys.",
    deepl: "DeepL: crie uma conta API Free ou Pro e copie a Authentication Key na área da conta.",
    microsoft: "Microsoft Translator: crie um recurso Translator no Azure. Copie uma key e a respectiva região.",
    required: "A chave do servidor falhou. Introduza uma chave pessoal para continuar e tente novamente.",
    configure: "Configurar chave pessoal",
    ready: "Chave pessoal disponível para esta sessão. Tente a tradução novamente.",
    cleared: "As chaves pessoais foram removidas desta sessão."
  },
  en: {
    title: "Personal fallback API keys",
    intro: "Server keys are always tried first. Your key is used only if the server provider fails because of exhausted credits, rate limits, an invalid key, or provider unavailability.",
    provider: "Personal key provider",
    key: "API key",
    region: "Azure region",
    show: "Show",
    hide: "Hide",
    clear: "Clear keys from this session",
    saved: "The key remains only in this Excel/browser session. It is not written to the workbook or stored by the server.",
    openai: "OpenAI: create a platform account, enable billing when required, and generate a secret key under API keys.",
    deepl: "DeepL: create an API Free or Pro account and copy the Authentication Key from your account area.",
    microsoft: "Microsoft Translator: create a Translator resource in Azure. Copy one key and its matching region.",
    required: "The server key failed. Enter a personal key to continue, then retry the translation.",
    configure: "Configure personal key",
    ready: "A personal key is available for this session. Retry the translation.",
    cleared: "Personal keys were removed from this session."
  }
} as const;

const providerLinks: Record<SupportedProvider, string> = {
  openai: "https://platform.openai.com/api-keys",
  deepl: "https://www.deepl.com/your-account/keys",
  microsoft: "https://portal.azure.com/"
};

function el<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

function language(): UiLanguage {
  return document.documentElement.lang === "en" ? "en" : "pt";
}

function storageKey(provider: SupportedProvider): string {
  return `xlsform-api-key-${provider}`;
}

function selectedProvider(): SupportedProvider {
  const value = el<HTMLSelectElement>("personal-api-provider")?.value;
  return value === "deepl" || value === "microsoft" ? value : "openai";
}

function setText(): void {
  const copy = TEXT[language()];
  const mappings: Record<string, keyof typeof copy> = {
    "personal-api-title": "title",
    "personal-api-intro": "intro",
    "personal-api-provider-label": "provider",
    "personal-api-key-label": "key",
    "personal-api-region-label": "region",
    "personal-api-clear": "clear",
    "personal-api-privacy": "saved",
    "personal-api-openai-help": "openai",
    "personal-api-deepl-help": "deepl",
    "personal-api-microsoft-help": "microsoft",
    "personal-api-configure": "configure"
  };
  for (const [id, key] of Object.entries(mappings)) {
    const node = el(id);
    if (node) node.textContent = copy[key];
  }
  const toggle = el<HTMLButtonElement>("personal-api-show");
  const input = el<HTMLInputElement>("personal-api-key");
  if (toggle && input) toggle.textContent = input.type === "password" ? copy.show : copy.hide;
}

function loadProviderCredentials(): void {
  const provider = selectedProvider();
  const keyInput = el<HTMLInputElement>("personal-api-key");
  const regionInput = el<HTMLInputElement>("personal-api-region");
  const regionRow = el("personal-api-region-row");
  const helpItems = document.querySelectorAll<HTMLElement>("[data-api-help]");

  if (keyInput) keyInput.value = sessionStorage.getItem(storageKey(provider)) || "";
  if (regionInput) regionInput.value = sessionStorage.getItem("xlsform-api-region-microsoft") || "";
  regionRow?.classList.toggle("hidden", provider !== "microsoft");
  helpItems.forEach((item) => item.classList.toggle("hidden", item.dataset.apiHelp !== provider));

  const link = el<HTMLAnchorElement>("personal-api-link");
  if (link) link.href = providerLinks[provider];
}

function saveCurrentCredentials(): void {
  const provider = selectedProvider();
  const key = el<HTMLInputElement>("personal-api-key")?.value.trim() || "";
  const region = el<HTMLInputElement>("personal-api-region")?.value.trim() || "";
  if (key) sessionStorage.setItem(storageKey(provider), key);
  else sessionStorage.removeItem(storageKey(provider));
  if (provider === "microsoft") {
    if (region) sessionStorage.setItem("xlsform-api-region-microsoft", region);
    else sessionStorage.removeItem("xlsform-api-region-microsoft");
  }
  const status = el("personal-api-status");
  if (status) status.textContent = key ? TEXT[language()].ready : "";
}

function revealPanel(provider?: SupportedProvider, failed = false): void {
  const section = el("personal-api-section");
  const providerSelect = el<HTMLSelectElement>("personal-api-provider");
  section?.classList.remove("hidden");
  if (provider && providerSelect) providerSelect.value = provider;
  loadProviderCredentials();
  if (failed) {
    const settingsPanel = el("settings-panel");
    settingsPanel?.classList.remove("hidden");
    settingsPanel?.setAttribute("aria-hidden", "false");
    el("settings-button")?.setAttribute("aria-expanded", "true");
    const status = el("personal-api-status");
    if (status) status.textContent = TEXT[language()].required;
    el<HTMLInputElement>("personal-api-key")?.focus();
  }
}

function initialise(): void {
  setText();
  el("personal-api-configure")?.addEventListener("click", () => revealPanel());
  el<HTMLSelectElement>("personal-api-provider")?.addEventListener("change", loadProviderCredentials);
  el<HTMLInputElement>("personal-api-key")?.addEventListener("input", saveCurrentCredentials);
  el<HTMLInputElement>("personal-api-region")?.addEventListener("input", saveCurrentCredentials);
  el("personal-api-show")?.addEventListener("click", () => {
    const input = el<HTMLInputElement>("personal-api-key");
    if (!input) return;
    input.type = input.type === "password" ? "text" : "password";
    setText();
  });
  el("personal-api-clear")?.addEventListener("click", () => {
    (["openai", "deepl", "microsoft"] as SupportedProvider[]).forEach((provider) => sessionStorage.removeItem(storageKey(provider)));
    sessionStorage.removeItem("xlsform-api-region-microsoft");
    loadProviderCredentials();
    const status = el("personal-api-status");
    if (status) status.textContent = TEXT[language()].cleared;
  });
  window.addEventListener("xlsform-api-key-required", (event) => {
    const detail = (event as CustomEvent<{ provider?: SupportedProvider }>).detail;
    revealPanel(detail?.provider, true);
  });
  new MutationObserver(setText).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  loadProviderCredentials();
}

document.addEventListener("DOMContentLoaded", initialise);
