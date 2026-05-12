# Análises + Diário

Aplicação mobile-first para registo manual de análises de sangue, diário alimentar e cruzamento simples entre comportamentos alimentares e evolução dos biomarcadores.

Esta versão tem uma identidade visual mais clara e médica: fundo branco/azul muito suave, cartões limpos, botões arredondados, estados por cor e navegação inferior inspirada numa app mobile clínica.

> Nota importante: a análise de impacto é estatística simples/correlacional. Não substitui validação médica, especialmente em contexto de hemodiálise.

## Vistas incluídas

1. **Inserir Análises**
   - Nome do exame
   - Data e hora da recolha
   - Lista completa de biomarcadores
   - Campo manual para valor de cada biomarcador
   - Configuração manual de referências: suficiente mínimo/máximo e ideal mínimo/máximo

2. **Resumo da Última Análise**
   - Contadores por estado: Fora do intervalo, Suficiente e Ideal
   - Pesquisa por biomarcador
   - Lista com valor, unidade e barra visual de estado
   - Acesso ao detalhe de cada biomarcador

3. **Detalhe do Biomarcador**
   - Nome e descrição
   - Último valor registado
   - Estado do biomarcador
   - Gráfico das últimas 10 entradas
   - Bandas de referência no gráfico

4. **Diário Alimentar**
   - Registo diário Sim/Não
   - Lista inicial de 20 comportamentos alimentares/relacionados com diálise
   - Campo de notas diárias
   - Possibilidade de adicionar novos comportamentos

5. **Impacto dos Comportamentos**
   - Seleção do biomarcador
   - Janela de análise em dias
   - Comparação da média do biomarcador quando o comportamento existiu vs. quando não existiu
   - Resultado positivo/negativo apenas como pista, não como causalidade

6. **Mais / Lista de Biomarcadores**
   - Pesquisa e agrupamento por categoria
   - Acesso às ferramentas de backup
   - Acesso ao template Excel
   - Edição de referências


## Comportamentos iniciais incluídos

A lista inicial foi ajustada para contexto de insuficiência renal com hemodiálise e remove a palavra "Comi", por estar implícita no diário alimentar.

| # | Comportamento | Categoria | Biomarcadores/áreas que pode ajudar a cruzar |
|---:|---|---|---|
| 1 | Peixe | Proteína | Albumina, ureia, fósforo, lípidos |
| 2 | Carne branca | Proteína | Albumina, ureia, fósforo |
| 3 | Carne vermelha | Proteína | Ureia, fósforo, lípidos, ácido úrico |
| 4 | Enchidos ou carnes processadas | Sal / Fósforo | Sódio, fósforo, pressão/retensão hídrica |
| 5 | Marisco | Proteína / Fósforo | Fósforo, ácido úrico, ureia |
| 6 | Ovos ou claras | Proteína | Albumina, ureia, fósforo |
| 7 | Laticínios | Fósforo / Potássio | Fósforo, potássio, cálcio |
| 8 | Iogurtes proteicos | Fósforo / Proteína | Fósforo, ureia, albumina |
| 9 | Leguminosas | Potássio / Fósforo | Potássio, fósforo |
| 10 | Frutos secos ou sementes | Fósforo / Potássio | Fósforo, potássio |
| 11 | Batata, tomate ou espinafres | Potássio | Potássio |
| 12 | Fruta rica em potássio | Potássio | Potássio |
| 13 | Fruta baixa em potássio | Potássio | Potássio, glicemia |
| 14 | Legumes baixos em potássio | Potássio | Potássio, inflamação, lípidos |
| 15 | Alimentos salgados | Sódio / Líquidos | Sódio, sede, retenção hídrica |
| 16 | Refeição fora ou fast-food | Sódio / Fósforo | Sódio, fósforo, lípidos, glicemia |
| 17 | Refrigerantes tipo cola | Fósforo | Fósforo, glicemia |
| 18 | Doces ou pastelaria | Glicemia / Lípidos | Glicemia, HbA1c, triglicéridos |
| 19 | Líquidos acima do limite | Líquidos / Sódio | Retenção hídrica, sódio, pressão arterial |
| 20 | Quelante do fósforo à refeição | Tratamento / Fósforo | Fósforo, cálcio, PTH |

