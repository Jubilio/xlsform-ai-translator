# Microsoft Marketplace Submission Package

## Product identity

- **Product name:** XLSForm AI Translator
- **Publisher:** NexoVibe
- **Developer:** Jubílio Maússe
- **Office host:** Microsoft Excel
- **Category:** Productivity / Data management / Translation
- **Pricing:** Free add-in. External translation providers may charge users for API usage when personal API keys are used.
- **Production application:** https://xlsform-ai-translator.onrender.com/
- **Support:** https://nexovibe.netlify.app/xlsform-translator/support
- **Privacy policy:** https://nexovibe.netlify.app/xlsform-translator/privacy
- **Terms of use:** https://nexovibe.netlify.app/xlsform-translator/terms
- **User guide:** https://nexovibe.netlify.app/xlsform-translator/user-guide

## English Marketplace listing

### Short description

Translate Kobo/XLSForm surveys directly in Excel while preserving variables, formulas, placeholders, formatting, and form logic.

### Full description

XLSForm AI Translator helps survey designers, humanitarian teams, researchers, and data professionals translate Kobo/XLSForm questionnaires directly inside Microsoft Excel.

The add-in can translate selected cells or recognised multilingual XLSForm columns in the `survey` and `choices` worksheets. It protects variable references, formulas, HTML, URLs, line breaks, and other technical elements that must remain unchanged.

Key capabilities:

- Translate selected Excel cells without overwriting the source selection.
- Translate XLSForm labels, hints, guidance hints, required messages, and constraint messages.
- Create target-language columns when they do not exist.
- Review and edit translations before applying them.
- Preserve formulas, variable names, placeholders, formatting, and form logic.
- Use a built-in humanitarian terminology glossary.
- Use OpenAI, DeepL, Microsoft Translator, or a demonstration provider.
- Use the publisher's server credentials first, with optional personal API-key fallback when the configured provider is unavailable or has insufficient credit.
- Switch the interface between English and Portuguese.

The add-in is designed for questionnaire development and must not be used to send confidential survey responses or unnecessary personal information to external translation services.

### Search keywords

XLSForm, KoboToolbox, Excel translation, survey translation, humanitarian data, questionnaire, OpenAI, DeepL, Microsoft Translator, multilingual forms

## Portuguese Marketplace listing

### Descrição curta

Traduza questionários Kobo/XLSForm directamente no Excel, preservando variáveis, fórmulas, placeholders, formatação e lógica do formulário.

### Descrição completa

O XLSForm AI Translator ajuda equipas de inquéritos, organizações humanitárias, investigadores e profissionais de dados a traduzir questionários Kobo/XLSForm directamente no Microsoft Excel.

O Add-in pode traduzir células seleccionadas ou colunas multilingues reconhecidas nas folhas `survey` e `choices`. Elementos técnicos que não podem ser modificados — como referências de variáveis, fórmulas, HTML, URLs e quebras de linha — são protegidos durante a tradução.

Principais funcionalidades:

- Tradução de células seleccionadas sem substituir o conteúdo original.
- Tradução de labels, hints, guidance hints, mensagens obrigatórias e mensagens de validação.
- Criação automática das colunas do idioma de destino.
- Pré-visualização e edição antes da aplicação.
- Preservação de fórmulas, variáveis, placeholders, formatação e lógica do formulário.
- Glossário de terminologia humanitária.
- Compatibilidade com OpenAI, DeepL, Microsoft Translator e modo de demonstração.
- Utilização inicial das credenciais do servidor, com opção de chave pessoal apenas quando o provedor configurado estiver indisponível ou sem crédito suficiente.
- Interface em Português e Inglês.

O Add-in foi concebido para o desenvolvimento de questionários e não deve ser utilizado para enviar respostas confidenciais ou dados pessoais desnecessários para serviços externos de tradução.

### Palavras-chave

XLSForm, KoboToolbox, tradução no Excel, tradução de inquéritos, dados humanitários, questionário, OpenAI, DeepL, Microsoft Translator, formulários multilingues

## Certification test instructions

### Standard translation flow

1. Open Microsoft Excel and create a blank workbook.
2. Open **XLSForm AI Translator** from the Home ribbon.
3. Select English as the source language and Portuguese as the target language.
4. Enter `What is your name?` in cell A1.
5. Select A1 and click **Translate selection**.
6. Review the proposed translation.
7. Click **Apply translations**.
8. Confirm that the source text remains in A1 and the translated text is written to the adjacent output range.

### XLSForm flow

1. Open `examples/sample-xlsform.xlsx` from the repository.
2. Keep `survey` and `choices` selected.
3. Select English as source and Portuguese as target.
4. Click **Analyse structure**.
5. Click **Translate XLSForm**.
6. Review the preview and apply the translations.
7. Confirm that multilingual target columns are created or populated without changing `type`, `name`, `relevant`, `constraint`, `calculation`, or other logic columns.

### Interface localization

1. Open Settings using the gear button.
2. Change the interface language from English to Portuguese.
3. Confirm that headings, buttons, messages, errors, previews, and results change language.
4. Close and reopen the add-in and confirm the preference is retained.

### Personal API-key fallback

1. Attempt a translation using the server-configured provider.
2. When the server reports an unavailable, invalid, rate-limited, or insufficient-credit credential, open Settings.
3. Select OpenAI, DeepL, or Microsoft Translator.
4. Enter a valid personal key. For Microsoft Translator, also enter the Azure region.
5. Retry the translation.
6. Confirm that the personal key is not written into the workbook or `_translation_log`.
7. Use **Clear session keys**, close the add-in, and confirm that the key is no longer available.

## Reviewer notes

- No account or sign-in is required to open the add-in.
- The demo provider can be used for interface testing without external API credentials.
- Real translation quality depends on the selected external provider.
- Personal API credentials are optional and held only for the active session.
- The add-in requests `ReadWriteDocument` permission because it reads selected cells and writes translated content back to the workbook.

## Submission checklist

- [ ] Partner Center Microsoft Marketplace account verified.
- [ ] Publisher name is exactly `NexoVibe`.
- [ ] `manifest.production.xml` passes Microsoft validation.
- [ ] Production URLs are available without authentication.
- [ ] Privacy, terms, support, and user-guide pages return HTTP 200.
- [ ] Excel Desktop test completed.
- [ ] Excel for the Web test completed.
- [ ] Portuguese and English interface test completed.
- [ ] Server-key and personal-key fallback flows tested.
- [ ] Screenshots prepared without personal or confidential information.
- [ ] Listing text added for English and Portuguese.
- [ ] Offer marked as free, with disclosure that external API charges may apply.
- [ ] Certification test instructions copied into Partner Center.
- [ ] Preview audience selected before public release.
