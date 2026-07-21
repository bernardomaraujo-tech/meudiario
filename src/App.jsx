import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  BookOpenCheck,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Database,
  FlaskConical,
  Home,
  Info,
  LineChart,
  MoreHorizontal,
  Plus,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X
} from 'lucide-react'
import { biomarkers, defaultBehaviours, defaultReferences } from './data/biomarkers.js'
import { getAllCloudData, isCloudConfigured, saveAllCloudData } from './services/cloudStore.js'

const STORAGE = {
  exams: 'ads_exams_v2',
  diary: 'ads_diary_v2',
  behaviours: 'ads_behaviours_v4_lista_fechada',
  refs: 'ads_refs_v2',
  dataVersion: 'ads_data_version_v1',
  localResetVersion: 'ads_local_reset_version_v1'
}

const CLOUD_DATA_VERSION = '2026-06-05-comportamentos-diario-v8-lista-alfabetica'

const LOCAL_KEYS_TO_FORGET = [
  'ads_refs_v2',
  'ads_behaviours_v1',
  'ads_behaviours_v2',
  'ads_behaviours_v3',
  'ads_behaviours_v4',
  'ads_behaviours_v4_lista_fechada'
]

function forgetOldLocalDataIfNeeded() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return

    const alreadyResetForVersion = localStorage.getItem(STORAGE.localResetVersion)

    if (alreadyResetForVersion === CLOUD_DATA_VERSION) return

    LOCAL_KEYS_TO_FORGET.forEach((key) => {
      localStorage.removeItem(key)
    })

    localStorage.setItem(STORAGE.localResetVersion, CLOUD_DATA_VERSION)
  } catch {
    // Se o browser bloquear o localStorage, a app continua a funcionar com a cloud.
  }
}

forgetOldLocalDataIfNeeded()
function todayISO() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

function yesterdayISO() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

function timeNow() {
  return new Date().toTimeString().slice(0, 5)
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function parseNum(value) {
  if (value === '' || value === null || value === undefined) return null
  const n = Number(String(value).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function formatDate(dateText) {
  if (!dateText) return ''
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(`${dateText}T12:00:00`))
}

function formatDateShort(dateText) {
  if (!dateText) return ''
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit'
  }).format(new Date(`${dateText}T12:00:00`))
}

function hasRange(ref) {
  return [ref?.sufficientMin, ref?.sufficientMax, ref?.idealMin, ref?.idealMax].some((v) => parseNum(v) !== null)
}

function inRange(value, min, max) {
  const lo = parseNum(min)
  const hi = parseNum(max)

  if (lo !== null && value < lo) return false
  if (hi !== null && value > hi) return false

  return true
}

function getStatus(value, ref) {
  const n = parseNum(value)

  if (n === null) return 'empty'
  if (!hasRange(ref)) return 'unknown'

  const direction = ref?.direction || 'range'

  const refMin = parseNum(ref?.sufficientMin)
  const refMax = parseNum(ref?.sufficientMax)
  const idealMin = parseNum(ref?.idealMin)
  const idealMax = parseNum(ref?.idealMax)

  if (direction === 'lower') {
    const idealLimit = idealMax ?? idealMin
    const sufficientLimit = refMax ?? refMin

    if (idealLimit !== null && n <= idealLimit) return 'ideal'
    if (sufficientLimit !== null && n <= sufficientLimit) return idealLimit !== null ? 'sufficient' : 'ideal'
    if (idealLimit !== null || sufficientLimit !== null) return 'out'

    return 'unknown'
  }

  if (direction === 'higher') {
    const idealLimit = idealMin ?? idealMax
    const sufficientLimit = refMin ?? refMax

    if (idealLimit !== null && n >= idealLimit) return 'ideal'
    if (sufficientLimit !== null && n >= sufficientLimit) return idealLimit !== null ? 'sufficient' : 'ideal'
    if (idealLimit !== null || sufficientLimit !== null) return 'out'

    return 'unknown'
  }

  const hasIdeal = idealMin !== null || idealMax !== null
  const hasReference = refMin !== null || refMax !== null

  if (hasIdeal && inRange(n, ref.idealMin, ref.idealMax)) return 'ideal'
  if (hasReference && inRange(n, ref.sufficientMin, ref.sufficientMax)) return hasIdeal ? 'sufficient' : 'ideal'
  if (hasIdeal || hasReference) return 'out'

  return 'unknown'
}

function statusLabel(status) {
  return {
    ideal: 'Ideal',
    sufficient: 'Suficiente',
    out: 'Fora do intervalo',
    unknown: 'Sem referência',
    empty: 'Sem valor'
  }[status]
}

function statusIcon(status) {
  if (status === 'ideal') return '✓'
  if (status === 'sufficient') return '≈'
  if (status === 'out') return '!'
  return '—'
}

function sortExamDate(a, b) {
  return `${b.date} ${b.time || '00:00'}`.localeCompare(`${a.date} ${a.time || '00:00'}`)
}

function toDate(dateText) {
  return new Date(`${dateText}T12:00:00`)
}

function daysBetween(a, b) {
  return Math.round((toDate(a) - toDate(b)) / 86400000)
}

