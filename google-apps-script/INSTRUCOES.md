# Atualização do Google Apps Script

Estes dois ficheiros devem ser colocados no projeto Apps Script já ligado ao Google Sheets do Meu Diário.

## 1. Atualizar os ficheiros

1. Abrir **Extensões → Apps Script** no Google Sheets.
2. Abrir o ficheiro atual `Code.gs` e substituir todo o conteúdo pelo novo `Code.gs`.
3. Criar um novo ficheiro de script chamado `BehaviorAnalysis.gs`.
4. Colar nesse ficheiro todo o conteúdo de `BehaviorAnalysis.gs` entregue neste pacote.

## 2. Configurar as propriedades

Em **Definições do projeto → Propriedades do script**, adicionar:

- `OPENAI_API_KEY`: chave do projeto OpenAI.
- `OPENAI_MODEL`: `gpt-5.6-sol` — opcional; este já é o valor predefinido.
- `AI_DAILY_LIMIT`: `10` — opcional; máximo global de análises por dia.

Não colocar a chave da OpenAI no GitHub, no React ou em `cloudConfig.js`.

## 3. Publicar a versão

1. Escolher **Implementar → Gerir implementações**.
2. Editar a implementação atual através do ícone do lápis.
3. Em **Versão**, selecionar **Nova versão**.
4. Clicar em **Implementar**.

Ao atualizar a implementação existente, o URL `/exec` mantém-se igual e não é necessário alterar `src/cloudConfig.js`.

## Alterações já integradas

- Nova ação `createBehaviorAnalysis` no router de `Code.gs`.
- Análise de 30 dias, separada por biomarcador fora do intervalo.
- Validação estruturada da resposta da OpenAI.
- Limite diário configurável.
- Preservação de `OPENAI_API_KEY`: as chamadas existentes a `setProperties` deixaram de apagar as restantes propriedades do projeto.
