const MANUAL_CONFIG = {
  SPREADSHEET_ID: '120gDvisK4sIB8JTA61pjGsAyk4sHEKaxOPDgYEq-Kq0',
  APP_TOKEN: 'meudiario-2026-token'
}

const DATA_VERSION_ATUAL = '2026-05-25-correcao-final'

const SHEET_NAMES = {
  ANALISES: 'Analises',
  RESULTADOS: 'Resultados',
  DIARIO: 'Diario',
  COMPORTAMENTOS: 'Comportamentos',
  REFERENCIAS: 'Referencias',
  CONFIG: 'Config'
}

const HEADERS = {
  Analises: ['id', 'nome', 'data', 'hora', 'criadoEm'],
  Resultados: ['analiseId', 'biomarcadorId', 'valor'],
  Diario: ['data', 'comportamentoId', 'comportamento', 'valor', 'nota'],
  Comportamentos: ['id', 'etiqueta', 'categoria'],
  Referencias: ['biomarcadorId', 'refMin', 'refMax', 'alvoMin', 'alvoMax', 'direcao'],
  Config: ['chave', 'valor']
}

const APP_BIOMARCADORES = [
  'hemoglobina',
  'eritrocitos',
  'hematocrito',
  'vgm',
  'hgm',
  'cmhg',
  'rdw',
  'leucocitos',
  'neutrofilos',
  'eosinofilos',
  'basofilos',
  'linfocitos',
  'monocitos',
  'plaquetas',
  'ureia_pre_dialise',
  'ureia_pos_dialise',
  'alanina_aminotransferase',
  'potassio',
  'calcio_total',
  'fosforo_inorganico',
  'paratormona_pth',
  'ferro_serico',
  'capacidade_fixacao_ferro',
  'proteina_c_reactiva',
  'albumina',
  'creatininemia',
  'proteinas_totais',
  'fosfatase_alcalina',
  'sodio',
  'magnesio',
  'trigliceridos',
  'acido_urico',
  'hemoglobina_glicada',
  'glicemia_media_estimada',
  'psa_total',
  'psa_livre',
  'ratio_psa_l',
  'ferritina'
]

const BIOMARCADOR_ALIASES = {
  eritrócitos: 'eritrocitos',
  eritrocitos: 'eritrocitos',
  potássio: 'potassio',
  potassio: 'potassio',
  cálcio_total: 'calcio_total',
  calcio_total: 'calcio_total',
  fósforo_inorganico: 'fosforo_inorganico',
  fósforo_inorgânico: 'fosforo_inorganico',
  fosforo_inorgânico: 'fosforo_inorganico',
  fosforo_inorganico: 'fosforo_inorganico',
  proteína_c_reactiva: 'proteina_c_reactiva',
  proteina_c_reactiva: 'proteina_c_reactiva',
  alanina_aminotransferase: 'alanina_aminotransferase',
  paratormona_pth: 'paratormona_pth',
  ureia_pre_dialise: 'ureia_pre_dialise',
  ureia_pos_dialise: 'ureia_pos_dialise'
}

