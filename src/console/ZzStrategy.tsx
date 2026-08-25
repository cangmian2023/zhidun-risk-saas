// 催贷管理 · 模块2 智能策略引擎
import { useState, useRef, type MouseEvent as ReactMouseEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ZzPage, ZzCard, ZzBtn, ZzModal, ZzTable, ZzField, ZzInput, ZzSelect, ZzBadge, ZzTabs, BLUE } from './zzUi'
import {
  ZZ_STRATEGIES, ZZ_STRATEGY_VERSIONS, ZZ_STRATEGY_EXEC, ZZ_STRATEGY_EXCEPTIONS,
  ZZ_GRAPH_PROFILES, ZZ_GRAPH_TAG_COLOR,
  type ZzStrategy, type ZzStrategyVersion,
} from './zzData'

export function ZzStrategyModule({ pageKey }: { pageKey: string }) {
  // 画布页（带 ?id=）独立路由；其余（含 zz:strategy 首页）走统一首页双 Tab
  if (pageKey.startsWith('zz:strategy-canvas')) return <ZzStrategyCanvasPage />
  return <ZzStrategyHome />
}

/* ===================== 首页：顶部 Tab（策略列表 / 执行监控） ===================== */
function ZzStrategyHome() {
  const [tab, setTab] = useState('策略列表')
  return (
    <ZzPage title="智能策略引擎" crumb="催贷管理 / 智能策略引擎" subtitle="催收策略总入口：策略列表编排与全局执行监控">
      <ZzTabs tabs={['策略列表', '执行监控']} active={tab} onChange={setTab} />
      {tab === '策略列表' ? <ZzStrategyList /> : <ZzStrategyMonitor />}
    </ZzPage>
  )
}

/* ---------------- 策略列表（默认 Tab） ---------------- */
function ZzStrategyList() {
  const nav = useNavigate()
  const [rows, setRows] = useState<ZzStrategy[]>(() => ZZ_STRATEGIES.map((s) => ({ ...s })))
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', stageRange: 'M1', version: 'v1.0' })

  const openCanvas = (s: ZzStrategy) =>
    nav(`/console/zz/strategy-canvas?id=${s.id}&back=${encodeURIComponent('/console/zz/strategy')}`)

  const clone = (s: ZzStrategy) => {
    const id = `st-${Date.now().toString().slice(-6)}`
    setRows((r) => [{ ...s, id, name: s.name + ' 副本', enabled: true }, ...r])
    alert(`已复制策略「${s.name}」为新策略（${id}）`)
  }
  const toggle = (s: ZzStrategy) =>
    setRows((r) => r.map((x) => x.id === s.id ? { ...x, enabled: !x.enabled } : x))

  const create = () => {
    if (!form.name.trim()) return alert('请填写策略名称')
    const id = `st-${Date.now().toString().slice(-6)}`
    setRows((r) => [{ id, name: form.name.trim(), stageRange: form.stageRange, version: form.version, enabled: true, created: new Date().toISOString().slice(0, 10) }, ...r])
    setCreating(false)
    setForm({ name: '', stageRange: 'M1', version: 'v1.0' })
  }

  return (
    <ZzCard title="策略列表" extra={<div className="flex gap-2"><ZzBtn sm primary onClick={() => setCreating(true)}>新建策略</ZzBtn><ZzBtn sm>导出配置</ZzBtn></div>}>
      <ZzTable head={['策略名称', '适用账龄', '版本', '状态', '创建时间', '操作']} rows={rows.map((s) => [
        <button className="text-left font-medium text-[#1677ff] hover:underline" onClick={() => openCanvas(s)}>{s.name}</button>,
        s.stageRange, s.version,
        s.enabled ? <ZzBadge color="#16A34A">已启用</ZzBadge> : <ZzBadge color="#9CA3AF">已停用</ZzBadge>,
        s.created,
        <div className="flex flex-wrap gap-1">
          <ZzBtn sm primary onClick={() => openCanvas(s)}>编辑</ZzBtn>
          <ZzBtn sm onClick={() => clone(s)}>复制</ZzBtn>
          <ZzBtn sm onClick={() => toggle(s)}>{s.enabled ? '停用' : '启用'}</ZzBtn>
          <ZzBtn sm onClick={() => alert(`已对「${s.name}」发起灰度发布（10% 流量灰度）`)}>灰度发布</ZzBtn>
        </div>,
      ])} />
      {creating && (
        <ZzModal open title="新建策略" onClose={() => setCreating(false)} width={520}
          footer={<><ZzBtn onClick={() => setCreating(false)}>取消</ZzBtn><ZzBtn primary onClick={create}>创建</ZzBtn></>}>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><ZzField label="策略名称"><ZzInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="如：M1 短信+外呼策略" /></ZzField></div>
            <ZzField label="适用账龄"><ZzSelect value={form.stageRange} onChange={(e) => setForm({ ...form, stageRange: e.target.value })}><option>M0</option><option>M1</option><option>M2</option><option>M3+</option></ZzSelect></ZzField>
            <ZzField label="初始版本号"><ZzInput value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} /></ZzField>
          </div>
        </ZzModal>
      )}
    </ZzCard>
  )
}

