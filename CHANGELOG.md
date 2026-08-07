# Changelog

## Unreleased

- Instalador automático para configurar um Trusted Add-in Catalog no Excel Desktop para Windows.
- Correcção da resolução do caminho do manifesto em versões do Windows PowerShell onde `$PSScriptRoot` não está disponível durante a avaliação dos parâmetros.
- Correcção dos ícones do Excel: todas as imagens do catálogo e da faixa passam a usar o mesmo host HTTPS e a versão do manifesto é incrementada para renovar o cache do Office.
- Suporte a cabeçalhos XLSForm com ou sem códigos de idioma, como `label::English` e `label::English (en)`.
- Tradução opcional de `settings.form_title`, preservando os campos técnicos da folha.

## 1.0.0 — 2026-07-21

- Tradução de selecção e de XLSForm completo.
- Suporte a OpenAI, DeepL, Microsoft Translator e modo mock.
- Protecção de placeholders, HTML, URLs e fórmulas.
- Pré-visualização, validação e registo de alterações.
- Glossário humanitário Inglês–Português.
