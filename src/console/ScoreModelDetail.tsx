import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  useScore, updateScore, SCORE_PROD_LABEL, simulateFusion,
  type ScoreProd, type ModelMeta, type ModelVersion,
  type ProbScoreSeg, type ScoreLevelSeg, type RiskTagConfig, type FusionStrategy,
  type LevelDefaultDecision, type RiskLabel, type FusionRule,
} from './scoreData'
import { useDecision } from './decisionData'
import { PageShell } from './PageShell'
import { SingleSelect, Panel, Button, Badge, DataTable, Modal, RightDrawer, type Column, type Row } from '../components/ui'
import { Sam, Cfg, Cal } from './SourceTag'
import { LineChart } from '../components/charts'
import ModelDecisionGraph from './ModelDecisionGraph'
import { PIPELINE_GRAPHS } from './modelGraphData'
import FlowCanvasEditor from './FlowCanvasEditor'
import { useFlows, getFlowById } from './flowStore'
import { usePageNav } from './pageNav'

const MODEL_COLOR: Record<string, string> = {
  zhicha: '#ef4444',
  zhixin: '#22c55e',
  zhirong: '#8b5cf6',
  'jd-zonghe': '#DC2626',
  'jd-jingying': '#1677ff',
  'jd-kongke': '#D97706',
  'jd-kechuang': '#7C3AED',
  'jd-hetong': '#EA580C',
  'jd-sifa': '#DC2626',
}
const PSI_KIND: Record<string, 'green' | 'amber' | 'red'> = { 稳定: 'green', 临界: 'amber', 偏移: 'red' }

type DetailTab = 'base' | 'algo' | 'risklabel' | 'fusion' | 'effect'
const DETAIL_TABS: { key: DetailTab; label: string }[] = [
  { key: 'base', label: '基本信息' },
  { key: 'algo', label: '算法编辑' },
  { key: 'risklabel', label: '规则风险' },
  { key: 'fusion', label: '处置策略' },
  { key: 'effect', label: '模型效果' },
]

/** 风险等级编码 → 短名（与融合规则列表徽标、风险等级分段保持一致）。 */
const LV_SHORT: Record<string, string> = { ALL: '全部等级', VLOW: '极低', LOW: '低', MID: '中', HIGH: '高', VHIGH: '极高' }
const lvShort = (code: string) => LV_SHORT[code] ?? code

