import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  useScore, updateScore, SCORE_PROD_LABEL,
  type ScoreProd, type ModelMeta, type ModelVersion, type ThresholdRow,
} from './scoreData'
import { PageShell } from './PageShell'
import { Panel, Button, Badge, DataTable, Modal, type Column, type Row } from '../components/ui'
import { Sam, Cfg, Cal } from './SourceTag'
import { LineChart } from '../components/charts'
import ModelDecisionGraph from './ModelDecisionGraph'
import { PIPELINE_GRAPHS } from './modelGraphData'
import FlowCanvasEditor from './FlowCanvasEditor'
import { useFlows, getFlowById } from './flowStore'
import { updateAlerts, useMidAlerts, midNewId, type MidAlert } from './midStore'
import { usePageNav } from './pageNav'

const MODEL_COLOR: Record<ScoreProd, string> = {
  zhicha: '#ef4444',
  zhixin: '#22c55e',
  zhirong: '#8b5cf6',
}
const PSI_KIND: Record<string, 'green' | 'amber' | 'red'> = { 稳定: 'green', 临界: 'amber', 偏移: 'red' }

type DetailTab = 'base' | 'algo' | 'effect' | 'threshold'
const DETAIL_TABS: { key: DetailTab; label: string }[] = [
  { key: 'base', label: '基本信息' },
  { key: 'algo', label: '算法编辑' },
  { key: 'effect', label: '模型效果' },
  { key: 'threshold', label: '评分阈值' },
]