const REFERENCIAS_PADRAO = {
  hemoglobina: { refMin: 13, refMax: 17, alvoMin: '', alvoMax: '', direcao: 'range' },
  eritrocitos: { refMin: 4.5, refMax: 5.5, alvoMin: '', alvoMax: '', direcao: 'range' },
  hematocrito: { refMin: 40, refMax: 50, alvoMin: '', alvoMax: '', direcao: 'range' },
  vgm: { refMin: 83, refMax: 101, alvoMin: '', alvoMax: '', direcao: 'range' },
  hgm: { refMin: 27, refMax: 32, alvoMin: '', alvoMax: '', direcao: 'range' },
  cmhg: { refMin: 31.5, refMax: 34.5, alvoMin: '', alvoMax: '', direcao: 'range' },
  rdw: { refMin: 15.7, refMax: 16.7, alvoMin: '', alvoMax: '', direcao: 'range' },
  leucocitos: { refMin: 4, refMax: 10, alvoMin: '', alvoMax: '', direcao: 'range' },
  neutrofilos: { refMin: 2, refMax: 7, alvoMin: '', alvoMax: '', direcao: 'range' },
  eosinofilos: { refMin: 0.02, refMax: 0.5, alvoMin: '', alvoMax: '', direcao: 'range' },
  basofilos: { refMin: 0.01, refMax: 0.1, alvoMin: '', alvoMax: '', direcao: 'range' },
  linfocitos: { refMin: 1, refMax: 3, alvoMin: '', alvoMax: '', direcao: 'range' },
  monocitos: { refMin: 0.2, refMax: 1, alvoMin: '', alvoMax: '', direcao: 'range' },
  plaquetas: { refMin: 150, refMax: 400, alvoMin: '', alvoMax: '', direcao: 'range' },
  ureia_pre_dialise: { refMin: 50, refMax: '', alvoMin: '', alvoMax: '', direcao: 'higher' },
  ureia_pos_dialise: { refMin: 50, refMax: '', alvoMin: '', alvoMax: '', direcao: 'higher' },
  alanina_aminotransferase: { refMin: 10, refMax: 49, alvoMin: '', alvoMax: '', direcao: 'range' },
  potassio: { refMin: 3.5, refMax: 5.5, alvoMin: '', alvoMax: '', direcao: 'range' },
  calcio_total: { refMin: 8.7, refMax: 10.4, alvoMin: '', alvoMax: '', direcao: 'range' },
  fosforo_inorganico: { refMin: 2.4, refMax: 5.5, alvoMin: '', alvoMax: '', direcao: 'range' },
  paratormona_pth: { refMin: 18, refMax: 80, alvoMin: '', alvoMax: '', direcao: 'range' },
  ferro_serico: { refMin: 65, refMax: 175, alvoMin: '', alvoMax: '', direcao: 'range' },
  capacidade_fixacao_ferro: { refMin: 250, refMax: 450, alvoMin: '', alvoMax: '', direcao: 'range' },
  proteina_c_reactiva: { refMin: 0.05, refMax: 1, alvoMin: '', alvoMax: '', direcao: 'range' },
  albumina: { refMin: 3.3, refMax: 5, alvoMin: '', alvoMax: '', direcao: 'range' },
  creatininemia: { refMin: 0.7, refMax: 1.3, alvoMin: '', alvoMax: '', direcao: 'range' },
  proteinas_totais: { refMin: 5.7, refMax: 8.2, alvoMin: '', alvoMax: '', direcao: 'range' },
  fosfatase_alcalina: { refMin: 38, refMax: 129, alvoMin: '', alvoMax: '', direcao: 'range' },
  sodio: { refMin: 135, refMax: 145, alvoMin: '', alvoMax: '', direcao: 'range' },
  magnesio: { refMin: 1.6, refMax: 2.6, alvoMin: '', alvoMax: '', direcao: 'range' },
  trigliceridos: { refMin: '', refMax: 150, alvoMin: '', alvoMax: '', direcao: 'lower' },
  acido_urico: { refMin: 3.7, refMax: 9.2, alvoMin: '', alvoMax: '', direcao: 'range' },
  hemoglobina_glicada: { refMin: 3.4, refMax: 7, alvoMin: '', alvoMax: '', direcao: 'range' },
  glicemia_media_estimada: { refMin: '', refMax: 117, alvoMin: '', alvoMax: '', direcao: 'lower' },
  psa_total: { refMin: '', refMax: 4, alvoMin: '', alvoMax: '', direcao: 'lower' },
  ferritina: { refMin: 30, refMax: 340, alvoMin: '', alvoMax: '', direcao: 'range' }
}

/**
 * Executar primeiro para validar ID/token e guardar propriedades.
 */
function configurarPropriedades() {
  validarConfiguracaoManual_()

  PropertiesService.getScriptProperties().setProperties({
    SPREADSHEET_ID: MANUAL_CONFIG.SPREADSHEET_ID,
    APP_TOKEN: MANUAL_CONFIG.APP_TOKEN
  }, false)

  Logger.log('Propriedades configuradas com sucesso.')
  return 'Propriedades configuradas com sucesso.'
}

/**
 * Executar para criar/validar folhas e cabeçalhos.
 */
function setup() {
  ensureSheets_()
  return 'Estrutura criada/validada no Google Sheets.'
}

