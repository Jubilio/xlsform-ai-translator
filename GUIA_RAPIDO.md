# Guia rápido — XLSForm AI Translator

## Primeira instalação no Windows

1. Extraia o ZIP para uma pasta normal, por exemplo `Documentos\xlsform-ai-translator`.
2. Instale o Node.js 20 ou superior.
3. Execute `INSTALL_WINDOWS.bat`.
4. Abra `.env` e mantenha `TRANSLATION_PROVIDER=mock` para o primeiro teste, ou configure uma chave de API.
5. Execute `RUN_WINDOWS.bat` e mantenha a janela aberta.
6. Execute `SIDELOAD_EXCEL_WINDOWS.bat` para abrir o Add-in no Excel.

## Primeiro teste

1. Abra `examples\sample-xlsform.xlsx`.
2. No separador **Base/Home**, clique em **Traduzir XLSForm**.
3. Escolha `English` como origem e `Portuguese` como destino.
4. Clique em **Analisar estrutura**.
5. Clique em **Traduzir XLSForm**.
6. Reveja as traduções e clique em **Aplicar traduções**.

No modo de demonstração, frases reconhecidas são traduzidas e as restantes ficam marcadas com `[DEMO PT]`.

## Utilização diária

1. Inicie o projecto com `RUN_WINDOWS.bat`.
2. Abra o seu XLSForm no Excel.
3. Abra o painel do Add-in.
4. Traduza uma selecção ou as folhas `survey` e `choices`.
5. Reveja sempre os avisos antes de aplicar.
6. Guarde uma cópia do XLSForm antes de publicar no KoboToolbox.

## Encerrar

- Feche a janela de `RUN_WINDOWS.bat` com `Ctrl+C`.
- Execute `STOP_EXCEL_WINDOWS.bat` para remover a sessão de sideload.