function levelKind(level: string): 'red' | 'amber' | 'blue' | 'green' | 'gray' {
  if (level.includes('低') || level === 'A') return 'green'
  if (level.includes('中') || level === 'B') return 'blue'
  if (level.includes('高') || level === 'C') return 'amber'
  if (level === 'D') return 'red'
  return 'gray'
}
export default function ScoreModelDetailPage() {
  const data = useScore()
  const [params] = useSearchParams()
  const { goDetail, back } = usePageNav()
  const prod = ((params.get('prod') as ScoreProd) ?? 'zhicha')
  const m = data.models.find((x) => x.prod === prod) ?? data.models[0]
  const color = MODEL_COLOR[m.prod]
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

  /* ---------- 评分阈值（本模型）：分值分区 + 关联预警处置流程 ---------- */
  const flows = useFlows()
  const flowName = (id?: string) => flows.find((f) => f.id === id)?.name ?? '未关联'
  const [thEditId, setThEditId] = useState<string | null>(null)
  const [thAction, setThAction] = useState('')
  const [thBizOpen, setThBizOpen] = useState<string | null>(null) // 正在选流程的阈值 id
  const [thBizId, setThBizId] = useState('')
  const [thSelId, setThSelId] = useState<string | null>(null) // 选中查看处置流程的阈值
  const [thNewOpen, setThNewOpen] = useState(false)
  const [thDraft, setThDraft] = useState({ range: '', level: '', meaning: '', action: '', bizFlowId: '' })
  const thKey = (t: ThresholdRow) => `${t.prod}|${t.range}|${t.level}`
  const thRows: Row[] = data.thresholds
    .filter((t) => t.prod === prod)
    .map((t) => ({
      id: thKey(t), range: t.range, level: { v: t.level, kind: levelKind(t.level) },
      meaning: t.meaning, action: t.action, bizFlowId: t.bizFlowId ?? '',
    }))
  const thCols: Column[] = [
    { key: 'range', label: '分数区间', width: '150px' },
    { key: 'level', label: '等级', type: 'badge', badgeKind: 'gray', width: '90px' },
    { key: 'meaning', label: '含义', width: '200px' },
    {
      key: 'bizFlow', label: '预警处置流程', width: '200px',
      render: (r: Row) => {
        const id = r.id as string
        const cur = (r.bizFlowId as string) || ''
        if (thBizOpen === id) {
          return (
            <select value={thBizId} onChange={(e) => {
              const v = e.target.value
              setThBizId(v)
              updateScore((d) => ({ ...d, thresholds: d.thresholds.map((t) => (thKey(t) === id ? { ...t, bizFlowId: v } : t)) }))
              setThBizOpen(null)
            }}
              className="w-full rounded border border-slate-200 px-2 py-1 text-sm outline-none focus:border-brand-400">
              <option value="">未关联</option>
              {flows.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          )
        }
        return (
          <button className="text-left text-sm text-brand-600 hover:underline" onClick={() => { setThBizOpen(id); setThBizId(cur) }}>
            {cur ? flowName(cur) : '＋ 关联流程'}
          </button>
        )
      },
    },
    {
      key: 'action', label: '建议动作',
      render: (r: Row) => {
        const id = r.id as string
        if (thEditId === id) {
          return (
            <div className="flex items-center gap-2">
              <input value={thAction} onChange={(e) => setThAction(e.target.value)}
                className="w-40 rounded border border-slate-200 px-2 py-1 text-sm outline-none focus:border-brand-400" />
              <Button size="sm" variant="primary" onClick={() => {
                updateScore((d) => ({ ...d, thresholds: d.thresholds.map((t) => (thKey(t) === id ? { ...t, action: thAction } : t)) }))
                setThEditId(null)
              }}>保存</Button>
              <Button size="sm" variant="ghost" onClick={() => setThEditId(null)}>取消</Button>
            </div>
          )
        }
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm">{r.action as string}</span>
            <Button size="sm" variant="ghost" onClick={() => {
              const [p, range, level] = id.split('|')
              const t = data.thresholds.find((x) => x.prod === p && x.range === range && x.level === level)!
              setThAction(t.action); setThEditId(id)
            }}>编辑</Button>
          </div>
        )
      },
    },
    {
      key: 'flowPrev', label: '处置流程', width: '96px',
      render: (r: Row) => {
        const t = data.thresholds.find((x) => thKey(x) === r.id)
        if (!t?.bizFlowId) return <span className="text-xs text-slate-300">—</span>
        return <Button size="sm" variant="ghost" onClick={() => setThSelId(r.id as string)}>查看</Button>
      },
    },
  ]
  const confirmThNew = () => {
    const range = thDraft.range.trim(); const level = thDraft.level.trim()
    if (!range || !level) return
    updateScore((d) => ({ ...d, thresholds: [...d.thresholds, { prod, range, level, meaning: thDraft.meaning.trim(), action: thDraft.action.trim(), bizFlowId: thDraft.bizFlowId || undefined }] }))
    setThNewOpen(false)
  }
  const selThreshold = data.thresholds.find((t) => thKey(t) === thSelId) ?? null
  const selFlow = selThreshold?.bizFlowId ? getFlowById(selThreshold.bizFlowId) : undefined

  /* ---------- 关联预警（预警平台 midAlerts，模型管理仅作编辑入口） ---------- */
  const PROD_SCENE: Record<ScoreProd, string> = { zhicha: '反欺诈监测', zhixin: '贷中风控', zhirong: '贷后催收' }
  const midAlerts = useMidAlerts()
  const relatedAlerts = midAlerts.filter((a) => a.scene === PROD_SCENE[prod])
  const [alOpen, setAlOpen] = useState(false)
  const [alForm, setAlForm] = useState({ cust_name: '', alert_type: '负债激增', level: 'RED' as MidAlert['level'], rule_name: '', metric_value: 0, threshold: 0, flowKey: '' })
  const addAlert = () => {
    const today = new Date().toISOString().slice(0, 10)
    updateAlerts((list) => [...list, {
      alert_id: midNewId('AL'), cust_id: 'C' + String(Math.floor(Math.random() * 9000) + 1000),
      cust_name: alForm.cust_name || '未知客户', scene: PROD_SCENE[prod], alert_type: alForm.alert_type,
      level: alForm.level, alert_date: today, rule_name: alForm.rule_name || '自定义规则',
      metric_value: Number(alForm.metric_value) || 0, threshold: Number(alForm.threshold) || 0,
      flowKey: alForm.flowKey || undefined,
    }])
    setAlForm({ cust_name: '', alert_type: '负债激增', level: 'RED', rule_name: '', metric_value: 0, threshold: 0, flowKey: '' })
    setAlOpen(false)
  }
  const alCols: Column[] = [
    { key: 'alert_id', label: '预警编号', width: '130px' },
    { key: 'cust_name', label: '客户', width: '110px' },
    { key: 'alert_type', label: '类型', width: '130px' },
    { key: 'level', label: '等级', type: 'badge', badgeKind: 'gray', width: '90px' },
    { key: 'rule_name', label: '命中规则' },
    { key: 'flowState', label: '处置状态', width: '130px' },
  ]
  const alRows: Row[] = relatedAlerts.map((a) => ({
    id: a.alert_id, alert_id: a.alert_id, cust_name: a.cust_name, alert_type: a.alert_type,
    level: { v: a.level === 'RED' ? '红' : a.level === 'YELLOW' ? '黄' : '机会', kind: a.level === 'RED' ? 'red' : a.level === 'YELLOW' ? 'amber' : 'blue' },
    rule_name: a.rule_name, flowState: a.flowState ?? '—',
  }))

  /* ---------- 模型效果（本模型） ---------- */
  const ops = data.ops.find((x) => x.prod === prod)!

  return (
    <>
      <PageShell
        title={m.name}
        subtitle={`${SCORE_PROD_LABEL[m.prod]} · 模型详情（基本信息 / 算法编辑 / 模型效果 / 评分阈值 / 版本日志）`}
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
            desc="以「可视化」查看本模型真实计算链路（数据源 → 算法与因子 → 规则集 → 输出分数 → 决策映射），或以「代码」查看模型算法（Model-as-Code）"
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
                  graph={m.decisionGraph ?? (m.prod === 'zhixin' ? PIPELINE_GRAPHS.zhixin_credit_v1 : undefined)}
                  onJumpRules={() => goDetail('/console/cm/rule-hub')}
                  onJumpStrategy={() => goDetail('/console/sc/model-detail?prod=' + prod + '&tab=threshold')}
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

        {tab === 'effect' && (
          /* ===== 模型效果（本模型） ===== */
          <>
            <Panel title="模型效果" desc={`${SCORE_PROD_LABEL[prod]} · 运营效果指标与 6 个月趋势（单模型视角；三模型横向对比见「模型效果」页）`} actions={<><Cal /><Sam value="scoreData.json" /></>}>
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

        {tab === 'threshold' && (
          <div className="space-y-4">
            <Panel
              title={`评分阈值配置 · ${SCORE_PROD_LABEL[prod]}`}
              desc="分值分区 → 等级 → 含义 → 建议动作 → 关联预警处置流程（本模型输出映射，随模型管理）"
              actions={
                <>
                  <Cfg value="scoreData.json" />
                  <Button size="sm" variant="primary" onClick={() => { setThDraft({ range: '', level: '', meaning: '', action: '', bizFlowId: '' }); setThNewOpen(true) }}>新增阈值</Button>
                </>
              }
            >
              <DataTable columns={thCols} rows={thRows} empty="暂无阈值" pager defaultPageSize={10} />
              {selFlow?.flowGraphs?.[0] && (
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">处置流程预览：{selFlow.name}</span>
                    <Button size="sm" variant="ghost" onClick={() => setThSelId(null)}>收起</Button>
                  </div>
                  <FlowCanvasEditor graph={selFlow.flowGraphs[0]} readOnly />
                </div>
              )}
            </Panel>

            <Panel
              title="关联预警（预警平台）"
              desc={`本模型的预警统一来源于预警平台 midAlerts（场景：${PROD_SCENE[prod]}），模型管理仅作编辑入口`}
              actions={
                <>
                  <Cfg value="midAlerts.json" />
                  <Button size="sm" variant="primary" onClick={() => setAlOpen(true)}>新增预警</Button>
                </>
              }
            >
              <DataTable columns={alCols} rows={alRows} empty="暂无关联预警" pager defaultPageSize={10} />
            </Panel>
          </div>
        )}
      </div>

      {/* ===== 上线 Modal（版本 + 变更内容） ===== */}
      <Modal open={onlineOpen} onClose={() => setOnlineOpen(false)} title={`上线 · ${SCORE_PROD_LABEL[prod]}`}>
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

      {/* ===== 新增阈值 Modal ===== */}
      <Modal open={thNewOpen} onClose={() => setThNewOpen(false)} title={`新增阈值 · ${SCORE_PROD_LABEL[prod]}`}>
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">分数区间（如 0-40 / 41-69）</span>
            <input value={thDraft.range} onChange={(e) => setThDraft({ ...thDraft, range: e.target.value })} placeholder="0-40"
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">等级（如 高 / 中 / 低 或 A-E）</span>
            <input value={thDraft.level} onChange={(e) => setThDraft({ ...thDraft, level: e.target.value })} placeholder="高"
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">含义</span>
            <input value={thDraft.meaning} onChange={(e) => setThDraft({ ...thDraft, meaning: e.target.value })} placeholder="欺诈风险极高，直接拒绝"
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">建议动作</span>
            <input value={thDraft.action} onChange={(e) => setThDraft({ ...thDraft, action: e.target.value })} placeholder="拒绝 / 审慎授信 / 标准额度"
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">关联预警处置流程（可选）</span>
            <select value={thDraft.bizFlowId} onChange={(e) => setThDraft({ ...thDraft, bizFlowId: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400">
              <option value="">未关联</option>
              {flows.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setThNewOpen(false)}>取消</Button>
          <Button size="sm" variant="primary" onClick={confirmThNew}>确认新增</Button>
        </div>
      </Modal>

      {/* ===== 新增关联预警 Modal（写入 midAlerts 预警平台） ===== */}
      <Modal open={alOpen} onClose={() => setAlOpen(false)} title={`新增关联预警 · ${SCORE_PROD_LABEL[prod]}`}>
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm text-slate-500">客户名称</span>
            <input value={alForm.cust_name} onChange={(e) => setAlForm((f) => ({ ...f, cust_name: e.target.value }))} placeholder="如 张*明"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" />
          </label>
          <label className="block">
            <span className="text-sm text-slate-500">预警类型</span>
            <input value={alForm.alert_type} onChange={(e) => setAlForm((f) => ({ ...f, alert_type: e.target.value }))} placeholder="如 负债激增 / 多头借贷 / 司法涉诉"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-slate-500">等级</span>
              <select value={alForm.level} onChange={(e) => setAlForm((f) => ({ ...f, level: e.target.value as MidAlert['level'] }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400">
                <option value="RED">红（高风险）</option>
                <option value="YELLOW">黄（关注）</option>
                <option value="OPPORTUNITY">机会（营销）</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-slate-500">关联处置流程</span>
              <select value={alForm.flowKey} onChange={(e) => setAlForm((f) => ({ ...f, flowKey: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400">
                <option value="">未关联</option>
                {flows.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-slate-500">指标值</span>
              <input type="number" value={alForm.metric_value} onChange={(e) => setAlForm((f) => ({ ...f, metric_value: Number(e.target.value) }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" />
            </label>
            <label className="block">
              <span className="text-sm text-slate-500">阈值</span>
              <input type="number" value={alForm.threshold} onChange={(e) => setAlForm((f) => ({ ...f, threshold: Number(e.target.value) }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" />
            </label>
          </div>
          <label className="block">
            <span className="text-sm text-slate-500">命中规则</span>
            <input value={alForm.rule_name} onChange={(e) => setAlForm((f) => ({ ...f, rule_name: e.target.value }))} placeholder="如 近30天新增贷款≥3笔"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setAlOpen(false)}>取消</Button>
            <Button variant="primary" onClick={addAlert}>确认新增</Button>
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