/**
 * Executar agora para corrigir referências, normalizar IDs e diagnosticar a análise de 07/05/2026.
 */
function corrigirTudoAgora() {
  ensureSheets_()
  normalizarIdsBiomarcadoresNasFolhas()
  corrigirReferenciasDefinitivo()
  const diagnostico = diagnosticarCorrespondenciaBiomarcadoresMaio2026()

  Logger.log('Correção geral concluída.')
  Logger.log(JSON.stringify(diagnostico, null, 2))

  return diagnostico
}

function doGet(e) {
  return route_(e, 'GET')
}

function doPost(e) {
  return route_(e, 'POST')
}

function route_(e, method) {
  try {
    const action = getAction_(e, method)
    const token = getToken_(e, method)

    if (action === 'ping') {
      return output_({
        ok: true,
        message: 'Meu Diário API ativa',
        at: new Date().toISOString()
      }, e)
    }

    requireToken_(token)

    if (action === 'createBehaviorAnalysis') {
      const body = parseBody_(e)
      const result = createBehaviorAnalysis_(body.data || {})

      return output_(result, e)
    }

    if (action === 'setup') {
      ensureSheets_()
      return output_({ ok: true, message: 'Estrutura criada/validada no Google Sheets.' }, e)
    }

    if (action === 'getAllData') {
      ensureSheets_()
      return output_({ ok: true, data: readAllData_() }, e)
    }

    if (action === 'saveAllData') {
      const body = parseBody_(e)
      const payload = body.data || {}

      ensureSheets_()

      const currentVersion = String(getConfigValue_('dataVersion') || '').trim()
      const clientVersion = String(payload.dataVersion || body.dataVersion || '').trim()

      if (currentVersion && clientVersion !== currentVersion) {
        return output_({
          ok: false,
          blocked: true,
          error: 'Gravação bloqueada: a app tem dados antigos ou não enviou dataVersion. Primeiro carrega dados da cloud.',
          currentVersion: currentVersion,
          clientVersion: clientVersion || '(vazio)'
        }, e)
      }

      payload.dataVersion = currentVersion || payload.dataVersion || DATA_VERSION_ATUAL
      saveAllData_(payload)

      return output_({
        ok: true,
        message: 'Dados guardados no Google Sheets.',
        savedAt: new Date().toISOString(),
        dataVersion: payload.dataVersion
      }, e)
    }

    if (action === 'diagnosticarMaio2026') {
      return output_({ ok: true, data: diagnosticarCorrespondenciaBiomarcadoresMaio2026() }, e)
    }

    if (action === 'corrigirReferencias') {
      corrigirReferenciasDefinitivo()
      return output_({ ok: true, message: 'Referências corrigidas.' }, e)
    }

    return output_({ ok: false, error: 'Ação não reconhecida: ' + action }, e)
  } catch (error) {
    return output_({ ok: false, error: error.message || String(error) }, e)
  }
}

function getAction_(e, method) {
  if (method === 'GET') {
    return e && e.parameter && e.parameter.action ? e.parameter.action : 'getAllData'
  }

  const body = parseBody_(e)

  return body.action ||
    (e && e.parameter && e.parameter.action ? e.parameter.action : 'saveAllData')
}

function getToken_(e, method) {
  if (method === 'GET') {
    return e && e.parameter && e.parameter.token ? e.parameter.token : ''
  }

  const body = parseBody_(e)

  return body.token ||
    (e && e.parameter && e.parameter.token ? e.parameter.token : '')
}

function parseBody_(e) {
  if (e && e.parameter && e.parameter.payload) {
    try {
      return JSON.parse(e.parameter.payload)
    } catch (error) {
      throw new Error('Payload JSON inválido.')
    }
  }

  if (!e || !e.postData || !e.postData.contents) return {}

  const contents = String(e.postData.contents || '')

  try {
    return JSON.parse(contents)
  } catch (error) {
    const parsed = parseFormEncoded_(contents)

    if (parsed.payload) {
      try {
        return JSON.parse(parsed.payload)
      } catch (payloadError) {
        throw new Error('Payload JSON inválido.')
      }
    }

    return parsed
  }
}