/* ---------------- 执行监控（全局统计 Tab，支持按策略筛选） ---------------- */
function ZzStrategyMonitor() {
  const [sid, setSid] = useState('')
  const exec = ZZ_STRATEGY_EXEC.filter((e) => !sid || e.sid === sid)
  const errs = ZZ_STRATEGY_EXCEPTIONS.filter((e) => !sid || e.sid === sid)
  const inflowSum = exec.reduce((a, e) => a + e.inflow, 0)

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm text-gray-500">按策略筛选：</span>
        <ZzSelect value={sid} onChange={(e) => setSid(e.target.value)} className="w-56">
          <option value="">全部策略</option>
          {ZZ_STRATEGIES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </ZzSelect>
        {sid && <ZzBadge color={BLUE}>{ZZ_STRATEGIES.find((s) => s.id === sid)?.name}</ZzBadge>}
      </div>
      <div className="mb-4 flex gap-3">
        <ZzCard><div className="text-sm text-gray-500">流入分支总数</div><div className="mt-1 text-2xl font-semibold" style={{ color: BLUE }}>{inflowSum}</div></ZzCard>
        <ZzCard><div className="text-sm text-gray-500">异常日志</div><div className="mt-1 text-2xl font-semibold text-red-600">{errs.length}</div></ZzCard>
      </div>
      <ZzCard title="分流统计">
        <ZzTable head={['分支', '流入案件', 'AI机器人', '短信', '人工分配']} rows={exec.map((e) => [
          e.branch, e.inflow, e.ai, e.sms, e.human,
        ])} />
      </ZzCard>
      <ZzCard title="图谱策略因子（知识图谱赋能自动分案）">
        <div className="mb-2 rounded bg-[#eef4ff] p-2 text-xs text-[#1677ff]">策略引擎已接入知识图谱，在传统「账龄 / 金额」分流基础上，新增以下图谱维度因子，系统自动智能分流（零侵入升级，不改变现有策略编排）。</div>
        <ZzTable head={['图谱因子', '含义', '自动分流效果']} rows={[
          ['关联逾期密度', '客户周边逾期关联人越多，风险越高', '密度高 → 提前拦截、重点跟进'],
          ['关联联系人数量', '合法可触达关联线索数量', '线索多 → 优先人工精准催收'],
          ['团伙成员等级', '在逾期团伙网络中的角色（核心/普通）', '核心成员 → 升级法务 / 重点催收'],
          ['失联修复概率', '图谱计算的可达性得分', '概率低 → 自动 AI 外呼 + 委外'],
        ]} />
        <div className="mt-2 text-xs text-gray-400">样例（系统实时计算）：CO-202608-001 关联团伙 G-03 核心成员、失联修复得分 82 → 人工精准催收；CO-202608-006 孤立高危、得分 8 → 自动 AI 外呼 + 委外。完整画像见各案件详情「关联关系图谱」Tab。</div>
      </ZzCard>
      <ZzCard title="执行异常日志">
        <ZzTable head={['时间', '策略', '异常']} rows={errs.map((e) => [e.time, e.strategy, e.msg])} />
      </ZzCard>
    </div>
  )
}

