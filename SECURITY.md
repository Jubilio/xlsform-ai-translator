# Segurança

- Nunca coloque chaves de API em `src/`, `manifest.xml` ou ficheiros enviados ao GitHub.
- Use apenas o ficheiro local `.env`, que está excluído pelo `.gitignore`.
- O backend define `store: false` nos pedidos OpenAI.
- Antes de usar dados humanitários reais, confirme as políticas institucionais de protecção de dados e os termos do provedor escolhido.
- Evite enviar nomes, contactos, coordenadas exactas ou outros dados pessoais. Este suplemento foi desenhado para traduzir texto de questionários, não respostas recolhidas.