function parseFormEncoded_(text) {
  const result = {}

  String(text || '').split('&').forEach((part) => {
    if (!part) return

    const pieces = part.split('=')
    const key = decodeURIComponent((pieces[0] || '').replace(/\+/g, ' '))
    const value = decodeURIComponent((pieces.slice(1).join('=') || '').replace(/\+/g, ' '))

    if (key) result[key] = value
  })

  return result
}

function requireToken_(token) {
  const expected = String(getAppToken_() || '').trim()
  const received = String(token || '').trim()

  if (!expected) throw new Error('APP_TOKEN não configurado.')
  if (received !== expected) throw new Error('Token inválido.')
}

function getAppToken_() {
  const token = String(MANUAL_CONFIG.APP_TOKEN || '').trim()

  if (!token) {
    throw new Error('APP_TOKEN não configurado no MANUAL_CONFIG.')
  }

  PropertiesService.getScriptProperties().setProperty('APP_TOKEN', token)
  return token
}

function spreadsheet_() {
  const id = String(MANUAL_CONFIG.SPREADSHEET_ID || '').trim()
  const token = String(MANUAL_CONFIG.APP_TOKEN || '').trim()

  if (!id || id === 'COLA_AQUI_O_ID_REAL_DO_GOOGLE_SHEETS') {
    throw new Error('SPREADSHEET_ID inválido. Cola o ID real do Google Sheets no início do Código.gs.')
  }

  PropertiesService.getScriptProperties().setProperties({
    SPREADSHEET_ID: id,
    APP_TOKEN: token
  }, false)

  return SpreadsheetApp.openById(id)
}

function validarConfiguracaoManual_() {
  if (!MANUAL_CONFIG.SPREADSHEET_ID) {
    throw new Error('Tens de definir MANUAL_CONFIG.SPREADSHEET_ID.')
  }

  if (!MANUAL_CONFIG.APP_TOKEN) {
    throw new Error('Tens de definir MANUAL_CONFIG.APP_TOKEN.')
  }
}

function ensureSheets_() {
  const ss = spreadsheet_()

  Object.values(SHEET_NAMES).forEach((name) => {
    let sheet = ss.getSheetByName(name)

    if (!sheet) {
      sheet = ss.insertSheet(name)
    }

    const headers = HEADERS[name]
    if (!headers) return

    const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0]
    const mustWrite = headers.some((h, i) => String(current[i] || '').trim() !== h)

    if (mustWrite) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers])
      sheet.setFrozenRows(1)
    }
  })

  if (!getConfigValue_('dataVersion')) {
    setConfigValue_('dataVersion', DATA_VERSION_ATUAL)
  }
}

function getConfigValue_(key) {
  const ss = spreadsheet_()
  const sheet = ss.getSheetByName(SHEET_NAMES.CONFIG)

  if (!sheet) return ''

  const values = sheet.getDataRange().getValues()

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === key) {
      return String(values[i][1] || '')
    }
  }

  return ''
}

function setConfigValue_(key, value) {
  const ss = spreadsheet_()
  const sheet = ss.getSheetByName(SHEET_NAMES.CONFIG) || ss.insertSheet(SHEET_NAMES.CONFIG)

  const values = sheet.getDataRange().getValues()

  if (!values.length || !values[0][0]) {
    sheet.getRange(1, 1, 1, 2).setValues([HEADERS.Config])
    sheet.setFrozenRows(1)
  }

  const currentValues = sheet.getDataRange().getValues()

  for (let i = 1; i < currentValues.length; i++) {
    if (String(currentValues[i][0]) === key) {
      sheet.getRange(i + 1, 2).setValue(value)
      return
    }
  }

  sheet.appendRow([key, value])
}