/* ===================== 策略画布页（下钻页，内部双 Tab：画布编辑 / 版本管理） ===================== */
interface NodeT { id: string; kind: 'start' | 'cond' | 'exec'; label: string; x: number; y: number; detail: string }
interface EdgeT { id: string; from: string; to: string }
const NODE_W = 120
const NODE_H = 54
const CANVAS_W = 980
const CANVAS_H = 420
const INIT_NODES: NodeT[] = [
  { id: 'n1', kind: 'start', label: '开始', x: 40, y: 180, detail: '策略入口' },
  { id: 'n2', kind: 'cond', label: '条件分支', x: 220, y: 170, detail: '账龄 = M2 且 金额 ≥ 5万' },
  { id: 'n3', kind: 'exec', label: 'AI机器人', x: 440, y: 90, detail: '话术模板 T-01 / 外呼 2 次/日' },
  { id: 'n4', kind: 'exec', label: '短信发送', x: 440, y: 180, detail: '模板 催-M2-01' },
  { id: 'n5', kind: 'exec', label: '分配人工', x: 440, y: 280, detail: '坐席组 催收二组' },
  { id: 'n6', kind: 'exec', label: '延迟等待', x: 650, y: 180, detail: 'T+1 天' },
  { id: 'n7', kind: 'start', label: '结束', x: 840, y: 180, detail: '流程结束' },
]
const INIT_EDGES: EdgeT[] = [
  { id: 'e1', from: 'n1', to: 'n2' },
  { id: 'e2', from: 'n2', to: 'n3' },
  { id: 'e3', from: 'n2', to: 'n4' },
  { id: 'e4', from: 'n2', to: 'n5' },
  { id: 'e5', from: 'n3', to: 'n6' },
  { id: 'e6', from: 'n4', to: 'n6' },
  { id: 'e7', from: 'n5', to: 'n6' },
  { id: 'e8', from: 'n6', to: 'n7' },
]
function ZzStrategyCanvasPage() {
  const nav = useNavigate()
  const loc = useLocation()
  const id = new URLSearchParams(loc.search).get('id') || ''
  const st = ZZ_STRATEGIES.find((s) => s.id === id)
  const [tab, setTab] = useState('画布编辑')

  if (!st) {
    return (
      <ZzPage title="策略画布" crumb="催贷管理 / 智能策略引擎 / 策略列表" subtitle="拖拽式可视化编排">
        <ZzCard>
          <div className="py-10 text-center text-gray-400">未指定策略，请先从「策略列表」点击【编辑】进入画布。</div>
          <div className="text-center"><ZzBtn primary onClick={() => nav('/console/zz/strategy')}>返回策略列表</ZzBtn></div>
        </ZzCard>
      </ZzPage>
    )
  }

  return (
    <ZzPage
      title={`策略画布 · ${st.name}`}
      crumb={`催贷管理 / 智能策略引擎 / 策略列表 / ${st.name}(编辑)`}
      subtitle="拖拽式可视化编排：条件分支 + 执行节点 + 合规管控"
      actions={<ZzBtn sm onClick={() => nav('/console/zz/strategy')}>← 返回策略列表</ZzBtn>}
    >
      <ZzTabs tabs={['画布编辑', '版本管理']} active={tab} onChange={setTab} />
      {tab === '画布编辑' ? <CanvasEditor st={st} /> : <VersionManager st={st} onRollback={() => setTab('画布编辑')} />}
    </ZzPage>
  )
}

