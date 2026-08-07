# Changelog

## Unreleased

- Google Cloud Translation — Basic v2 como novo provedor do backend e das chaves pessoais de fallback.
- Detecção automática do idioma de origem para **Traduzir selecção**, suportada por todos os provedores reais.
- Lotes limitados simultaneamente a 30 células e aproximadamente 4.500 caracteres para reduzir erros de tamanho e latência.
- Validação no backend do total de caracteres enviado por pedido.
- Comparação de um formulário aberto com um XLSForm canónico, inspirada no pacote `idem` da IMPACT Initiatives.
- Verificação de perguntas, listas, opções, folhas obrigatórias e correspondência de `type`/lista por pergunta.
- Navegação directa para problemas encontrados e exportação para `_validation_report`.
- Leitura local do ficheiro de referência no painel, sem envio do XLSForm ao backend.
- A opção **Substituir traduções existentes** passa a permitir que **Traduzir selecção** substitua dados ou fórmulas no bloco de destino à direita.
- Correcção do cache do painel: HTML sem cache e bundles JavaScript com hash de conteúdo impedem combinações entre interface nova e código antigo.
- Criador de modelos XLSForm com folhas `survey`, `choices` e `settings`, idiomas configuráveis e dois formatos de cabeçalho.
- Função para adicionar idiomas a formulários existentes sem duplicar colunas nem substituir dados.
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
