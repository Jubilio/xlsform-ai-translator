# XLSForm AI Translator

Suplemento do Microsoft Excel para traduzir questionários Kobo/XLSForm sem alterar códigos, fórmulas, nomes de variáveis ou placeholders.

## O que está incluído

- Tradução da selecção actual.
- Tradução automática das folhas `survey` e `choices`.
- Criação de colunas como `label::Portuguese`, sem apagar `label::English`.
- Protecção de `${variáveis}`, HTML, URLs e quebras de linha.
- Preservação de fórmulas e formatação.
- Pré-visualização editável antes de aplicar.
- Glossário humanitário Inglês–Português.
- Registo oculto `_translation_log`.
- Backend seguro compatível com OpenAI, DeepL e Microsoft Translator.
- Modo `mock`, para testar sem chave de API.
- Testes automáticos e exemplo de XLSForm.

## Requisitos

- Windows 10/11, macOS ou Excel para a Web.
- Microsoft Excel com suporte a Office Add-ins.
- Node.js 20 ou superior; Node.js 22 é recomendado.
- VS Code é recomendado, mas não obrigatório.

## Instalação rápida

### 1. Descompactar e abrir o projecto

```powershell
cd xlsform-ai-translator
```

### 2. Instalar dependências

```powershell
npm install
```

### 3. Criar o ficheiro de configuração

No PowerShell:

```powershell
Copy-Item .env.example .env
```

No Prompt de Comando:

```cmd
copy .env.example .env
```

O projecto começa com:

```env
TRANSLATION_PROVIDER=mock
```

Este modo não usa a Internet nem uma chave e serve para validar o funcionamento.

### 4. Criar e confiar no certificado HTTPS local

```powershell
npm run certs
```

No Windows, instale-o no repositório de confiança do utilizador:

```powershell
npm run trust:cert:windows
```

No macOS, abra `certs/localhost.crt` no Keychain Access e marque-o como confiável para SSL.

### 5. Iniciar o painel e o backend

```powershell
npm run dev
```

Mantenha este terminal aberto. O painel ficará em `https://localhost:3000` e o backend em `http://localhost:3001`.

### 6. Abrir o suplemento no Excel

Num segundo terminal:

```powershell
npm run sideload
```

O Excel deverá abrir e mostrar o botão **Traduzir XLSForm** no separador **Base/Home**.

Para encerrar a sessão de sideload:

```powershell
npm run stop
```

## Instalação manual no Excel para a Web

1. Abra um ficheiro no Excel para a Web.
2. Seleccione **Base/Home > Add-ins > More Add-ins**.
3. Abra **My Add-ins**.
4. Escolha **Upload My Add-in**.
5. Seleccione `manifest.xml`.
6. Abra o painel **Traduzir XLSForm**.

O servidor local (`npm run dev`) deve continuar activo.

## Configurar um provedor real

Edite `.env` e escolha apenas um provedor padrão.

### OpenAI

```env
TRANSLATION_PROVIDER=openai
OPENAI_API_KEY=coloque_a_chave_aqui
OPENAI_MODEL=gpt-5-mini
```

A chave é utilizada apenas pelo backend. Pode mudar `OPENAI_MODEL` para qualquer modelo compatível disponível na sua conta.

### DeepL

```env
TRANSLATION_PROVIDER=deepl
DEEPL_API_KEY=coloque_a_chave_aqui
DEEPL_API_URL=https://api-free.deepl.com/v2/translate
```

Para uma conta Pro, use `https://api.deepl.com/v2/translate`.

### Microsoft Translator

```env
TRANSLATION_PROVIDER=microsoft
AZURE_TRANSLATOR_KEY=coloque_a_chave_aqui
AZURE_TRANSLATOR_REGION=sua_regiao_azure
```

Depois de editar `.env`, reinicie `npm run dev`.

## Como utilizar

### Traduzir células seleccionadas

1. Seleccione uma célula ou intervalo com texto.
2. Escolha o idioma de origem e destino.
3. Clique em **Traduzir selecção**.
4. Reveja as propostas.
5. Clique em **Aplicar traduções**.

A tradução substitui o texto nas células seleccionadas, mas não altera a formatação. Fórmulas, números e células vazias são ignorados.

### Traduzir um XLSForm completo

1. Abra o ficheiro XLSForm.
2. Escolha, por exemplo, `English` → `Portuguese`.
3. Mantenha `survey` e `choices` seleccionadas.
4. Clique em **Analisar estrutura** para ver quantas células serão processadas.
5. Clique em **Traduzir XLSForm**.
6. Reveja e edite as traduções.
7. Clique em **Aplicar traduções**.

Exemplo:

```text
label::English  ->  label::Portuguese
hint::English   ->  hint::Portuguese
```

Se a coluna de destino não existir, é criada no fim da folha. Se já existir, por padrão apenas as células vazias são preenchidas.

## Colunas traduzidas automaticamente

- `label::<idioma>`
- `hint::<idioma>`
- `guidance_hint::<idioma>`
- `required_message::<idioma>`
- `constraint_message::<idioma>`

## Elementos que nunca são traduzidos automaticamente

- `type`
- `name`
- `list_name`
- `relevant`
- `constraint`
- `calculation`
- `choice_filter`
- `appearance`
- `repeat_count`
- `default`
- `parameters`
- `bind::*`
- `instance::*`
- fórmulas iniciadas por `=`

## Protecção de conteúdo interno

Antes de enviar um texto ao provedor, o suplemento protege elementos como:

```text
${household_name}
<b>Important</b>
https://example.org
\n
```

Depois da tradução, estes elementos são repostos e validados. Qualquer diferença aparece como aviso na pré-visualização e no `_translation_log`.

## Testar com o exemplo

Abra:

```text
examples/sample-xlsform.xlsx
```

No modo `mock`, algumas frases comuns são traduzidas e as restantes recebem o prefixo `[DEMO PT]`, indicando claramente que não são traduções finais.

## Verificação técnica

```powershell
# A validação do manifesto descarrega a ferramenta Microsoft apenas quando necessária.
npm run validate:manifest
npm run typecheck
npm test
npm run build
```

## Limitações da versão 1.0

- O glossário incorporado é mais completo para Inglês → Português.
- DeepL e Microsoft Translator podem não suportar todos os idiomas apresentados.
- O suplemento traduz a estrutura do questionário, não deve ser utilizado para enviar respostas pessoais ou dados sensíveis a serviços externos.
- Em folhas muito grandes, recomenda-se traduzir por blocos e rever os custos da API.

## Publicação institucional

Para uso interno na REACH/ACTED ou noutra organização:

1. Aloje `dist/` e o backend num domínio HTTPS institucional.
2. Substitua todas as ocorrências de `https://localhost:3000` no `manifest.xml` pelo domínio real.
3. Guarde as chaves num secret manager ou variáveis de ambiente do servidor.
4. Valide o manifesto.
5. Faça implantação centralizada pelo Microsoft 365 Admin Center.
6. Conclua uma revisão de protecção de dados antes de disponibilizar o Add-in.

Consulte também `SECURITY.md`, `docs/ARCHITECTURE.md` e `docs/TROUBLESHOOTING.md`.
