# Arquitectura

```text
Excel / Office.js (HTTPS localhost:3000)
             |
             | POST /api/translate
             v
Backend Node.js/Express (localhost:3001)
             |
             +-- OpenAI Responses API
             +-- DeepL API
             +-- Microsoft Translator
             +-- Mock local
```

## Princípios de segurança do XLSForm

1. Apenas células de texto são enviadas para tradução.
2. Fórmulas iniciadas por `=` são ignoradas.
3. No modo XLSForm, apenas `label`, `hint`, `guidance_hint`, `required_message` e `constraint_message` com sufixo de idioma são processados.
4. Cabeçalhos lógicos como `name`, `type`, `constraint`, `relevant`, `calculation`, `choice_filter`, `bind::*` e `instance::*` não são traduzidos.
5. `${variáveis}`, tags HTML, URLs, entidades HTML e sequências `\\n` são substituídas temporariamente por tokens protegidos.
6. A escrita é feita somente nas células de destino; a formatação é copiada quando uma nova coluna linguística é criada.
7. Todas as alterações são registadas numa folha oculta `_translation_log`.
