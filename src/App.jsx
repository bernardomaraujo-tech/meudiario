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
  behaviours: 'ads_behaviours_v3',
  refs: 'ads_refs_v2',
  dataVersion: 'ads_data_version_v1',
  localResetVersion: 'ads_local_reset_version_v1'
}

const CLOUD_DATA_VERSION = '2026-05-25-referencias-seguras-final'

const LOCAL_KEYS_TO_FORGET = [
  'ads_exams_v2',
  'ads_diary_v2',
  'ads_behaviours_v3',
  'ads_refs_v2',
  'ads_data_version_v1'
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

  // Para biomarcadores onde quanto mais baixo melhor.
  // Aceita o limite tanto em refMax como em refMin, para compatibilidade com o ficheiro atual.
  if (direction === 'lower') {
    const limit = idealMax ?? refMax ?? idealMin ?? refMin

    if (limit === null) return 'unknown'

    return n <= limit ? 'ideal' : 'out'
  }

  // Para biomarcadores onde quanto mais alto melhor.
  // Aceita o limite tanto em refMin como em refMax, para compatibilidade com o ficheiro atual.
  if (direction === 'higher') {
    const limit = idealMin ?? refMin ?? idealMax ?? refMax

    if (limit === null) return 'unknown'

    return n >= limit ? 'ideal' : 'out'
  }

  // Para biomarcadores com intervalo normal.
  const hasIdeal = idealMin !== null || idealMax !== null
  const hasReference = refMin !== null || refMax !== null

  if (hasIdeal) return inRange(n, ref.idealMin, ref.idealMax) ? 'ideal' : 'out'
  if (hasReference) return inRange(n, ref.sufficientMin, ref.sufficientMax) ? 'ideal' : 'out'

  return 'unknown'
}

function statusLabel(status) {
  return {
    ideal: 'Ideal',
    sufficient: 'Ideal',
    out: 'Fora do intervalo',
    unknown: 'Sem referência',
    empty: 'Sem valor'
  }[status]
}

function statusIcon(status) {
  if (status === 'ideal') return '✓'
  if (status === 'sufficient') return '✓'
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
    history: 'Histórico de Análises',
    diary: 'Diário Alimentar',
    impact: 'Impacto dos Comportamentos',
    more: 'Acompanhamento'
  }[tab] || 'Meu Diário'
}

function isBlankReferenceValue(value) {
  return value === undefined || value === null || String(value).trim() === ''
}

function mergeReference(defaultRef = {}, cloudRef = {}) {
  const merged = { ...(defaultRef || {}) }

  if (!cloudRef || typeof cloudRef !== 'object') return merged

  ;['sufficientMin', 'sufficientMax', 'idealMin', 'idealMax', 'direction'].forEach((field) => {
    if (!isBlankReferenceValue(cloudRef[field])) {
      merged[field] = cloudRef[field]
    }
  })

  if (!merged.direction) merged.direction = defaultRef?.direction || cloudRef?.direction || 'range'

  return merged
}

function getReferenceConfig(id, refs = {}) {
  return mergeReference(defaultReferences[id], refs?.[id])
}

function withDefaultReferences(value) {
  const cloudRefs = value && typeof value === 'object' ? value : {}
  const ids = new Set([...Object.keys(defaultReferences), ...Object.keys(cloudRefs)])
  const mergedRefs = {}

  ids.forEach((id) => {
    mergedRefs[id] = mergeReference(defaultReferences[id], cloudRefs[id])
  })

  return mergedRefs
}

