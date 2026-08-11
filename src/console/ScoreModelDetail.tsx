import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  useScore, updateScore, SCORE_PROD_LABEL,
  type ScoreProd, type ModelMeta, type ModelVersion,
} from './scoreData'
import { PageShell } from './PageShell'
import { Panel, Button, Badge, DataTable, type Column, type Row } from '../components/ui'
import { Sam, Cfg, Cal } from './SourceTag'
import ModelDecisionGraph from './ModelDecisionGraph'

const MODEL_COLOR: Record<ScoreProd, string> = {
  zhicha: '#ef4444',
  zhixin: '#22c55e',
  zhirong: '#8b5cf6',
}

export default function ScoreModelDetailPage() {
  const data = useScore()
  const [params] = useSearchParams()
  const nav = useNavigate()
  const prod = ((params.get('prod') as ScoreProd) ?? 'zhicha')
  const m = data.models.find((x) => x.prod === prod) ?? data.models[0]
  const color = MODEL_COLOR[m.prod]

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

  return (
    <>
      <PageShell
        title={m.name}
        subtitle={`${SCORE_PROD_LABEL[m.prod]} · 模型详情（基本信息 / 算法编辑 / 版本管理）`}
        crumb="评分产品 / 模型管理"
        actions={
          <Button size="sm" variant="secondary" onClick={() => nav('/console/sc/model-manage')}>← 返回模型列表</Button>
        }
      />
      <div className="space-y-4">
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

        {/* ===== 算法编辑 ===== */}
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
            <ModelDecisionGraph
              prod={m.prod}
              model={m}
              thresholds={data.thresholds}
              onJumpRules={() => nav('/console/cm/rule-hub')}
              onJumpStrategy={() => nav('/console/sc/score-threshold?prod=' + prod)}
              onSaveCollisions={(rules) =>
                updateScore((d) => ({
                  ...d,
                  models: d.models.map((mm) => (mm.prod === prod ? { ...mm, collisionRules: rules } : mm)),
                }))
              }
            />
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
        <Panel title="版本管理" desc="本模型版本历史，可回滚至历史版本" actions={<Cfg value="scoreData.json" />}>
          <DataTable columns={verCols} rows={verRows} empty="暂无版本" pager defaultPageSize={10} />
        </Panel>
      </div>
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