> A lista serve para observação e correlação. Em hemodiálise, os limites de líquidos, potássio, fósforo, sódio, proteína e medicação devem ser sempre ajustados pela equipa clínica/dietista.

## Stack

- React
- Vite
- CSS mobile-first
- Lucide React para ícones
- LocalStorage para persistência inicial
- Exportação/importação JSON para backup

## Como correr localmente

```bash
npm install
npm run dev
```

Depois abrir o endereço indicado pelo Vite.

## Como publicar no GitHub

```bash
git init
git add .
git commit -m "MVP analises e diario alimentar"
git branch -M main
git remote add origin <URL_DO_REPOSITORIO>
git push -u origin main
```

## Ficheiro Excel

O ficheiro Excel incluído é apenas um **template/base de apoio**. A aplicação, nesta fase MVP, guarda os dados no browser através de `localStorage` e permite exportar/importar backup em JSON.

### Onde colocar o Excel no repositório

Foram incluídas duas cópias com finalidades diferentes:

```text
/public/templates/template_base_dados_analises_diario.xlsx
/docs/template_base_dados_analises_diario.xlsx
```

Usa assim:

- `/public/templates/` → para a app conseguir abrir/descarregar o template através do botão **Template Excel**.
- `/docs/` → para documentação do projeto no GitHub.

### Onde colocar o Excel para utilização real

Para uso real com o teu pai, o ficheiro de trabalho não deve viver apenas dentro do GitHub. O ideal é:

1. Carregar o ficheiro para Google Drive ou OneDrive.
2. Guardar uma cópia como ficheiro principal de trabalho.
3. Usar o GitHub apenas como template/referência.
4. Numa fase seguinte, ligar a app ao Google Sheets, OneDrive/Excel Online, Supabase ou Firebase.

Recomendação prática para a próxima fase: converter o Excel em **Google Sheets** e expor as operações através de **Google Apps Script**, porque é simples para MVP e fácil de manter.

## Modelo de dados atual

### `exams`

```json
{
  "id": "uuid",
  "name": "Análises Março 2026",
  "date": "2026-03-11",
  "time": "09:30",
  "values": {
    "fosforo_inorganico": 5.2,
    "potassio": 4.8
  },
  "createdAt": "2026-03-11T09:30:00.000Z"
}
```

### `diary`

```json
{
  "date": "2026-05-11",
  "behaviourId": "peixe",
  "label": "Peixe",
  "value": true
}
```

### `refs`

```json
{
  "fosforo_inorganico": {
    "sufficientMin": "",
    "sufficientMax": "",
    "idealMin": "",
    "idealMax": "",
    "direction": "lower"
  }
}
```

## Próxima evolução recomendada

### Fase 1 — MVP atual

- LocalStorage
- Export/import JSON
- Referências configuráveis manualmente
- Interface mobile-first limpa e médica

### Fase 2 — Base de dados cloud simples

Opção mais simples: Google Sheets via Google Apps Script.

Estrutura sugerida:

- `Biomarcadores`
- `Analises`
- `Resultados_Analises`
- `Comportamentos`
- `Diario_Comportamentos`
- `Referencias`
- `Impacto`

### Fase 3 — Login e multiutilizador

- Firebase Auth ou Supabase Auth
- Base de dados por utilizador
- Backup automático

### Fase 4 — Algoritmo melhorado

- Separar impacto de curto prazo e longo prazo
- Criar janelas por biomarcador
- Exigir número mínimo de observações antes de sugerir impacto
- Mostrar confiança da análise
- Permitir notas de contexto: medicação, diálise, infeções, internamentos, alterações de dieta

## Limitações atuais

- Sem ligação direta ao Google Drive/Excel
- Sem OCR de PDFs de análises
- Sem autenticação
- Sem normalização automática de unidades
- O utilizador deve configurar os intervalos de referência antes de usar a classificação clínica