/** 可搜索筛选的规则集下拉（判定依据仅可选规则集，输入即过滤）。 */
function RuleSetSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const decision = useDecision()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const flat = decision.models.flatMap((dm) => dm.policies.map((p) => ({ id: p.id, name: p.name })))
  const sel = flat.find((o) => o.id === value)
  const groups = decision.models
    .map((dm) => ({ dm, ps: dm.policies.filter((p) => !q || p.name.includes(q) || dm.name.includes(q)) }))
    .filter((g) => g.ps.length)
  return (
    <div className="relative">
      <input
        value={open ? q : (sel?.name ?? '')}
        onFocus={() => { setOpen(true); setQ('') }}
        onChange={(e) => { setQ(e.target.value); setOpen(true) }}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder="输入名称搜索规则集…"
        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400"
      />
      {open && (
        <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {groups.length ? groups.map(({ dm, ps }) => (
            <div key={dm.id}>
              <div className="bg-slate-50 px-3 py-1 text-xs text-slate-400">规则集 · {dm.name}</div>
              {ps.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); onChange(p.id); setOpen(false); setQ('') }}
                  className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-brand-50 ${p.id === value ? 'text-brand-600' : 'text-slate-700'}`}
                >{p.name}</button>
              ))}
            </div>
          )) : <div className="px-3 py-2 text-xs text-slate-400">无匹配规则集</div>}
        </div>
      )}
    </div>
  )
}

function levelKind(level: string): 'red' | 'amber' | 'blue' | 'green' | 'gray' {
  if (level.includes('低') || level === 'A') return 'green'
  if (level.includes('中') || level === 'B') return 'blue'
  if (level.includes('高') || level === 'C') return 'amber'
  if (level === 'D') return 'red'
  return 'gray'
}
export default function ScoreModelDetailPage() {
  const data = useScore()
  const decision = useDecision()
  const [params] = useSearchParams()
  /* 决策引擎资产 → 显示名（Tab3 规则风险引用名单库/规则集） */
  const refLabel = (rt: 'list' | 'ruleset', ref: string) => {
    if (rt === 'list') return decision.lists.find((l) => l.id === ref)?.name ?? `名单(${ref})`
    for (const dm of decision.models) {
      const p = dm.policies.find((pp) => pp.id === ref)
      if (p) return p.name
    }
    return `规则集(${ref})`
  }
  const { goDetail, back } = usePageNav()
  const prod = ((params.get('prod') as ScoreProd) ?? 'zhicha')
  const m = data.models.find((x) => x.prod === prod) ?? data.models[0]
  const color = MODEL_COLOR[m.prod] ?? m.color ?? '#64748b'
  const tabParam = params.get('tab')
  const [tab, setTab] = useState<DetailTab>(
    (DETAIL_TABS.some((t) => t.key === tabParam) ? (tabParam as DetailTab) : 'base'),
  )
  useEffect(() => {
    if (tabParam && DETAIL_TABS.some((t) => t.key === tabParam)) setTab(tabParam as DetailTab)
  }, [tabParam]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- 基本信息：收起 / 展开编辑 ---------- */
  const [infoOpen, setInfoOpen] = useState(false)
  const [info, setInfo] = useState({
    name: m.name, version: m.version, algoType: m.algoType, enabled: m.enabled,
    range0: m.range[0], range1: m.range[1],
  })
  useEffect(() => {
    setInfo({
      name: m.name, version: m.version, algoType: m.algoType, enabled: m.enabled,
      range0: m.range[0], range1: m.range[1],
    })
  }, [prod]) // eslint-disable-line react-hooks/exhaustive-deps

  const openInfo = () => {
    setInfo({
      name: m.name, version: m.version, algoType: m.algoType, enabled: m.enabled,
      range0: m.range[0], range1: m.range[1],
    })
    setInfoOpen(true)
  }
  const saveInfo = () =>
    updateScore((d) => ({
      ...d,
      models: d.models.map((mm) =>
        mm.prod === prod
          ? {
              ...mm,
              name: info.name,
              version: info.version,
              algoType: info.algoType,
              enabled: info.enabled,
              range: [Number(info.range0), Number(info.range1)],
            }
          : mm,
      ),
    }))

  /* ---------- 上线管理：上下线 + 上线版本/变更内容 ---------- */
  const [onlineOpen, setOnlineOpen] = useState(false)
  const [onlineVer, setOnlineVer] = useState(m.version)
  const [onlineNote, setOnlineNote] = useState('')

  /* ---------- 算法编辑：可视化 / 代码 ---------- */
  const [algoTab, setAlgoTab] = useState<'visual' | 'code'>('visual')
  const [code, setCode] = useState(m.algoCode)
  useEffect(() => { setCode(m.algoCode) }, [prod]) // eslint-disable-line react-hooks/exhaustive-deps
  const saveCode = () =>
    updateScore((d) => ({
      ...d,
      models: d.models.map((mm) => (mm.prod === prod ? { ...mm, algoCode: code } : mm)),
    }))

  /* ---------- 版本管理（本模型内） ---------- */
  const rollback = (ver: string) =>
    updateScore((d) => ({
      ...d,
      models: d.models.map((mm) =>
        mm.prod === prod
          ? { ...mm, versions: mm.versions.map((v) => ({ ...v, current: v.version === ver })) }
          : mm,
      ),
    }))
  const verCols: Column[] = [
    { key: 'version', label: '版本', width: '110px' },
    { key: 'date', label: '日期', width: '130px' },
    { key: 'note', label: '更新说明' },
    { key: 'current', label: '当前', type: 'badge', badgeKind: 'green', width: '90px' },
    {
      key: 'op', label: '操作', width: '90px',
      render: (r: Row) => {
        const ver = r.id as string
        const v = m.versions.find((x) => x.version === ver)!
        return v.current ? <span className="text-xs text-slate-300">—</span>
          : <Button size="sm" variant="ghost" onClick={() => rollback(ver)}>回滚</Button>
      },
    },
  ]
  const verRows: Row[] = m.versions.map((v: ModelVersion) => ({
    id: v.version, version: v.version, date: v.date, note: v.note,
    current: v.current ? { v: '当前', kind: 'green' } : { v: '历史', kind: 'gray' },
  }))

  const current = m.versions.find((v) => v.current)

  /* ---------- Tab3 风险标签：全局配置 + 标签明细（引用决策引擎资产，并行支线，不影响分数） ---------- */
  const tags = m.riskLabels ?? []
  const tagCfg = m.riskTagConfig ?? { tagSwitch: true, conflictStrategy: 'keep-all', defaultTagOpen: true }
  const saveTagCfg = (next: RiskTagConfig) =>
    updateScore((d) => ({ ...d, models: d.models.map((mm) => (mm.prod === prod ? { ...mm, riskTagConfig: next } : mm)) }))
  const [rlNewOpen, setRlNewOpen] = useState(false)
  const [tagCfgOpen, setTagCfgOpen] = useState(false)
  const [rlDraft, setRlDraft] = useState<Partial<RiskLabel>>({
    name: '', tagCode: '', tagLevel: '中度风险', refType: 'ruleset', ref: '',
    collisionCondition: 'single', joinFusion: true, isRiskMonitorTag: false, tagDesc: '', enabled: true,
  })
  const saveLabels = (next: RiskLabel[]) =>
    updateScore((d) => ({ ...d, models: d.models.map((mm) => (mm.prod === prod ? { ...mm, riskLabels: next } : mm)) }))
  const rlToggle = (id: string) => saveLabels(tags.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l)))
  const rlRemove = (id: string) => saveLabels(tags.filter((l) => l.id !== id))
  const rlMove = (id: string, dir: -1 | 1) => {
    const idx = tags.findIndex((l) => l.id === id); const ni = idx + dir
    if (idx < 0 || ni < 0 || ni >= tags.length) return
    const next = [...tags]; const a = next[idx]; next[idx] = next[ni]; next[ni] = a
    next.forEach((l, i) => (l.tagSort = i + 1)); saveLabels(next)
  }
  const rlConfirm = () => {
    if (!rlDraft.name?.trim() || !rlDraft.ref) return
    const sort = tags.length ? Math.max(...tags.map((l) => l.tagSort)) + 1 : 1
    const code = (rlDraft.tagCode?.trim() || `TAG_${prod.slice(0, 2).toUpperCase()}_${(tags.length + 1).toString().padStart(3, '0')}`).toUpperCase()
    saveLabels([...tags, {
      id: `rl-${Date.now().toString(36)}`, tagSort: sort, tagCode: code, name: rlDraft.name.trim(),
      tagLevel: (rlDraft.tagLevel as RiskLabel['tagLevel']) ?? '中度风险',
      refType: (rlDraft.refType as 'list' | 'ruleset') ?? 'ruleset', ref: rlDraft.ref,
      collisionCondition: (rlDraft.collisionCondition as 'single' | 'all') ?? 'single',
      joinFusion: rlDraft.joinFusion ?? true, isRiskMonitorTag: rlDraft.isRiskMonitorTag ?? false,
      tagDesc: rlDraft.tagDesc ?? '', enabled: true,
    }])
    setRlNewOpen(false)
    setRlDraft({ name: '', tagCode: '', tagLevel: '中度风险', refType: 'ruleset', ref: '', collisionCondition: 'single', joinFusion: true, isRiskMonitorTag: false, tagDesc: '', enabled: true })
  }
  /* Tab3 模块3：实时输出预览（风险标签对外统一结构） */
  const tagPreview = tagCfg.tagSwitch
    ? tags.filter((l) => l.enabled).map((l) => ({ tag_code: l.tagCode, tag_name: l.name, tag_level: l.tagLevel, is_monitor_tag: l.isRiskMonitorTag, join_fusion: l.joinFusion, tag_desc: l.tagDesc }))
    : []

  /* ---------- Tab4 区块A：融合处置策略全局配置 ---------- */
  const strat = m.fusionStrategy ?? { strategyName: '', priorityMode: 'tag-first', defaultDecision: '转人工', strategyStatus: true, validStart: '', validEnd: '', strategyVersion: '', updateUser: '', updateTime: '' }
  const [stratOpen, setStratOpen] = useState(false)
  const [probMapOpen, setProbMapOpen] = useState(false)
  const [levelMapOpen, setLevelMapOpen] = useState(false)
  const [rlPreviewOpen, setRlPreviewOpen] = useState(false)
  const saveStrat = (next: FusionStrategy) =>
    updateScore((d) => ({ ...d, models: d.models.map((mm) => (mm.prod === prod ? { ...mm, fusionStrategy: next } : mm)) }))
  const [stratName, setStratName] = useState(strat.strategyName)
  const [stratPriority, setStratPriority] = useState<FusionStrategy['priorityMode']>(strat.priorityMode)
  const [stratDefault, setStratDefault] = useState<FusionStrategy['defaultDecision']>(strat.defaultDecision)
  const [stratStatus, setStratStatus] = useState(strat.strategyStatus)
  const [stratStart, setStratStart] = useState(strat.validStart)
  const [stratEnd, setStratEnd] = useState(strat.validEnd)
  const saveStratMeta = () => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false })
    const nextVer = strat.strategyVersion ? strat.strategyVersion : `V1.0`
    saveStrat({ strategyName: stratName.trim() || `${SCORE_PROD_LABEL[prod] ?? m.name}处置策略`, priorityMode: stratPriority, defaultDecision: stratDefault, strategyStatus: stratStatus, validStart: stratStart, validEnd: stratEnd, strategyVersion: nextVer, updateUser: 'admin', updateTime: now })
  }

  /* ---------- Tab4 区块B：概率 p → 标准分 映射（分段表 / 线性公式） ---------- */
  const scoreMapMode = m.scoreMapMode ?? 'segment'
  const saveScoreMapMode = (mode: 'segment' | 'formula') =>
    updateScore((d) => ({ ...d, models: d.models.map((mm) => (mm.prod === prod ? { ...mm, scoreMapMode: mode } : mm)) }))
  const probScoreMap = m.probScoreMap ?? []
  const saveProbMap = (next: ProbScoreSeg[]) =>
    updateScore((d) => ({ ...d, models: d.models.map((mm) => (mm.prod === prod ? { ...mm, probScoreMap: next } : mm)) }))
  const probEdit = (i: number, k: keyof ProbScoreSeg, v: number | string) =>
    saveProbMap(probScoreMap.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)))
  const probAdd = () => saveProbMap([...probScoreMap, { probMin: 0, probMax: 1, standardScore: 0, remark: '' }])
  const probDel = (i: number) => saveProbMap(probScoreMap.filter((_, idx) => idx !== i))
  const [formulaText, setFormulaText] = useState(m.scoreFormula ?? 'standard_score = Round(predict_prob * 100)')
  const saveFormula = () => updateScore((d) => ({ ...d, models: d.models.map((mm) => (mm.prod === prod ? { ...mm, scoreFormula: formulaText } : mm)) }))
  const [probPreviewVal, setProbPreviewVal] = useState('0.5')
  const probPreview = (() => {
    const p = Number(probPreviewVal)
    if (scoreMapMode === 'formula' && (m.scoreFormula ?? formulaText)) {
      try { const Round = (x: number) => Math.round(x); const expr = (m.scoreFormula ?? formulaText).split('=').slice(1).join('='); const v = Number(new Function('predict_prob', 'Round', `return (${expr})`)(p, Round)); return isFinite(v) ? v : 0 } catch { return 0 }
    }
    const seg = probScoreMap.find((s) => p >= s.probMin && p < (s.probMax === 1 ? 1.0001 : s.probMax))
    return seg?.standardScore ?? probScoreMap[probScoreMap.length - 1]?.standardScore ?? 0
  })()

  /* ---------- Tab4 区块C：标准分 → 风险等级 分段 ---------- */
  const scoreLevelMap = m.scoreLevelMap ?? []
  const saveLevelMap = (next: ScoreLevelSeg[]) =>
    updateScore((d) => ({ ...d, models: d.models.map((mm) => (mm.prod === prod ? { ...mm, scoreLevelMap: next } : mm)) }))
  const levelEdit = (i: number, k: keyof ScoreLevelSeg, v: number | string) => {
    const oldCode = scoreLevelMap[i]?.levelCode
    saveLevelMap(scoreLevelMap.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)))
    if (k === 'levelCode' && v !== oldCode) {
      saveLevelDecisions(levelDecisions.map((d) => (d.level === oldCode ? { ...d, level: String(v) } : d)))
    }
  }
  const levelAdd = () => {
    const newCode = 'LV' + (scoreLevelMap.length + 1)
    saveLevelMap([...scoreLevelMap, { scoreMin: 0, scoreMax: 100, levelCode: newCode, levelName: '' }])
    saveLevelDecisions([...levelDecisions, { level: newCode, decision: '通过', processId: '' }])
  }
  const levelDel = (i: number) => {
    const code = scoreLevelMap[i]?.levelCode
    saveLevelMap(scoreLevelMap.filter((_, idx) => idx !== i))
    saveLevelDecisions(levelDecisions.filter((d) => d.level !== code))
  }

  /* ---------- Tab4 等级默认处置映射表（兜底） ---------- */
  const levelDecisions = m.levelDefaultDecision ?? []
  const saveLevelDecisions = (next: LevelDefaultDecision[]) =>
    updateScore((d) => ({ ...d, models: d.models.map((mm) => (mm.prod === prod ? { ...mm, levelDefaultDecision: next } : mm)) }))
  const ldEdit = (i: number, k: keyof LevelDefaultDecision, v: string) =>
    saveLevelDecisions(levelDecisions.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)))

  /* ---------- Tab4 区块D：融合处置规则（等级 + 标签） ---------- */
  const fus = m.fusionRules ?? []
  const saveFus = (next: FusionRule[]) =>
    updateScore((d) => ({ ...d, models: d.models.map((mm) => (mm.prod === prod ? { ...mm, fusionRules: next } : mm)) }))
  const fuToggle = (id: string) => saveFus(fus.map((f) => (f.id === id ? { ...f, isActive: !f.isActive } : f)))
  const fuRemove = (id: string) => saveFus(fus.filter((f) => f.id !== id))
  const fuMove = (id: string, dir: -1 | 1) => {
    const idx = fus.findIndex((f) => f.id === id); const ni = idx + dir
    if (idx < 0 || ni < 0 || ni >= fus.length) return
    const next = [...fus]; const a = next[idx]; next[idx] = next[ni]; next[ni] = a
    next.forEach((f, i) => (f.ruleSort = i + 1)); saveFus(next)
  }
  const [fuNewOpen, setFuNewOpen] = useState(false)
  const [fuEditId, setFuEditId] = useState<string | null>(null)
  const [fuDraft, setFuDraft] = useState<Partial<FusionRule>>({
    baseRiskLevel: [], matchTagList: [], matchMode: 'any', finalDecision: '通过', processId: '', outputRemark: '', isActive: true,
  })
  const openFuAdd = () => { setFuEditId(null); setFuDraft({ baseRiskLevel: [], matchTagList: [], matchMode: 'any', finalDecision: '通过', processId: '', outputRemark: '', isActive: true }); setFuNewOpen(true) }
  const openFuEdit = (id: string) => {
    const f = fus.find((x) => x.id === id); if (!f) return
    setFuEditId(id)
    setFuDraft({ baseRiskLevel: f.baseRiskLevel, matchTagList: f.matchTagList, matchMode: f.matchMode, finalDecision: f.finalDecision, processId: f.processId ?? '', outputRemark: f.outputRemark, isActive: f.isActive })
    setFuNewOpen(true)
  }
  const fuConfirm = () => {
    if (!fuDraft.baseRiskLevel) return
    const patch = {
      baseRiskLevel: fuDraft.baseRiskLevel ?? [],
      matchTagList: fuDraft.matchTagList ?? [],
      matchMode: (fuDraft.matchMode as 'all' | 'any') ?? 'any',
      finalDecision: (fuDraft.finalDecision as '通过' | '转人工' | '拒绝') ?? '通过',
      processId: fuDraft.processId || undefined,
      outputRemark: fuDraft.outputRemark ?? '',
    }
    if (fuEditId) {
      saveFus(fus.map((f) => (f.id === fuEditId ? { ...f, ...patch } : f)))
    } else {
      const sort = fus.length ? Math.max(...fus.map((f) => f.ruleSort)) + 1 : 1
      saveFus([...fus, { id: `fr-${Date.now().toString(36)}`, ruleSort: sort, ...patch, isActive: true }])
    }
    setFuNewOpen(false); setFuEditId(null)
    setFuDraft({ baseRiskLevel: [], matchTagList: [], matchMode: 'any', finalDecision: '通过', processId: '', outputRemark: '', isActive: true })
  }

  /* ---------- Tab4 全链路模拟调试 ---------- */
  const [simOpen, setSimOpen] = useState(false)
  const [simProb, setSimProb] = useState('0.5')
  const [simTags, setSimTags] = useState<string[]>([])
  /* 切换模型时同步全局策略本地编辑态 */
  useEffect(() => {
    setStratName(strat.strategyName)
    setStratPriority(strat.priorityMode)
    setStratDefault(strat.defaultDecision)
    setStratStatus(strat.strategyStatus)
    setStratStart(strat.validStart)
    setStratEnd(strat.validEnd)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prod])

  /* ---------- 业务流程库（融合处置关联） ---------- */
  const flows = useFlows()
  const flowName = (id?: string) => flows.find((f) => f.id === id)?.name ?? '未关联'

  /* ---------- 模型效果（本模型） ---------- */
  const ops = data.ops.find((x) => x.prod === prod)!

  return (
    <>
      <PageShell
        title={m.name}
        subtitle={`${SCORE_PROD_LABEL[m.prod] ?? m.name} · 模型详情（基本信息 / 算法编辑 / 规则风险 / 处置策略 / 模型效果）`}
        crumb="评分产品 / 模型管理"
        actions={
          <Button size="sm" variant="secondary" onClick={() => back('/console/sc/model-manage')}>← 返回模型列表</Button>
        }
      />
      <div className="space-y-4">
        {/* ===== Tab 条 ===== */}
        <div className="flex flex-wrap gap-1 border-b border-slate-100 pb-2">
          {DETAIL_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${tab === t.key ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'base' && (
          <>
            {/* ===== 基本信息 ===== */}
            <Panel
              title="基本信息"
              desc={infoOpen ? '编辑后点击保存' : '点击「展开编辑」修改模型信息'}
              actions={
                infoOpen ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="primary" onClick={saveInfo}>保存</Button>
                    <Button size="sm" variant="ghost" onClick={() => setInfoOpen(false)}>收起</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="ghost" onClick={openInfo}>展开编辑</Button>
                )
              }
            >
              {infoOpen ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="模型名称">
                    <input className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} />
                  </Field>
                  <Field label="算法类型">
                    <input className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400" value={info.algoType} onChange={(e) => setInfo({ ...info, algoType: e.target.value })} />
                  </Field>
                  <Field label="版本">
                    <input className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400" value={info.version} onChange={(e) => setInfo({ ...info, version: e.target.value })} />
                  </Field>
                  <Field label="分数区间">
                    <div className="flex items-center gap-2">
                      <input className="w-24 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400" value={info.range0} onChange={(e) => setInfo({ ...info, range0: e.target.value })} />
                      <span className="text-slate-400">–</span>
                      <input className="w-24 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400" value={info.range1} onChange={(e) => setInfo({ ...info, range1: e.target.value })} />
                    </div>
                  </Field>
                  <Field label="启用状态">
                    <button
                      onClick={() => setInfo({ ...info, enabled: !info.enabled })}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${info.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {info.enabled ? '已启用（点击停用）' : '已停用（点击启用）'}
                    </button>
                  </Field>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div><div className="text-xs text-slate-400">当前得分</div><div className="text-2xl font-bold tabular-nums" style={{ color }}>{m.score}</div></div>
                  <div><div className="text-xs text-slate-400">分数区间</div><div className="mt-1 text-sm">{m.range[0]} – {m.range[1]}</div></div>
                  <div><div className="text-xs text-slate-400">版本</div><div className="mt-1 text-sm">{m.version}</div></div>
                  <div><div className="text-xs text-slate-400">更新时间</div><div className="mt-1 text-sm">{m.updatedAt}</div></div>
                  <div className="col-span-2 md:col-span-4 flex items-center gap-3">
                    <Badge kind={m.enabled ? 'green' : 'gray'}>{m.enabled ? '已启用' : '已停用'}</Badge>
                    <span className="text-sm text-slate-500">{m.algoType}</span>
                  </div>
                </div>
              )}
            </Panel>

            {/* ===== 上线管理（上/下线 + 上线版本与变更内容） ===== */}
            <Panel
              title="上线管理"
              desc="模型投产与下线控制；上线时可指定版本与变更内容，自动记入版本日志"
              actions={<Cfg value="scoreData.json" />}
            >
              <div className="flex flex-wrap items-center gap-3">
                <Badge kind={m.enabled ? 'green' : 'gray'}>{m.enabled ? '已上线' : '已下线'}</Badge>
                <span className="text-sm text-slate-500">当前版本 {m.version}</span>
                <div className="flex-1" />
                {m.enabled ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      updateScore((d) => ({
                        ...d,
                        models: d.models.map((mm) => (mm.prod === prod ? { ...mm, enabled: false } : mm)),
                      }))
                    }
                  >
                    下线
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => { setOnlineVer(m.version); setOnlineNote(''); setOnlineOpen(true) }}
                  >
                    上线
                  </Button>
                )}
              </div>
            </Panel>

            {/* ===== 部署对接（只读） ===== */}
            <Panel title="部署与对接" desc="模型生产化对接方式（只读）" actions={<Cal />}>
              <dl className="grid grid-cols-1 gap-x-8 gap-y-2 text-sm md:grid-cols-2">
                <Def k="服务地址" v={`POST /api/score/${m.prod}`} />
                <Def k="调用方式" v="实时 API / 批量文件" />
                <Def k="版本标识" v="请求头 x-model-version" />
                <Def k="灰度发布" v="冠军 / 挑战者（Champion-Challenger）" />
                <Def k="监控指标" v={`PSI ≥ 0.25 触发自动回滚`} />
                <Def k="当前线上版本" v={current?.version ?? '—'} />
              </dl>
            </Panel>

            {/* ===== 版本管理（内置） ===== */}
            <Panel title="版本日志" desc="本模型版本历史，可回滚至历史版本" actions={<Cfg value="scoreData.json" />}>
              <DataTable columns={verCols} rows={verRows} empty="暂无版本" pager defaultPageSize={10} />
            </Panel>
          </>
        )}

        {tab === 'algo' && (
          /* ===== 算法编辑 ===== */
          <Panel
            title="算法编辑"
            desc="以「可视化」查看本模型真实计算链路（数据源 → 算法与因子 → 输出概率 p + SHAP。主线视图，规则集/碰撞/决策等支线已隐藏），或以「代码」查看模型算法（Model-as-Code）"
            actions={
              <div className="flex gap-2">
                <Button size="sm" variant={algoTab === 'visual' ? 'primary' : 'secondary'} onClick={() => setAlgoTab('visual')}>可视化</Button>
                <Button size="sm" variant={algoTab === 'code' ? 'primary' : 'secondary'} onClick={() => setAlgoTab('code')}>代码</Button>
              </div>
            }
          >
            {algoTab === 'visual' ? (
              <div>
                <ModelDecisionGraph
                  prod={m.prod}
                  model={m}
                  thresholds={data.thresholds}
                  mainOnly
                  graph={m.decisionGraph ?? (m.prod === 'zhixin' ? PIPELINE_GRAPHS.zhixin_credit_v1 : undefined)}
                  onJumpRules={() => goDetail('/console/cm/rule-hub')}
                  onJumpStrategy={() => goDetail('/console/sc/model-detail?prod=' + prod + '&tab=fusion')}
                  onSaveCollisions={(rules) =>
                    updateScore((d) => ({
                      ...d,
                      models: d.models.map((mm) => (mm.prod === prod ? { ...mm, collisionRules: rules } : mm)),
                    }))
                  }
                  editable
                  onSaveGraph={(g) =>
                    updateScore((d) => ({
                      ...d,
                      models: d.models.map((mm) => (mm.prod === prod ? { ...mm, decisionGraph: g } : mm)),
                    }))
                  }
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{m.name} · 算法代码（Python）</span>
                  <Button size="sm" variant="primary" onClick={saveCode}>保存代码</Button>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                  className="h-72 w-full rounded-xl border border-slate-800 bg-slate-900 p-4 font-mono text-[13px] leading-relaxed text-slate-100 outline-none focus:border-brand-400"
                />
              </div>
            )}
            <div className="mt-3"><Cfg value="scoreData.json" /></div>
          </Panel>
        )}

        {tab === 'risklabel' && (
          /* ===== Tab3 风险标签（独立并行规则支线，不影响分数） ===== */
          <div className="space-y-4">
            {/* 模块1：全局配置（默认收起，显示概要） */}
            <Panel
              title="风险标签配置"
              desc="控制整套并行标签支线的运行模式、冲突处理与空命中策略。标签与 Tab2 模型推理完全并行，不参与概率计算、不改变标准分。"
              actions={<div className="flex items-center gap-2"><Cfg value="scoreData.json" /><Button size="sm" variant="ghost" onClick={() => setTagCfgOpen((v) => !v)}>{tagCfgOpen ? '收起' : '展开配置'}</Button></div>}
            >
              {tagCfgOpen ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                  <div>
                    <div className="text-sm font-medium text-slate-700">标签支线总开关</div>
                    <div className="text-xs text-slate-400">关闭后整套并行标签逻辑停摆，无任何标签输出</div>
                  </div>
                  <button onClick={() => saveTagCfg({ ...tagCfg, tagSwitch: !tagCfg.tagSwitch })}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${tagCfg.tagSwitch ? 'bg-brand-500' : 'bg-slate-300'}`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${tagCfg.tagSwitch ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                  <div>
                    <div className="text-sm font-medium text-slate-700">空命中默认标签</div>
                    <div className="text-xs text-slate-400">无任何规则命中时，输出「无风险信号」空标签</div>
                  </div>
                  <button onClick={() => saveTagCfg({ ...tagCfg, defaultTagOpen: !tagCfg.defaultTagOpen })}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${tagCfg.defaultTagOpen ? 'bg-brand-500' : 'bg-slate-300'}`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${tagCfg.defaultTagOpen ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                </div>
                <div className="rounded-lg border border-slate-100 px-3 py-2">
                  <div className="text-sm font-medium text-slate-700">多标签命中冲突策略</div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => saveTagCfg({ ...tagCfg, conflictStrategy: 'keep-all' })}
                      className={`rounded px-3 py-1 text-sm ${tagCfg.conflictStrategy === 'keep-all' ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-500'}`}>全部保留多标签</button>
                    <button onClick={() => saveTagCfg({ ...tagCfg, conflictStrategy: 'keep-highest' })}
                      className={`rounded px-3 py-1 text-sm ${tagCfg.conflictStrategy === 'keep-highest' ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-500'}`}>只保留最高优先级</button>
                  </div>
                </div>
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-sm font-medium text-slate-700">运行模式（只读）</div>
                  <div className="mt-1 text-xs text-slate-500">并行独立执行，不影响模型概率与分数</div>
                </div>
              </div>
              ) : (
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-slate-500">
                  <span>标签支线：<b className={tagCfg.tagSwitch ? 'text-emerald-600' : 'text-slate-400'}>{tagCfg.tagSwitch ? '已开启' : '已关闭'}</b></span>
                  <span>空命中默认标签：<b className={tagCfg.defaultTagOpen ? 'text-emerald-600' : 'text-slate-400'}>{tagCfg.defaultTagOpen ? '开' : '关'}</b></span>
                  <span>冲突策略：{tagCfg.conflictStrategy === 'keep-all' ? '全部保留多标签' : '只保留最高优先级'}</span>
                  <span>运行模式：并行独立执行</span>
                </div>
              )}
            </Panel>

            {/* 模块2：标签明细配置列表 */}
            <Panel
              title="标签明细"
              desc="每一条风险标签 = 一套独立规则碰撞条件。引用已配置的名单库 / 规则集（不可新建），命中即派生标签；标签仅作解释信号与融合决策输入，不参与分数计算。"
              actions={<div className="flex items-center gap-2"><Button size="sm" variant="secondary" onClick={() => setRlPreviewOpen(true)}>查看实时输出预览</Button><Button size="sm" variant="primary" onClick={() => setRlNewOpen(true)}>新增标签</Button></div>}
            >
              <div className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                ⚠️ 标签 ≠ 最终审批结论：决策型标签（计入融合）参与 Tab4 审批；监控型标签（不计入融合）仅用于模型 PSI/KS 监控与样本调优。
              </div>
              <DataTable
                columns={[
                  { key: 'tagSort', label: '排序', width: '72px', render: (r: Row) => (
                    <div className="flex items-center gap-1">
                      <button className="text-xs text-slate-400 hover:text-brand-600" onClick={() => rlMove(r.id as string, -1)}>↑</button>
                      <span className="text-sm tabular-nums">{r.tagSort as number}</span>
                      <button className="text-xs text-slate-400 hover:text-brand-600" onClick={() => rlMove(r.id as string, 1)}>↓</button>
                    </div>
                  ) },
                  { key: 'tagCode', label: '标签编码', width: '130px' },
                  { key: 'name', label: '风险标签', width: '160px' },
                  { key: 'tagLevel', label: '等级', type: 'badge', width: '90px' },
                  { key: 'refType', label: '对象类型', width: '110px' },
                  { key: 'ref', label: '判定依据' },
                  { key: 'collision', label: '触发条件', width: '130px' },
                  { key: 'joinFusion', label: '计入融合', width: '90px', render: (r: Row) => (r.joinFusion ? <Badge kind="blue">是</Badge> : <Badge kind="gray">否</Badge>) },
                  { key: 'monitor', label: '监控样本', width: '90px', render: (r: Row) => (r.monitor ? <Badge kind="violet">是</Badge> : <Badge kind="gray">否</Badge>) },
                  { key: 'tagDesc', label: '风险描述', render: (r: Row) => <span className="text-xs text-slate-500">{r.tagDesc as string}</span> },
                  { key: 'enabled', label: '状态', width: '90px', render: (r: Row) => (
                    <button onClick={() => rlToggle(r.id as string)} className={r.enabled ? 'text-emerald-600 hover:underline' : 'text-slate-400 hover:underline'}>{r.enabled ? '已启用' : '已停用'}</button>
                  ) },
                  { key: 'op', label: '操作', width: '80px', render: (r: Row) => <Button size="sm" variant="ghost" onClick={() => rlRemove(r.id as string)}>删除</Button> },
                ]}
                rows={tags.map((l) => ({
                  id: l.id, tagSort: l.tagSort, tagCode: l.tagCode, name: l.name,
                  tagLevel: { v: l.tagLevel, kind: l.tagLevel === '重度风险' ? 'red' : l.tagLevel === '中度风险' ? 'amber' : l.tagLevel === '轻度风险' ? 'blue' : 'gray' },
                  refType: l.refType === 'list' ? '公共名单库' : '公共规则集',
                  ref: refLabel(l.refType, l.ref),
                  collision: l.collisionCondition === 'single' ? '单条件命中' : '多规则同时命中',
                  joinFusion: l.joinFusion, monitor: l.isRiskMonitorTag, tagDesc: l.tagDesc, enabled: l.enabled,
                }))}
                empty="暂无风险标签，点击「新增标签」配置一条并行规则支线"
                pager
                defaultPageSize={10}
              />
            </Panel>

          </div>
        )}

        {tab === 'effect' && (
          /* ===== 模型效果（本模型） ===== */
          <>
            <Panel title="模型效果" desc={`${SCORE_PROD_LABEL[prod] ?? m.name} · 运营效果指标与 6 个月趋势（单模型视角；三模型横向对比见「模型效果」页）`} actions={<div className="flex items-center gap-2"><Cal /><Sam value="scoreData.json" /></div>}>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div><div className="text-xs text-slate-400">评分覆盖率</div><div className="text-2xl font-bold tabular-nums" style={{ color }}>{ops.coverage}%</div></div>
                <div><div className="text-xs text-slate-400">预警准确率</div><div className="text-2xl font-bold tabular-nums" style={{ color }}>{ops.accuracy}%</div></div>
                <div><div className="text-xs text-slate-400">处置及时率</div><div className="text-2xl font-bold tabular-nums" style={{ color }}>{ops.timely}%</div></div>
                <div><div className="text-xs text-slate-400">本月调用</div><div className="text-2xl font-bold tabular-nums" style={{ color }}>{ops.calls.toLocaleString()}</div></div>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500">PSI</span>
                <Badge kind={PSI_KIND[ops.psiStatus]}>{ops.psi} · {ops.psiStatus}</Badge>
                <span className="text-xs text-slate-400">PSI ≥ 0.25 触发漂移预警</span>
                <div className="flex-1" />
                <Button size="sm" variant="ghost" onClick={() => goDetail('/console/sc/model-effect')}>查看三模型对比 →</Button>
              </div>
            </Panel>
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel title="覆盖率 / 准确率趋势" actions={<Cal />}>
                <LineChart labels={ops.trend.map((t) => t.month)}
                  series={[
                    { name: '覆盖率', color: MODEL_COLOR[prod], data: ops.trend.map((t) => t.coverage) },
                    { name: '准确率', color: '#3b82f6', data: ops.trend.map((t) => t.accuracy) },
                  ]} unit="%" height={220} />
              </Panel>
              <Panel title="及时率 / 调用量趋势" actions={<Cal />}>
                <LineChart labels={ops.trend.map((t) => t.month)}
                  series={[
                    { name: '及时率', color: '#8b5cf6', data: ops.trend.map((t) => t.timely) },
                    { name: '调用量', color: '#f59e0b', data: ops.trend.map((t) => t.calls) },
                  ]} height={220} />
              </Panel>
            </div>
          </>
        )}

        {tab === 'fusion' && (
          <div className="space-y-4">
            {/* ===== 区块A：全局策略基础配置 ===== */}
            <Panel
              title="处置策略配置"
              desc="融合处置策略全局配置：优先级模式决定「标签」与「分数」谁说了算；兜底处置在模型异常、特征缺失、无法计算时生效。"
              actions={<div className="flex items-center gap-2"><Cfg value="scoreData.json" /><Button size="sm" variant="ghost" onClick={() => setStratOpen((v) => !v)}>{stratOpen ? '收起' : '展开配置'}</Button></div>}
            >
              {stratOpen ? (
              <>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs text-slate-400">策略名称</span>
                  <input value={stratName} onChange={(e) => setStratName(e.target.value)} placeholder={`${SCORE_PROD_LABEL[prod] ?? m.name}处置策略`} className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400" />
                </label>
                <div>
                  <span className="mb-1 block text-xs text-slate-400">优先级模式（全局生效）</span>
                  <div className="flex gap-2">
                    <button onClick={() => setStratPriority('tag-first')} className={`rounded px-3 py-1.5 text-sm ${stratPriority === 'tag-first' ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-500'}`}>标签优先（强规则拦截）</button>
                    <button onClick={() => setStratPriority('score-first')} className={`rounded px-3 py-1.5 text-sm ${stratPriority === 'score-first' ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-500'}`}>分数优先</button>
                  </div>
                </div>
                <label className="block">
                  <span className="mb-1 block text-xs text-slate-400">兜底处置</span>
                  <SingleSelect label="兜底处置" fullWidth value={stratDefault} onChange={(v) => setStratDefault(v as FusionStrategy['defaultDecision'])} options={[
                    { value: '通过', label: '通过' },
                    { value: '转人工', label: '转人工审核' },
                    { value: '拒绝', label: '直接拒绝' },
                  ]} />
                </label>
                <div className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                  <div><div className="text-sm font-medium text-slate-700">策略启停</div><div className="text-xs text-slate-400">停用后整体处置策略不生效</div></div>
                  <button onClick={() => setStratStatus(!stratStatus)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${stratStatus ? 'bg-brand-500' : 'bg-slate-300'}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${stratStatus ? 'left-[22px]' : 'left-0.5'}`} /></button>
                </div>
                <label className="block">
                  <span className="mb-1 block text-xs text-slate-400">生效起（定时切换）</span>
                  <input type="datetime-local" value={stratStart} onChange={(e) => setStratStart(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-slate-400">生效止（可空）</span>
                  <input type="datetime-local" value={stratEnd} onChange={(e) => setStratEnd(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400" />
                </label>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                <span>策略版本：{strat.strategyVersion || '—'}</span>
                <span>更新人：{strat.updateUser || '—'}</span>
                <span>更新时间：{strat.updateTime || '—'}</span>
              </div>
              <div className="mt-3 flex justify-end">
                <Button size="sm" variant="primary" onClick={saveStratMeta}>保存策略</Button>
              </div>
              </>
              ) : (
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-slate-500">
                  <span>策略：<b className="text-slate-700">{stratName || `${SCORE_PROD_LABEL[prod] ?? m.name}处置策略`}</b></span>
                  <span>优先级：<b className="text-slate-700">{stratPriority === 'tag-first' ? '标签优先' : '分数优先'}</b></span>
                  <span>兜底处置：<b className="text-slate-700">{stratDefault}</b></span>
                  <span>状态：<b className={stratStatus ? 'text-emerald-600' : 'text-slate-400'}>{stratStatus ? '启用' : '停用'}</b></span>
                </div>
              )}
            </Panel>

            {/* ===== 区块B：概率 p → 标准分 映射 ===== */}
            <Panel
              title="概率映射"
              desc="原生预测概率 predict_prob(0~1) → 对外标准分。两种映射方式二选一，修改映射无需重新训练模型。"
              actions={<div className="flex items-center gap-2"><Cfg value="scoreData.json" /><Cal /><Button size="sm" variant="ghost" onClick={() => setProbMapOpen((v) => !v)}>{probMapOpen ? '收起' : '展开'}</Button></div>}
            >
              {probMapOpen ? (
              <div className="space-y-3">
              <div className="mb-3 flex items-center gap-3">
                <span className="text-xs text-slate-500">映射方式：</span>
                <button onClick={() => saveScoreMapMode('segment')} className={`rounded px-3 py-1 text-sm ${scoreMapMode === 'segment' ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-500'}`}>分段映射表</button>
                <button onClick={() => saveScoreMapMode('formula')} className={`rounded px-3 py-1 text-sm ${scoreMapMode === 'formula' ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-500'}`}>线性公式</button>
              </div>
              {scoreMapMode === 'segment' ? (
                <>
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-3 py-2 text-left">prob 下界(含)</th><th className="px-3 py-2 text-left">prob 上界(不含)</th><th className="px-3 py-2 text-left">标准分</th><th className="px-3 py-2 text-left">备注</th><th className="px-3 py-2 text-left">操作</th></tr></thead>
                      <tbody>
                        {probScoreMap.map((s, i) => (
                          <tr key={i} className="border-t border-slate-100">
                            <td className="px-3 py-1.5"><input type="number" step="0.01" value={s.probMin} onChange={(e) => probEdit(i, 'probMin', Number(e.target.value))} className="w-20 rounded border border-slate-200 px-2 py-1 text-sm outline-none focus:border-brand-400" /></td>
                            <td className="px-3 py-1.5"><input type="number" step="0.01" value={s.probMax} onChange={(e) => probEdit(i, 'probMax', Number(e.target.value))} className="w-20 rounded border border-slate-200 px-2 py-1 text-sm outline-none focus:border-brand-400" /></td>
                            <td className="px-3 py-1.5"><input type="number" value={s.standardScore} onChange={(e) => probEdit(i, 'standardScore', Number(e.target.value))} className="w-24 rounded border border-slate-200 px-2 py-1 text-sm outline-none focus:border-brand-400" /></td>
                            <td className="px-3 py-1.5"><input value={s.remark ?? ''} onChange={(e) => probEdit(i, 'remark', e.target.value)} className="w-32 rounded border border-slate-200 px-2 py-1 text-sm outline-none focus:border-brand-400" /></td>
                            <td className="px-3 py-1.5"><button className="text-xs text-rose-500 hover:underline" onClick={() => probDel(i)}>删除</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="border-t border-slate-100 px-3 py-2">
                    <Button size="sm" variant="ghost" onClick={probAdd}>＋ 新增分段</Button>
                  </div>
                </div>
                </>
              ) : (
                <>
                  <label className="block">
                    <span className="mb-1 block text-xs text-slate-400">公式配置：standard_score = f(predict_prob)</span>
                    <input value={formulaText} onChange={(e) => setFormulaText(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400" />
                  </label>
                  <Button size="sm" variant="ghost" className="mt-2" onClick={saveFormula}>保存公式</Button>
                </>
              )}
              <div className="mt-3 flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                <span>预览：</span>
                <input type="number" step="0.01" min="0" max="1" value={probPreviewVal} onChange={(e) => setProbPreviewVal(e.target.value)} className="w-24 rounded border border-slate-200 px-2 py-1 text-sm outline-none focus:border-brand-400" />
                <span>→ 标准分</span>
                <span className="font-semibold text-brand-600">{probPreview}</span>
              </div>
              </div>
              ) : (
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-slate-500">
                  <span>映射方式：<b className="text-slate-700">{scoreMapMode === 'segment' ? '分段映射表' : '线性公式'}</b></span>
                  <span>分段数：<b className="text-slate-700">{probScoreMap.length}</b></span>
                  {scoreMapMode === 'segment'
                    ? <span>各段概率区间→标准分：{probScoreMap.map((s) => `${s.probMin}~${s.probMax === 1 ? '1' : s.probMax}→${s.standardScore}`).join('；')}</span>
                    : <span>公式：{m.scoreFormula ?? formulaText}</span>}
                </div>
              )}
            </Panel>

            {/* ===== 风险等级：标准分 → 等级（兜底处置统一由融合规则揭露） ===== */}
            <Panel
              title="风险等级"
              desc="标准分区间 → 风险等级：把模型标准分切成若干风险档（分段与等级一一对应，不丢档）。"
              actions={<div className="flex items-center gap-2"><Cfg value="scoreData.json" /><Cal /><Button size="sm" variant="ghost" onClick={() => setLevelMapOpen((v) => !v)}>{levelMapOpen ? '收起' : '展开'}</Button></div>}
            >
              {levelMapOpen ? (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-3 py-2 text-left">分数下界(含)</th><th className="px-3 py-2 text-left">分数上界(含)</th><th className="px-3 py-2 text-left">风险等级编码</th><th className="px-3 py-2 text-left">风险等级名称</th><th className="px-3 py-2 text-left">操作</th></tr></thead>
                      <tbody>
                        {scoreLevelMap.map((s, i) => (
                          <tr key={i} className="border-t border-slate-100">
                            <td className="px-3 py-1.5"><input type="number" value={s.scoreMin} onChange={(e) => levelEdit(i, 'scoreMin', Number(e.target.value))} className="w-24 rounded border border-slate-200 px-2 py-1 text-sm outline-none focus:border-brand-400" /></td>
                            <td className="px-3 py-1.5"><input type="number" value={s.scoreMax} onChange={(e) => levelEdit(i, 'scoreMax', Number(e.target.value))} className="w-24 rounded border border-slate-200 px-2 py-1 text-sm outline-none focus:border-brand-400" /></td>
                            <td className="px-3 py-1.5"><input value={s.levelCode} onChange={(e) => levelEdit(i, 'levelCode', e.target.value)} className="w-24 rounded border border-slate-200 px-2 py-1 text-sm outline-none focus:border-brand-400" /></td>
                            <td className="px-3 py-1.5"><input value={s.levelName} onChange={(e) => levelEdit(i, 'levelName', e.target.value)} className="w-40 rounded border border-slate-200 px-2 py-1 text-sm outline-none focus:border-brand-400" /></td>
                            <td className="px-3 py-1.5"><button className="text-xs text-rose-500 hover:underline" onClick={() => levelDel(i)}>删除</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="border-t border-slate-100 px-3 py-2">
                    <Button size="sm" variant="ghost" onClick={levelAdd}>＋ 新增分段</Button>
                  </div>
                </div>
              </div>
              ) : (
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-slate-500">
                  {scoreLevelMap.map((s) => (
                    <span key={s.levelCode}>分值 {s.scoreMin}~{s.scoreMax} → <b className="text-slate-700">{s.levelName}</b></span>
                  ))}
                </div>
              )}
            </Panel>

            {/* ===== 区块D：融合处置规则（等级 + 标签） ===== */}
            <Panel
              title="融合处置规则"
              desc="基础风险等级 + 命中标签 → 最终处置。规则从上至下依次匹配，命中即终止；可调整顺序、启停、编辑或删除。"
              actions={<div className="flex items-center gap-2"><Cfg value="scoreData.json" /><Button size="sm" variant="secondary" onClick={() => setSimOpen(true)}>全链路模拟调试</Button><Button size="sm" variant="primary" onClick={openFuAdd}>新增融合规则</Button></div>}
            >
              <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                <span className="font-medium text-slate-600">配置步骤：</span>
                <span>① 选择风险等级（可多选）</span>
                <span className="text-slate-300">→</span>
                <span>② 选择标签 + 标签要求</span>
                <span className="text-slate-300">→</span>
                <span>③ 审核结果、关联业务流程</span>
              </div>
              <DataTable
                columns={[
                  { key: 'ruleSort', label: '排序', width: '88px', render: (r: Row) => (
                    <div className="flex items-center gap-1">
                      <button className="text-xs text-slate-400 hover:text-brand-600" onClick={() => fuMove(r.id as string, -1)}>↑</button>
                      <span className="text-sm tabular-nums">{r.ruleSort as number}</span>
                      <button className="text-xs text-slate-400 hover:text-brand-600" onClick={() => fuMove(r.id as string, 1)}>↓</button>
                    </div>
                  ) },
                  { key: 'baseRiskLevel', label: '适配基础等级', width: '150px', render: (r: Row) => (
                    <div className="flex flex-wrap gap-1">{(r.baseRiskLevel as string[]).map((lv) => <Badge key={lv} kind={lv === 'HIGH' || lv === 'VHIGH' ? 'red' : lv === 'MID' ? 'amber' : lv === 'VLOW' || lv === 'LOW' ? 'green' : 'gray'}>{lv === 'ALL' ? '全部' : lv === 'VLOW' ? '极低' : lv === 'LOW' ? '低' : lv === 'MID' ? '中' : lv === 'HIGH' ? '高' : '极高'}</Badge>)}</div>
                  ) },
                  { key: 'matchTagList', label: '引用标签 + 匹配方式', render: (r: Row) => {
                    const codes = r.matchTagList as string[]
                    if (!codes.length) return <span className="text-xs text-slate-400">仅看等级（无标签条件）</span>
                    const names = codes.map((c) => tags.find((t) => t.tagCode === c)?.name ?? c).join('、')
                    return <span className="text-sm">{names} <span className="text-xs text-slate-400">（{r.matchMode === 'all' ? '全部命中' : '任意命中'}）</span></span>
                  } },
                  { key: 'finalDecision', label: '处置意见', width: '100px', render: (r: Row) => <Badge kind={r.finalDecision === '拒绝' ? 'red' : r.finalDecision === '转人工' ? 'amber' : 'green'}>{r.finalDecision as string}</Badge> },
                  { key: 'processId', label: '关联业务流程', width: '200px', render: (r: Row) => <span className="text-sm">{flowName(r.processId as string)}</span> },
                  { key: 'outputRemark', label: '处置说明', render: (r: Row) => <span className="text-xs text-slate-500">{r.outputRemark as string}</span> },
                  { key: 'isActive', label: '状态', width: '90px', render: (r: Row) => (
                    <button onClick={() => fuToggle(r.id as string)} className={r.isActive ? 'text-emerald-600 hover:underline' : 'text-slate-400 hover:underline'}>{r.isActive ? '已启用' : '已停用'}</button>
                  ) },
                  { key: 'op', label: '操作', width: '120px', render: (r: Row) => (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openFuEdit(r.id as string)}>编辑</Button>
                      <button className="text-xs text-rose-500 hover:underline" onClick={() => fuRemove(r.id as string)}>删除</button>
                    </div>
                  ) },
                ]}
                rows={fus.map((f) => ({ id: f.id, ruleSort: f.ruleSort, baseRiskLevel: f.baseRiskLevel, matchTagList: f.matchTagList, matchMode: f.matchMode, finalDecision: f.finalDecision, processId: f.processId ?? '', outputRemark: f.outputRemark, isActive: f.isActive }))}
                empty="暂无融合规则，点击「新增融合规则」配置「等级 + 标签 → 处置」"
                pager
                defaultPageSize={10}
              />
            </Panel>

          </div>
        )}
      </div>

      {/* ===== 上线 Modal（版本 + 变更内容） ===== */}
      <Modal open={onlineOpen} onClose={() => setOnlineOpen(false)} title={`上线 · ${SCORE_PROD_LABEL[prod] ?? m.name}`}>
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">上线版本</span>
            <input
              value={onlineVer}
              onChange={(e) => setOnlineVer(e.target.value)}
              placeholder="如 v2.3.1"
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">变更内容</span>
            <textarea
              value={onlineNote}
              onChange={(e) => setOnlineNote(e.target.value)}
              placeholder="本次上线的主要变更说明（将记入版本日志）"
              className="h-24 w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-brand-400"
            />
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setOnlineOpen(false)}>取消</Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              const today = new Date().toISOString().slice(0, 10)
              const ver = onlineVer.trim() || m.version
              updateScore((d) => ({
                ...d,
                models: d.models.map((mm) =>
                  mm.prod === prod
                    ? {
                        ...mm,
                        enabled: true,
                        version: ver,
                        versions: [
                          { version: ver, date: today, note: onlineNote.trim() || '上线投产', current: true },
                          ...mm.versions.map((v) => ({ ...v, current: false })),
                        ],
                      }
                    : mm,
                ),
              }))
              setOnlineOpen(false)
            }}
          >
            确认上线
          </Button>
        </div>
      </Modal>

      {/* ===== 新增阈值 Modal（已随评分类改造移除：阈值逻辑并入 Tab4 区块C + 等级默认处置表） ===== */}

      {/* ===== 新增规则风险 Modal（引用决策引擎资产） ===== */}
      <Modal open={rlNewOpen} onClose={() => setRlNewOpen(false)} title={`新增风险标签 · ${SCORE_PROD_LABEL[prod] ?? m.name}`}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs text-slate-400">风险标签</span>
              <input value={rlDraft.name ?? ''} onChange={(e) => setRlDraft({ ...rlDraft, name: e.target.value })} placeholder="如 黑灰名单命中"
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-400">标签编码（系统自动生成）</span>
              <input value={rlDraft.tagCode ?? ''} onChange={(e) => setRlDraft({ ...rlDraft, tagCode: e.target.value })} placeholder={`自动生成 TAG_${prod.slice(0, 2).toUpperCase()}_xxx`}
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs text-slate-400">标签等级</span>
              <SingleSelect label="标签等级" fullWidth portal value={rlDraft.tagLevel ?? '中度风险'} onChange={(v) => setRlDraft({ ...rlDraft, tagLevel: v as RiskLabel['tagLevel'] })} options={[
                { value: '重度风险', label: '重度风险' },
                { value: '中度风险', label: '中度风险' },
                { value: '轻度风险', label: '轻度风险' },
                { value: '监控信号', label: '监控信号' },
              ]} />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">判定依据（仅可选规则集，输入名称即可搜索筛选）</span>
            <RuleSetSelect value={rlDraft.ref ?? ''} onChange={(v) => setRlDraft({ ...rlDraft, ref: v, refType: 'ruleset' })} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">触发条件</span>
            <SingleSelect label="触发条件" fullWidth portal value={rlDraft.collisionCondition ?? 'single'} onChange={(v) => setRlDraft({ ...rlDraft, collisionCondition: v as 'single' | 'all' })} options={[
              { value: 'single', label: '规则命中即生成标签' },
              { value: 'all', label: '多规则同时命中才生成标签' },
            ]} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">风险描述 / 业务解释</span>
            <textarea value={rlDraft.tagDesc ?? ''} onChange={(e) => setRlDraft({ ...rlDraft, tagDesc: e.target.value })} placeholder="用于对外报告、合规解释、人工复核提示"
              className="h-20 w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-brand-400" />
          </label>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={rlDraft.joinFusion ?? true} onChange={(e) => setRlDraft({ ...rlDraft, joinFusion: e.target.checked })} /> 计入融合处置
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={rlDraft.isRiskMonitorTag ?? false} onChange={(e) => setRlDraft({ ...rlDraft, isRiskMonitorTag: e.target.checked })} /> 纳入自动化监控样本
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={rlDraft.enabled ?? true} onChange={(e) => setRlDraft({ ...rlDraft, enabled: e.target.checked })} /> 启用
            </label>
          </div>
          <div className="text-xs text-slate-400">排序保存后自动按当前最大序号 +1；命中即派生该标签，标签不参与概率与标准分计算。</div>
          <div className="flex justify-end gap-2 pt-1">
            <Button size="sm" variant="ghost" onClick={() => setRlNewOpen(false)}>取消</Button>
            <Button size="sm" variant="primary" onClick={rlConfirm}>确认新增</Button>
          </div>
        </div>
      </Modal>

      {/* ===== 实时输出预览 Modal（风险标签对外统一结构） ===== */}
      <Modal open={rlPreviewOpen} onClose={() => setRlPreviewOpen(false)} title={`实时输出预览 · ${SCORE_PROD_LABEL[prod] ?? m.name}`}>
        <div className="space-y-3">
          <div className="text-xs text-slate-500">当前模型最终产出的风险标签数组，结构对标同盾对外 API，供前端对接、调试使用。</div>
          <pre className="max-h-80 overflow-auto rounded-lg bg-slate-900 p-3 text-xs leading-relaxed text-slate-100">{JSON.stringify(tagPreview, null, 2)}</pre>
          {!tagCfg.tagSwitch && <div className="text-xs text-amber-600">标签支线已关闭，当前无标签输出。</div>}
          <div className="flex justify-end">
            <Button size="sm" variant="ghost" onClick={() => setRlPreviewOpen(false)}>关闭</Button>
          </div>
        </div>
      </Modal>

      {/* ===== 新增 / 编辑 融合处置规则 Modal（小白友好版） ===== */}
      <RightDrawer open={fuNewOpen} onClose={() => { setFuNewOpen(false); setFuEditId(null) }} title={`${fuEditId ? '编辑' : '新增'}融合处置规则`} width={560}>
        <div className="space-y-4">
          <div className="rounded-lg bg-brand-50 px-3 py-2 text-xs leading-relaxed text-brand-700">
            这条规则用来决定：<b>满足什么条件的客户，系统该给「通过 / 转人工 / 拒绝」</b>。规则从上往下匹配，先命中谁就用谁。
          </div>

          {/* 审核结果 + 启用（置顶同一行） */}
          <div className="flex flex-wrap items-end gap-4">
            <label className="block flex-1 min-w-[200px]">
              <span className="mb-1 block text-sm font-medium text-slate-700">审核结果</span>
              <SingleSelect label="审核结果" fullWidth portal value={fuDraft.finalDecision} onChange={(v) => setFuDraft({ ...fuDraft, finalDecision: v as FusionRule['finalDecision'] })} options={[
                { value: '通过', label: '通过' },
                { value: '转人工', label: '转人工' },
                { value: '拒绝', label: '拒绝' },
              ]} />
            </label>
            <label className="flex items-center gap-2 pb-1.5 text-sm text-slate-600">
              <input type="checkbox" checked={fuDraft.isActive ?? true} onChange={(e) => setFuDraft({ ...fuDraft, isActive: e.target.checked })} /> 启用
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">关联业务流程</span>
            <SingleSelect label="关联业务流程" fullWidth portal value={fuDraft.processId ?? ''} onChange={(v) => setFuDraft({ ...fuDraft, processId: v })} options={[
              { value: '', label: '未关联' },
              ...flows.map((f) => ({ value: f.id, label: f.name })),
            ]} />
          </label>

          {/* 选择风险等级（跟随模型风险等级分段，实时） */}
          <div>
            <div className="mb-1 text-sm font-medium text-slate-700">选择风险等级（客户分数落在哪个区间）</div>
            <span className="mb-2 block text-xs text-slate-400">可多选；都不选 = 适用于所有等级</span>
            <div className="flex flex-wrap gap-2">
              {scoreLevelMap.map((s) => {
                const code = s.levelCode
                const checked = (fuDraft.baseRiskLevel ?? []).includes(code)
                return (
                  <button key={code} type="button" onClick={() => {
                    const cur = fuDraft.baseRiskLevel ?? []
                    setFuDraft({ ...fuDraft, baseRiskLevel: checked ? cur.filter((x) => x !== code) : [...cur, code] })
                  }}
                    className={`rounded-full px-3 py-1 text-sm ${checked ? 'bg-brand-50 text-brand-600 ring-1 ring-brand-200' : 'bg-slate-50 text-slate-500'}`}>
                    {lvShort(code) || s.levelName || code}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 选择标签 + 标签要求（同一区块，标签与规则风险联动） */}
          <div className="space-y-3 rounded-lg border border-slate-100 p-3">
            <div>
              <div className="mb-1 text-sm font-medium text-slate-700">选择标签（可留空）</div>
              <span className="mb-2 block text-xs text-slate-400">从「规则风险」页已配置的标签里选；不选 = 只看等级，不考虑标签</span>
              {tags.length ? (
                <div className="space-y-2">
                  {(['重度风险', '中度风险', '轻度风险', '监控信号'] as const).map((lv) => {
                    const group = tags.filter((t) => t.tagLevel === lv)
                    if (!group.length) return null
                    return (
                      <div key={lv} className="flex flex-wrap items-center gap-2">
                        <span className="w-14 shrink-0 text-xs text-slate-400">{lv}</span>
                        {group.map((l) => {
                          const checked = (fuDraft.matchTagList ?? []).includes(l.tagCode)
                          return (
                            <button key={l.id} type="button" onClick={() => {
                              const cur = fuDraft.matchTagList ?? []
                              setFuDraft({ ...fuDraft, matchTagList: checked ? cur.filter((c) => c !== l.tagCode) : [...cur, l.tagCode] })
                            }}
                              className={`rounded-full px-3 py-1 text-sm ${checked ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200' : 'bg-slate-50 text-slate-500'}`}>
                              {l.name}
                            </button>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              ) : <span className="text-xs text-slate-400">暂无标签，请先到「规则风险」页新增</span>}
            </div>
            <div>
              <div className="mb-1 text-sm font-medium text-slate-700">标签要求</div>
              <span className="mb-2 block text-xs text-slate-400">{(fuDraft.matchTagList ?? []).length ? '选了标签时生效' : '未选标签，此步自动忽略'}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setFuDraft({ ...fuDraft, matchMode: 'any' })} className={`rounded px-3 py-1 text-sm ${fuDraft.matchMode !== 'all' ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-500'}`}>命中任意一个即可</button>
                <button type="button" onClick={() => setFuDraft({ ...fuDraft, matchMode: 'all' })} className={`rounded px-3 py-1 text-sm ${fuDraft.matchMode === 'all' ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-500'}`}>必须全部命中</button>
              </div>
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">处置说明（选填）</span>
            <textarea value={fuDraft.outputRemark ?? ''} onChange={(e) => setFuDraft({ ...fuDraft, outputRemark: e.target.value })} placeholder="接口返回、审核页面展示的处置说明"
              className="h-16 w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-brand-400" />
          </label>

          <div className="rounded-lg bg-slate-900 px-3 py-2 text-xs leading-relaxed text-slate-100">
            {(() => {
              const lvNames = (fuDraft.baseRiskLevel ?? []).map((lv) => lvShort(lv)).join('、') || '全部等级'
              const tagNames = (fuDraft.matchTagList ?? []).map((c) => tags.find((t) => t.tagCode === c)?.name ?? c).join('、')
              const hasTags = (fuDraft.matchTagList ?? []).length > 0
              const modeTxt = hasTags ? (fuDraft.matchMode === 'all' ? '且须全部命中' : '且命中任意一个') : ''
              const flowTxt = flowName(fuDraft.processId)
              return `规则预览：当客户属于【${lvNames}】${ hasTags ? `${modeTxt}【${tagNames}】` : '' } → 系统给【${fuDraft.finalDecision ?? '通过'}】${ flowTxt && flowTxt !== '未关联' ? `，转【${flowTxt}】` : '' }`
            })()}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button size="sm" variant="ghost" onClick={() => { setFuNewOpen(false); setFuEditId(null) }}>取消</Button>
            <Button size="sm" variant="primary" onClick={fuConfirm}>{fuEditId ? '保存修改' : '确认新增'}</Button>
            </div>
          </div>
      </RightDrawer>

      {/* ===== 全链路模拟调试 Modal ===== */}
      <Modal open={simOpen} onClose={() => setSimOpen(false)} title={`全链路模拟调试 · ${SCORE_PROD_LABEL[prod] ?? m.name}`}>
        <div className="space-y-3">
          <div className="text-xs text-slate-500">输入预测概率、勾选命中标签，一键算出标准分 / 风险等级 / 命中规则 / 最终处置。</div>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">模拟预测概率（0~1）</span>
            <input type="number" step="0.01" min="0" max="1" value={simProb} onChange={(e) => setSimProb(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400" />
          </label>
          <div>
            <span className="mb-1 block text-xs text-slate-400">模拟命中标签</span>
            <div className="flex flex-wrap gap-2">
              {tags.length ? tags.map((l) => {
                const checked = simTags.includes(l.tagCode)
                return (
                  <button key={l.id} onClick={() => setSimTags(checked ? simTags.filter((c) => c !== l.tagCode) : [...simTags, l.tagCode])}
                    className={`rounded-full px-3 py-1 text-sm ${checked ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200' : 'bg-slate-50 text-slate-500'}`}>
                    {l.tagCode} · {l.name}
                  </button>
                )
              }) : <span className="text-xs text-slate-400">暂无标签</span>}
            </div>
          </div>
          {(() => {
            const r = simulateFusion(m, Number(simProb), simTags)
            return (
              <div className="space-y-2 rounded-lg bg-slate-900 p-3 text-xs leading-relaxed text-slate-100">
                <div>映射标准分：<span className="font-semibold text-emerald-300">{r.standardScore}</span></div>
                <div>基础风险等级：<span className="font-semibold text-amber-300">{r.riskLevel}（{r.riskLevelName}）</span></div>
                <div>命中融合规则：<span className="font-semibold text-sky-300">{r.matchedRule ? `${r.matchedRule.id} · ${r.matchedRule.outputRemark}` : '无（按处置策略兜底）'}</span></div>
                <div>最终处置：<span className={`font-semibold ${r.decision === '拒绝' ? 'text-rose-300' : r.decision === '转人工' ? 'text-amber-300' : 'text-emerald-300'}`}>{r.decision}</span> ｜ 流程：{flowName(r.processId)}</div>
                <div className="text-slate-400">说明：{r.remark}</div>
              </div>
            )
          })()}
          <div className="flex justify-end gap-2 pt-1">
            <Button size="sm" variant="ghost" onClick={() => setSimOpen(false)}>关闭</Button>
          </div>
        </div>
      </Modal>

    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs text-slate-400">{label}</div>
      {children}
    </div>
  )
}
function Def({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-slate-50 py-1.5">
      <dt className="text-slate-500">{k}</dt>
      <dd className="font-medium text-ink-900">{v}</dd>
    </div>
  )
}