function readAllData_() {
  const analysesRows = readObjects_(SHEET_NAMES.ANALISES)
  const resultRows = readObjects_(SHEET_NAMES.RESULTADOS)
  const diaryRows = readObjects_(SHEET_NAMES.DIARIO)
  const behaviourRows = readObjects_(SHEET_NAMES.COMPORTAMENTOS)
  const referenceRows = readObjects_(SHEET_NAMES.REFERENCIAS)

  const examsById = {}

  analysesRows.forEach((row) => {
    const id = String(row.id || '').trim()
    if (!id) return

    examsById[id] = {
      id: id,
      name: row.nome || '',
      date: asDateString_(row.data),
      time: asTimeString_(row.hora),
      values: {},
      createdAt: row.criadoEm || ''
    }
  })

  resultRows.forEach((row) => {
    const examId = String(row.analiseId || '').trim()
    const biomarkerId = canonicalBiomarkerId_(row.biomarcadorId)

    if (!examId || !biomarkerId || !examsById[examId]) return

    const value = parseNumber_(row.valor)

    if (value !== null) {
      examsById[examId].values[biomarkerId] = value
    }
  })

  const diary = diaryRows
    .map((row) => ({
      date: asDateString_(row.data),
      behaviourId: String(row.comportamentoId || ''),
      label: row.comportamento || '',
      value: parseBooleanOrNull_(row.valor),
      note: row.nota || ''
    }))
    .filter((row) => row.date && row.behaviourId)

  const behaviours = behaviourRows
    .map((row) => ({
      id: String(row.id || ''),
      label: row.etiqueta || '',
      category: row.categoria || ''
    }))
    .filter((row) => row.id && row.label)

  const refs = {}

  referenceRows.forEach((row) => {
    const id = canonicalBiomarkerId_(row.biomarcadorId)
    if (!id) return

    refs[id] = normalizarReferenciaParaApp_(row)
  })

  Object.keys(REFERENCIAS_PADRAO).forEach((id) => {
    if (!refs[id] || !referenciaAppTemValores_(refs[id])) {
      refs[id] = referenciaPadraoParaApp_(id)
    }
  })

  return {
    exams: Object.values(examsById),
    diary: diary,
    behaviours: behaviours,
    refs: refs,
    dataVersion: getConfigValue_('dataVersion') || DATA_VERSION_ATUAL,
    source: 'google-sheets',
    loadedAt: new Date().toISOString()
  }
}

function saveAllData_(data) {
  const exams = Array.isArray(data.exams) ? data.exams : []
  const diary = Array.isArray(data.diary) ? data.diary : []
  const behaviours = Array.isArray(data.behaviours) ? data.behaviours : []

  const analysesRows = exams.map((exam) => [
    exam.id || Utilities.getUuid(),
    exam.name || '',
    exam.date || '',
    exam.time || '',
    exam.createdAt || ''
  ])

  const resultRows = []

  exams.forEach((exam) => {
    const values = exam.values || {}

    Object.keys(values).forEach((biomarkerId) => {
      resultRows.push([
        exam.id,
        canonicalBiomarkerId_(biomarkerId),
        values[biomarkerId]
      ])
    })
  })

  const diaryRows = diary.map((row) => [
    row.date || '',
    row.behaviourId || '',
    row.label || '',
    row.value === null || row.value === undefined ? '' : String(row.value),
    row.note || ''
  ])

  const behaviourRows = behaviours.map((row) => [
    row.id || '',
    row.label || '',
    row.category || ''
  ])

  writeRows_(SHEET_NAMES.ANALISES, HEADERS.Analises, analysesRows)
  writeRows_(SHEET_NAMES.RESULTADOS, HEADERS.Resultados, resultRows)
  writeRows_(SHEET_NAMES.DIARIO, HEADERS.Diario, diaryRows)
  writeRows_(SHEET_NAMES.COMPORTAMENTOS, HEADERS.Comportamentos, behaviourRows)

  // Intencional: a app já NÃO regrava a folha Referencias.
  // Isto impede que referências incompletas vindas do browser voltem a estragar a classificação.
  corrigirReferenciasDefinitivo()

  const currentVersion = getConfigValue_('dataVersion') || data.dataVersion || DATA_VERSION_ATUAL

  setConfigValue_('ultimaGravacao', new Date().toISOString())
  setConfigValue_('versao', '1')
  setConfigValue_('dataVersion', currentVersion)
}

function readObjects_(sheetName) {
  const ss = spreadsheet_()
  const sheet = ss.getSheetByName(sheetName)

  if (!sheet) return []

  const values = sheet.getDataRange().getValues()

  if (values.length < 2) return []

  const headers = values[0].map((h) => String(h || '').trim())

  return values
    .slice(1)
    .filter((row) => row.some((cell) => cell !== ''))
    .map((row) => {
      const obj = {}

      headers.forEach((h, i) => {
        obj[h] = row[i]
      })

      return obj
    })
}

