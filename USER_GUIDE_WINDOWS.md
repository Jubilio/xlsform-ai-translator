# XLSForm AI Translator — Guia do Utilizador no Windows

Este guia explica como instalar e utilizar o **XLSForm AI Translator** no Microsoft Excel para Windows usando a versão hospedada no Render.

A versão hospedada não exige Node.js, servidor local, certificados locais ou comandos de desenvolvimento. O Excel carrega directamente o Add-in a partir de:

```text
https://xlsform-ai-translator.onrender.com
```

## 1. Antes de começar

Confirme que tem:

- Windows 10 ou Windows 11;
- Microsoft Excel 2016 ou posterior, preferencialmente Microsoft 365;
- acesso à Internet;
- o ficheiro `manifest.production.xml`;
- permissão para instalar Add-ins personalizados ou configurar um catálogo confiável.

## 2. Confirmar que o serviço está disponível

Antes de instalar o Add-in, abra estes endereços no navegador:

```text
https://xlsform-ai-translator.onrender.com/api/health
```

O resultado esperado é:

```json
{"ok":true,"service":"xlsform-ai-translator"}
```

Depois abra:

```text
https://xlsform-ai-translator.onrender.com/taskpane.html
```

O painel deve aparecer no navegador. No plano gratuito do Render, o primeiro carregamento após um período de inactividade pode demorar alguns segundos.

## 3. Instalar no Excel para a Web

Quando a opção estiver disponível:

1. Abra um ficheiro no Excel para a Web.
2. Vá a **Home > Add-ins > More Add-ins**.
3. Abra **My Add-ins**.
4. Seleccione **Upload My Add-in**.
5. Escolha `manifest.production.xml`.
6. Clique em **Upload**.
7. Abra o painel **Traduzir XLSForm**.

## 4. Instalar no Excel Desktop através de um Trusted Add-in Catalog

Use este método quando o Excel Desktop não mostrar **Upload My Add-in**.

### 4.1 Criar uma pasta para o manifesto

Crie:

```text
C:\OfficeAddins
```

Copie para essa pasta:

```text
manifest.production.xml
```

### 4.2 Partilhar a pasta

No Explorador de Ficheiros:

1. Clique com o botão direito em `C:\OfficeAddins`.
2. Seleccione **Properties**.
3. Abra **Sharing**.
4. Clique em **Advanced Sharing**.
5. Marque **Share this folder**.
6. Use o nome `OfficeAddins`.

Para saber o nome do computador, execute no PowerShell:

```powershell
hostname
```

O caminho partilhado ficará semelhante a:

```text
\\NOME-DO-PC\OfficeAddins
```

Teste esse caminho no Explorador de Ficheiros antes de continuar.

### 4.3 Registar o catálogo no Excel

No Excel em inglês:

```text
File
> Options
> Trust Center
> Trust Center Settings
> Trusted Add-in Catalogs
```

Em **Catalog Url**, introduza:

```text
\\NOME-DO-PC\OfficeAddins
```

Depois:

1. Clique em **Add catalog**.
2. Marque **Show in Menu**.
3. Clique em **OK**.
4. Feche completamente o Excel.
5. Abra novamente o Excel.

### 4.4 Adicionar o Add-in

No Excel:

```text
Home
> Add-ins
> More Add-ins
> Shared Folder
```

Seleccione **XLSForm AI Translator** e clique em **Add**.

O botão deverá aparecer em:

```text
Home > XLSForm > Traduzir XLSForm
```

## 5. Abrir o Add-in

1. Abra o ficheiro Excel ou XLSForm.
2. Vá ao separador **Home**.
3. Procure o grupo **XLSForm**.
4. Clique em **Traduzir XLSForm**.

O painel lateral será aberto.

## 6. Traduzir um XLSForm

O modo **Traduzir XLSForm** reconhece automaticamente colunas como:

```text
label::English
hint::English
guidance_hint::English
required_message::English
constraint_message::English
```

### Procedimento

1. Escolha o idioma de origem.
2. Escolha o idioma de destino.
3. Seleccione as folhas `survey`, `choices` e, quando necessário, `settings`.
4. Mantenha **Usar glossário humanitário** seleccionado quando aplicável.
5. Clique em **Analisar estrutura** para rever o número de colunas e células elegíveis.
6. Clique em **Traduzir XLSForm**.
7. Reveja as traduções propostas.
8. Clique em **Aplicar traduções**.

### Quando a coluna de destino não existe

O Add-in cria automaticamente, por exemplo:

```text
label::Portuguese
```

A nova coluna é criada no fim da folha e recebe a formatação da coluna de origem.

