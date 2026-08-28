// 催贷管理 · 模块7 AI协催机器人
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ZzPage, ZzCard, ZzBtn, ZzModal, ZzDrawer, ZzTable, ZzFilterBar, ZzField, ZzInput, ZzSelect, ZzTextarea, ZzBadge, ZzStat, BLUE } from './zzUi'
import { ZZ_AI_TASKS, ZZ_AI_TEMPLATES, ZZ_AI_BOARD } from './zzData'

const GREEN = '#16A34A'; const RED = '#DC2626'; const AMBER = '#D97706'; const GRAY = '#9CA3AF'
function tColor(s: string) { return s === '运行中' ? GREEN : s === '已暂停' ? GRAY : AMBER }

export function ZzAiModule({ pageKey }: { pageKey: string }) {
  if (pageKey === 'zz:ai-template') return <ZzAiTemplate />
  return <ZzAiTask />
}

/* ============================ 外呼任务总览（核心主页面） ============================ */
function ZzAiTask() {
  const nav = useNavigate()
  const [tasks, setTasks] = useState<any[]>(ZZ_AI_TASKS)
  const [newManual, setNewManual] = useState(false)
  const [newAuto, setNewAuto] = useState(false)
  const [fName, setFName] = useState('')
  const [fType, setFType] = useState('')
  const [fTpl, setFTpl] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [expanded, setExpanded] = useState(true)
  const [drawerTask, setDrawerTask] = useState<any | null>(null)
  const [drawerMetric, setDrawerMetric] = useState<string | null>(null)
  const b = ZZ_AI_BOARD

  const metricDefs = [
    { label: '呼叫总量', value: b.total, accent: BLUE },
    { label: '接通量', value: b.connected, accent: GREEN },
    { label: '有效对话占比', value: (b.effective * 100).toFixed(0) + '%' },
    { label: '转人工', value: b.toHuman, accent: AMBER },
    { label: '异常任务', value: b.abnormal, accent: RED },
  ]
  const buildMetricRows = (label: string) => {
    switch (label) {
      case '呼叫总量': return { head: ['任务ID', '任务名称', '呼叫量'], rows: tasks.map((t) => [t.id, t.name, t.kpi.called]) }
      case '接通量': return { head: ['任务ID', '任务名称', '接通量'], rows: tasks.map((t) => [t.id, t.name, t.kpi.connected]) }
      case '有效对话占比': return { head: ['任务ID', '任务名称', '有效对话数'], rows: tasks.map((t) => [t.id, t.name, Math.round(t.kpi.connected * 0.6)]) }
      case '转人工': return { head: ['任务ID', '任务名称', '转人工户数'], rows: tasks.map((t) => [t.id, t.name, t.kpi.toHuman]) }
      case '异常任务': return { head: ['任务ID', '异常说明'], rows: [['AI-01', '批次 B20260823 接通率波动超阈值'], ['AI-02', '暂停期间产生 0 次呼叫']] }
      default: return { head: ['说明'], rows: [['暂无明细']] }
    }
  }

  const statusColor: any = { 运行中: GREEN, 已暂停: AMBER, 已终止: RED, 待执行: BLUE }
  const quick = ['', '自动周期', '手动临时', '运行中', '已暂停']
  const quickActive = fType || fStatus

  const filtered = useMemo(() => tasks.filter((t) =>
    (!fName || t.name.toLowerCase().includes(fName.toLowerCase()) || t.id.toLowerCase().includes(fName.toLowerCase())) &&
    (!fType || t.type === fType) &&
    (!fTpl || t.template === fTpl) &&
    (!fStatus || t.status === fStatus)
  ), [tasks, fName, fType, fTpl, fStatus])

  const reset = () => { setFName(''); setFType(''); setFTpl(''); setFStatus('') }
  const goDetail = (t: any) => nav('/console/zz/ai-task-detail?taskId=' + t.id)

  return (
    <ZzPage title="外呼任务总览" crumb="催贷管理 / AI协催" subtitle="手动临时任务 + 自动周期任务（系统按策略自动外呼，无需每次手动新建）"
      actions={<><ZzBtn onClick={() => setNewManual(true)}>新建临时任务</ZzBtn><ZzBtn primary onClick={() => setNewAuto(true)}>新建自动周期任务</ZzBtn></>}>
      <div className="mb-4 flex flex-wrap gap-3">
        {metricDefs.map((m) => (
          <div key={m.label} onClick={() => setDrawerMetric(m.label)} className="cursor-pointer rounded-xl transition hover:ring-2 hover:ring-[#1677ff]/40"
            title="点击查看该指标构成明细">
            <ZzStat label={m.label} value={m.value} accent={m.accent} />
          </div>
        ))}
      </div>

      <ZzFilterBar>
        <ZzField label="任务名称/ID"><ZzInput placeholder="搜索任务名称或ID" value={fName} onChange={(e) => setFName(e.target.value)} /></ZzField>
        <ZzField label="任务类型"><ZzSelect value={fType} onChange={(e) => setFType(e.target.value)}><option value="">全部</option><option>自动周期</option><option>手动临时</option></ZzSelect></ZzField>
        <ZzField label="对话模板"><ZzSelect value={fTpl} onChange={(e) => setFTpl(e.target.value)}><option value="">全部</option>{ZZ_AI_TEMPLATES.map((t) => <option key={t.id}>{t.name}</option>)}</ZzSelect></ZzField>
        <ZzField label="状态"><ZzSelect value={fStatus} onChange={(e) => setFStatus(e.target.value)}><option value="">全部</option><option>运行中</option><option>已暂停</option><option>已终止</option><option>待执行</option></ZzSelect></ZzField>
        <ZzBtn onClick={() => setExpanded((v) => !v)}>{expanded ? '收起' : '展开'}</ZzBtn>
        <ZzBtn kind="text" onClick={reset}>重置</ZzBtn>
      </ZzFilterBar>

      {expanded && (
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-gray-400">快捷筛选：</span>
          {quick.map((q) => (
            <button key={q} onClick={() => { setFType(q === '自动周期' || q === '手动临时' ? q : ''); setFStatus(q === '运行中' || q === '已暂停' ? q : '') }}
              className={`rounded-full border px-3 py-1 text-xs ${quickActive === q ? 'border-[#1677ff] bg-[#1677ff] text-white' : 'border-slate-300 text-gray-600'}`}>
              {q || '全部'}
            </button>
          ))}
        </div>
      )}

      <ZzCard title={`任务列表（${filtered.length}）`}>
        <ZzTable stickyAction head={['任务ID', '任务名称', '类型', '对话模板', '状态', '执行周期/时间', '总待呼', '已呼叫', '接通', '接通率', '操作']} rows={filtered.map((t) => [
          t.id, <span className="font-medium">{t.name}</span>, <ZzBadge color={t.type === '自动周期' ? BLUE : AMBER}>{t.type}</ZzBadge>, t.template, <ZzBadge color={statusColor[t.status] ?? GRAY}>{t.status}</ZzBadge>,
          t.schedule, t.kpi.pending, t.kpi.called, t.kpi.connected, (t.kpi.connectRate * 100).toFixed(2) + '%',
          <div className="flex flex-nowrap gap-1">
            <ZzBtn sm primary onClick={() => setDrawerTask(t)}>详情</ZzBtn>
            {t.status === '运行中'
              ? <ZzBtn sm danger onClick={() => setTasks((ts) => ts.map((x) => x.id === t.id ? { ...x, status: '已暂停' } : x))}>暂停</ZzBtn>
              : <ZzBtn sm onClick={() => setTasks((ts) => ts.map((x) => x.id === t.id ? { ...x, status: '运行中' } : x))}>启动</ZzBtn>}
            {t.type === '手动临时' && <ZzBtn sm onClick={() => alert('已复制任务配置，请修改后新建')}>复制</ZzBtn>}
          </div>,
        ])} />
      </ZzCard>

      {newManual && <NewManualModal onClose={() => setNewManual(false)} onOk={(name) => { setTasks((ts) => [...ts, { id: 'AI-' + (ts.length + 1), name, type: '手动临时', template: '标准开场白', status: '运行中', schedule: '立即执行一次', nextRun: '-', filter: '导入客户池', strategy: '每客户最大呼叫 3 次', kpi: { pending: 100, called: 0, connected: 0, connectRate: 0, noAnswer: 0, busy: 0, promise: 0, toHuman: 0 }, fail: { 关机: 0, 空号: 0, 拒接: 0, 号码错误: 0 }, calls: [] }]); setNewManual(false) }} />}
      {newAuto && <NewAutoModal onClose={() => setNewAuto(false)} onOk={(name) => { setTasks((ts) => [...ts, { id: 'AI-' + (ts.length + 1), name, type: '自动周期', template: '标准开场白', status: '运行中', schedule: '每日自动执行', nextRun: '2026-08-26 09:00', filter: '逾期 M1-M3；排除已人工/外访/法务/禁止AI', strategy: '每客户最大呼叫 2 次；夜间禁止', kpi: { pending: 800, called: 0, connected: 0, connectRate: 0, noAnswer: 0, busy: 0, promise: 0, toHuman: 0 }, fail: { 关机: 0, 空号: 0, 拒接: 0, 号码错误: 0 }, calls: [] }]); setNewAuto(false) }} />

      {/* req1: 任务点击 → 右侧抽屉概览（替代原跳转/弹窗） */}
      {drawerTask && (
        <ZzDrawer open title={`任务概览 · ${drawerTask.name}`} onClose={() => setDrawerTask(null)}
          footer={<><ZzBtn onClick={() => setDrawerTask(null)}>关闭</ZzBtn><ZzBtn primary onClick={() => { const id = drawerTask.id; setDrawerTask(null); goDetail({ id }) }}>打开完整详情</ZzBtn></>}>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded border px-3 py-2"><div className="text-xs text-gray-400">任务ID</div><div className="font-medium">{drawerTask.id}</div></div>
              <div className="rounded border px-3 py-2"><div className="text-xs text-gray-400">类型</div><div className="font-medium">{drawerTask.type}</div></div>
              <div className="rounded border px-3 py-2"><div className="text-xs text-gray-400">状态</div><div className="font-medium">{drawerTask.status}</div></div>
              <div className="rounded border px-3 py-2"><div className="text-xs text-gray-400">绑定模板</div><div className="font-medium">{drawerTask.template}</div></div>
            </div>
            <div className="rounded border px-3 py-2"><div className="text-xs text-gray-400">执行周期/时间</div><div className="font-medium">{drawerTask.schedule}</div></div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded border px-3 py-2 text-center"><div className="text-xs text-gray-400">总待呼</div><div className="font-medium">{drawerTask.kpi.pending}</div></div>
              <div className="rounded border px-3 py-2 text-center"><div className="text-xs text-gray-400">已呼叫</div><div className="font-medium">{drawerTask.kpi.called}</div></div>
              <div className="rounded border px-3 py-2 text-center"><div className="text-xs text-gray-400">接通</div><div className="font-medium">{drawerTask.kpi.connected}</div></div>
            </div>
          </div>
        </ZzDrawer>
      )}

      {/* req2: 指标看板卡片点击 → 右侧抽屉展示指标构成明细 */}
      {drawerMetric && (
        <ZzDrawer open title={`${drawerMetric} · 指标构成明细`} onClose={() => setDrawerMetric(null)}
          footer={<ZzBtn primary onClick={() => setDrawerMetric(null)}>关闭</ZzBtn>}>
          {(() => { const r = buildMetricRows(drawerMetric); return <ZzTable head={r.head} rows={r.rows} /> })()}
        </ZzDrawer>
      )}
    </ZzPage>
  )
}

/* 新建临时任务 */
function NewManualModal({ onClose, onOk }: { onClose: () => void; onOk: (name: string) => void }) {
  const [name, setName] = useState('M3协催临时批次')
  return (
    <ZzModal open title="新建临时任务（一次性专项外呼）" onClose={onClose} width={640}
      footer={<><ZzBtn onClick={onClose}>取消</ZzBtn><ZzBtn primary onClick={() => onOk(name)}>提交执行</ZzBtn></>}>
      <div className="space-y-3">
        <ZzField label="任务名称"><ZzInput value={name} onChange={(e) => setName(e.target.value)} /></ZzField>
        <ZzField label="客户案件池"><ZzTextarea rows={2} placeholder="条件筛选（逾期阶段/天数）或导入名单" /></ZzField>
        <ZzField label="绑定对话模板"><ZzSelect defaultValue={ZZ_AI_TEMPLATES[1].name}>{ZZ_AI_TEMPLATES.map((t) => <option key={t.id}>{t.name}</option>)}</ZzSelect></ZzField>
        <div className="grid grid-cols-2 gap-3">
          <ZzField label="外呼时间窗口"><ZzInput placeholder="09:00-12:00" /></ZzField>
          <ZzField label="最大呼叫次数"><ZzInput type="number" defaultValue={3} /></ZzField>
        </div>
        <ZzField label="重呼策略"><ZzSelect defaultValue="失败4h后重呼"><option>失败4h后重呼</option><option>失败6h后重呼</option><option>不重呼</option></ZzSelect></ZzField>
      </div>
    </ZzModal>
  )
}

/* 新建自动周期任务（真正全自动） */
function NewAutoModal({ onClose, onOk }: { onClose: () => void; onOk: (name: string) => void }) {
  const [name, setName] = useState('M1每日自动提醒')
  return (
    <ZzModal open title="新建自动周期任务（系统全自动外呼）" onClose={onClose} width={640}
      footer={<><ZzBtn onClick={onClose}>取消</ZzBtn><ZzBtn primary onClick={() => onOk(name)}>启用自动任务</ZzBtn></>}>
      <div className="mb-3 rounded bg-blue-50 p-2 text-xs text-blue-700">💡 自动周期任务：系统按配置的筛选条件与调度时间，自动扫描逾期案件池生成 AI 外呼，无需每次手动新建；临时任务用于一次性专项批次。</div>
      <div className="space-y-3">
        <ZzField label="任务名称"><ZzInput value={name} onChange={(e) => setName(e.target.value)} /></ZzField>
        <ZzField label="案件筛选条件（核心）">
          <div className="flex flex-wrap gap-2">
            <ZzSelect defaultValue="M1-M3"><option>M1</option><option>M1-M3</option><option>全部逾期</option></ZzSelect>
            <ZzSelect defaultValue="逾期1-90天"><option>逾期1-30天</option><option>逾期1-90天</option><option>全部</option></ZzSelect>
          </div>
          <ZzTextarea rows={2} className="mt-2" defaultValue="排除已人工跟进/已承诺还款/禁止AI协催/已转外访或法务" />
        </ZzField>
        <ZzField label="绑定对话模板"><ZzSelect defaultValue={ZZ_AI_TEMPLATES[0].name}>{ZZ_AI_TEMPLATES.map((t) => <option key={t.id}>{t.name}</option>)}</ZzSelect></ZzField>
        <div className="grid grid-cols-2 gap-3">
          <ZzField label="执行频率"><ZzSelect defaultValue="每日"><option>每日</option><option>每周</option></ZzSelect></ZzField>
          <ZzField label="每日呼叫时段"><ZzInput defaultValue="09:00-12:00, 14:00-18:00" /></ZzField>
        </div>
        <ZzField label="外呼控制策略"><ZzTextarea rows={2} defaultValue="每客户最大呼叫 2 次；失败重呼间隔 4h；接通后不再重呼；夜间禁止外呼" /></ZzField>
        <ZzField label="开关"><ZzSelect defaultValue="启用"><option>启用</option><option>停用</option></ZzSelect></ZzField>
      </div>
    </ZzModal>
  )
}

/* ============================ 对话模板管理 ============================ */
function ZzAiTemplate() {
  const [rows, setRows] = useState<any[]>(ZZ_AI_TEMPLATES)
  const [preview, setPreview] = useState<any | null>(null)
  const [edit, setEdit] = useState<any | null>(null)
  const [sim, setSim] = useState<any | null>(null)
  return (
    <ZzPage title="对话模板管理" crumb="催贷管理 / AI协催" subtitle="多轮对话话术模板、分支流程与模拟测试">
      <ZzCard title="话术模板" extra={<ZzBtn sm primary onClick={() => setEdit({ id: 'T-' + (rows.length + 1), name: '新模板', scenario: '', enabled: true, nodeCount: 1, nodes: [{ id: 'n1', role: 'AI', text: '您好', branch: [] }] })}>新增模板</ZzBtn>}>
        <ZzTable head={['模板名称', '适用场景', '节点数', '分支数', '启用', '操作']} rows={rows.map((t) => [
          t.name, t.scenario, t.nodeCount, t.nodes.reduce((a: number, n: any) => a + (n.branch?.length ?? 0), 0), <ZzBadge color={t.enabled ? GREEN : GRAY}>{t.enabled ? '启用' : '停用'}</ZzBadge>,
          <div className="flex flex-wrap gap-1">
            <ZzBtn sm onClick={() => setEdit(t)}>编辑</ZzBtn>
            <ZzBtn sm primary onClick={() => setPreview(t)}>预览</ZzBtn>
            <ZzBtn sm onClick={() => setSim(t)}>模拟测试</ZzBtn>
          </div>,
        ])} />
      </ZzCard>
      {preview && <FlowPreview t={preview} onClose={() => setPreview(null)} />}
      {edit && <TemplateEditor t={edit} onClose={() => setEdit(null)} onSave={(nt) => { setRows((rs) => { const i = rs.findIndex((x) => x.id === nt.id); return i >= 0 ? rs.map((x) => x.id === nt.id ? nt : x) : [...rs, nt] })(); setEdit(null) }} />}
      {sim && <Simulator t={sim} onClose={() => setSim(null)} />}
    </ZzPage>
  )
}

/* 对话流程图预览 */
function FlowPreview({ t, onClose }: { t: any; onClose: () => void }) {
  return (
    <ZzModal open title={`对话流程预览 · ${t.name}`} onClose={onClose} width={640}
      footer={<ZzBtn primary onClick={onClose}>关闭</ZzBtn>}>
      <div className="space-y-2">
        {t.nodes.map((n: any, i: number) => (
          <div key={n.id} className="rounded border p-3">
            <div className="text-sm font-medium text-blue-700">{n.id}｜{n.role}：{n.text}</div>
            {(n.branch?.length ?? 0) > 0 && <div className="mt-2 space-y-1 pl-3 text-sm text-gray-600">
              {n.branch.map((b: any, j: number) => (
                <div key={j}>├ 客户「{b.answer}」 → 跳转 {b.next}{b.action ? `（动作：${b.action}）` : ''}</div>
              ))}
            </div>}
          </div>
        ))}
        <div className="rounded bg-gray-50 p-3 text-xs text-gray-500">示例路径：开场 → 客户说没钱 → 共情分期 → 同意分期 → 记录还款承诺结束；拒绝 → 转人工；辱骂 → 终止标记拒绝。</div>
      </div>
    </ZzModal>
  )
}

/* 模板编辑器 */
function TemplateEditor({ t, onClose, onSave }: { t: any; onClose: () => void; onSave: (t: any) => void }) {
  const [draft, setDraft] = useState<any>(JSON.parse(JSON.stringify(t)))
  const setNode = (id: string, patch: any) => setDraft((d: any) => ({ ...d, nodes: d.nodes.map((n: any) => n.id === id ? { ...n, ...patch } : n) }))
  return (
    <ZzDrawer open title={`模板编辑 · ${t.name}`} onClose={onClose} width={720}
      footer={<><ZzBtn onClick={onClose}>取消</ZzBtn><ZzBtn primary onClick={() => onSave({ ...draft, nodeCount: draft.nodes.length })}>保存</ZzBtn></>}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <ZzField label="模板名称"><ZzInput value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></ZzField>
          <ZzField label="适用逾期阶段"><ZzInput value={draft.scenario} onChange={(e) => setDraft({ ...draft, scenario: e.target.value })} placeholder="如 M1/M2 催收提醒" /></ZzField>
        </div>
        <div className="space-y-2">
          {draft.nodes.map((n: any, i: number) => (
            <div key={n.id} className="rounded border p-3">
              <div className="mb-1 text-xs text-gray-400">节点 {n.id}（{n.role}）</div>
              <ZzTextarea rows={3} className="w-full resize-y leading-relaxed" value={n.text} onChange={(e) => setNode(n.id, { text: e.target.value })} />
              <div className="mt-2 space-y-1">
                {(n.branch ?? []).map((b: any, j: number) => (
                  <div key={j} className="flex flex-wrap gap-2 text-sm"><span className="text-gray-400">客户应答：</span><span className="font-medium">{b.answer}</span><span className="text-gray-400">→ 跳转 {b.next}</span>{b.action && <span className="text-amber-600">动作：{b.action}</span>}</div>
                ))}
                {(n.branch ?? []).length === 0 && <div className="text-xs text-gray-400">（无分支，结束节点）</div>}
              </div>
            </div>
          ))}
        </div>
        <ZzBtn sm onClick={() => setDraft((d: any) => ({ ...d, nodes: [...d.nodes, { id: 'n' + (d.nodes.length + 1), role: 'AI', text: '', branch: [] }] }))}>新增节点</ZzBtn>
      </div>
    </ZzDrawer>
  )
}

/* 模拟测试：选择/输入客户应答，按分支逻辑走到对应节点并展示模拟对话 */
function Simulator({ t, onClose }: { t: any; onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [cur, setCur] = useState<any>(t.nodes[0])
  const [log, setLog] = useState<{ who: 'AI' | '客户' | '动作'; text: string }[]>(() => [{ who: 'AI', text: t.nodes[0].text }])
  const [input, setInput] = useState('')

  const ended = (cur.branch?.length ?? 0) === 0
  const nodeById = (id: string) => t.nodes.find((n: any) => n.id === id)

  const matchBranch = (text: string): any => {
    const q = text.trim()
    if (!q) return null
    // 先精确/包含匹配，再模糊（任一方包含关键词）
    return (cur.branch ?? []).find((b: any) => b.answer === q)
      || (cur.branch ?? []).find((b: any) => q.includes(b.answer) || b.answer.includes(q))
      || null
  }

  const choose = (b: any) => {
    const next = nodeById(b.next)
    const entries: { who: 'AI' | '客户' | '动作'; text: string }[] = [{ who: '客户', text: b.answer }]
    if (b.action) entries.push({ who: '动作', text: b.action })
    if (next) {
      entries.push({ who: 'AI', text: next.text })
      setCur(next)
      setStep((s) => s + 1)
    } else {
      entries.push({ who: '动作', text: '（未找到跳转节点 «' + b.next + '»，流程异常终止）' })
    }
    setLog((l) => [...l, ...entries])
  }

  const send = () => {
    const b = matchBranch(input)
    if (!b) {
      setLog((l) => [...l, { who: '客户', text: input.trim() }, { who: '动作', text: '未匹配到任何分支，对话中断（可尝试下方预设应答）' }])
      setInput('')
      return
    }
    setInput('')
    choose(b)
  }

  const reset = () => {
    setStep(0)
    setCur(t.nodes[0])
    setLog([{ who: 'AI', text: t.nodes[0].text }])
    setInput('')
  }

  return (
    <ZzModal open title={`模拟测试 · ${t.name}`} onClose={onClose} width={640}
      footer={<><ZzBtn onClick={reset}>重新开始</ZzBtn><ZzBtn primary onClick={onClose}>关闭</ZzBtn></>}>
      <p className="mb-3 text-xs text-gray-500">选择或输入模拟客户应答，按模板分支逻辑走到对应节点，实时展示模拟对话（当前节点 #{step + 1}）。</p>
      <div className="space-y-2 rounded border bg-slate-50 p-3">
        {log.map((m, i) => (
          <div key={i} className="flex">
            {m.who === 'AI' && <div className="max-w-[85%] rounded-lg bg-[#1677ff] px-3 py-1.5 text-sm text-white">🤖 {m.text}</div>}
            {m.who === '客户' && <div className="ml-auto max-w-[85%] rounded-lg bg-white px-3 py-1.5 text-sm text-gray-800 shadow-sm ring-1 ring-slate-200">🙋 {m.text}</div>}
            {m.who === '动作' && <div className="w-full text-center text-xs text-amber-600">⚡ {m.text}</div>}
          </div>
        ))}
      </div>

      {ended ? (
        <div className="mt-3 rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-700">✅ 流程已到达结束节点（{cur.id}）。</div>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="text-xs font-medium text-gray-500">模拟客户应答（点击预设或自行输入）：</div>
          <div className="flex flex-wrap gap-2">
            {cur.branch.map((b: any, j: number) => (
              <button key={j} onClick={() => choose(b)} className="rounded-full border border-[#1677ff] bg-[#1677ff] px-3 py-1 text-xs text-white transition hover:bg-[#0f5fd1]">{b.answer}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <ZzInput value={input} onChange={(e) => setInput(e.target.value)} placeholder="自定义客户应答（命中分支关键词即可）" onKeyDown={(e: any) => { if (e.key === 'Enter') send() }} />
            <ZzBtn primary onClick={send}>发送</ZzBtn>
          </div>
        </div>
      )}
    </ZzModal>
  )
}