function writeRows_(sheetName, headers, rows) {
  const ss = spreadsheet_()
  const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName)

  sheet.clearContents()
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
  sheet.setFrozenRows(1)

  if (rows.length) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows)
  }

  sheet.autoResizeColumns(1, headers.length)
}

function corrigirReferenciasDefinitivo() {
  const ss = spreadsheet_()
  let sheet = ss.getSheetByName(SHEET_NAMES.REFERENCIAS)

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAMES.REFERENCIAS)
  }

  ensureReferenceHeaders_(sheet)

  const values = sheet.getDataRange().getValues()
  const headers = values[0]

  const col = {
    biomarcadorId: headers.indexOf('biomarcadorId'),
    refMin: headers.indexOf('refMin'),
    refMax: headers.indexOf('refMax'),
    alvoMin: headers.indexOf('alvoMin'),
    alvoMax: headers.indexOf('alvoMax'),
    direcao: headers.indexOf('direcao')
  }

  const refsPorId = {}

  values.slice(1).forEach((row) => {
    const id = canonicalBiomarkerId_(row[col.biomarcadorId])
    if (!id) return

    refsPorId[id] = {
      refMin: row[col.refMin],
      refMax: row[col.refMax],
      alvoMin: row[col.alvoMin],
      alvoMax: row[col.alvoMax],
      direcao: row[col.direcao] || 'range'
    }
  })

  Object.keys(REFERENCIAS_PADRAO).forEach((id) => {
    const atual = refsPorId[id]
    const padrao = REFERENCIAS_PADRAO[id]

    if (!atual || !referenciaTemValores_(atual)) {
      refsPorId[id] = Object.assign({}, padrao)
      return
    }

    refsPorId[id] = {
      refMin: valueOrFallback_(atual.refMin, padrao.refMin),
      refMax: valueOrFallback_(atual.refMax, padrao.refMax),
      alvoMin: valueOrFallback_(atual.alvoMin, padrao.alvoMin),
      alvoMax: valueOrFallback_(atual.alvoMax, padrao.alvoMax),
      direcao: atual.direcao || padrao.direcao || 'range'
    }
  })

  const orderedIds = []

  APP_BIOMARCADORES.forEach((id) => {
    if (refsPorId[id] || REFERENCIAS_PADRAO[id]) orderedIds.push(id)
  })

  Object.keys(refsPorId).sort().forEach((id) => {
    if (orderedIds.indexOf(id) === -1) orderedIds.push(id)
  })

  const rows = orderedIds.map((id) => {
    const ref = refsPorId[id] || REFERENCIAS_PADRAO[id] || {}

    return [
      id,
      ref.refMin === undefined ? '' : ref.refMin,
      ref.refMax === undefined ? '' : ref.refMax,
      ref.alvoMin === undefined ? '' : ref.alvoMin,
      ref.alvoMax === undefined ? '' : ref.alvoMax,
      ref.direcao || 'range'
    ]
  })

  writeRows_(SHEET_NAMES.REFERENCIAS, HEADERS.Referencias, rows)

  setConfigValue_('dataVersion', getConfigValue_('dataVersion') || DATA_VERSION_ATUAL)
  setConfigValue_('ultimaCorrecaoReferencias', new Date().toISOString())

  Logger.log('Referências corrigidas/normalizadas: ' + rows.length)
  return 'Referências corrigidas/normalizadas: ' + rows.length
}

function ensureReferenceHeaders_(sheet) {
  const headers = HEADERS.Referencias
  const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0]
  const invalid = headers.some((h, i) => String(current[i] || '').trim() !== h)

  if (invalid) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    sheet.setFrozenRows(1)
  }
}

function normalizarIdsBiomarcadoresNasFolhas() {
  normalizarIdsNaFolha_(SHEET_NAMES.RESULTADOS, 'biomarcadorId')
  normalizarIdsNaFolha_(SHEET_NAMES.REFERENCIAS, 'biomarcadorId')

  setConfigValue_('ultimaNormalizacaoIdsBiomarcadores', new Date().toISOString())

  return 'IDs de biomarcadores normalizados nas folhas Resultados e Referencias.'
}

