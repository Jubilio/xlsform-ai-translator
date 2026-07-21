# Deploy gratuito no Render

Este projecto pode hospedar o painel do Excel e o backend de tradução no mesmo serviço Render.

## 1. Preparar o repositório local

```powershell
git pull
npm ci
npm run typecheck
npm test
npm run build
```

## 2. Criar o serviço no Render

1. Entre no Render e escolha **New > Blueprint**.
2. Ligue a sua conta GitHub.
3. Seleccione o repositório `Jubilio/xlsform-ai-translator`.
4. O Render detectará o ficheiro `render.yaml`.
5. Confirme a criação do serviço gratuito.

O serviço utiliza:

```text
Build command: npm ci && npm run build
Start command: npm start
Health check: /api/health
```

## 3. Configurar o provedor de tradução

No painel do serviço Render, abra **Environment**.

### DeepL Free

```env
TRANSLATION_PROVIDER=deepl
DEEPL_API_KEY=SUA_CHAVE
DEEPL_API_URL=https://api-free.deepl.com/v2/translate
```

### DeepL Pro

```env
TRANSLATION_PROVIDER=deepl
DEEPL_API_KEY=SUA_CHAVE
DEEPL_API_URL=https://api.deepl.com/v2/translate
```

### OpenAI

```env
TRANSLATION_PROVIDER=openai
OPENAI_API_KEY=SUA_CHAVE
OPENAI_MODEL=gpt-5-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

Nunca coloque chaves no GitHub, no `manifest.xml` ou no frontend.

## 4. Testar o deploy

O Render fornecerá um endereço semelhante a:

```text
https://xlsform-ai-translator.onrender.com
```

Teste:

```text
https://SEU-ENDERECO.onrender.com/api/health
https://SEU-ENDERECO.onrender.com/taskpane.html
https://SEU-ENDERECO.onrender.com/assets/icon-32.png
```

O endpoint de saúde deve devolver `ok: true`.

## 5. Gerar o manifesto de produção

Na pasta do projecto, execute:

```powershell
npm run manifest:production -- https://SEU-ENDERECO.onrender.com
npm run validate:manifest:production
```

Isso cria:

```text
manifest.production.xml
```

O manifesto local `manifest.xml` continua a apontar para `localhost` e permanece disponível para desenvolvimento.

## 6. Instalar o Add-in hospedado

Use `manifest.production.xml` para distribuição interna ou carregamento manual no Excel. Depois de instalado, o Add-in deixa de depender de:

- `npm run dev`;
- certificado localhost;
- sideload de debugging;
- computador local ligado como servidor.

## 7. Actualizações

Cada `git push` para `main` inicia um novo deploy automático no Render. O manifesto não precisa ser reinstalado enquanto o domínio e o ID do Add-in permanecerem iguais.

## Limitações do plano gratuito

O serviço pode entrar em suspensão após inactividade. A primeira abertura ou tradução depois desse período pode demorar mais enquanto o serviço inicia novamente.