function withDefaultBehaviours(value) {
  if (!Array.isArray(value) || value.length === 0) return defaultBehaviours

  const existingIds = new Set(value.map((item) => item.id))
  const missingDefaults = defaultBehaviours.filter((item) => !existingIds.has(item.id))

  return [...value, ...missingDefaults]
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

function App() {
  const [tab, setTab] = useState('analysis')
  const [exams, setExams] = useState(() => loadJson(STORAGE.exams, []))
  const [diary, setDiary] = useState(() => loadJson(STORAGE.diary, []))
  const [behaviours, setBehaviours] = useState(() => withDefaultBehaviours(loadJson(STORAGE.behaviours, defaultBehaviours)))
  const [refs, setRefs] = useState(() => withDefaultReferences(loadJson(STORAGE.refs, defaultReferences)))
  const [dataVersion, setDataVersion] = useState(() => localStorage.getItem(STORAGE.dataVersion) || '')
  const isLoadingCloudRef = useRef(false)
  const [selectedBiomarkerId, setSelectedBiomarkerId] = useState(null)
  const [selectedExamId, setSelectedExamId] = useState(null)
  const [impactBiomarkerId, setImpactBiomarkerId] = useState(null)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [cloudStatus, setCloudStatus] = useState(isCloudConfigured() ? 'Ligado' : 'Não configurado')
  const [cloudMessage, setCloudMessage] = useState(isCloudConfigured() ? 'Dados locais antigos ignorados. A carregar dados atuais da cloud.' : 'Configura o Apps Script para ativar a sincronização.')

  useEffect(() => saveJson(STORAGE.exams, exams), [exams])
  useEffect(() => saveJson(STORAGE.diary, diary), [diary])
  useEffect(() => saveJson(STORAGE.behaviours, behaviours), [behaviours])
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
        setCloudStatus('Cloud vazia')
        setCloudMessage('A cloud está ligada, mas ainda não tem dados. Usa Guardar cloud no dispositivo onde tens os dados atuais para inicializar o Google Sheets.')
        return
      }

      const nextExams = Array.isArray(data.exams) ? data.exams : exams
      const nextDiary = Array.isArray(data.diary) ? data.diary : diary
      const nextBehaviours = Array.isArray(data.behaviours) && data.behaviours.length > 0
        ? withDefaultBehaviours(data.behaviours)
        : behaviours
      const nextRefs = data.refs && Object.keys(data.refs).length > 0
        ? withDefaultReferences(data.refs)
        : refs
      const nextDataVersion = data.dataVersion || ''

      setExams(nextExams)
      setDiary(nextDiary)
      setBehaviours(nextBehaviours)
      setRefs(nextRefs)
      setDataVersion(nextDataVersion)

      saveJson(STORAGE.exams, nextExams)
      saveJson(STORAGE.diary, nextDiary)
      saveJson(STORAGE.behaviours, nextBehaviours)
      saveJson(STORAGE.refs, nextRefs)
      localStorage.setItem(STORAGE.dataVersion, nextDataVersion)

      setCloudStatus('Sincronizado')
      setCloudMessage(`Dados carregados da cloud. Versão: ${nextDataVersion || 'sem versão'}. Última leitura: ${new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`)
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

    if (!dataVersion) {
      setCloudStatus('A carregar')
      setCloudMessage('Antes de guardar, a app precisa de carregar a versão atual da cloud. Clica em Carregar cloud e tenta novamente.')
      return
    }

    const payload = {
      dataVersion,
      exams: overrides.exams ?? exams,
      diary: overrides.diary ?? diary,
      behaviours: withDefaultBehaviours(overrides.behaviours ?? behaviours),
      refs: withDefaultReferences(overrides.refs ?? refs)
    }

    try {
      setCloudStatus('A guardar')
      setCloudMessage('A guardar dados no Google Sheets...')

      const result = await saveAllCloudData(payload)

      if (result?.dataVersion) {
        setDataVersion(result.dataVersion)
        localStorage.setItem(STORAGE.dataVersion, result.dataVersion)
      }

      setCloudStatus('Sincronizado')
      setCloudMessage(`Dados guardados na cloud. Versão: ${result?.dataVersion || dataVersion || 'sem versão'}. Última gravação: ${new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`)
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
            refs={refs}
            onSelect={setSelectedBiomarkerId}
          />
        )}

        {tab === 'diary' && (
          <DiaryView
            diary={diary}
            setDiary={setDiary}
            behaviours={behaviours}
            setBehaviours={setBehaviours}
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

function AnalysisView({ exam, refs, onSelect }) {
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

function buildImpactRows({ behaviours, exams, diary, biomarker, refs, windowDays }) {
  if (!biomarker) return []

  return behaviours
    .map((behaviour) => {
      const yesValues = []
      const noValues = []

      exams.forEach((exam) => {
        const value = parseNum(exam.values?.[biomarker.id])

        if (value === null) return

        const related = diary.filter((d) => {
          return d.behaviourId === behaviour.id &&
            daysBetween(exam.date, d.date) >= 0 &&
            daysBetween(exam.date, d.date) <= Number(windowDays)
        })

        if (!related.length) return

        const hadYes = related.some((d) => d.value === true)
        const hadOnlyNo = related.every((d) => d.value === false)

        if (hadYes) yesValues.push(value)
        if (hadOnlyNo) noValues.push(value)
      })

      const avgYes = average(yesValues)
      const avgNo = average(noValues)
      const score = classifyImpact(avgYes, avgNo, biomarker, getReferenceConfig(biomarker.id, refs))

      return {
        behaviour,
        avgYes,
        avgNo,
        yesCount: yesValues.length,
        noCount: noValues.length,
        score
      }
    })
    .sort((a, b) => Math.abs(b.score ?? 0) - Math.abs(a.score ?? 0))
}

function validImpact(row) {
  return row.score !== null && row.yesCount >= 1 && row.noCount >= 1
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

function DiaryView({ diary, setDiary, behaviours, setBehaviours, syncCloudSnapshot }) {
  const [date, setDate] = useState(yesterdayISO())
  const [values, setValues] = useState({})
  const [note, setNote] = useState('')
  const [newBehaviour, setNewBehaviour] = useState('')

  useEffect(() => {
    const existing = diary.filter((d) => d.date === date)

    setValues(Object.fromEntries(existing.filter((d) => d.behaviourId !== '__note__').map((d) => [d.behaviourId, d.value])))
    setNote(existing.find((d) => d.behaviourId === '__note__')?.note || '')
  }, [date, diary])

  function setAnswer(id, value) {
    setValues({ ...values, [id]: value })
  }

  function addBehaviour() {
    const label = newBehaviour.trim()

    if (!label) return

    const id = label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '') || crypto.randomUUID()

    if (behaviours.some((b) => b.id === id)) return

    setBehaviours([...behaviours, { id, label, category: 'Personalizado' }])
    setNewBehaviour('')
  }

  function saveDiary() {
    const otherDays = diary.filter((d) => d.date !== date)
    const dayRows = behaviours.map((b) => ({ date, behaviourId: b.id, label: b.label, value: values[b.id] ?? null }))
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

      <div className="add-row">
        <input value={newBehaviour} onChange={(e) => setNewBehaviour(e.target.value)} placeholder="Adicionar comportamento" />
        <button onClick={addBehaviour}><Plus size={18} /></button>
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
  const targetCards = useMemo(() => latestBiomarkerCards(latestExam, refs, ['out']), [latestExam, refs])
  const targetBiomarkers = targetCards.map((card) => card.biomarker)
  const fallbackSelected = initialSelected || targetBiomarkers[0]?.id || biomarkers[0]?.id
  const [selected, setSelected] = useState(fallbackSelected)
  const [windowDays, setWindowDays] = useState(7)

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

  const impactRows = useMemo(() => {
    return buildImpactRows({ behaviours, exams, diary, biomarker, refs, windowDays })
  }, [behaviours, exams, diary, biomarker, refs, windowDays])

  const harmful = impactRows.filter((row) => validImpact(row) && row.score < -3).slice(0, 3)
  const helpful = impactRows.filter((row) => validImpact(row) && row.score > 3).slice(0, 3)

  if (!latestExam) {
    return <EmptyState title="Ainda não existem análises" text="Insere primeiro uma análise para a app identificar os biomarcadores que merecem acompanhamento." />
  }

  if (!targetBiomarkers.length) {
    return (
      <section className="screen">
        <EmptyState title="Sem biomarcadores a acompanhar" text="Na última análise não existem biomarcadores fora do intervalo. A análise de impacto fica disponível quando existir algum ponto prioritário a acompanhar." />
      </section>
    )
  }

  return (
    <section className="screen">
      <div className="intro-card clinical">
        <div className="intro-icon"><Activity size={22} /></div>
        <div>
          <p className="eyebrow">Análise orientada</p>
          <h2>Impacto nos biomarcadores fora do intervalo</h2>
          <p>A app analisa prioritariamente os biomarcadores fora do intervalo na última análise.</p>
        </div>
      </div>

      <div className="form-grid compact-grid">
        <label>
          Biomarcador
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            {targetBiomarkers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </label>

        <label>
          Janela de análise
          <input type="number" min="1" max="90" value={windowDays} onChange={(e) => setWindowDays(e.target.value)} />
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

      <div className="section-header">
        <h3>Sugestões de comportamento</h3>
      </div>

      <div className="suggestion-grid">
        {harmful.length > 0 && (
          <div className="suggestion-card negative">
            <strong>Possível foco de redução</strong>
            <p>{harmful.map((row) => row.behaviour.label).join(', ')}</p>
            <span>Comportamentos associados a pior resultado neste biomarcador.</span>
          </div>
        )}

        {helpful.length > 0 && (
          <div className="suggestion-card positive">
            <strong>Possível foco a manter</strong>
            <p>{helpful.map((row) => row.behaviour.label).join(', ')}</p>
            <span>Comportamentos associados a melhor resultado neste biomarcador.</span>
          </div>
        )}

        {!harmful.length && !helpful.length && (
          <div className="suggestion-card neutral">
            <strong>Ainda sem padrão suficiente</strong>
            <p>Continua a registar diário e análises para gerar sugestões mais úteis.</p>
            <span>É preciso haver dias com “Sim” e “Não” para comparar.</span>
          </div>
        )}
      </div>

      <div className="impact-legend">
        <span>Prejudica</span>
        <strong>Impacto</strong>
        <span>Ajuda</span>
      </div>

      <div className="impact-list">
        {impactRows.map((row) => <ImpactRow key={row.behaviour.id} row={row} />)}
      </div>

      <div className="info-card warning-soft">
        <Sparkle />
        <p>A app identifica correlações entre diário e análises. Não prova causa-efeito e não deve alterar dieta, líquidos ou medicação sem validação clínica.</p>
      </div>
    </section>
  )
}

function ImpactRow({ row }) {
  const score = row.score
  const valid = validImpact(row)
  const normalized = Math.max(-1, Math.min(1, (score || 0) / 30))
  const label = !valid ? '—' : `${score > 0 ? '+' : ''}${score.toFixed(1)}%`

  return (
    <div className="impact-row">
      <strong>{row.behaviour.label}</strong>

      <div className="impact-scale">
        <i />
        <span className={valid && score >= 0 ? 'positive' : 'negative'} style={{ transform: `translateX(${normalized * 92}px)` }} />
      </div>

      <b className={valid && score >= 0 ? 'positive' : 'negative'}>{label}</b>
    </div>
  )
}

function MoreView({ latestExam, refs, setRefs, goTo, onSelectBiomarker, onAnalyseImpact, cloudStatus, cloudMessage, loadCloudData, syncCloudSnapshot }) {
  const [showRefs, setShowRefs] = useState(false)
  const [query, setQuery] = useState('')

  const followUpCards = useMemo(() => {
    const q = query.trim().toLowerCase()

    return latestBiomarkerCards(latestExam, refs, ['out', 'ideal'])
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
          <p>Esta área mostra os biomarcadores da última análise em dois estados: fora do intervalo ou ideal.</p>
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
        <EmptyState title="Ainda não existem análises" text="Insere uma análise para aparecerem aqui os biomarcadores que merecem acompanhamento." compact />
      )}

      {latestExam && !followUpCards.length && (
        <EmptyState title="Sem biomarcadores classificados" text="Com os dados atuais, não existem biomarcadores classificados como fora do intervalo ou ideal na última análise." compact />
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
        <p>O objetivo é cruzar os biomarcadores fora do intervalo com o diário de comportamentos e gerar pistas de melhoria. As sugestões são apoio ao acompanhamento, não decisão clínica.</p>
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