function normalizarIdsNaFolha_(sheetName, headerName) {
  const ss = spreadsheet_()
  const sheet = ss.getSheetByName(sheetName)

  if (!sheet) return

  const values = sheet.getDataRange().getValues()
  if (values.length < 2) return

  const headers = values[0]
  const col = headers.indexOf(headerName)

  if (col === -1) {
    throw new Error('Cabeçalho não encontrado em ' + sheetName + ': ' + headerName)
  }

  const updates = []

  for (let i = 1; i < values.length; i++) {
    const original = values[i][col]
    const normalizado = canonicalBiomarkerId_(original)

    if (String(original || '') !== normalizado && normalizado) {
      updates.push({ row: i + 1, value: normalizado })
    }
  }

  updates.forEach((update) => {
    sheet.getRange(update.row, col + 1).setValue(update.value)
  })

  Logger.log(sheetName + ': ' + updates.length + ' IDs normalizados.')
}

function diagnosticarCorrespondenciaBiomarcadoresMaio2026() {
  return diagnosticarCorrespondenciaPorAnalise_('analise-2026-05-07')
}

function diagnosticarCorrespondenciaPorAnalise_(analiseId) {
  const ss = spreadsheet_()
  const resultadosSheet = ss.getSheetByName(SHEET_NAMES.RESULTADOS)
  const referenciasSheet = ss.getSheetByName(SHEET_NAMES.REFERENCIAS)

  if (!resultadosSheet) throw new Error('Folha Resultados não encontrada.')
  if (!referenciasSheet) throw new Error('Folha Referencias não encontrada.')

  const resultados = resultadosSheet.getDataRange().getValues()
  const referencias = referenciasSheet.getDataRange().getValues()

  const resHeaders = resultados[0]
  const refHeaders = referencias[0]

  const resAnaliseIdCol = resHeaders.indexOf('analiseId')
  const resBiomarcadorIdCol = resHeaders.indexOf('biomarcadorId')
  const resValorCol = resHeaders.indexOf('valor')

  const refBiomarcadorIdCol = refHeaders.indexOf('biomarcadorId')
  const refMinCol = refHeaders.indexOf('refMin')
  const refMaxCol = refHeaders.indexOf('refMax')
  const alvoMinCol = refHeaders.indexOf('alvoMin')
  const alvoMaxCol = refHeaders.indexOf('alvoMax')
  const direcaoCol = refHeaders.indexOf('direcao')

  if (resAnaliseIdCol === -1 || resBiomarcadorIdCol === -1 || resValorCol === -1) {
    throw new Error('Cabeçalhos esperados não encontrados na folha Resultados.')
  }

  if (refBiomarcadorIdCol === -1 || refMinCol === -1 || refMaxCol === -1 || alvoMinCol === -1 || alvoMaxCol === -1 || direcaoCol === -1) {
    throw new Error('Cabeçalhos esperados não encontrados na folha Referencias.')
  }

  const appSet = new Set(APP_BIOMARCADORES)
  const referenciasMap = {}

  referencias.slice(1).forEach((row) => {
    const id = canonicalBiomarkerId_(row[refBiomarcadorIdCol])
    if (!id) return

    referenciasMap[id] = {
      refMin: row[refMinCol],
      refMax: row[refMaxCol],
      alvoMin: row[alvoMinCol],
      alvoMax: row[alvoMaxCol],
      direcao: row[direcaoCol]
    }
  })

  const diagnostico = []

  resultados.slice(1).forEach((row) => {
    const rowAnaliseId = String(row[resAnaliseIdCol] || '').trim()
    if (rowAnaliseId !== analiseId) return

    const original = String(row[resBiomarcadorIdCol] || '')
    const biomarcadorId = canonicalBiomarkerId_(original)
    const ref = referenciasMap[biomarcadorId]

    diagnostico.push({
      biomarcadorId: biomarcadorId,
      biomarcadorIdOriginal: original,
      valor: row[resValorCol],
      existeNaApp: appSet.has(biomarcadorId),
      existeEmReferencias: !!ref,
      temReferenciaValida: !!ref && referenciaTemValores_(ref),
      refMin: ref ? ref.refMin : '',
      refMax: ref ? ref.refMax : '',
      alvoMin: ref ? ref.alvoMin : '',
      alvoMax: ref ? ref.alvoMax : '',
      direcao: ref ? ref.direcao : '',
      temEspacosOuFormatoDiferenteNoId: original !== biomarcadorId
    })
  })

  const semReferenciaValida = diagnostico.filter((row) => !row.temReferenciaValida)
  const naoExistemNaApp = diagnostico.filter((row) => !row.existeNaApp)
  const naoExistemEmReferencias = diagnostico.filter((row) => !row.existeEmReferencias)
  const idsComFormatoDiferente = diagnostico.filter((row) => row.temEspacosOuFormatoDiferenteNoId)

  const resumo = {
    analiseId: analiseId,
    totalResultados: diagnostico.length,
    totalComReferenciaValida: diagnostico.length - semReferenciaValida.length,
    totalSemReferenciaValida: semReferenciaValida.length,
    semReferenciaValida: semReferenciaValida,
    naoExistemNaApp: naoExistemNaApp,
    naoExistemEmReferencias: naoExistemEmReferencias,
    idsComFormatoDiferente: idsComFormatoDiferente,
    diagnosticoCompleto: diagnostico
  }

  Logger.log('--- DIAGNÓSTICO ' + analiseId + ' ---')
  Logger.log(JSON.stringify(resumo, null, 2))

  return resumo
}