### Quando a coluna de destino já existe

Por padrão:

- apenas células vazias são preenchidas;
- traduções existentes são preservadas;
- fórmulas não são substituídas.

Marque **Substituir traduções existentes** apenas quando pretender voltar a traduzir células já preenchidas.

## 7. Traduzir uma selecção comum do Excel

O botão **Traduzir selecção** funciona também em tabelas que não sejam XLSForm.

1. Seleccione uma célula ou intervalo com texto.
2. Escolha o idioma de origem e destino.
3. Clique em **Traduzir selecção**.
4. Reveja as traduções.
5. Clique em **Aplicar traduções**.

A tradução é escrita num bloco equivalente imediatamente à direita da selecção. O conteúdo original permanece intacto.

Exemplos:

```text
Selecção: A2:A10
Destino:  B2:B10
```

```text
Selecção: A2:C10
Destino:  D2:F10
```

Se o bloco de destino já contiver dados, o Add-in interrompe a operação para evitar sobrescrita. Fórmulas, números e células vazias são ignorados.

## 8. Conteúdo protegido

O Add-in protege automaticamente:

```text
${variaveis}
<html>
URLs
quebras de linha
fórmulas
```

Também não traduz automaticamente colunas de lógica como:

```text
type
name
list_name
relevant
constraint
calculation
choice_filter
appearance
default
bind::*
instance::*
```

## 9. Registo de traduções

Depois de aplicar traduções, o Add-in cria ou actualiza uma folha oculta chamada:

```text
_translation_log
```

Ela guarda:

- data e hora;
- folha e célula;
- idioma de origem e destino;
- provedor utilizado;
- texto original;
- tradução;
- avisos de validação.

## 10. Problemas comuns

### O Add-in mostra “Sorry, we can’t load the add-in”

1. Abra primeiro:

```text
https://xlsform-ai-translator.onrender.com/api/health
```

2. Espere o serviço responder.
3. Feche e abra novamente o painel.
4. Confirme que instalou `manifest.production.xml`, e não `manifest.xml`.

O ficheiro `manifest.xml` é apenas para desenvolvimento local com `localhost`.

### O botão do Add-in não aparece

1. Feche todas as janelas do Excel.
2. Confirme que o catálogo está marcado como **Show in Menu**.
3. Abra novamente:

```text
Home > Add-ins > More Add-ins > Shared Folder
```

4. Volte a adicionar o Add-in.

### O Excel continua a mostrar uma versão antiga

No Excel:

```text
File
> Options
> Trust Center
> Trust Center Settings
> Trusted Add-in Catalogs
```

Marque a opção para limpar a cache dos Web Add-ins no próximo arranque, quando disponível.

Também pode fechar o Excel e executar:

```powershell
taskkill /F /IM EXCEL.EXE
Remove-Item "$env:LOCALAPPDATA\Microsoft\Office\16.0\Wef\*" -Recurse -Force -ErrorAction SilentlyContinue
```

Depois abra novamente o Excel e adicione o Add-in.

### O Add-in mostra um erro antigo de debugging

Não abra ficheiros temporários chamados:

```text
Excel add-in <ID>.xlsx
Excel add-in <ID>.1.xlsx
Excel add-in <ID>.2.xlsx
```

Esses ficheiros pertencem ao modo de desenvolvimento local.

Para a versão hospedada, use apenas `manifest.production.xml`.

## 11. Actualizações

Quando o código é actualizado no GitHub, o Render faz um novo deploy automaticamente.

Normalmente não é necessário reinstalar o manifesto se:

- o domínio continuar igual;
- o ID do Add-in não mudar;
- os URLs do manifesto permanecerem iguais.

Feche e volte a abrir o painel para carregar a nova versão. Se o Excel mantiver uma versão antiga, limpe a cache dos Web Add-ins.

## 12. Segurança e uso responsável

- Não inclua chaves de API no manifesto ou no Excel.
- Não publique chaves no GitHub.
- Evite enviar dados pessoais ou sensíveis de beneficiários para serviços externos.
- Use o Add-in principalmente para traduzir questionários, labels, hints e conteúdos não pessoais.
- Reveja sempre as traduções antes de as aplicar.

## 13. Desenvolvimento local opcional

A versão hospedada no Render é recomendada para utilizadores finais. Para desenvolvimento local no Windows, consulte o `README.md` principal e utilize:

```powershell
npm install
Copy-Item .env.example .env
npm run certs
npm run trust:cert:windows
npm run dev
```

Noutro terminal:

```powershell
npm run sideload
```

O desenvolvimento local usa `manifest.xml`; a versão hospedada usa `manifest.production.xml`.
