# Resolução de problemas

## O painel mostra erro de ligação ao backend

Confirme que `npm run dev` está activo e que `http://localhost:3001/api/health` devolve JSON.

## Erro de certificado

Execute novamente:

```bash
npm run certs
```

Feche e reabra o Excel. No Windows, confirme que aceitou instalar o certificado de desenvolvimento.

## O Add-in não aparece

1. Execute `npm run validate:manifest`.
2. Pare sessões antigas com `npm run stop`.
3. Execute `npm run sideload` novamente.
4. No Excel Web, carregue manualmente o `manifest.xml` em **Add-ins > My Add-ins > Upload My Add-in**.

## A tradução altera um placeholder

Não aplique a tradução quando existir aviso na pré-visualização. Edite o texto para restaurar exactamente o placeholder ou mantenha a célula original.

## DeepL não aceita um idioma

Nem todos os idiomas do painel são suportados por todos os provedores. Use OpenAI, Microsoft Translator ou remova o idioma do painel conforme a necessidade.