function CanvasEditor({ st }: { st: ZzStrategy }) {
  const [nodes, setNodes] = useState<NodeT[]>(INIT_NODES)
  const [edges, setEdges] = useState<EdgeT[]>(INIT_EDGES)
  const [active, setActive] = useState<NodeT | null>(INIT_NODES[1])
  const [zoom, setZoom] = useState(1)
  const [linkFrom, setLinkFrom] = useState<string | null>(null)
  const [callWindow, setCallWindow] = useState('22:00-08:00 禁止外呼')
  const [maxCall, setMaxCall] = useState(2)
  const wrapRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null)

  const color = (k: NodeT['kind']) => k === 'start' ? '#16A34A' : k === 'cond' ? BLUE : '#D97706'
  const nodeById = (id: string) => nodes.find((n) => n.id === id)

  const onNodeDown = (e: ReactMouseEvent, n: NodeT) => {
    e.stopPropagation()
    const rect = wrapRef.current!.getBoundingClientRect()
    drag.current = { id: n.id, dx: (e.clientX - rect.left) / zoom - n.x, dy: (e.clientY - rect.top) / zoom - n.y }
    setActive(n)
  }
  const onMove = (e: ReactMouseEvent) => {
    if (!drag.current) return
    const rect = wrapRef.current!.getBoundingClientRect()
    const x = Math.max(0, (e.clientX - rect.left) / zoom - drag.current.dx)
    const y = Math.max(0, (e.clientY - rect.top) / zoom - drag.current.dy)
    const id = drag.current.id
    setNodes((ns) => ns.map((n) => n.id === id ? { ...n, x, y } : n))
  }
  const onUp = () => { drag.current = null }

  const addNode = (kind: NodeT['kind']) => {
    const id = 'n' + Date.now().toString().slice(-5)
    const label = kind === 'cond' ? '条件分支' : kind === 'exec' ? '执行节点' : '开始/结束'
    const n: NodeT = { id, kind, label, x: 160 + Math.round(Math.random() * 220), y: 70 + Math.round(Math.random() * 240), detail: kind === 'cond' ? '新判断条件' : kind === 'exec' ? '新执行动作' : '新端点' }
    setNodes((ns) => [...ns, n])
    setActive(n)
  }

  const onNodeClick = (n: NodeT) => {
    if (linkFrom) {
      if (linkFrom !== n.id && !edges.some((e) => e.from === linkFrom && e.to === n.id)) {
        setEdges((es) => [...es, { id: 'e' + Date.now().toString().slice(-5), from: linkFrom, to: n.id }])
      }
      setLinkFrom(null)
      setActive(n)
    }
  }

  const delNode = (id: string) => {
    setNodes((ns) => ns.filter((n) => n.id !== id))
    setEdges((es) => es.filter((e) => e.from !== id && e.to !== id))
    if (active?.id === id) setActive(null)
  }
  const delEdge = (id: string) => setEdges((es) => es.filter((e) => e.id !== id))

  const updateActive = (patch: Partial<NodeT>) => {
    if (!active) return
    const id = active.id
    setNodes((ns) => ns.map((n) => n.id === id ? { ...n, ...patch } : n))
    setActive((a) => (a ? { ...a, ...patch } : a))
  }

  return (
    <>
    <div className="grid grid-cols-[minmax(0,1fr)_280px] gap-4">
      <div className="min-w-0 overflow-auto" style={{ scrollbarWidth: 'none' }}>
      <ZzCard title={`画布（${st.name}）`} extra={
        <div className="flex flex-wrap items-center gap-2">
          <ZzBtn sm onClick={() => addNode('cond')}>+ 条件</ZzBtn>
          <ZzBtn sm onClick={() => addNode('exec')}>+ 执行</ZzBtn>
          <ZzBtn sm onClick={() => addNode('start')}>+ 端点</ZzBtn>
          <span className="text-gray-300">|</span>
          <ZzBtn sm onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))}>－</ZzBtn>
          <span className="w-12 text-center text-sm">{Math.round(zoom * 100)}%</span>
          <ZzBtn sm onClick={() => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)))}>＋</ZzBtn>
          <ZzBtn sm onClick={() => setZoom(1)}>重置</ZzBtn>
          <span className="text-gray-300">|</span>
          <ZzBtn sm onClick={() => alert('画布已保存')}>保存</ZzBtn>
          <ZzBtn sm primary onClick={() => alert(`「${st.name}」已发布`)}>发布</ZzBtn>
        </div>
      }>
        <div className="relative h-[520px] w-full overflow-auto rounded border bg-slate-50" style={{ minWidth: CANVAS_W }}
          onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} onClick={() => linkFrom && setLinkFrom(null)}>
          <div ref={wrapRef} className="relative" style={{ width: CANVAS_W * zoom, height: CANVAS_H * zoom, transform: `scale(${zoom})`, transformOrigin: '0 0' }}>
            <svg className="pointer-events-none absolute inset-0" width={CANVAS_W} height={CANVAS_H}>
              {edges.map((e) => {
                const a = nodeById(e.from), b = nodeById(e.to)
                if (!a || !b) return null
                const x1 = a.x + NODE_W, y1 = a.y + NODE_H / 2
                const x2 = b.x, y2 = b.y + NODE_H / 2
                const mx = (x1 + x2) / 2
                const my = (y1 + y2) / 2
                return (
                  <g key={e.id}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth={2} />
                    <circle cx={mx} cy={my} r={9} fill="#fff" stroke="#94a3b8" className="pointer-events-auto cursor-pointer" onClick={(ev) => { ev.stopPropagation(); delEdge(e.id) }} />
                    <text x={mx} y={my + 4} textAnchor="middle" fontSize={13} fill="#ef4444" className="pointer-events-auto cursor-pointer select-none" onClick={(ev) => { ev.stopPropagation(); delEdge(e.id) }}>×</text>
                  </g>
                )
              })}
            </svg>
            {nodes.map((n) => (
              <div key={n.id}
                onMouseDown={(e) => onNodeDown(e, n)}
                onClick={(e) => { e.stopPropagation(); onNodeClick(n) }}
                className="absolute cursor-move rounded-lg border bg-white px-3 py-2 text-center text-sm shadow-sm"
                style={{ left: n.x, top: n.y, width: NODE_W, borderColor: active?.id === n.id ? BLUE : (linkFrom === n.id ? '#16A34A' : '#e2e8f0') }}>
                <div className="font-medium leading-tight" style={{ color: color(n.kind) }}>{n.label}</div>
                <div className="mt-0.5 truncate text-[11px] text-gray-400" style={{ maxWidth: NODE_W - 24 }}>{n.detail}</div>
                <div title="拖拽连线到目标节点" onMouseDown={(e) => { e.stopPropagation(); setLinkFrom(n.id) }}
                  className="absolute -right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 cursor-crosshair rounded-full border-2 border-white bg-[#1677ff]" />
              </div>
            ))}
          </div>
        </div>
        {linkFrom && <div className="mt-2 rounded bg-blue-50 px-3 py-1.5 text-xs text-[#1677ff]">连线中：点击目标节点完成连接，点击空白处取消；再次点击起点可取消。</div>}
      </ZzCard>
      </div>
      <div>
        <ZzCard title="节点属性" bodyClass="p-4 max-h-[520px] overflow-y-auto">
          {active ? (
            <div className="grid grid-cols-1 gap-3">
              <ZzField label="节点名称"><ZzInput value={active.label} onChange={(e) => updateActive({ label: e.target.value })} /></ZzField>
              <ZzField label="节点类型"><ZzSelect value={active.kind} onChange={(e) => updateActive({ kind: e.target.value as NodeT['kind'] })}><option value="cond">条件分支</option><option value="exec">执行节点</option><option value="start">开始/结束</option></ZzSelect></ZzField>
              {active.kind === 'cond' && <ZzField label="判断条件"><ZzInput value={active.detail} onChange={(e) => updateActive({ detail: e.target.value })} /></ZzField>}
              {active.kind === 'exec' && <><ZzField label="话术/模板"><ZzSelect defaultValue="T-01"><option>T-01</option><option>催-M2-01</option></ZzSelect></ZzField><ZzField label="频次"><ZzInput defaultValue="2 次/日" /></ZzField></>}
              {active.kind === 'start' && <ZzField label="说明"><ZzInput value={active.detail} onChange={(e) => updateActive({ detail: e.target.value })} /></ZzField>}
              <div><ZzBtn sm danger onClick={() => delNode(active.id)}>删除节点</ZzBtn></div>
            </div>
          ) : <div className="text-sm text-gray-400">点击画布节点进行配置；拖动节点移动位置，拖右侧蓝点连线到其他节点。</div>}
        </ZzCard>
      </div>
    </div>
    <div className="mt-4">
      <ZzCard title="合规管控配置">
        <div className="grid grid-cols-1 gap-3">
          <ZzField label="拨打时间窗口"><ZzInput value={callWindow} onChange={(e) => setCallWindow(e.target.value)} /></ZzField>
          <ZzField label="单客户每日最大呼叫次数"><ZzInput type="number" value={maxCall} onChange={(e) => setMaxCall(Number(e.target.value))} /></ZzField>
          <div className="rounded bg-amber-50 p-2 text-xs text-amber-700">硬限制：22:00-08:00 禁止外呼；禁止骚扰第三方联系人。</div>
        </div>
      </ZzCard>
    </div>
    </>
  )
}