function average(values) {
  const valid = values.filter((v) => Number.isFinite(v))
  if (!valid.length) return null
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

function distanceToIdeal(value, ref) {
  const n = parseNum(value)

  if (n === null) return null

  const lo = parseNum(ref?.idealMin)
  const hi = parseNum(ref?.idealMax)

  if (lo !== null && n < lo) return lo - n
  if (hi !== null && n > hi) return n - hi

  return 0
}

function classifyImpact(avgYes, avgNo, biomarker, ref) {
  if (avgYes === null || avgNo === null || Math.abs(avgNo) < 0.00001) return null

  const direction = ref?.direction || biomarker.direction
  let score = 0

  if (direction === 'lower') score = ((avgNo - avgYes) / Math.abs(avgNo)) * 100
  if (direction === 'higher') score = ((avgYes - avgNo) / Math.abs(avgNo)) * 100

  if (direction === 'range') {
    const dy = distanceToIdeal(avgYes, ref)
    const dn = distanceToIdeal(avgNo, ref)

    if (dy === null || dn === null || dn < 0.00001) return null

    score = ((dn - dy) / Math.max(dn, 0.00001)) * 100
  }

  return Math.max(-99, Math.min(99, score))
}

function classNameForStatus(status) {
  return `pill ${status}`
}

function titleForTab(tab, selectedBiomarkerId) {
  if (selectedBiomarkerId) return 'Detalhe do Biomarcador'

  return {
    insert: 'Nova Análise',
    analysis: 'Resumo da Última Análise',
    report: 'Relatório da Última Análise',
    history: 'Histórico de Análises',
    diary: 'Diário Alimentar',
    impact: 'Impacto dos Comportamentos',
    more: 'Acompanhamento'
  }[tab] || 'Meu Diário'
}

function isBlankReferenceValue(value) {
  return value === undefined || value === null || String(value).trim() === ''
}

const REFERENCE_FIELD_ALIASES = {
  sufficientMin: ['sufficientMin', 'refMin'],
  sufficientMax: ['sufficientMax', 'refMax'],
  idealMin: ['idealMin', 'alvoMin'],
  idealMax: ['idealMax', 'alvoMax'],
  direction: ['direction', 'direcao']
}

function firstReferenceValue(source = {}, field) {
  const aliases = REFERENCE_FIELD_ALIASES[field] || [field]

  for (const alias of aliases) {
    const value = source?.[alias]

    if (!isBlankReferenceValue(value)) return value
  }

  return ''
}

function normalizeDirection(value, fallback = 'range') {
  const direction = String(value || '').trim().toLowerCase()

  if (['range', 'higher', 'lower'].includes(direction)) return direction

  return fallback || 'range'
}

function validReferenceNumber(value) {
  return !isBlankReferenceValue(value) && parseNum(value) !== null
}

function mergeReference(defaultRef = {}, cloudRef = {}) {
  const merged = { ...(defaultRef || {}) }

  if (!cloudRef || typeof cloudRef !== 'object') return merged

  ;['sufficientMin', 'sufficientMax', 'idealMin', 'idealMax'].forEach((field) => {
    const value = firstReferenceValue(cloudRef, field)

    // Só aceita números válidos. Isto impede que datas geradas pelo Google Sheets
    // substituam referências corretas ou referências default da app.
    if (validReferenceNumber(value)) {
      merged[field] = value
    }
  })

  merged.direction = normalizeDirection(
    firstReferenceValue(cloudRef, 'direction'),
    defaultRef?.direction || 'range'
  )

  return merged
}

function normalizeReferenceForBiomarker(id, ref = {}) {
  const normalized = { ...(ref || {}) }

  if (id === 'ureia_pre_dialise' || id === 'ureia_pos_dialise') {
    const hasMax = validReferenceNumber(normalized.sufficientMax)
    const legacyMin = normalized.sufficientMin

    if (!hasMax && validReferenceNumber(legacyMin)) {
      normalized.sufficientMax = legacyMin
    }

    normalized.sufficientMin = ''
    normalized.direction = 'lower'
    normalized.exclusiveMax = true
  }

  return normalized
}

function getReferenceConfig(id, refs = {}) {
  return normalizeReferenceForBiomarker(id, mergeReference(defaultReferences[id], refs?.[id]))
}

function withDefaultReferences(value) {
  const cloudRefs = value && typeof value === 'object' ? value : {}
  const ids = new Set([...Object.keys(defaultReferences), ...Object.keys(cloudRefs)])
  const mergedRefs = {}

  ids.forEach((id) => {
    mergedRefs[id] = normalizeReferenceForBiomarker(id, mergeReference(defaultReferences[id], cloudRefs[id]))
  })

  return mergedRefs
}

const legacyBehaviourIdMap = {
  batata: 'batata_tomate_espinafres',
  batata_tomate_espinafre: 'batata_tomate_espinafres',
  comida_processada: 'enchidos_carne_processada',
  carne_processada: 'enchidos_carne_processada',
  enchidos_fumados: 'enchidos_carne_processada',
  enchidos_ou_carne_processada: 'enchidos_carne_processada',
  fast_food: 'refeicao_fora_fast_food',
  refeicao_fora_ou_fast_food: 'refeicao_fora_fast_food',
  croissant_pastelaria: 'doces_pastelaria',
  doces_ou_pastelaria: 'doces_pastelaria',
  frutos_secos: 'frutos_secos_sementes',
  frutos_secos_ou_sementes: 'frutos_secos_sementes',
  liquidos_acima_do_limite: 'liquidos_acima_limite',
  laticinios: 'laticinios',
  lacticinios: 'laticinios',
  refrigerante_tipo_cola: 'refrigerante_cola',
  quelante_de_fosforo_a_refeicao: 'quelante_fosforo',
  arroz_ou_massa: 'arroz_massa',
  salgados: 'refeicao_salgada',
  sessao_de_dialise_4h: 'sessao_dialise_4h',
  sessao_de_dialise_6h30m: 'sessao_dialise_6h30m',
  tratamento_4h: 'sessao_dialise_4h',
  tratamento_6h30m: 'sessao_dialise_6h30m'
}

const legacyBehaviourLabelMap = {
  'batata tomate espinafre': 'batata_tomate_espinafres',
  'batata tomate espinafres': 'batata_tomate_espinafres',
  'enchidos ou carne processada': 'enchidos_carne_processada',
  'refrigerante tipo cola': 'refrigerante_cola',
  'doces ou pastelaria': 'doces_pastelaria',
  'frutos secos ou sementes': 'frutos_secos_sementes',
  'liquidos acima do limite': 'liquidos_acima_limite',
  'liquidos acima limite': 'liquidos_acima_limite',
  'laticinios': 'laticinios',
  'lacticinios': 'laticinios',
  'quelante de fosforo a refeicao': 'quelante_fosforo',
  'arroz ou massa': 'arroz_massa',
  'salgados': 'refeicao_salgada',
  'sessao dialise 4h': 'sessao_dialise_4h',
  'sessao de dialise 4h': 'sessao_dialise_4h',
  'sessao dialise 6h30m': 'sessao_dialise_6h30m',
  'sessao de dialise 6h30m': 'sessao_dialise_6h30m',
  'atividade fisica': 'atividade_fisica',
  'alcool': 'alcool',
  'iogurte normal': 'iogurte_normal',
  'iogurte vegan': 'iogurte_vegan'
}

const deprecatedBehaviourIds = new Set([
  'bolo_caseiro',
  'bolo_fabrico',
  'fruta',
  'iogurte_proteina',
  'comida_processada',
  'fast_food',
  'croissant_pastelaria',
  'dialise',
  'tratamento_a_noite',
  'tratamento_a_tarde',
  'tratamento_noite',
  'tratamento_tarde'
])

const deprecatedBehaviourLabels = new Set([
  'bolo caseiro',
  'bolo fabrico',
  'fruta',
  'iogurte proteina',
  'comida processada',
  'fast food',
  'croissant pastelaria',
  'dialise',
  'tratamento à noite',
  'tratamento a noite',
  'tratamento à tarde',
  'tratamento a tarde'
])

function normalizeTextKey(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function sortBehavioursByLabel(value) {
  if (!Array.isArray(value)) return []

  return [...value].sort((a, b) => {
    return String(a?.label || '').localeCompare(String(b?.label || ''), 'pt-PT', {
      sensitivity: 'base',
      numeric: true,
      ignorePunctuation: true
    })
  })
}

function normalizeDiaryBehaviours(value) {
  if (!Array.isArray(value)) return []

  const normalized = new Map()

  value.forEach((item) => {
    if (!item || typeof item !== 'object') return

    if (item.behaviourId === '__note__') {
      normalized.set([item.date || '', '__note__'].join('|'), item)
      return
    }

    const mappedId = legacyBehaviourIdMap[item.behaviourId] || legacyBehaviourLabelMap[normalizeTextKey(item.label)] || item.behaviourId

    if (deprecatedBehaviourIds.has(item.behaviourId) || deprecatedBehaviourIds.has(mappedId)) return
    if (deprecatedBehaviourLabels.has(normalizeTextKey(item.label))) return

    const mappedBehaviour = defaultBehaviours.find((behaviour) => behaviour.id === mappedId)

    // Mantém apenas comportamentos pertencentes à lista final oficial.
    if (!mappedBehaviour) return

    const normalizedItem = {
      ...item,
      behaviourId: mappedId,
      label: mappedBehaviour.label
    }
    const key = [normalizedItem.date || '', normalizedItem.behaviourId || ''].join('|')
    const existing = normalized.get(key)

    if (!existing) {
      normalized.set(key, normalizedItem)
      return
    }

    normalized.set(key, {
      ...existing,
      ...normalizedItem,
      value: existing.value === true || normalizedItem.value === true
    })
  })

  return Array.from(normalized.values())
}

function withDefaultBehaviours() {
  // A lista de comportamentos passa a ser fechada: nem mais, nem menos.
  // A apresentação é sempre ordenada alfabeticamente pelo label.
  // Isto impede que comportamentos antigos guardados em localStorage ou na cloud voltem a aparecer.
  return sortBehavioursByLabel(defaultBehaviours.map((item) => ({ ...item })))
}

function listKeyExam(item) {
  if (!item || typeof item !== 'object') return ''
  return item.id || [item.name, item.date, item.time].filter(Boolean).join('|')
}

function listKeyDiary(item) {
  if (!item || typeof item !== 'object') return ''
  return [item.date || '', item.behaviourId || item.id || item.label || ''].join('|')
}

function listKeyBehaviour(item) {
  if (!item || typeof item !== 'object') return ''
  const normalizedLabel = normalizeTextKey(item.label)
  const normalizedId = legacyBehaviourIdMap[item.id] || legacyBehaviourLabelMap[normalizedLabel] || item.id
  return normalizedId || normalizedLabel || ''
}

function mergeListByKey(cloudList, localList, makeKey) {
  const merged = new Map()

  ;(Array.isArray(localList) ? localList : []).forEach((item) => {
    const key = makeKey(item)

    if (!key) return

    merged.set(key, item)
  })

  ;(Array.isArray(cloudList) ? cloudList : []).forEach((item) => {
    const key = makeKey(item)

    if (!key) return

    const localItem = merged.get(key) || {}

    merged.set(key, {
      ...localItem,
      ...item,
      values: {
        ...(localItem.values || {}),
        ...(item.values || {})
      }
    })
  })

  return Array.from(merged.values())
}

function normalizeReferenceMap(refsInput) {
  const refs = refsInput && typeof refsInput === 'object' && !Array.isArray(refsInput) ? refsInput : {}
  const normalized = {}

  Object.entries(refs).forEach(([id, ref]) => {
    normalized[id] = normalizeReferenceForBiomarker(id, mergeReference(defaultReferences[id], ref))
  })

  return normalized
}

function mergeReferencesForCloud(cloudRefsInput, localRefsInput) {
  const cloudRefs = normalizeReferenceMap(cloudRefsInput)
  const localRefs = normalizeReferenceMap(localRefsInput)
  const cloudHasRefs = Object.keys(cloudRefs).length > 0

  if (!cloudHasRefs) {
    return withDefaultReferences(localRefs)
  }

  // As referências do Google Sheets passam a ser a fonte principal.
  // Isto evita que referências antigas/corrompidas em localStorage voltem
  // a substituir os valores corrigidos na cloud.
  return withDefaultReferences({
    ...localRefs,
    ...cloudRefs
  })
}

function mergeCloudWithLocalData(cloudData = {}, localData = {}) {
  const examsMerged = mergeListByKey(cloudData.exams, localData.exams, listKeyExam).sort(sortExamDate)
  const diaryMerged = normalizeDiaryBehaviours(mergeListByKey(cloudData.diary, localData.diary, listKeyDiary))
  const behavioursMerged = withDefaultBehaviours(
    mergeListByKey(cloudData.behaviours, localData.behaviours, listKeyBehaviour)
  )
  const refsMerged = mergeReferencesForCloud(cloudData.refs, localData.refs)

  return {
    dataVersion: cloudData.dataVersion || localData.dataVersion || '',
    exams: examsMerged,
    diary: diaryMerged,
    behaviours: behavioursMerged,
    refs: refsMerged
  }
}

function latestBiomarkerCards(exam, refs, allowedStatuses = ['out', 'ideal', 'sufficient', 'unknown', 'empty']) {
  if (!exam || !exam.values) return []

  return biomarkers
    .map((biomarker) => {
      const value = exam.values[biomarker.id]

      if (value === undefined || value === null || value === '') {
        return null
      }

      const refConfig = getReferenceConfig(biomarker.id, refs)
      const status = getStatus(value, refConfig)

      return {
        biomarker,
        value,
        status
      }
    })
    .filter(Boolean)
    .filter((card) => allowedStatuses.includes(card.status))
}

const REPORT_PRIORITY = [
  'ureia_pos_dialise',
  'ureia_pre_dialise',
  'fosforo_inorganico',
  'potassio',
  'albumina',
  'hemoglobina',
  'hematocrito',
  'ferritina',
  'paratormona_pth',
  'calcio_total',
  'sodio',
  'proteina_c_reactiva'
]

function monthsWindowDays(months) {
  return months * 30
}

function formatNumber(value) {
  const n = parseNum(value)

  if (n === null) return '—'

  return Number.isInteger(n)
    ? String(n)
    : n.toFixed(1).replace('.', ',')
}

function formatRef(refConfig) {
  const min = parseNum(refConfig?.idealMin) ?? parseNum(refConfig?.sufficientMin)
  const max = parseNum(refConfig?.idealMax) ?? parseNum(refConfig?.sufficientMax)
  const direction = refConfig?.direction || 'range'

  if (direction === 'lower' && max !== null) return `< ${formatNumber(max)}`
  if (direction === 'lower' && min !== null) return `< ${formatNumber(min)}`
  if (direction === 'higher' && min !== null) return `> ${formatNumber(min)}`
  if (direction === 'higher' && max !== null) return `> ${formatNumber(max)}`
  if (min !== null && max !== null) return `${formatNumber(min)} - ${formatNumber(max)}`
  if (min !== null) return `> ${formatNumber(min)}`
  if (max !== null) return `< ${formatNumber(max)}`

  return 'Sem ref.'
}

function averageForBiomarker(exams, biomarkerId, latestDate, months) {
  const days = monthsWindowDays(months)

  const values = exams
    .filter((exam) => {
      if (!exam?.date) return false

      const diff = daysBetween(latestDate, exam.date)

      return diff >= 0 && diff <= days
    })
    .map((exam) => parseNum(exam.values?.[biomarkerId]))
    .filter((value) => value !== null)

  return average(values)
}

function seriesForBiomarker(exams, biomarkerId, latestDate, months = 6) {
  const days = monthsWindowDays(months)

  return [...exams]
    .filter((exam) => {
      if (!exam?.date) return false

      const diff = daysBetween(latestDate, exam.date)

      return diff >= 0 && diff <= days && parseNum(exam.values?.[biomarkerId]) !== null
    })
    .sort((a, b) => `${a.date} ${a.time || ''}`.localeCompare(`${b.date} ${b.time || ''}`))
    .map((exam) => ({
      date: exam.date,
      value: parseNum(exam.values?.[biomarkerId])
    }))
}

function trendForValue(current, avg3m, refConfig) {
  const value = parseNum(current)

  if (value === null || avg3m === null) {
    return {
      direction: 'flat',
      tone: 'neutral',
      label: 'Sem dados'
    }
  }

  const diff = value - avg3m
  const absDiff = Math.abs(diff)

  if (absDiff < 0.01) {
    return {
      direction: 'flat',
      tone: 'neutral',
      label: 'Estável'
    }
  }

  const improvementDirection = refConfig?.direction || 'range'

  if (improvementDirection === 'lower') {
    return diff < 0
      ? { direction: 'down', tone: 'good', label: 'Melhorou' }
      : { direction: 'up', tone: 'watch', label: 'Subiu' }
  }

  if (improvementDirection === 'higher') {
    return diff > 0
      ? { direction: 'up', tone: 'good', label: 'Melhorou' }
      : { direction: 'down', tone: 'watch', label: 'Desceu' }
  }

  return diff > 0
    ? { direction: 'up', tone: 'neutral', label: 'Subiu' }
    : { direction: 'down', tone: 'neutral', label: 'Desceu' }
}

function buildReportRows(exam, exams, refs) {
  if (!exam) return []

  return Object.entries(exam.values || {})
    .map(([id, value]) => {
      const biomarker = biomarkers.find((item) => item.id === id) || {
        id,
        name: id.replaceAll('_', ' '),
        unit: '',
        category: 'Não mapeado',
        direction: 'range'
      }

      const refConfig = getReferenceConfig(id, refs)
      const status = getStatus(value, refConfig)
      const avg3m = averageForBiomarker(exams, id, exam.date, 3)
      const avg6m = averageForBiomarker(exams, id, exam.date, 6)
      const series = seriesForBiomarker(exams, id, exam.date, 6)
      const trend = trendForValue(value, avg3m, refConfig)

      return {
        id,
        biomarker,
        value,
        refConfig,
        status,
        avg3m,
        avg6m,
        trend,
        series
      }
    })
    .sort((a, b) => {
      const priorityA = REPORT_PRIORITY.indexOf(a.id)
      const priorityB = REPORT_PRIORITY.indexOf(b.id)

      const aIndex = priorityA === -1 ? 999 : priorityA
      const bIndex = priorityB === -1 ? 999 : priorityB

      return aIndex - bIndex || a.biomarker.name.localeCompare(b.biomarker.name, 'pt-PT')
    })
}

function reportInsightRows(rows) {
  const outRows = rows.filter((row) => row.status === 'out')
  const improvingRows = rows.filter((row) => row.trend.tone === 'good')
  const stableRows = rows.filter((row) => row.trend.label === 'Estável')

  if (outRows.length) {
    return outRows.slice(0, 3).map((row) => `${row.biomarker.name}: fora da referência, com tendência "${row.trend.label.toLowerCase()}".`)
  }

  if (improvingRows.length) {
    return improvingRows.slice(0, 3).map((row) => `${row.biomarker.name}: evolução favorável face à média dos últimos 3 meses.`)
  }

  if (stableRows.length) {
    return stableRows.slice(0, 3).map((row) => `${row.biomarker.name}: comportamento estável face à média recente.`)
  }

  return ['Sem alertas principais com os dados disponíveis.']
}

function App() {
  const [tab, setTab] = useState('analysis')
  const [exams, setExams] = useState(() => loadJson(STORAGE.exams, []))
  const [diary, setDiary] = useState(() => normalizeDiaryBehaviours(loadJson(STORAGE.diary, [])))
  const [behaviours, setBehaviours] = useState(() => withDefaultBehaviours(loadJson(STORAGE.behaviours, defaultBehaviours)))
  const [refs, setRefs] = useState(() => withDefaultReferences(loadJson(STORAGE.refs, defaultReferences)))
  const [dataVersion, setDataVersion] = useState(() => localStorage.getItem(STORAGE.dataVersion) || '')
  const isLoadingCloudRef = useRef(false)
  const [selectedBiomarkerId, setSelectedBiomarkerId] = useState(null)
  const [selectedExamId, setSelectedExamId] = useState(null)
  const [impactBiomarkerId, setImpactBiomarkerId] = useState(null)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [cloudStatus, setCloudStatus] = useState(isCloudConfigured() ? 'Ligado' : 'Não configurado')
  const [cloudMessage, setCloudMessage] = useState(isCloudConfigured() ? 'Lista de comportamentos fechada. A carregar dados atuais da cloud.' : 'Configura o Apps Script para ativar a sincronização.')

  useEffect(() => saveJson(STORAGE.exams, exams), [exams])
  useEffect(() => saveJson(STORAGE.diary, diary), [diary])
  useEffect(() => saveJson(STORAGE.behaviours, withDefaultBehaviours()), [behaviours])
  useEffect(() => {
    const exact = withDefaultBehaviours()
    const currentSignature = behaviours.map((item) => `${item.id}|${item.label}`).join('§')
    const exactSignature = exact.map((item) => `${item.id}|${item.label}`).join('§')

    if (currentSignature !== exactSignature) {
      setBehaviours(exact)
    }
  }, [behaviours])
  useEffect(() => saveJson(STORAGE.refs, refs), [refs])
  useEffect(() => localStorage.setItem(STORAGE.dataVersion, dataVersion || ''), [dataVersion])

  const latestExam = useMemo(() => [...exams].sort(sortExamDate)[0] || null, [exams])

  const selectedExam = useMemo(() => {
    return exams.find((exam) => exam.id === selectedExamId) || latestExam || null
  }, [exams, selectedExamId, latestExam])

  async function loadCloudData() {
    if (!isCloudConfigured()) {
      setCloudStatus('Não configurado')
      setCloudMessage('Preenche CLOUD_API_URL e CLOUD_TOKEN em src/cloudConfig.js.')
      return
    }

    isLoadingCloudRef.current = true

    try {
      setCloudStatus('A carregar')
      setCloudMessage('A carregar dados do Google Sheets...')

      const data = await getAllCloudData()

      if (!data) throw new Error('Sem dados devolvidos pela cloud.')

      const cloudHasData =
        (Array.isArray(data.exams) && data.exams.length > 0) ||
        (Array.isArray(data.diary) && data.diary.length > 0) ||
        (Array.isArray(data.behaviours) && data.behaviours.length > 0) ||
        (data.refs && Object.keys(data.refs).length > 0)

      if (!cloudHasData) {
        const nextDataVersion = data.dataVersion || ''

        setDataVersion(nextDataVersion)
        localStorage.setItem(STORAGE.dataVersion, nextDataVersion)
        setCloudStatus('Cloud vazia')
        setCloudMessage('A cloud está ligada, mas ainda não tem dados. Podes usar Guardar cloud para enviar os dados locais para o Google Sheets.')
        return
      }

      const mergedData = mergeCloudWithLocalData(data, { exams, diary, behaviours, refs })
      const nextDataVersion = data.dataVersion || ''

      setExams(mergedData.exams)
      setDiary(mergedData.diary)
      setBehaviours(mergedData.behaviours)
      setRefs(mergedData.refs)
      setDataVersion(nextDataVersion)

      saveJson(STORAGE.exams, mergedData.exams)
      saveJson(STORAGE.diary, mergedData.diary)
      saveJson(STORAGE.behaviours, mergedData.behaviours)
      saveJson(STORAGE.refs, mergedData.refs)
      localStorage.setItem(STORAGE.dataVersion, nextDataVersion)

      setCloudStatus('Sincronizado')
      setCloudMessage(`Dados carregados da cloud sem perder registos locais ainda não sincronizados. Versão: ${nextDataVersion || 'sem versão'}. Última leitura: ${new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`)
    } catch (error) {
      setCloudStatus('Erro')
      setCloudMessage(error.message || 'Erro ao carregar dados da cloud.')
    } finally {
      isLoadingCloudRef.current = false
    }
  }

  async function syncCloudSnapshot(overrides = {}) {
    if (!isCloudConfigured()) return

    if (isLoadingCloudRef.current) {
      return
    }

    try {
      const localData = {
        dataVersion,
        exams: overrides.exams ?? exams,
        diary: overrides.diary ?? diary,
        behaviours: withDefaultBehaviours(overrides.behaviours ?? behaviours),
        refs: withDefaultReferences(overrides.refs ?? refs)
      }

      let payload = localData
      let versionForMessage = dataVersion

      if (!dataVersion) {
        setCloudStatus('A carregar')
        setCloudMessage('A confirmar a versão atual da cloud antes de guardar...')

        const cloudData = await getAllCloudData()

        if (!cloudData) throw new Error('Não foi possível obter a versão atual da cloud antes de guardar.')

        const mergedData = mergeCloudWithLocalData(cloudData, localData)

        payload = mergedData
        versionForMessage = mergedData.dataVersion || ''

        setExams(mergedData.exams)
        setDiary(mergedData.diary)
        setBehaviours(mergedData.behaviours)
        setRefs(mergedData.refs)
        setDataVersion(versionForMessage)

        saveJson(STORAGE.exams, mergedData.exams)
        saveJson(STORAGE.diary, mergedData.diary)
        saveJson(STORAGE.behaviours, mergedData.behaviours)
        saveJson(STORAGE.refs, mergedData.refs)
        localStorage.setItem(STORAGE.dataVersion, versionForMessage)
      }

      setCloudStatus('A guardar')
      setCloudMessage('A guardar dados no Google Sheets...')

      const result = await saveAllCloudData(payload)
      const nextDataVersion = result?.dataVersion || versionForMessage || dataVersion || ''

      if (nextDataVersion) {
        setDataVersion(nextDataVersion)
        localStorage.setItem(STORAGE.dataVersion, nextDataVersion)
      }

      setCloudStatus('Sincronizado')
      setCloudMessage(`Dados guardados na cloud. Versão: ${nextDataVersion || 'sem versão'}. Última gravação: ${new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`)
    } catch (error) {
      setCloudStatus('Erro')
      setCloudMessage(error.message || 'Erro ao guardar dados na cloud.')
    }
  }

  useEffect(() => {
    if (isCloudConfigured()) loadCloudData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function goTo(nextTab) {
    setSelectedBiomarkerId(null)
    setTab(nextTab)
    setQuickAddOpen(false)

    if (nextTab !== 'analysis') setSelectedExamId(null)
  }

  function analyseImpactFor(id) {
    setSelectedBiomarkerId(null)
    setImpactBiomarkerId(id)
    setTab('impact')
  }

  return (
    <div className="app-shell">
      <div className="soft-glow" />

      <header className="topbar">
        <button className="nav-icon" onClick={() => selectedBiomarkerId ? setSelectedBiomarkerId(null) : (tab === 'analysis' ? goTo('analysis') : goTo('history'))} aria-label="Voltar">‹</button>

        <div className="top-title">
          <h1>{titleForTab(tab, selectedBiomarkerId)}</h1>
          {latestExam && tab !== 'insert' && <p>{formatDate(latestExam.date)} · {latestExam.time}</p>}
        </div>

        <button className="nav-icon" onClick={() => goTo('more')} aria-label="Mais"><Info size={18} /></button>
      </header>

      <main className="content">
        {tab === 'insert' && <InsertExamView refs={refs} setRefs={setRefs} exams={exams} setExams={setExams} syncCloudSnapshot={syncCloudSnapshot} />}

        {tab === 'history' && (
          <HistoryView
            exams={exams}
            refs={refs}
            onOpenExam={(examId) => {
              setSelectedExamId(examId)
              setSelectedBiomarkerId(null)
              setTab('analysis')
            }}
            onNewExam={() => {
              setSelectedExamId(null)
              setTab('insert')
            }}
          />
        )}

        {tab === 'analysis' && selectedBiomarkerId && (
          <BiomarkerDetail
            id={selectedBiomarkerId}
            exams={exams}
            refs={refs}
            onBack={() => setSelectedBiomarkerId(null)}
          />
        )}

        {tab === 'analysis' && !selectedBiomarkerId && (
          <AnalysisView
            exam={selectedExam}
            exams={exams}
            refs={refs}
            onSelect={setSelectedBiomarkerId}
            onOpenReport={() => setTab('report')}
          />
        )}

        {tab === 'report' && (
          <ReportView
            exam={selectedExam}
            exams={exams}
            refs={refs}
            onBack={() => setTab('analysis')}
            onSelect={(id) => {
              setSelectedBiomarkerId(id)
              setTab('analysis')
            }}
          />
        )}

        {tab === 'diary' && (
          <DiaryView
            diary={diary}
            setDiary={setDiary}
            behaviours={behaviours}
            syncCloudSnapshot={syncCloudSnapshot}
          />
        )}

        {tab === 'impact' && (
          <ImpactView
            exams={exams}
            diary={diary}
            behaviours={behaviours}
            refs={refs}
            latestExam={latestExam}
            initialSelected={impactBiomarkerId}
          />
        )}

        {tab === 'more' && (
          <MoreView
            latestExam={latestExam}
            refs={refs}
            setRefs={setRefs}
            goTo={goTo}
            onSelectBiomarker={(id) => {
              setSelectedBiomarkerId(id)
              setTab('analysis')
            }}
            onAnalyseImpact={analyseImpactFor}
            cloudStatus={cloudStatus}
            cloudMessage={cloudMessage}
            loadCloudData={loadCloudData}
            syncCloudSnapshot={syncCloudSnapshot}
          />
        )}
      </main>

      {quickAddOpen && (
        <QuickAddSheet
          onClose={() => setQuickAddOpen(false)}
          onNewExam={() => {
            setQuickAddOpen(false)
            setSelectedExamId(null)
            setTab('insert')
          }}
          onNewDiary={() => {
            setQuickAddOpen(false)
            setTab('diary')
          }}
        />
      )}

      <nav className="bottom-nav">
        <button className={tab === 'analysis' && !selectedBiomarkerId ? 'active' : ''} onClick={() => { setSelectedExamId(null); goTo('analysis') }}><Home size={18} />Resumo</button>
        <button className={tab === 'history' ? 'active' : ''} onClick={() => goTo('history')}><FlaskConical size={18} />Análises</button>
        <button className="add-button" onClick={() => setQuickAddOpen(true)} aria-label="Adicionar"><Plus size={28} /></button>
        <button className={tab === 'diary' ? 'active' : ''} onClick={() => goTo('diary')}><BookOpenCheck size={18} />Diário</button>
        <button className={tab === 'more' || tab === 'impact' ? 'active' : ''} onClick={() => goTo('more')}><MoreHorizontal size={18} />Mais</button>
      </nav>
    </div>
  )
}

function InsertExamView({ refs, setRefs, exams, setExams, syncCloudSnapshot }) {
  const [examName, setExamName] = useState('')
  const [date, setDate] = useState(todayISO())
  const [time, setTime] = useState(timeNow())
  const [values, setValues] = useState({})
  const [query, setQuery] = useState('')
  const [showRefs, setShowRefs] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    if (!q) return biomarkers

    return biomarkers.filter((b) => {
      return `${b.name} ${b.category} ${(b.aliases || []).join(' ')}`.toLowerCase().includes(q)
    })
  }, [query])

  function saveExam() {
    const normalizedValues = Object.fromEntries(
      Object.entries(values)
        .map(([id, value]) => [id, parseNum(value)])
        .filter(([, value]) => value !== null)
    )

    if (!Object.keys(normalizedValues).length) {
      alert('Insere pelo menos um valor de análise antes de guardar.')
      return
    }

    const record = {
      id: crypto.randomUUID(),
      name: examName || `Análise ${date}`,
      date,
      time,
      values: normalizedValues,
      createdAt: new Date().toISOString()
    }

    const nextExams = [record, ...exams]

    setExams(nextExams)
    syncCloudSnapshot?.({ exams: nextExams })
    setExamName('')
    setValues({})

    alert('Análise guardada.')
  }

  return (
    <section className="screen">
      <div className="intro-card clinical">
        <div className="intro-icon"><ShieldCheck size={22} /></div>
        <div>
          <p className="eyebrow">Registo manual</p>
          <h2>Inserir valores das análises</h2>
          <p>Regista os resultados por biomarcador e mantém as referências configuráveis por laboratório.</p>
        </div>
      </div>

      <div className="form-grid date-grid">
        <label>
          Nome do exame
          <input value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="Ex.: Análises mensais" />
        </label>

        <label>
          <span><CalendarDays size={15} /> Data da recolha</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>

        <label>
          <span><Clock3 size={15} /> Hora da recolha</span>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
      </div>

      <div className="search-box">
        <Search size={18} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar biomarcadores" />
      </div>

      <button className="secondary-action" onClick={() => setShowRefs(!showRefs)}>
        <SlidersHorizontal size={18} /> {showRefs ? 'Esconder referências' : 'Configurar referências'}
      </button>

      {showRefs && <ReferenceEditor refs={refs} setRefs={setRefs} />}

      <div className="section-header">
        <h3>Biomarcadores principais</h3>
        <span>{filtered.length}</span>
      </div>

      <div className="list-block">
        {filtered.map((b) => {
          const status = getStatus(values[b.id], getReferenceConfig(b.id, refs))

          return (
            <div className="input-card" key={b.id}>
              <div className="metric-name">
                <MetricIcon category={b.category} />
                <div>
                  <strong>{b.name}</strong>
                  <span>{b.unit || 'sem unidade'} · {b.category}</span>
                </div>
              </div>

              <div className="value-entry">
                <input
                  inputMode="decimal"
                  value={values[b.id] ?? ''}
                  onChange={(e) => setValues({ ...values, [b.id]: e.target.value })}
                  placeholder="Valor"
                />

                {values[b.id] !== undefined && (
                  <em className={classNameForStatus(status)}>
                    {statusIcon(status)} {statusLabel(status)}
                  </em>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <button className="primary-action sticky-save" onClick={saveExam}>
        <Save size={18} /> Guardar Análise
      </button>
    </section>
  )
}

function ReferenceEditor({ refs, setRefs }) {
  const [query, setQuery] = useState('')

  const filtered = biomarkers.filter((b) => {
    return `${b.name} ${b.category} ${(b.aliases || []).join(' ')}`.toLowerCase().includes(query.toLowerCase())
  })

  function patchRef(id, field, value) {
    setRefs({ ...refs, [id]: { ...(refs[id] || {}), [field]: value } })
  }

  return (
    <div className="reference-panel">
      <div className="notice">
        <strong>Referências clínicas</strong>
        <span>Deixa em branco os intervalos ainda não validados. A classificação só é aplicada quando existir referência.</span>
      </div>

      <input className="plain-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filtrar referências" />

      {filtered.slice(0, 12).map((b) => {
        const ref = getReferenceConfig(b.id, refs)

        return (
          <div className="reference-row" key={b.id}>
            <strong>{b.name}</strong>

            <div className="ref-inputs">
              <label>Ref. mín<input inputMode="decimal" value={ref.sufficientMin ?? ''} onChange={(e) => patchRef(b.id, 'sufficientMin', e.target.value)} /></label>
              <label>Ref. máx<input inputMode="decimal" value={ref.sufficientMax ?? ''} onChange={(e) => patchRef(b.id, 'sufficientMax', e.target.value)} /></label>
              <label>Alvo mín<input inputMode="decimal" value={ref.idealMin ?? ''} onChange={(e) => patchRef(b.id, 'idealMin', e.target.value)} /></label>
              <label>Alvo máx<input inputMode="decimal" value={ref.idealMax ?? ''} onChange={(e) => patchRef(b.id, 'idealMax', e.target.value)} /></label>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AnalysisView({ exam, exams, refs, onSelect, onOpenReport }) {
  const [query, setQuery] = useState('')
  const latestValues = exam?.values || {}

  const cards = Object.entries(latestValues)
    .map(([id, value]) => {
      const biomarker = biomarkers.find((b) => b.id === id) || {
        id,
        name: id.replaceAll('_', ' '),
        unit: '',
        category: 'Não mapeado',
        direction: 'range',
        description: 'Biomarcador presente na cloud, mas ainda não configurado no ficheiro de biomarcadores.'
      }

      const refConfig = getReferenceConfig(id, refs)
      const status = getStatus(value, refConfig)

      return { biomarker, value, status }
    })

  const grouped = {
    out: cards.filter((c) => c.status === 'out'),
    ideal: cards.filter((c) => c.status === 'ideal' || c.status === 'sufficient'),
    unknown: cards.filter((c) => c.status === 'unknown' || c.status === 'empty')
  }

  const filteredCards = cards.filter((c) => {
    return `${c.biomarker.name} ${c.biomarker.category}`.toLowerCase().includes(query.toLowerCase())
  })

  const statusOrder = ['out', 'ideal', 'sufficient', 'unknown', 'empty']
  const orderedCards = [...filteredCards].sort((a, b) => {
    const aIndex = statusOrder.indexOf(a.status) === -1 ? statusOrder.length : statusOrder.indexOf(a.status)
    const bIndex = statusOrder.indexOf(b.status) === -1 ? statusOrder.length : statusOrder.indexOf(b.status)

    return aIndex - bIndex || a.biomarker.name.localeCompare(b.biomarker.name, 'pt-PT')
  })

  if (!exam) {
    return <EmptyState title="Ainda não existem análises" text="Começa por inserir uma análise. Depois a app mostra aqui o resumo por biomarcador." />
  }

  return (
    <section className="screen">
      <div className="info-chip">
        {exam.name || 'Análise'} · {formatDate(exam.date)}{exam.time ? ` · ${exam.time}` : ''}
      </div>

      <button className="report-entry-card" onClick={onOpenReport}>
        <div>
          <span>Relatório clínico</span>
          <strong>Comparar com 3 meses e 6 meses</strong>
          <small>Ver tendências, médias e alertas da última análise.</small>
        </div>

        <FileText size={24} />
      </button>

      <div className="status-grid">
        <StatusCard label="Fora do intervalo" count={grouped.out.length} status="out" />
        <StatusCard label="Ideal" count={grouped.ideal.length} status="ideal" />
        <StatusCard label="Sem referência" count={grouped.unknown.length} status="unknown" />
      </div>

      <div className="search-box">
        <Search size={18} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar biomarcadores" />
      </div>

      <div className="list-block compact-list">
        {orderedCards.map(({ biomarker, value, status }) => (
          <button className="metric-card" key={biomarker.id} onClick={() => onSelect(biomarker.id)}>
            <div>
              <strong>{biomarker.name}</strong>
              <b>{value}<small> {biomarker.unit}</small></b>
            </div>

            <MiniBar status={status} />
            <ChevronRight />
          </button>
        ))}
      </div>

      {!orderedCards.length && (
        <EmptyState title="Sem resultados" text="Não existem biomarcadores com esse filtro." compact />
      )}
    </section>
  )
}

function ReportView({ exam, exams, refs, onBack, onSelect }) {
  const rows = useMemo(() => buildReportRows(exam, exams, refs), [exam, exams, refs])

  if (!exam) {
    return <EmptyState title="Sem análise" text="Ainda não existe uma análise para gerar relatório." />
  }

  const grouped = {
    ideal: rows.filter((row) => row.status === 'ideal').length,
    sufficient: rows.filter((row) => row.status === 'sufficient').length,
    out: rows.filter((row) => row.status === 'out').length,
    unknown: rows.filter((row) => row.status === 'unknown' || row.status === 'empty').length
  }

  const highlights = rows.slice(0, 6)
  const chartRows = rows.filter((row) => row.series.length >= 2).slice(0, 4)
  const insightRows = reportInsightRows(rows)

  return (
    <section className="screen report-screen">
      <button className="back-button" onClick={onBack}>‹ Voltar ao resumo</button>

      <div className="report-hero">
        <div>
          <p className="eyebrow">Relatório de análises</p>
          <h2>Última análise</h2>
          <span>{exam.name || 'Análise'} · {formatDate(exam.date)}{exam.time ? ` · ${exam.time}` : ''}</span>
        </div>

        <button className="secondary-action print-button" onClick={() => window.print()}>
          <FileText size={18} /> Exportar / imprimir
        </button>
      </div>

      <div className="report-kpi-grid">
        <ReportKpi label="Indicadores" value={rows.length} tone="blue" />
        <ReportKpi label="Ideal" value={grouped.ideal} tone="green" />
        <ReportKpi label="Suficiente" value={grouped.sufficient} tone="orange" />
        <ReportKpi label="Fora" value={grouped.out} tone="red" />
      </div>

      <div className="section-header">
        <h3>Destaques</h3>
      </div>

      <div className="report-highlight-grid">
        {highlights.map((row) => (
          <button className="report-highlight-card" key={row.id} onClick={() => onSelect?.(row.id)}>
            <span>{row.biomarker.name}</span>
            <strong>{formatNumber(row.value)} <small>{row.biomarker.unit}</small></strong>
            <em>Ref. {formatRef(row.refConfig)}</em>
            <b className={classNameForStatus(row.status)}>{statusLabel(row.status)}</b>
          </button>
        ))}
      </div>

      <div className="report-reading-card">
        <strong>Leitura rápida</strong>
        <ul>
          {insightRows.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      </div>

      <div className="section-header">
        <h3>Comparação 3M / 6M</h3>
      </div>

      <div className="report-table-card">
        <table className="report-table">
          <thead>
            <tr>
              <th>Biomarcador</th>
              <th>Última</th>
              <th>Ref.</th>
              <th>Média 3M</th>
              <th>Média 6M</th>
              <th>Estado</th>
              <th>Tendência</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.biomarker.name}</td>
                <td>{formatNumber(row.value)} {row.biomarker.unit}</td>
                <td>{formatRef(row.refConfig)}</td>
                <td>{formatNumber(row.avg3m)}</td>
                <td>{formatNumber(row.avg6m)}</td>
                <td><span className={classNameForStatus(row.status)}>{statusLabel(row.status)}</span></td>
                <td><TrendIcon trend={row.trend} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-header">
        <h3>Evolução dos últimos 6 meses</h3>
      </div>

      {chartRows.length > 0 ? (
        <div className="report-chart-grid">
          {chartRows.map((row) => (
            <div className="report-chart-card" key={row.id}>
              <strong>{row.biomarker.name}</strong>
              <TrendChart series={row.series} refConfig={row.refConfig} unit={row.biomarker.unit} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="Dados insuficientes" text="São necessárias pelo menos duas análises por biomarcador para mostrar gráficos de evolução." compact />
      )}
    </section>
  )
}

function ReportKpi({ label, value, tone }) {
  return (
    <div className={`report-kpi ${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function TrendIcon({ trend }) {
  if (trend.direction === 'up') {
    return (
      <span className={`trend-icon ${trend.tone}`}>
        <TrendingUp size={16} />
        {trend.label}
      </span>
    )
  }

  if (trend.direction === 'down') {
    return (
      <span className={`trend-icon ${trend.tone}`}>
        <TrendingDown size={16} />
        {trend.label}
      </span>
    )
  }

  return (
    <span className="trend-icon neutral">
      <Minus size={16} />
      {trend.label}
    </span>
  )
}

function HistoryView({ exams, refs, onOpenExam, onNewExam }) {
  const orderedExams = [...exams].sort(sortExamDate)

  if (!orderedExams.length) {
    return (
      <section className="screen">
        <EmptyState title="Ainda não existem análises" text="Usa o botão + para criar a primeira análise." />
        <button className="primary-action" onClick={onNewExam}><Plus size={18} /> Nova Análise</button>
      </section>
    )
  }

  return (
    <section className="screen">
      <div className="intro-card clinical">
        <div className="intro-icon"><Database size={22} /></div>
        <div>
          <p className="eyebrow">Consulta</p>
          <h2>Histórico de análises</h2>
          <p>Consulta todas as análises registadas e abre rapidamente o respetivo resumo.</p>
        </div>
      </div>

      <div className="history-list">
        {orderedExams.map((exam) => {
          const cards = latestBiomarkerCards(exam, refs, ['out', 'ideal', 'sufficient', 'unknown', 'empty'])
          const outCount = cards.filter((c) => c.status === 'out').length
          const idealCount = cards.filter((c) => c.status === 'ideal' || c.status === 'sufficient').length
          const unknownCount = cards.filter((c) => c.status === 'unknown' || c.status === 'empty').length

          return (
            <button key={exam.id} className="history-card" onClick={() => onOpenExam(exam.id)}>
              <div className="history-card-head">
                <strong>{exam.name || 'Análise'}</strong>
                <ChevronRight size={18} />
              </div>

              <p>{formatDate(exam.date)}{exam.time ? ` · ${exam.time}` : ''}</p>

              <div className="history-card-meta">
                <span>{Object.keys(exam.values || {}).length} resultados</span>
                <em className="pill out">! Fora: {outCount}</em>
                <em className="pill ideal">✓ Ideal: {idealCount}</em>
                {unknownCount > 0 && <em className="pill unknown">? Sem ref.: {unknownCount}</em>}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function QuickAddSheet({ onClose, onNewExam, onNewDiary }) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="quick-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div className="sheet-header">
          <strong>Novo registo</strong>
          <button className="nav-icon mini" onClick={onClose} aria-label="Fechar"><X size={18} /></button>
        </div>

        <div className="quick-grid">
          <button className="quick-card" onClick={onNewExam}>
            <FlaskConical size={20} />
            <strong>Nova análise</strong>
            <span>Inserir resultados manualmente</span>
          </button>

          <button className="quick-card" onClick={onNewDiary}>
            <BookOpenCheck size={20} />
            <strong>Novo diário</strong>
            <span>Registar comportamentos do dia</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusCard({ label, count, status }) {
  return (
    <div className={`status-card ${status}`}>
      <span>{label}</span>
      <strong>{count}</strong>
      <small>biomarcadores</small>
    </div>
  )
}

function MiniBar({ status }) {
  return <div className={`mini-bar ${status}`}><span /><span /><i /></div>
}

const BIOMARKER_BEHAVIOUR_LINKS = {
  hemoglobina: {
    supportive: ['carne_vermelha', 'carne_branca', 'peixe', 'ovos', 'claras'],
    review: ['esquecimento_medicacao']
  },
  hematocrito: {
    supportive: ['carne_vermelha', 'carne_branca', 'peixe', 'ovos', 'claras'],
    review: ['esquecimento_medicacao']
  },
  ferritina: {
    supportive: ['carne_vermelha', 'carne_branca', 'peixe', 'ovos'],
    review: ['esquecimento_medicacao']
  },
  ferro_serico: {
    supportive: ['carne_vermelha', 'carne_branca', 'peixe', 'ovos'],
    review: ['esquecimento_medicacao']
  },
  potassio: {
    supportive: ['sessao_dialise_4h', 'sessao_dialise_6h30m'],
    review: ['banana', 'batata_tomate_espinafres', 'fruta_rica_potassio', 'frutos_secos_sementes', 'leguminosas', 'laticinios', 'iogurte_normal', 'iogurte_vegan', 'leite']
  },
  fosforo_inorganico: {
    supportive: ['quelante_fosforo', 'sessao_dialise_4h', 'sessao_dialise_6h30m'],
    review: ['laticinios', 'queijo', 'leite', 'iogurte_normal', 'frutos_secos_sementes', 'refrigerante_cola', 'enchidos_carne_processada', 'refeicao_fora_fast_food']
  },
  paratormona_pth: {
    supportive: ['quelante_fosforo', 'sessao_dialise_4h', 'sessao_dialise_6h30m'],
    review: ['laticinios', 'queijo', 'leite', 'iogurte_normal', 'frutos_secos_sementes', 'refrigerante_cola', 'enchidos_carne_processada']
  },
  sodio: {
    supportive: ['sessao_dialise_4h', 'sessao_dialise_6h30m'],
    review: ['refeicao_salgada', 'enchidos_carne_processada', 'refeicao_fora_fast_food', 'liquidos_acima_limite']
  },
  albumina: {
    supportive: ['peixe', 'carne_branca', 'carne_vermelha', 'ovos', 'claras'],
    review: ['esquecimento_medicacao']
  },
  ureia_pre_dialise: {
    supportive: ['sessao_dialise_4h', 'sessao_dialise_6h30m'],
    review: ['carne_vermelha', 'carne_branca', 'peixe', 'ovos', 'laticinios']
  },
  ureia_pos_dialise: {
    supportive: ['sessao_dialise_4h', 'sessao_dialise_6h30m'],
    review: ['carne_vermelha', 'carne_branca', 'peixe', 'ovos', 'laticinios']
  },
  glicemia: {
    supportive: ['atividade_fisica'],
    review: ['doces_pastelaria', 'bolachas', 'chocolate', 'refrigerante_cola', 'refeicao_fora_fast_food']
  },
  hemoglobina_glicada: {
    supportive: ['atividade_fisica'],
    review: ['doces_pastelaria', 'bolachas', 'chocolate', 'refrigerante_cola', 'refeicao_fora_fast_food']
  },
  trigliceridos: {
    supportive: ['atividade_fisica', 'peixe'],
    review: ['doces_pastelaria', 'bolachas', 'chocolate', 'alcool', 'refeicao_fora_fast_food']
  },
  colesterol_total: {
    supportive: ['atividade_fisica', 'peixe'],
    review: ['enchidos_carne_processada', 'carne_vermelha', 'refeicao_fora_fast_food', 'doces_pastelaria']
  },
  colesterol_ldl: {
    supportive: ['atividade_fisica', 'peixe'],
    review: ['enchidos_carne_processada', 'carne_vermelha', 'refeicao_fora_fast_food', 'doces_pastelaria']
  }
}

function distanceToReference(value, ref) {
  const n = parseNum(value)

  if (n === null) return null

  const lo = parseNum(ref?.idealMin) ?? parseNum(ref?.sufficientMin)
  const hi = parseNum(ref?.idealMax) ?? parseNum(ref?.sufficientMax)
  const direction = ref?.direction || 'range'

  if (direction === 'lower') {
    const limit = hi ?? lo
    if (limit === null) return null
    return Math.max(0, n - limit)
  }

  if (direction === 'higher') {
    const limit = lo ?? hi
    if (limit === null) return null
    return Math.max(0, limit - n)
  }

  if (lo === null && hi === null) return null
  if (lo !== null && n < lo) return lo - n
  if (hi !== null && n > hi) return n - hi

  return 0
}

function compareBiomarkerValues(current, previous, ref) {
  const currentValue = parseNum(current)
  const previousValue = parseNum(previous)

  if (currentValue === null || previousValue === null) return null

  const absoluteChange = currentValue - previousValue
  const percentChange = Math.abs(previousValue) > 0.00001
    ? (absoluteChange / Math.abs(previousValue)) * 100
    : null

  const currentDistance = distanceToReference(currentValue, ref)
  const previousDistance = distanceToReference(previousValue, ref)
  let outcome = 'stable'

  if (currentDistance !== null && previousDistance !== null) {
    const distanceChange = currentDistance - previousDistance

    if (distanceChange < -0.00001) outcome = 'improved'
    if (distanceChange > 0.00001) outcome = 'worsened'
  } else if (Math.abs(absoluteChange) > 0.00001) {
    outcome = absoluteChange > 0 ? 'increased' : 'decreased'
  }

  return {
    currentValue,
    previousValue,
    absoluteChange,
    percentChange,
    outcome
  }
}

function diaryRowsBetween(diary, previousDate, latestDate) {
  return diary.filter((item) => {
    if (!item?.date || item.behaviourId === '__note__') return false
    return item.date > previousDate && item.date <= latestDate
  })
}

function summarisePeriodBehaviours({ behaviours, diary, previousDate, latestDate, biomarkerId }) {
  const rows = diaryRowsBetween(diary, previousDate, latestDate)
  const links = BIOMARKER_BEHAVIOUR_LINKS[biomarkerId] || { supportive: [], review: [] }
  const linkedIds = new Set([...links.supportive, ...links.review])

  return behaviours
    .filter((behaviour) => linkedIds.has(behaviour.id))
    .map((behaviour) => {
      const behaviourRows = rows.filter((item) => item.behaviourId === behaviour.id)
      const yesCount = behaviourRows.filter((item) => item.value === true).length
      const noCount = behaviourRows.filter((item) => item.value === false).length
      const totalCount = yesCount + noCount

      return {
        behaviour,
        group: links.supportive.includes(behaviour.id) ? 'supportive' : 'review',
        yesCount,
        noCount,
        totalCount,
        rate: totalCount ? (yesCount / totalCount) * 100 : null
      }
    })
    // Os valores 'Não' são gravados por defeito no diário e não representam
    // necessariamente um comportamento assinalado pelo utilizador. Para esta
    // leitura mostramos apenas comportamentos com pelo menos um registo 'Sim'.
    .filter((row) => row.yesCount > 0)
    .sort((a, b) => b.yesCount - a.yesCount || b.totalCount - a.totalCount || a.behaviour.label.localeCompare(b.behaviour.label, 'pt-PT'))
}

function confidenceFromHistory(examCount) {
  if (examCount >= 8) return 'Elevada'
  if (examCount >= 4) return 'Média'
  return 'Baixa'
}


const PHOSPHORUS_RULES = {
  hiddenPhosphates: [
    'pao',
    'bolachas',
    'iogurte_vegan',
    'doces_pastelaria',
    'enchidos_carne_processada',
    'refeicao_fora_fast_food',
    'refrigerante_cola'
  ],
  directSources: [
    'queijo',
    'leite',
    'iogurte_normal',
    'laticinios',
    'frutos_secos_sementes',
    'leguminosas',
    'carne_vermelha',
    'carne_branca',
    'peixe',
    'marisco',
    'ovos'
  ],
  potassium: [
    'banana',
    'batata_tomate_espinafres',
    'fruta_rica_potassio',
    'frutos_secos_sementes',
    'leguminosas',
    'laticinios',
    'iogurte_normal',
    'iogurte_vegan',
    'leite'
  ],
  protein: ['peixe', 'carne_branca', 'carne_vermelha', 'marisco', 'ovos', 'claras'],
  glycaemic: ['doces_pastelaria', 'bolachas', 'chocolate', 'pao', 'arroz_massa', 'refrigerante_cola'],
  sodiumAndFluids: ['refeicao_salgada', 'enchidos_carne_processada', 'refeicao_fora_fast_food', 'liquidos_acima_limite']
}

function shiftIsoDate(dateText, deltaDays) {
  const date = toDate(dateText)
  date.setDate(date.getDate() + deltaDays)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 10)
}

function trueDiaryRowsBetween(diary, startDate, endDate) {
  return diary.filter((item) => {
    return item?.date &&
      item.behaviourId !== '__note__' &&
      item.value === true &&
      item.date > startDate &&
      item.date <= endDate
  })
}

function behaviourCountMap(rows) {
  const counts = new Map()

  rows.forEach((row) => {
    counts.set(row.behaviourId, (counts.get(row.behaviourId) || 0) + 1)
  })

  return counts
}

function behaviourDays(rows, ids) {
  const allowed = new Set(ids)
  return new Set(rows.filter((row) => allowed.has(row.behaviourId)).map((row) => row.date)).size
}

function behaviourPeriodItems(rows, ids, behaviourMap, previousCounts = new Map()) {
  const counts = behaviourCountMap(rows)

  return ids
    .map((id) => {
      const count = counts.get(id) || 0
      const previousCount = previousCounts.get(id) || 0
      const behaviour = behaviourMap.get(id)

      return {
        id,
        label: behaviour?.label || id.replaceAll('_', ' '),
        count,
        previousCount,
        change: count - previousCount
      }
    })
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count || b.change - a.change || a.label.localeCompare(b.label, 'pt-PT'))
}

function dialysisHours(rows) {
  const sessionsByDate = new Map()

  rows.forEach((row) => {
    let hours = 0
    if (row.behaviourId === 'sessao_dialise_4h') hours = 4
    if (row.behaviourId === 'sessao_dialise_6h30m') hours = 6.5
    if (!hours) return

    sessionsByDate.set(row.date, Math.max(sessionsByDate.get(row.date) || 0, hours))
  })

  return Array.from(sessionsByDate.values()).reduce((total, value) => total + value, 0)
}

function formatList(items, limit = 4) {
  return items
    .slice(0, limit)
    .map((item) => `${item.label} (${item.count} ${item.count === 1 ? 'dia' : 'dias'})`)
    .join(', ')
}

function buildPhosphorusAnalysis({ diary, behaviours, previousDate, latestDate, comparison }) {
  const intervalDays = Math.max(1, daysBetween(latestDate, previousDate))
  const comparisonStart = shiftIsoDate(previousDate, -intervalDays)
  const currentRows = trueDiaryRowsBetween(diary, previousDate, latestDate)
  const previousRows = trueDiaryRowsBetween(diary, comparisonStart, previousDate)
  const currentCounts = behaviourCountMap(currentRows)
  const previousCounts = behaviourCountMap(previousRows)
  const behaviourMap = new Map(behaviours.map((behaviour) => [behaviour.id, behaviour]))

  const hiddenItems = behaviourPeriodItems(currentRows, PHOSPHORUS_RULES.hiddenPhosphates, behaviourMap, previousCounts)
  const directItems = behaviourPeriodItems(currentRows, PHOSPHORUS_RULES.directSources, behaviourMap, previousCounts)
  const hypotheses = []
  const questions = []

  if (hiddenItems.length) {
    const increased = hiddenItems.filter((item) => item.change > 0)
    const evidence = formatList(increased.length ? increased : hiddenItems)

    hypotheses.push({
      title: 'Fósforo escondido em alimentos processados',
      text: increased.length
        ? `Foram registados alimentos com possível presença de fosfatos adicionados e alguns aumentaram face ao período anterior: ${evidence}.`
        : `Foram registados alimentos que podem conter fosfatos adicionados: ${evidence}. A presença depende da marca, ingredientes e processamento.`,
      tone: 'negative'
    })
    questions.push('Confirmar nos rótulos a presença de aditivos com “fosfato”, “ácido fosfórico” ou códigos E338–E341, E343 e E450–E452.')
  }

  const riskFoodDays = behaviourDays(currentRows, [...PHOSPHORUS_RULES.hiddenPhosphates, ...PHOSPHORUS_RULES.directSources])
  const binderDays = currentCounts.get('quelante_fosforo') || 0
  const forgottenDays = currentCounts.get('esquecimento_medicacao') || 0

  if (forgottenDays > 0 || (riskFoodDays > 0 && binderDays > 0)) {
    let text = ''

    if (forgottenDays > 0) {
      text = `Foram registados ${forgottenDays} ${forgottenDays === 1 ? 'dia' : 'dias'} com esquecimento da medicação.`
    } else {
      text = `O quelante foi registado em ${binderDays} ${binderDays === 1 ? 'dia' : 'dias'}, mas existiram ${riskFoodDays} dias com alimentos potencialmente relevantes. O diário não confirma se foi tomado com cada refeição ou snack com fósforo, nem se a dose e o momento foram adequados.`
    }

    hypotheses.push({
      title: 'Cobertura do quelante a confirmar',
      text,
      tone: forgottenDays > 0 ? 'negative' : 'neutral'
    })
    questions.push('Confirmar se o quelante foi tomado com todas as refeições e snacks que continham fósforo, na dose e momento prescritos.')
  }

  const currentDialysisHours = dialysisHours(currentRows)
  const previousDialysisHours = dialysisHours(previousRows)
  const dialysisChange = previousDialysisHours > 0
    ? ((currentDialysisHours - previousDialysisHours) / previousDialysisHours) * 100
    : null

  if (currentDialysisHours > 0 || previousDialysisHours > 0) {
    const reduced = dialysisChange !== null && dialysisChange <= -10

    hypotheses.push({
      title: reduced ? 'Redução das horas de diálise registadas' : 'Adequação da diálise a rever',
      text: previousDialysisHours > 0
        ? `Foram registadas ${formatNumber(currentDialysisHours)} horas no período atual e ${formatNumber(previousDialysisHours)} horas no período anterior${dialysisChange !== null ? ` (${dialysisChange >= 0 ? '+' : ''}${dialysisChange.toFixed(1).replace('.', ',')}%)` : ''}. ${reduced ? 'A redução pode influenciar a remoção de fósforo e deve ser interpretada com a equipa clínica.' : 'A duração registada, faltas e adequação das sessões devem ser consideradas na leitura do resultado.'}`
        : `Foram registadas ${formatNumber(currentDialysisHours)} horas de diálise no período. Não existem dados suficientes no período anterior para comparar.`,
      tone: reduced ? 'negative' : 'neutral'
    })
    questions.push('Confirmar se existiram sessões encurtadas, faltas, alterações de frequência ou problemas de adequação da diálise.')
  }

  if (directItems.length && hypotheses.length < 3) {
    hypotheses.push({
      title: 'Fontes alimentares diretas de fósforo',
      text: `Foram registadas fontes alimentares relevantes: ${formatList(directItems)}. O impacto depende das porções e da absorção do fósforo de cada alimento.`,
      tone: 'neutral'
    })
  }

  const otherPoints = []
  const potassiumDays = behaviourDays(currentRows, PHOSPHORUS_RULES.potassium)
  const proteinDays = behaviourDays(currentRows, PHOSPHORUS_RULES.protein)
  const glycaemicItems = behaviourPeriodItems(currentRows, PHOSPHORUS_RULES.glycaemic, behaviourMap, previousCounts)
  const sodiumDays = behaviourDays(currentRows, PHOSPHORUS_RULES.sodiumAndFluids)

  if (potassiumDays > 0) {
    otherPoints.push(`Potássio: foram registados ${potassiumDays} dias com alimentos explicitamente associados a maior carga de potássio. A leitura deve considerar quantidades, intervalo desde a última diálise, medicação e possível hemólise da amostra.`)
  } else {
    otherPoints.push('Potássio: não foram assinalados alimentos explicitamente classificados como ricos em potássio neste período; ainda assim, as quantidades e a composição real das refeições não são conhecidas.')
  }

  if (proteinDays > 0) {
    otherPoints.push(`Ureia e nutrição: foram registadas fontes proteicas em ${proteinDays} dias. Não se deve reduzir proteína apenas com base nesta contagem; é necessário considerar porções, albumina e adequação da diálise.`)
  }

  if (glycaemicItems.length) {
    const increasedGlycaemic = glycaemicItems.filter((item) => item.change > 0)
    otherPoints.push(`Glicemia e triglicéridos: ${formatList(increasedGlycaemic.length ? increasedGlycaemic : glycaemicItems)} foram registados no período${increasedGlycaemic.length ? ' e aumentaram face ao período anterior' : ''}.`)
  }

  if (sodiumDays > 0) {
    otherPoints.push(`Sódio e líquidos: existiram ${sodiumDays} dias com comportamentos potencialmente relevantes. Para interpretar melhor faltam o volume real de líquidos e o ganho de peso entre sessões.`)
  } else {
    otherPoints.push('Sódio e líquidos: não foram assinalados comportamentos de risco neste grupo, mas faltam valores reais de ingestão de líquidos e ganho de peso entre sessões.')
  }

  const conclusionParts = hypotheses.slice(0, 3).map((item) => item.title.toLowerCase())
  const conclusion = conclusionParts.length
    ? `A principal hipótese é a combinação de ${conclusionParts.join(' + ')}. Esta é uma leitura orientada por regras e pelos registos disponíveis, não uma conclusão clínica.`
    : 'Os registos disponíveis não permitem destacar uma causa principal. Devem ser revistas porções, rótulos, adesão ao quelante e adequação da diálise.'

  return {
    intervalDays,
    comparisonStart,
    currentRows,
    previousRows,
    hypotheses,
    otherPoints,
    questions: Array.from(new Set(questions)),
    conclusion,
    comparison
  }
}

function ClinicalRuleAnalysis({ analysis }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="section-header">
        <h3>Hipóteses principais</h3>
        <span>{analysis.hypotheses.length}</span>
      </div>

      {analysis.hypotheses.length > 0 ? (
        analysis.hypotheses.map((item) => (
          <div key={item.title} className={`suggestion-card ${item.tone || 'neutral'}`}>
            <strong>{item.title}</strong>
            <p>{item.text}</p>
          </div>
        ))
      ) : (
        <EmptyState title="Sem hipótese principal" text="Não foram encontrados registos suficientes para destacar fatores plausíveis neste período." compact />
      )}

      <div className="section-header">
        <h3>Outros pontos a considerar</h3>
      </div>

      <div className="report-reading-card">
        <ul>
          {analysis.otherPoints.map((text) => <li key={text}>{text}</li>)}
        </ul>
      </div>

      <div className="section-header">
        <h3>O que falta confirmar</h3>
      </div>

      <div className="report-reading-card">
        <ul>
          {analysis.questions.length > 0
            ? analysis.questions.map((text) => <li key={text}>{text}</li>)
            : <li>Confirmar porções, rótulos dos alimentos, data e condições da colheita.</li>}
        </ul>
      </div>

      <div className="suggestion-card neutral">
        <strong>Conclusão orientativa</strong>
        <p>{analysis.conclusion}</p>
      </div>
    </div>
  )
}

function BiomarkerDetail({ id, exams, refs, onBack }) {
  const biomarker = biomarkers.find((b) => b.id === id)

  const series = [...exams]
    .filter((e) => parseNum(e.values?.[id]) !== null)
    .sort((a, b) => `${a.date} ${a.time || ''}`.localeCompare(`${b.date} ${b.time || ''}`))
    .slice(-10)
    .map((e) => ({ date: e.date, value: parseNum(e.values[id]) }))

  const last = series[series.length - 1]
  const refConfig = getReferenceConfig(id, refs)
  const status = last ? getStatus(last.value, refConfig) : 'empty'

  if (!biomarker) return null

  return (
    <section className="screen detail-screen">
      <button className="back-button" onClick={onBack}>‹ Voltar</button>

      <div className="detail-heading">
        <div>
          <h2>{biomarker.name}</h2>
          <p>{biomarker.description}</p>
        </div>

        <em className={classNameForStatus(status)}>{statusLabel(status)}</em>
      </div>

      {last && (
        <div className="latest-card">
          <span>Último resultado</span>
          <strong>{last.value}<small> {biomarker.unit}</small></strong>
          <em className={classNameForStatus(status)}>{statusIcon(status)} {statusLabel(status)}</em>
        </div>
      )}

      <div className="section-header">
        <h3>Evolução dos últimos 10 resultados</h3>
      </div>

      <TrendChart series={series} refConfig={refConfig} unit={biomarker.unit} />

      <div className="note-card">
        <strong>Notas</strong>
        <p>Usa a evolução juntamente com o diário alimentar. Esta leitura não substitui validação clínica.</p>
      </div>
    </section>
  )
}

function formatReferenceValue(value) {
  const n = parseNum(value)

  if (n === null) return null

  return Number.isInteger(n) ? String(n) : String(n).replace('.', ',')
}

function referenceBand(refConfig) {
  const idealLo = parseNum(refConfig?.idealMin)
  const idealHi = parseNum(refConfig?.idealMax)
  const sufficientLo = parseNum(refConfig?.sufficientMin)
  const sufficientHi = parseNum(refConfig?.sufficientMax)

  const idealComplete = idealLo !== null && idealHi !== null
  const sufficientComplete = sufficientLo !== null && sufficientHi !== null

  if (idealComplete) {
    return {
      label: 'Ideal',
      lo: idealLo,
      hi: idealHi,
      display: `${formatReferenceValue(idealLo)}–${formatReferenceValue(idealHi)}`,
      sufficientLo,
      sufficientHi
    }
  }

  if (sufficientComplete) {
    return {
      label: 'Ideal',
      lo: sufficientLo,
      hi: sufficientHi,
      display: `${formatReferenceValue(sufficientLo)}–${formatReferenceValue(sufficientHi)}`,
      sufficientLo,
      sufficientHi
    }
  }

  return {
    label: 'Referência',
    lo: idealLo ?? sufficientLo,
    hi: idealHi ?? sufficientHi,
    display: 'Sem intervalo',
    sufficientLo,
    sufficientHi
  }
}

function TrendChart({ series, refConfig, unit }) {
  if (series.length < 2) {
    return <EmptyState title="Dados insuficientes" text="São necessárias pelo menos duas entradas deste biomarcador para mostrar evolução." compact />
  }

  const band = referenceBand(refConfig)
  const values = series.map((s) => s.value)

  const referenceValues = [
    refConfig?.sufficientMin,
    refConfig?.sufficientMax,
    refConfig?.idealMin,
    refConfig?.idealMax
  ]
    .map(parseNum)
    .filter((v) => v !== null)

  const min = Math.min(...values, ...referenceValues)
  const max = Math.max(...values, ...referenceValues)
  const pad = Math.max((max - min) * 0.22, 1)
  const yMin = min - pad
  const yMax = max + pad

  const plot = { x: 42, y: 24, w: 300, h: 184 }
  const labelX = 366
  const baseY = 246
  const viewBox = '0 0 460 282'

  const x = (idx) => plot.x + (idx * (plot.w / Math.max(series.length - 1, 1)))
  const y = (v) => plot.y + plot.h - ((v - yMin) / (yMax - yMin)) * plot.h
  const clampY = (v) => Math.max(plot.y, Math.min(plot.y + plot.h, y(v)))
  const points = series.map((s, i) => `${x(i)},${y(s.value)}`).join(' ')

  const hasMainBand = band.lo !== null && band.hi !== null
  const mainTop = hasMainBand ? clampY(band.hi) : null
  const mainBottom = hasMainBand ? clampY(band.lo) : null
  const sufficientComplete = band.sufficientLo !== null && band.sufficientHi !== null
  const sufficientTop = sufficientComplete ? clampY(band.sufficientHi) : null
  const sufficientBottom = sufficientComplete ? clampY(band.sufficientLo) : null

  const rowTop = plot.y
  const rowBottom = plot.y + plot.h
  const valueLabelY = 16

  return (
    <div className="chart-card large-chart">
      <svg viewBox={viewBox} role="img" aria-label="Evolução do biomarcador">
        <rect x={plot.x} y={plot.y} width={plot.w} height={plot.h} rx="16" className="plot-surface" />
        <rect x={plot.x} y={plot.y} width={plot.w} height={plot.h} rx="16" className="band-out-top" />

        {sufficientComplete && (
          <rect
            x={plot.x}
            y={sufficientTop}
            width={plot.w}
            height={Math.max(4, sufficientBottom - sufficientTop)}
            className="band-sufficient"
          />
        )}

        {hasMainBand && (
          <rect
            x={plot.x}
            y={mainTop}
            width={plot.w}
            height={Math.max(4, mainBottom - mainTop)}
            className={band.label === 'Ideal' ? 'band-ideal' : 'band-reference'}
          />
        )}

        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const gy = plot.y + plot.h * ratio

          return <line key={ratio} x1={plot.x} y1={gy} x2={plot.x + plot.w} y2={gy} className="grid-line" />
        })}

        <line x1={plot.x} y1={plot.y + plot.h} x2={plot.x + plot.w} y2={plot.y + plot.h} className="axis" />
        <line x1={plot.x} y1={plot.y} x2={plot.x} y2={plot.y + plot.h} className="axis" />

        {hasMainBand && (
          <>
            <line x1={plot.x} y1={mainTop} x2={plot.x + plot.w} y2={mainTop} className="reference-line" />
            <line x1={plot.x} y1={mainBottom} x2={plot.x + plot.w} y2={mainBottom} className="reference-line" />
          </>
        )}

        <polyline points={points} fill="none" className="trend-line" />

        {series.map((s, i) => (
          <g key={`${s.date}-${i}`}>
            <circle cx={x(i)} cy={y(s.value)} r="6.2" className="trend-point" />
            <text x={x(i)} y={y(s.value) - 12} textAnchor="middle" className="point-value">{String(s.value).replace('.', ',')}</text>
            <text x={x(i)} y={baseY} textAnchor="middle" className="date-label">{formatDateShort(s.date)}</text>
          </g>
        ))}

        <text x={plot.x} y={valueLabelY} className="axis-label">{yMax.toFixed(1).replace('.', ',')}</text>
        <text x={plot.x} y={baseY} className="axis-label lower">{yMin.toFixed(1).replace('.', ',')}</text>

        {hasMainBand ? (
          <>
            <text x={labelX} y={Math.max(rowTop + 20, mainTop - 12)} className="range-label out">
              <tspan x={labelX}>Acima</tspan>
              <tspan x={labelX} dy="16">&gt; {formatReferenceValue(band.hi)}</tspan>
            </text>

            <text x={labelX} y={(mainTop + mainBottom) / 2 - 8} className={band.label === 'Ideal' ? 'range-label ideal' : 'range-label sufficient'}>
              <tspan x={labelX}>{band.label}</tspan>
              <tspan x={labelX} dy="16">{band.display}</tspan>
            </text>

            <text x={labelX} y={Math.min(rowBottom - 18, mainBottom + 22)} className="range-label out">
              <tspan x={labelX}>Abaixo</tspan>
              <tspan x={labelX} dy="16">&lt; {formatReferenceValue(band.lo)}</tspan>
            </text>
          </>
        ) : (
          <text x={labelX} y={plot.y + plot.h / 2 - 8} className="range-label sufficient">
            <tspan x={labelX}>Sem</tspan>
            <tspan x={labelX} dy="16">referência</tspan>
          </text>
        )}
      </svg>

      <small className="chart-unit">Unidade: {unit || 'sem unidade'}</small>
    </div>
  )
}

function DiaryView({ diary, setDiary, behaviours, syncCloudSnapshot }) {
  const [date, setDate] = useState(yesterdayISO())
  const [values, setValues] = useState({})
  const [note, setNote] = useState('')

  useEffect(() => {
    const existing = diary.filter((d) => d.date === date)
    const existingValues = Object.fromEntries(
      existing
        .filter((d) => d.behaviourId !== '__note__')
        .map((d) => [d.behaviourId, d.value === true])
    )
    const defaultNoValues = Object.fromEntries(behaviours.map((b) => [b.id, existingValues[b.id] === true]))

    setValues(defaultNoValues)
    setNote(existing.find((d) => d.behaviourId === '__note__')?.note || '')
  }, [date, diary, behaviours])

  function setAnswer(id, value) {
    setValues({ ...values, [id]: value })
  }

  function saveDiary() {
    const otherDays = diary.filter((d) => d.date !== date)
    const dayRows = behaviours.map((b) => ({ date, behaviourId: b.id, label: b.label, value: values[b.id] === true }))
    const noteRow = { date, behaviourId: '__note__', label: 'Nota diária', value: null, note }
    const nextDiary = [...otherDays, ...dayRows, noteRow]

    setDiary(nextDiary)
    syncCloudSnapshot?.({ diary: nextDiary })

    alert('Diário guardado.')
  }

  return (
    <section className="screen">
      <div className="date-switch">
        <button onClick={() => setDate(shiftDate(date, -1))}>‹</button>

        <label>
          Data de referência
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>

        <button onClick={() => setDate(shiftDate(date, 1))}>›</button>
      </div>

      <div className="section-header">
        <h3>Comportamentos do dia anterior</h3>
        <span>Por defeito: Não</span>
      </div>

      <div className="diary-list">
        {behaviours.map((b) => (
          <div className="diary-row" key={b.id}>
            <span>{b.label}</span>

            <div>
              <button className={values[b.id] === false ? 'no active' : 'no'} onClick={() => setAnswer(b.id, false)}><X size={14} />Não</button>
              <button className={values[b.id] === true ? 'yes active' : 'yes'} onClick={() => setAnswer(b.id, true)}><Check size={14} />Sim</button>
            </div>
          </div>
        ))}
      </div>

      <div className="note-field">
        <label>Notas</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 300))} placeholder="Escreve algo sobre o dia..." />
        <small>{note.length}/300</small>
      </div>


      <button className="primary-action" onClick={saveDiary}><Save size={18} /> Guardar Diário</button>
    </section>
  )
}

function shiftDate(dateText, delta) {
  const d = toDate(dateText)

  d.setDate(d.getDate() + delta)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())

  return d.toISOString().slice(0, 10)
}

function ImpactView({ exams, diary, behaviours, refs, latestExam, initialSelected }) {
  const targetCards = useMemo(() => latestBiomarkerCards(latestExam, refs), [latestExam, refs])
  const targetBiomarkers = targetCards.map((card) => card.biomarker)
  const fallbackSelected = initialSelected || targetBiomarkers[0]?.id || biomarkers[0]?.id
  const [selected, setSelected] = useState(fallbackSelected)

  useEffect(() => {
    if (initialSelected) setSelected(initialSelected)
  }, [initialSelected])

  useEffect(() => {
    if (!targetBiomarkers.length) return

    if (!targetBiomarkers.some((b) => b.id === selected)) {
      setSelected(targetBiomarkers[0].id)
    }
  }, [targetBiomarkers, selected])

  const biomarker = biomarkers.find((b) => b.id === selected) || targetBiomarkers[0] || biomarkers[0]
  const selectedCard = targetCards.find((card) => card.biomarker.id === biomarker?.id)

  const biomarkerExams = useMemo(() => {
    return [...exams]
      .filter((exam) => parseNum(exam.values?.[biomarker?.id]) !== null)
      .sort((a, b) => `${a.date} ${a.time || ''}`.localeCompare(`${b.date} ${b.time || ''}`))
  }, [exams, biomarker])

  const latestBiomarkerExam = biomarkerExams[biomarkerExams.length - 1] || null
  const previousBiomarkerExam = biomarkerExams[biomarkerExams.length - 2] || null
  const refConfig = getReferenceConfig(biomarker?.id, refs)
  const comparison = latestBiomarkerExam && previousBiomarkerExam
    ? compareBiomarkerValues(
        latestBiomarkerExam.values?.[biomarker.id],
        previousBiomarkerExam.values?.[biomarker.id],
        refConfig
      )
    : null

  const periodRows = useMemo(() => {
    if (!previousBiomarkerExam || !latestBiomarkerExam || !biomarker) return []

    return summarisePeriodBehaviours({
      behaviours,
      diary,
      previousDate: previousBiomarkerExam.date,
      latestDate: latestBiomarkerExam.date,
      biomarkerId: biomarker.id
    })
  }, [behaviours, diary, previousBiomarkerExam, latestBiomarkerExam, biomarker])

  const phosphorusAnalysis = useMemo(() => {
    if (biomarker?.id !== 'fosforo_inorganico' || !comparison || !previousBiomarkerExam || !latestBiomarkerExam) return null

    return buildPhosphorusAnalysis({
      diary,
      behaviours,
      previousDate: previousBiomarkerExam.date,
      latestDate: latestBiomarkerExam.date,
      comparison
    })
  }, [biomarker, comparison, previousBiomarkerExam, latestBiomarkerExam, diary, behaviours])

  const reviewRows = periodRows.filter((row) => row.group === 'review').slice(0, 6)
  const supportiveRows = periodRows.filter((row) => row.group === 'supportive').slice(0, 6)
  const confidence = confidenceFromHistory(biomarkerExams.length)

  if (!latestExam) {
    return <EmptyState title="Ainda não existem análises" text="Insere primeiro uma análise para a app conseguir comparar a evolução dos biomarcadores com o diário." />
  }

  if (!targetBiomarkers.length) {
    return (
      <section className="screen">
        <EmptyState title="Sem biomarcadores para analisar" text="A última análise não tem biomarcadores com valor preenchido." />
      </section>
    )
  }

  return (
    <section className="screen">
      <div className="intro-card clinical">
        <div className="intro-icon"><Activity size={22} /></div>
        <div>
          <p className="eyebrow">Análise orientada por regras</p>
          <h2>O que poderá explicar esta evolução?</h2>
          <p>Compara os resultados e interpreta os comportamentos registados através de regras clínicas transparentes, sem inteligência artificial.</p>
        </div>
      </div>

      <div className="form-grid compact-grid">
        <label>
          Biomarcador
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            {targetBiomarkers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </label>
      </div>

      {selectedCard && (
        <div className={`followup-focus ${selectedCard.status}`}>
          <div>
            <span>Último resultado</span>
            <strong>{selectedCard.value}<small> {selectedCard.biomarker.unit}</small></strong>
          </div>

          <em className={classNameForStatus(selectedCard.status)}>{statusIcon(selectedCard.status)} {statusLabel(selectedCard.status)}</em>
        </div>
      )}

      {!comparison && (
        <div className="suggestion-card neutral">
          <strong>Ainda sem comparação disponível</strong>
          <p>É necessária uma segunda análise com valor para {biomarker.name}.</p>
          <span>O acompanhamento começa logo que existam dois resultados deste biomarcador.</span>
        </div>
      )}

      {comparison && (
        <>
          <div className={`suggestion-card ${comparison.outcome === 'worsened' ? 'negative' : comparison.outcome === 'improved' ? 'positive' : 'neutral'}`}>
            <strong>
              {comparison.outcome === 'worsened' && 'O biomarcador afastou-se da referência'}
              {comparison.outcome === 'improved' && 'O biomarcador aproximou-se da referência'}
              {comparison.outcome === 'stable' && 'O biomarcador manteve-se estável'}
              {comparison.outcome === 'increased' && 'O biomarcador aumentou'}
              {comparison.outcome === 'decreased' && 'O biomarcador diminuiu'}
            </strong>
            <p>
              {formatNumber(comparison.previousValue)} → {formatNumber(comparison.currentValue)} {biomarker.unit}
              {comparison.percentChange !== null && ` (${comparison.percentChange >= 0 ? '+' : ''}${comparison.percentChange.toFixed(1).replace('.', ',')}%)`}
            </p>
            <span>
              Entre {formatDate(previousBiomarkerExam.date)} e {formatDate(latestBiomarkerExam.date)} · {biomarkerExams.length} análises disponíveis no histórico
            </span>
          </div>

          {phosphorusAnalysis ? (
            <ClinicalRuleAnalysis analysis={phosphorusAnalysis} />
          ) : (
            <>
              <div className="section-header">
                <h3>Comportamentos registados a rever</h3>
                <span>{reviewRows.length}</span>
              </div>

              {reviewRows.length > 0 ? (
                <div className="impact-list">
                  {reviewRows.map((row) => <PeriodBehaviourRow key={row.behaviour.id} row={row} />)}
                </div>
              ) : (
                <EmptyState title="Sem comportamentos assinalados" text="Não existem comportamentos relevantes marcados como Sim entre as duas análises." compact />
              )}

              <div className="section-header">
                <h3>Adesão e fatores favoráveis registados</h3>
                <span>{supportiveRows.length}</span>
              </div>

              {supportiveRows.length > 0 ? (
                <div className="impact-list">
                  {supportiveRows.map((row) => <PeriodBehaviourRow key={row.behaviour.id} row={row} positive />)}
                </div>
              ) : (
                <EmptyState title="Sem fatores favoráveis assinalados" text="Não existem comportamentos deste grupo marcados como Sim durante o período analisado." compact />
              )}
            </>
          )}
        </>
      )}

      <div className="info-card warning-soft">
        <Sparkle />
        <p>Esta leitura é produzida por regras fixas e pelos dados registados. Identifica hipóteses plausíveis, não prova causa-efeito e não deve justificar alterações de dieta, líquidos, diálise ou medicação sem validação clínica.</p>
      </div>
    </section>
  )
}

function PeriodBehaviourRow({ row, positive = false }) {
  return (
    <div
      className="impact-row"
      style={{
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        alignItems: 'center',
        gap: '14px'
      }}
    >
      <div style={{ minWidth: 0 }}>
        <strong
          title={row.behaviour.label}
          style={{
            display: 'block',
            whiteSpace: 'normal',
            overflow: 'visible',
            textOverflow: 'clip',
            lineHeight: 1.3
          }}
        >
          {row.behaviour.label}
        </strong>
        <span
          style={{
            display: 'block',
            marginTop: '4px',
            fontSize: '12px',
            color: 'var(--muted)',
            fontWeight: 700
          }}
        >
          Assinalado em {row.yesCount} {row.yesCount === 1 ? 'dia' : 'dias'} no período
        </span>
      </div>

      <b
        className={positive ? 'positive' : 'negative'}
        style={{ whiteSpace: 'nowrap', textAlign: 'right' }}
      >
        {row.yesCount}× Sim
      </b>
    </div>
  )
}

function MoreView({ latestExam, refs, setRefs, goTo, onSelectBiomarker, onAnalyseImpact, cloudStatus, cloudMessage, loadCloudData, syncCloudSnapshot }) {
  const [showRefs, setShowRefs] = useState(false)
  const [query, setQuery] = useState('')

  const followUpCards = useMemo(() => {
    const q = query.trim().toLowerCase()

    return latestBiomarkerCards(latestExam, refs)
      .filter((card) => {
        return !q || `${card.biomarker.name} ${card.biomarker.category} ${card.biomarker.description}`.toLowerCase().includes(q)
      })
  }, [latestExam, refs, query])

  const counts = {
    out: followUpCards.filter((card) => card.status === 'out').length,
    ideal: followUpCards.filter((card) => card.status === 'ideal').length
  }

  return (
    <section className="screen">
      <div className="intro-card clinical">
        <div className="intro-icon"><LineChart size={22} /></div>
        <div>
          <p className="eyebrow">Acompanhamento</p>
          <h2>Estado dos biomarcadores</h2>
          <p>Esta área mostra todos os biomarcadores com valor na última análise, incluindo fora do intervalo, ideal e sem referência.</p>
        </div>
      </div>

      <div className="status-grid two-cols">
        <StatusCard label="Fora do intervalo" count={counts.out} status="out" />
        <StatusCard label="Ideal" count={counts.ideal} status="ideal" />
      </div>

      <div className="search-box">
        <Search size={18} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar biomarcadores" />
      </div>

      {!latestExam && (
        <EmptyState title="Ainda não existem análises" text="Insere uma análise para aparecerem aqui os biomarcadores registados." compact />
      )}

      {latestExam && !followUpCards.length && (
        <EmptyState title="Sem biomarcadores com valor" text="Com os dados atuais, a última análise não tem biomarcadores com valor preenchido." compact />
      )}

      <div className="followup-list">
        {followUpCards.map(({ biomarker, value, status }) => (
          <article className={`followup-card ${status}`} key={biomarker.id}>
            <div className="followup-main">
              <MetricIcon category={biomarker.category} />

              <div>
                <strong>{biomarker.name}</strong>
                <span>{biomarker.category}</span>
                <b>{value}<small> {biomarker.unit}</small></b>
              </div>
            </div>

            <em className={classNameForStatus(status)}>{statusIcon(status)} {statusLabel(status)}</em>

            <div className="followup-actions">
              <button onClick={() => onSelectBiomarker?.(biomarker.id)}>Ver evolução</button>
              <button className="primary-mini" onClick={() => onAnalyseImpact?.(biomarker.id)}>Analisar impacto</button>
            </div>
          </article>
        ))}
      </div>

      <div className="info-card warning-soft">
        <Sparkle />
        <p>O objetivo é cruzar todos os biomarcadores registados com o diário de comportamentos e gerar pistas de melhoria. As sugestões são apoio ao acompanhamento, não decisão clínica.</p>
      </div>

      <div className="section-header">
        <h3>Ferramentas</h3>
      </div>

      <div className="tool-grid">
        <button onClick={loadCloudData}><Database size={18} /> Carregar cloud</button>
        <button onClick={() => syncCloudSnapshot?.()}><Save size={18} /> Guardar cloud</button>
        <button onClick={() => setShowRefs(!showRefs)}><SlidersHorizontal size={18} /> Referências</button>
        <button onClick={() => goTo('impact')}><Activity size={18} /> Análise de impacto</button>
      </div>

      <div className="cloud-note">
        <strong>Cloud Google Sheets · {cloudStatus}</strong>
        <p>{cloudMessage}</p>
      </div>

      {showRefs && <ReferenceEditor refs={refs} setRefs={setRefs} />}
    </section>
  )
}

function MetricIcon({ category }) {
  const c = category.toLowerCase()

  let icon = '•'

  if (c.includes('hemograma')) icon = 'Hb'
  if (c.includes('ferro')) icon = 'Fe'
  if (c.includes('inflama')) icon = 'CRP'
  if (c.includes('rim') || c.includes('diálise')) icon = 'R'
  if (c.includes('nutri')) icon = 'N'
  if (c.includes('fígado')) icon = 'ALT'
  if (c.includes('lípidos')) icon = 'LDL'
  if (c.includes('glicose')) icon = 'Glu'
  if (c.includes('mineral') || c.includes('eletrólitos')) icon = 'Na'
  if (c.includes('osso') || c.includes('pth')) icon = 'PTH'
  if (c.includes('próstata')) icon = 'PSA'

  return <span className="metric-icon">{icon}</span>
}

function Sparkle() {
  return <span className="sparkle">✦</span>
}

function EmptyState({ title, text, compact = false }) {
  return (
    <div className={compact ? 'empty compact' : 'empty'}>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  )
}

export default App