function canonicalBiomarkerId_(value) {
  const normalized = normalizarId_(value)
  return BIOMARCADOR_ALIASES[normalized] || normalized
}

function normalizarId_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function normalizarReferenciaParaApp_(row) {
  return {
    sufficientMin: valueToString_(row.refMin),
    sufficientMax: valueToString_(row.refMax),
    idealMin: valueToString_(row.alvoMin),
    idealMax: valueToString_(row.alvoMax),
    direction: row.direcao || 'range'
  }
}

function referenciaPadraoParaApp_(id) {
  const ref = REFERENCIAS_PADRAO[id] || {}

  return {
    sufficientMin: valueToString_(ref.refMin),
    sufficientMax: valueToString_(ref.refMax),
    idealMin: valueToString_(ref.alvoMin),
    idealMax: valueToString_(ref.alvoMax),
    direction: ref.direcao || 'range'
  }
}

function referenciaTemValores_(ref) {
  if (!ref) return false

  return String(ref.refMin || '').trim() !== '' ||
    String(ref.refMax || '').trim() !== '' ||
    String(ref.alvoMin || '').trim() !== '' ||
    String(ref.alvoMax || '').trim() !== ''
}

function referenciaAppTemValores_(ref) {
  if (!ref) return false

  return String(ref.sufficientMin || '').trim() !== '' ||
    String(ref.sufficientMax || '').trim() !== '' ||
    String(ref.idealMin || '').trim() !== '' ||
    String(ref.idealMax || '').trim() !== ''
}

function valueOrFallback_(value, fallback) {
  if (value === null || value === undefined || String(value).trim() === '') return fallback
  return value
}

function output_(payload, e) {
  const callback = e && e.parameter && e.parameter.callback
    ? String(e.parameter.callback).trim()
    : ''

  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(payload) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT)
  }

  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON)
}

function asDateString_(value) {
  if (!value) return ''

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd')
  }

  const text = String(value).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text

  return text
}

function asTimeString_(value) {
  if (!value) return ''

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'HH:mm')
  }

  return String(value).trim()
}

function parseNumber_(value) {
  if (value === '' || value === null || value === undefined) return null

  const n = Number(String(value).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function valueToString_(value) {
  if (value === null || value === undefined) return ''
  return String(value)
}

function parseBooleanOrNull_(value) {
  if (value === true || value === 'true' || value === 'TRUE' || value === 'Sim' || value === 'sim') {
    return true
  }

  if (value === false || value === 'false' || value === 'FALSE' || value === 'Não' || value === 'Nao' || value === 'não' || value === 'nao') {
    return false
  }

  return null
}