/* ---------------- 版本管理（仅当前策略的版本，支持对比/快照/回滚） ---------------- */
function VersionManager({ st, onRollback }: { st: ZzStrategy; onRollback: () => void }) {
  const versions = ZZ_STRATEGY_VERSIONS.filter((v) => v.id === st.id)
  const [compareOpen, setCompareOpen] = useState(false)
  const [va, setVa] = useState('')
  const [vb, setVb] = useState('')

  if (!versions.length) {
    return <ZzCard><div className="py-10 text-center text-gray-400">「{st.name}」暂无可回滚的版本记录。</div></ZzCard>
  }
  const vaV = versions.find((v) => v.version === va) || versions[0]
  const vbV = versions.find((v) => v.version === vb) || versions[versions.length - 1]

  return (
    <ZzCard title={`版本管理 · ${st.name}（${versions.length} 个版本）`} extra={<ZzBtn sm onClick={() => { setVa(versions[0].version); setVb(versions[versions.length - 1].version); setCompareOpen(true) }}>版本对比</ZzBtn>}>
      <ZzTable head={['版本号', '修改人', '修改时间', '版本备注', '画布概要', '操作']} rows={versions.map((v) => [
        <ZzBadge color={BLUE}>{v.version}</ZzBadge>, v.editor, v.time, v.note, v.summary,
        <div className="flex gap-1">
          <ZzBtn sm onClick={() => { setVa(v.version); setVb(versions[versions.length - 1].version); setCompareOpen(true) }}>对比</ZzBtn>
          <ZzBtn sm onClick={() => alert(`已生成 ${v.version} 快照`)}>快照</ZzBtn>
          <ZzBtn sm onClick={() => { alert(`已回滚至 ${v.version}，画布已刷新`); onRollback() }}>回滚</ZzBtn>
        </div>,
      ])} />
      {compareOpen && (
        <ZzModal open title={`版本对比 · ${st.name}`} onClose={() => setCompareOpen(false)} width={640}
          footer={<ZzBtn primary onClick={() => setCompareOpen(false)}>关闭</ZzBtn>}>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="font-medium text-gray-500">对比项</div>
            <div className="font-medium">{vaV.version}</div>
            <div className="font-medium">{vbV.version}</div>
            <div className="text-gray-500">修改人</div><div>{vaV.editor}</div><div>{vbV.editor}</div>
            <div className="text-gray-500">修改时间</div><div>{vaV.time}</div><div>{vbV.time}</div>
            <div className="text-gray-500">版本备注</div><div>{vaV.note}</div><div>{vbV.note}</div>
            <div className="text-gray-500">画布概要</div><div>{vaV.summary}</div><div>{vbV.summary}</div>
          </div>
          <div className="mt-3 flex gap-2">
            <ZzSelect value={va} onChange={(e) => setVa(e.target.value)} className="flex-1"><option value="">选择版本A</option>{versions.map((v) => <option key={v.version} value={v.version}>{v.version} · {v.time}</option>)}</ZzSelect>
            <ZzSelect value={vb} onChange={(e) => setVb(e.target.value)} className="flex-1"><option value="">选择版本B</option>{versions.map((v) => <option key={v.version} value={v.version}>{v.version} · {v.time}</option>)}</ZzSelect>
          </div>
        </ZzModal>
      )}
    </ZzCard>
  )
}
