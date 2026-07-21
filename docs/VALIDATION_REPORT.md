# Relatório de validação — versão 1.0.0

Data: 21 de Julho de 2026

## Verificações concluídas

- `npm install`: concluído.
- `npm run typecheck`: concluído sem erros TypeScript.
- `npm test`: 2 ficheiros de teste e 3 testes aprovados.
- `npm run build:client`: compilação Webpack concluída.
- `npm run build:server`: compilação do backend concluída.
- `GET /api/health`: resposta correcta.
- `POST /api/translate` com provedor `mock`: resposta correcta e IDs preservados.
- Teste integrado `https://localhost:3000/api/health` através do proxy do Add-in: concluído.
- `manifest.xml`: XML bem formado.
- `examples/sample-xlsform.xlsx`: criado e inspeccionado sem erros de fórmula.

## Validação remota do manifesto

O comando abaixo está configurado:

```bash
npm run validate:manifest
```

Durante a preparação do pacote, o serviço remoto `validationgateway.omex.office.net` não pôde ser alcançado por restrição de DNS/rede do ambiente de execução. Por isso, a validação remota deve ser repetida num computador com acesso à Internet antes da implantação institucional.

## Teste ainda necessário no computador do utilizador

- Abrir o painel dentro do Excel desktop ou Excel para a Web.
- Confirmar a confiança do certificado HTTPS local.
- Fazer o sideload do manifesto.
- Testar com uma cópia de um XLSForm real antes de utilizar em produção.
