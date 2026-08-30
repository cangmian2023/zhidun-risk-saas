// 催贷管理 · 模块2 智能策略引擎
import { useState, useRef, useEffect, type MouseEvent as ReactMouseEvent, type WheelEvent as ReactWheelEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ZzPage, ZzCard, ZzBtn, ZzModal, ZzTable, ZzField, ZzInput, ZzSelect, ZzBadge, ZzTabs, ZzDrawer, BLUE } from './zzUi'
import {
  ZZ_STRATEGIES, ZZ_STRATEGY_VERSIONS, ZZ_STRATEGY_EXEC, ZZ_STRATEGY_EXCEPTIONS,
  ZZ_STRATEGY_GROUPS, ZZ_AI_TEMPLATES,
  type ZzStrategy, type ZzExecRow,
} from './zzData'
import strategyFlows from './strategyFlows.json'
import { useZzList, updateZzList, ZZ_FILE, DEFAULT_POLICY } from './zzStore'

export function ZzStrategyModule({ pageKey }: { pageKey: string }) {
  if (pageKey.startsWith('zz:strategy-canvas')) return <ZzStrategyCanvasPage />
  if (pageKey === 'zz:strategy-monitor') return <ZzStrategyMonitorPage />
  return <ZzStrategyHome />
}

/* ===================== 首页：策略列表 ===================== */
function ZzStrategyHome() {
  return (
    <ZzPage title="智能策略" crumb="催贷管理 / 智能策略" subtitle="催收策略总入口：策略列表编排与版本管理（执行监控见独立页面）">
      <ZzStrategyList />
    </ZzPage>
  )
}

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
    setRows((r) => [{ id, name: form.name.trim(), stageRange: form.stageRange, version: form.version, group: 'AI外呼', flow: [], enabled: true, created: new Date().toISOString().slice(0, 10) }, ...r])
    setCreating(false)
    setForm({ name: '', stageRange: 'M1', version: 'v1.0' })
  }

  return (
    <ZzCard title="策略列表" extra={<div className="flex gap-2"><ZzBtn sm primary onClick={() => setCreating(true)}>新建策略</ZzBtn><ZzBtn sm>导出配置</ZzBtn></div>}>
      <ZzTable stickyAction head={['策略名称', '适用账龄', '版本', '状态', '创建时间', '操作']} rows={rows.map((s) => [
        <button className="text-left font-medium text-[#1677ff] hover:underline" onClick={() => openCanvas(s)}>{s.name}</button>,
        s.stageRange, s.version,
        s.enabled ? <ZzBadge color="#16A34A">已启用</ZzBadge> : <ZzBadge color="#9CA3AF">已停用</ZzBadge>,
        s.created,
        <div className="flex flex-nowrap gap-1">
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

/* ---------------- 执行监控 ---------------- */
function ZzStrategyMonitorPage() {
  return (
    <ZzPage title="执行监控" crumb="催贷管理 / 智能策略" subtitle="策略全局执行监控：分流统计、图谱因子与异常日志">
      <ZzStrategyMonitor />
    </ZzPage>
  )
}
function ZzStrategyMonitor() {
  const nav = useNavigate()
  const [sid, setSid] = useState('')
  const [group, setGroup] = useState('')
  const [detail, setDetail] = useState<ZzExecRow | null>(null)
  const [caseDetail, setCaseDetail] = useState<any | null>(null)
  // 执行监控读共享数据层：画布发布产生的执行批次（ZZ_FILE.exec）实时上列，策略→监控闭环打通
  const published = useZzList<any>(ZZ_FILE.exec, [])
  const [pubDetail, setPubDetail] = useState<any | null>(null)
  const executions = ZZ_STRATEGY_EXEC.filter((e) => !sid || e.sid === sid).filter((e) => !group || e.group === group)
  const exceptions = ZZ_STRATEGY_EXCEPTIONS.filter((e) => !sid || e.sid === sid)

  const inflowTotal = executions.reduce((a, e) => a + e.inflow, 0)
  const successTotal = inflowTotal
  const interceptTotal = exceptions.filter((e) => e.type === '规则跳过').reduce((a, e) => a + e.affected, 0)
  const errTotal = exceptions.reduce((a, e) => a + e.affected, 0)
  const ptpTotal = executions.reduce((a, e) => a + e.ptp, 0)
  const repayTotal = executions.reduce((a, e) => a + e.repay, 0)

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-gray-500">策略版本</span>
        <ZzSelect value={sid} onChange={(e) => setSid(e.target.value)} className="w-56">
          <option value="">全部版本</option>
          {ZZ_STRATEGIES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </ZzSelect>
        <span className="text-sm text-gray-500">执行时间范围</span>
        <ZzSelect value="" onChange={() => { }} className="w-44">
          <option value="">近 7 天</option>
          <option value="30">近 30 天</option>
          <option value="90">近 90 天</option>
        </ZzSelect>
        {sid && <ZzBadge color={BLUE}>{ZZ_STRATEGIES.find((s) => s.id === sid)?.name}</ZzBadge>}
      </div>

      <div className="mb-4 grid grid-cols-6 gap-3">
        <ZzCard><div className="text-sm text-gray-500">流入案件总数量</div><div className="mt-1 text-2xl font-semibold" style={{ color: BLUE }}>{inflowTotal}</div></ZzCard>
        <ZzCard><div className="text-sm text-gray-500">成功执行案件数</div><div className="mt-1 text-2xl font-semibold text-green-600">{successTotal}</div></ZzCard>
        <ZzCard><div className="text-sm text-gray-500">被拦截跳过案件数</div><div className="mt-1 text-2xl font-semibold text-[#D97706]">{interceptTotal}</div></ZzCard>
        <ZzCard><div className="text-sm text-gray-500">执行异常案件数</div><div className="mt-1 text-2xl font-semibold text-red-600">{errTotal}</div></ZzCard>
        <ZzCard><div className="text-sm text-gray-500">策略产出 PTP 数量</div><div className="mt-1 text-2xl font-semibold" style={{ color: BLUE }}>{ptpTotal}</div></ZzCard>
        <ZzCard><div className="text-sm text-gray-500">策略关联回款金额</div><div className="mt-1 text-2xl font-semibold text-green-600">¥{repayTotal.toLocaleString()}</div></ZzCard>
      </div>

      <ZzCard title={`策略执行批次（已发布 · ${published.length} 个）`} extra={<span className="text-xs text-gray-400">画布「发布」后实时生成，点击查看批次快照</span>}>
        {published.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">暂无已发布批次。进入策略画布编辑并点击「发布」，即可在此查看执行批次与命中情况。</div>
        ) : (
          <ZzTable head={['批次号', '策略名称', '发布时间', '流入案件数', '画布规模', '状态', '操作']} rows={published.map((p) => [
            <ZzBadge key={p.id} color={BLUE}>{p.batch}</ZzBadge>, p.name, p.time, p.inflow, `${p.nodes} 节点 / ${p.edges} 连线`,
            <span key={p.id + 's'} className="text-green-600">● {p.status}</span>,
            <ZzBtn key={p.id + 'b'} sm onClick={() => setPubDetail(p)}>查看快照</ZzBtn>,
          ])} />
        )}
      </ZzCard>

      <ZzCard title="策略分流执行效果">
        <div className="mb-3 flex flex-wrap gap-2">
          <span
            className="cursor-pointer rounded px-3 py-1 text-xs"
            style={{ background: !group ? '#eef4ff' : '#f5f5f5', color: !group ? BLUE : '#666', fontWeight: !group ? 600 : 400 }}
            onClick={() => setGroup('')}
          >全部分组</span>
          {ZZ_STRATEGY_GROUPS.map((g) => (
            <span
              key={g}
              className="cursor-pointer rounded px-3 py-1 text-xs"
              style={{ background: group === g ? '#eef4ff' : '#f5f5f5', color: group === g ? BLUE : '#666', fontWeight: group === g ? 600 : 400 }}
              onClick={() => setGroup(group === g ? '' : g)}
            >{g}</span>
          ))}
        </div>
        <ZzTable head={['策略分支名称', '流入案件数', '分配去向', 'PTP达成数', '回款金额', '失联占比']} rows={executions.map((e) => [
          e.branch, e.inflow, e.allocate.join(' / '), e.ptp, '¥' + e.repay.toLocaleString(), e.lostRate + '%',
        ])} onRow={(i) => setDetail(executions[i])} />
        <div className="mt-2 text-xs text-gray-400">提示：点击任意行可在右侧抽屉查看该分支受影响案件明细快照。</div>
      </ZzCard>

      <ZzCard title="策略执行异常日志">
        <ZzTable head={['发生时间', '策略名称', '异常类型', '受影响案件数量', '异常描述', '操作']} rows={exceptions.map((e) => [
          e.time, e.strategy, <span key={e.time} className="text-[#D97706]">{e.type}</span>, e.affected, e.msg,
          <button key={e.time + 'btn'} className="text-[#1677ff] underline" onClick={() => setCaseDetail(e)}>案件明细</button>,
        ])} />
      </ZzCard>

      <ZzDrawer open={!!detail} onClose={() => setDetail(null)} title="受影响案件明细快照">
        {detail && (
          <div>
            <div className="mb-3 text-sm"><b>{detail.branch}</b> · 流入 {detail.inflow} 件</div>
            <ZzTable head={['案件号', '客户', '当前状态', '分配去向', 'PTP', '失联']} rows={[
              ['CO-202608-1001', '客户A', '执行中', detail.allocate[0], '—', detail.lostRate > 20 ? '是' : '否'],
              ['CO-202608-1002', '客户B', '已回款', detail.allocate[0], '达成', '否'],
              ['CO-202608-1003', '客户C', '待跟进', detail.allocate[1] || detail.allocate[0], '—', '是'],
            ]} />
            <div className="mt-3 text-xs text-gray-400">以上为样例快照数据，仅用于演示明细穿透能力。</div>
          </div>
        )}
      </ZzDrawer>

      <ZzDrawer open={!!caseDetail} onClose={() => setCaseDetail(null)} title="受影响案件明细">
        {caseDetail && (
          <div>
            <div className="mb-3 text-sm"><b>{caseDetail.strategy}</b> · 异常类型 <span className="text-[#D97706]">{caseDetail.type}</span> · 受影响案件 <b>{caseDetail.affected}</b> 件</div>
            <ZzTable head={['案件编号', '客户', '当前状态', '分配去向', '最近PTP', '是否失联']} rows={Array.from({ length: caseDetail.affected }).map((_, i) => {
              const cid = `CO-${caseDetail.sid}-${String(i + 1).padStart(3, '0')}`
              return [
                <span key={cid} className="font-mono text-xs text-[#1677ff] underline cursor-pointer" onClick={() => nav('/console/zz/case-detail?id=' + cid)}>{cid}</span>,
                ['客户A', '客户B', '客户C', '客户D'][i % 4] || '客户X',
                '待跟进',
                '人工催收',
                '—',
                '否',
              ]
            })} />
            <div className="mt-3 text-xs text-gray-400">点击案件编号可穿透至案件详情页查看处置闭环。</div>
          </div>
        )}
      </ZzDrawer>

      <ZzDrawer open={!!pubDetail} onClose={() => setPubDetail(null)} title="已发布批次快照">
        {pubDetail && (
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
              <ZzBadge color={BLUE}>{pubDetail.batch}</ZzBadge>
              <b>{pubDetail.name}</b>
              <span className="text-green-600">● {pubDetail.status}</span>
            </div>
            <ZzTable head={['发布时间', '流入案件数', '画布节点', '连线数']} rows={[[
              pubDetail.time, pubDetail.inflow, pubDetail.nodes, pubDetail.edges,
            ]]} />
            <div className="mt-3 rounded bg-slate-50 p-3 text-xs text-gray-500">
              该批次由画布「发布」动作生成，流入案件数实时取自当前在催案件池。执行监控的总览与分流效果表为演示样例数据，发布动作负责把策略真正"落地成批次"，二者共同构成"配置→发布→监控"的闭环。
            </div>
          </div>
        )}
      </ZzDrawer>
    </div>
  )
}

/* ============================================================================
 * 结构化规则引擎数据模型
 * 条件节点：rules[] — 每条规则 = 字段 + 运算符 + 值 + 与前一条的逻辑关系
 * 执行节点：action — 动作类型 + 结构化参数（全部受控，可序列化可执行）
 * ========================================================================== */

/* ---------- 条件规则 ---------- */
interface RuleItem {
  id: string
  field: string       // 字段key，来自 RULE_FIELDS
  operator: string    // 运算符key，来自 RULE_OPERATORS
  value: string       // 字段值（数字或枚举值的字符串形式）
  logic: 'AND' | 'OR' // 与前一条规则的逻辑关系（第一条忽略）
}

const RULE_FIELDS: { key: string; label: string; type: 'number' | 'enum'; options?: string[] }[] = [
  { key: 'age_stage', label: '账龄阶段', type: 'enum', options: ['M0', 'M1', 'M2', 'M3+'] },
  { key: 'overdue_days', label: '逾期天数', type: 'number' },
  { key: 'overdue_amount', label: '逾期金额(元)', type: 'number' },
  { key: 'product_type', label: '产品类型', type: 'enum', options: ['信用卡', '消费贷', '现金贷', '车抵贷'] },
  { key: 'lost_status', label: '失联状态', type: 'enum', options: ['可联系', '疑似失联', '确认失联'] },
  { key: 'ptp_status', label: 'PTP状态', type: 'enum', options: ['无PTP', 'PTP进行中', 'PTP已履约', 'PTP已失约'] },
  { key: 'risk_level', label: '风险等级', type: 'enum', options: ['低', '中', '高'] },
  { key: 'fraud_tag', label: '欺诈标签', type: 'enum', options: ['无', '疑似欺诈', '确认欺诈'] },
  { key: 'complaint_tag', label: '投诉标记', type: 'enum', options: ['无', '已投诉', '投诉处理中'] },
  { key: 'call_count', label: '累计外呼次数', type: 'number' },
  { key: 'connected', label: '是否接通', type: 'enum', options: ['是', '否'] },
  { key: 'repay_status', label: '回款状态', type: 'enum', options: ['未回款', '部分回款', '全额回款'] },
  { key: 'sms_delivered', label: '短信送达', type: 'enum', options: ['已送达', '发送失败', '退订'] },
]

const RULE_OPERATORS: { key: string; label: string }[] = [
  { key: 'eq', label: '等于' },
  { key: 'neq', label: '不等于' },
  { key: 'gt', label: '大于' },
  { key: 'gte', label: '大于等于' },
  { key: 'lt', label: '小于' },
  { key: 'lte', label: '小于等于' },
  { key: 'in', label: '包含' },
  { key: 'nin', label: '不包含' },
]

const OP_SYMBOL: Record<string, string> = {
  eq: '=', neq: '≠', gt: '>', gte: '≥', lt: '<', lte: '≤', in: '包含', nin: '不包含',
}

function fieldLabel(key: string): string {
  return RULE_FIELDS.find((f) => f.key === key)?.label ?? key
}
function fieldDef(key: string) {
  return RULE_FIELDS.find((f) => f.key === key)
}
function ruleSummary(rules: RuleItem[]): string {
  if (!rules?.length) return '未配置条件'
  return rules.map((r, i) => {
    const prefix = i === 0 ? '' : (r.logic === 'AND' ? ' ∧ ' : ' ∨ ')
    return `${prefix}${fieldLabel(r.field)}${OP_SYMBOL[r.operator] ?? r.operator}${r.value}`
  }).join('')
}

/* ---------- 执行动作 ---------- */
type ActionType = 'ai_call' | 'sms' | 'letter' | 'assign' | 'wait' | 'system'

interface ActionParamDef {
  key: string
  label: string
  type: 'number' | 'enum' | 'boolean' | 'template' | 'smsTemplate' | 'text'
  options?: string[]
  default?: any
  placeholder?: string
}

const ACTION_DEFS: { type: ActionType; label: string; params: ActionParamDef[] }[] = [
  {
    type: 'ai_call', label: 'AI外呼',
    params: [
      { key: 'templateId', label: '对话模板', type: 'template' },
      { key: 'dailyMax', label: '每日最大呼叫次数', type: 'number', default: 2 },
      { key: 'retryInterval', label: '失败重呼间隔(小时)', type: 'number', default: 4 },
      { key: 'retryMax', label: '无人接听重试次数', type: 'number', default: 1 },
      { key: 'stopWhenConnected', label: '接通后不再重呼', type: 'boolean', default: true },
    ],
  },
  {
    type: 'sms', label: '短信发送',
    params: [
      { key: 'smsTemplate', label: '短信模板', type: 'smsTemplate' },
      { key: 'sendTiming', label: '发送时机', type: 'enum', options: ['立即发送', '延时N小时', '指定时段发送'] },
      { key: 'delayHours', label: '延时小时数', type: 'number', default: 24 },
    ],
  },
  {
    type: 'letter', label: '函件发送',
    params: [
      { key: 'letterType', label: '函件类型', type: 'enum', options: ['催告函', '律师函', '诉前告知函'] },
      { key: 'deliveryMethod', label: '送达方式', type: 'enum', options: ['仅电子函件', '仅纸质邮寄', '电子+纸质'] },
    ],
  },
  {
    type: 'assign', label: '分配/移交',
    params: [
      { key: 'targetType', label: '分配目标类型', type: 'enum', options: ['人工坐席组', '委外机构', '法务团队', '欺诈调查组'] },
      { key: 'assignRule', label: '分配规则', type: 'enum', options: ['按区域分配', '按负载率分配', '按回收率分配', '指定目标'] },
      { key: 'targetValue', label: '目标组/机构', type: 'text', placeholder: '如：催收二组 / AG-01' },
    ],
  },
  {
    type: 'wait', label: '延时等待',
    params: [
      { key: 'waitDays', label: '等待天数', type: 'number', default: 3 },
      { key: 'interruptOnRepay', label: '回款时中断等待', type: 'boolean', default: true },
    ],
  },
  {
    type: 'system', label: '系统动作',
    params: [
      { key: 'systemAction', label: '系统动作', type: 'enum', options: ['更新案件状态', '生成分账记录', '标记失联', '标记PTP', '归档结案', '触发子策略'] },
      { key: 'targetStrategy', label: '目标子策略ID', type: 'text', placeholder: '如：st-graph-1' },
    ],
  },
]

const SMS_TEMPLATES = [
  { key: 'SMS-M0', label: 'M0还款提醒（友好）' },
  { key: 'SMS-M1', label: 'M1催收提醒（升级）' },
  { key: 'SMS-M2', label: 'M2催告通知（严肃）' },
  { key: 'SMS-LOST', label: '失联修复引导' },
  { key: 'SMS-PTP', label: 'PTP到期提醒' },
]

function actionDef(type: ActionType) {
  return ACTION_DEFS.find((a) => a.type === type)
}
function actionSummary(action: { type: ActionType; params: Record<string, any> } | undefined): string {
  if (!action) return '未配置动作'
  const def = actionDef(action.type)
  if (!def) return action.type
  const parts: string[] = [def.label]
  const p = action.params ?? {}
  if (action.type === 'ai_call') {
    const t = ZZ_AI_TEMPLATES.find((x: any) => x.id === p.templateId)
    if (t) parts.push(t.name)
    if (p.dailyMax) parts.push(`${p.dailyMax}次/日`)
  } else if (action.type === 'sms') {
    const t = SMS_TEMPLATES.find((x) => x.key === p.smsTemplate)
    if (t) parts.push(t.label)
  } else if (action.type === 'letter') {
    if (p.letterType) parts.push(p.letterType)
  } else if (action.type === 'assign') {
    if (p.targetType) parts.push(p.targetType)
    if (p.targetValue) parts.push(`→${p.targetValue}`)
  } else if (action.type === 'wait') {
    if (p.waitDays) parts.push(`${p.waitDays}天`)
  } else if (action.type === 'system') {
    if (p.systemAction) parts.push(p.systemAction)
  }
  return parts.join('·')
}

/* ---------- 节点数据结构 ---------- */
interface NodeT {
  id: string
  kind: 'start' | 'cond' | 'exec'
  label: string
  x: number
  y: number
  detail: string           // 节点备注/说明
  rules?: RuleItem[]      // cond 节点：结构化条件规则
  action?: { type: ActionType; params: Record<string, any> }  // exec 节点：结构化动作配置
}
interface EdgeT { id: string; from: string; to: string }

const NODE_W = 120
const NODE_H = 54
const INIT_NODES: NodeT[] = [
  { id: 'n1', kind: 'start', label: '开始', x: 40, y: 180, detail: '策略入口' },
  { id: 'n2', kind: 'cond', label: '条件分支', x: 220, y: 170, detail: '', rules: [
    { id: 'r1', field: 'age_stage', operator: 'eq', value: 'M2', logic: 'AND' },
    { id: 'r2', field: 'overdue_amount', operator: 'gte', value: '50000', logic: 'AND' },
  ]},
  { id: 'n3', kind: 'exec', label: 'AI外呼', x: 440, y: 90, detail: '', action: { type: 'ai_call', params: { templateId: 'T-01', dailyMax: 2, retryInterval: 4, retryMax: 1, stopWhenConnected: true } } },
  { id: 'n4', kind: 'exec', label: '短信发送', x: 440, y: 180, detail: '', action: { type: 'sms', params: { smsTemplate: 'SMS-M2', sendTiming: '立即发送' } } },
  { id: 'n5', kind: 'exec', label: '分配人工', x: 440, y: 280, detail: '', action: { type: 'assign', params: { targetType: '人工坐席组', assignRule: '按负载率分配', targetValue: '催收二组' } } },
  { id: 'n6', kind: 'exec', label: '延时等待', x: 650, y: 180, detail: '', action: { type: 'wait', params: { waitDays: 1, interruptOnRepay: true } } },
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

/* ===================== 策略画布页 ===================== */
function ZzStrategyCanvasPage() {
  const nav = useNavigate()
  const loc = useLocation()
  const id = new URLSearchParams(loc.search).get('id') || ''
  const st = ZZ_STRATEGIES.find((s) => s.id === id)
  const [tab, setTab] = useState('画布编辑')

  if (!st) {
    return (
      <ZzPage title="策略画布" crumb="催贷管理 / 智能策略 / 策略列表" subtitle="拖拽式可视化编排">
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
      crumb={`催贷管理 / 智能策略 / 策略列表 / ${st.name}(编辑)`}
      subtitle="拖拽式可视化编排：结构化条件规则 + 可执行动作配置 + 合规管控"
      actions={<ZzBtn sm onClick={() => nav('/console/zz/strategy')}>← 返回策略列表</ZzBtn>}
    >
      <ZzTabs tabs={['画布编辑', '版本管理']} active={tab} onChange={setTab} />
      {tab === '画布编辑' ? <CanvasEditor st={st} /> : <VersionManager st={st} onRollback={() => setTab('画布编辑')} />}
    </ZzPage>
  )
}

/* ===================== 画布编辑器（核心重写） ===================== */
function CanvasEditor({ st }: { st: ZzStrategy }) {
  const flow = (strategyFlows as Record<string, { nodes: NodeT[]; edges: EdgeT[] }>)[st.id] || { nodes: INIT_NODES, edges: INIT_EDGES }
  const CW = Math.max(1200, Math.max(...flow.nodes.map((n) => n.x + NODE_W), 0) + 200)
  const CH = Math.max(600, Math.max(...flow.nodes.map((n) => n.y + NODE_H), 0) + 100)
  // 画布内容走共享数据层：保存后落盘、回滚可还原，不再只存在组件内存里
  const flows = useZzList<any>(ZZ_FILE.flows, [])
  const caseRows = useZzList<any>(ZZ_FILE.cases, [])
  const savedFlow = flows.find((f) => f.id === st.id)
  const [nodes, setNodes] = useState<NodeT[]>(() => savedFlow?.nodes ?? flow.nodes)
  const [edges, setEdges] = useState<EdgeT[]>(() => savedFlow?.edges ?? flow.edges)
  const [synced, setSynced] = useState(!!savedFlow)
  useEffect(() => {
    if (synced) return
    const f = flows.find((x) => x.id === st.id)
    if (f) { setNodes(f.nodes ?? []); setEdges(f.edges ?? []); setSynced(true) }
  }, [flows, synced, st.id])
  const [active, setActive] = useState<NodeT | null>((savedFlow?.nodes ?? flow.nodes)[1] || (savedFlow?.nodes ?? flow.nodes)[0])
  const [zoom, setZoom] = useState(0.8)
  const [panX, setPanX] = useState(20)
  const [panY, setPanY] = useState(20)
  const [linkFrom, setLinkFrom] = useState<string | null>(null)
  // 合规管控配置走共享数据层：改完即时生效于坐席工作台 / AI 外呼的禁呼与频次校验
  const policyRows = useZzList<any>(ZZ_FILE.policy, [DEFAULT_POLICY])
  const policy = policyRows[0] ?? DEFAULT_POLICY
  const callWindow = String(policy.callWindow ?? DEFAULT_POLICY.callWindow)
  const maxCall = Number(policy.maxCall ?? DEFAULT_POLICY.maxCall)
  const setPolicy = (patch: any) => updateZzList<any>(ZZ_FILE.policy, (rows) => [{ ...(rows[0] ?? DEFAULT_POLICY), ...patch }])
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const nodeDrag = useRef<{ id: string; dx: number; dy: number } | null>(null)
  const panDrag = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null)

  const color = (k: NodeT['kind']) => k === 'start' ? '#16A34A' : k === 'cond' ? BLUE : '#D97706'
  const nodeById = (id: string) => nodes.find((n) => n.id === id)

  /* ---------- 节点拖拽 ---------- */
  const onNodeDown = (e: ReactMouseEvent, n: NodeT) => {
    e.stopPropagation()
    const rect = wrapRef.current!.getBoundingClientRect()
    nodeDrag.current = {
      id: n.id,
      dx: (e.clientX - rect.left) / zoom - n.x,
      dy: (e.clientY - rect.top) / zoom - n.y,
    }
    setActive(n)
  }

  /* ---------- 画布空白处按下 → 开始平移 ---------- */
  const onCanvasDown = (e: ReactMouseEvent) => {
    // 节点的 onMouseDown 已 stopPropagation，能到这里说明点的是空白
    panDrag.current = { startX: e.clientX, startY: e.clientY, panX, panY }
  }

  const onCanvasMove = (e: ReactMouseEvent) => {
    // 画布平移
    if (panDrag.current) {
      setPanX(panDrag.current.panX + (e.clientX - panDrag.current.startX))
      setPanY(panDrag.current.panY + (e.clientY - panDrag.current.startY))
      return
    }
    // 节点拖拽
    if (nodeDrag.current) {
      const rect = wrapRef.current!.getBoundingClientRect()
      const x = Math.max(0, (e.clientX - rect.left) / zoom - nodeDrag.current.dx)
      const y = Math.max(0, (e.clientY - rect.top) / zoom - nodeDrag.current.dy)
      const id = nodeDrag.current.id
      setNodes((ns) => ns.map((n) => n.id === id ? { ...n, x, y } : n))
    }
  }

  const onCanvasUp = () => {
    nodeDrag.current = null
    panDrag.current = null
  }

  /* ---------- 鼠标滚轮缩放（以鼠标位置为中心） ---------- */
  const onWheel = (e: ReactWheelEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const delta = e.deltaY > 0 ? -0.08 : 0.08
    const newZoom = Math.max(0.3, Math.min(2.5, +(zoom + delta).toFixed(2)))
    // 保持鼠标指向的画布点不动
    const canvasX = (mouseX - panX) / zoom
    const canvasY = (mouseY - panY) / zoom
    setPanX(mouseX - canvasX * newZoom)
    setPanY(mouseY - canvasY * newZoom)
    setZoom(newZoom)
  }

  const resetView = () => {
    const el = canvasRef.current
    if (!el) return
    const { width: w, height: h } = el.getBoundingClientRect()
    const z = Math.min(1, w / CW, h / CH)
    setZoom(+z.toFixed(2))
    setPanX(20)
    setPanY(20)
  }

  /* ---------- 节点增删 ---------- */
  const addNode = (kind: NodeT['kind']) => {
    const id = 'n' + Date.now().toString().slice(-5)
    const n: NodeT = {
      id, kind,
      label: kind === 'cond' ? '条件分支' : kind === 'exec' ? '执行节点' : '开始/结束',
      x: 200 + Math.round(Math.random() * 200),
      y: 100 + Math.round(Math.random() * 200),
      detail: '',
      ...(kind === 'cond' ? { rules: [{ id: 'r' + Date.now().toString().slice(-4), field: 'age_stage', operator: 'eq', value: 'M1', logic: 'AND' }] } : {}),
      ...(kind === 'exec' ? { action: { type: 'system', params: { systemAction: '更新案件状态' } } } : {}),
    }
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

  // 拖拽连线：从蓝点按下并拖到目标节点松手时完成连接
  const onNodeUp = (e: ReactMouseEvent, n: NodeT) => {
    if (!linkFrom) return
    if (linkFrom !== n.id && !edges.some((ed) => ed.from === linkFrom && ed.to === n.id)) {
      setEdges((es) => [...es, { id: 'e' + Date.now().toString().slice(-5), from: linkFrom, to: n.id }])
    }
    setLinkFrom(null)
    setActive(n)
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

  /* ---------- 条件规则操作 ---------- */
  const addRule = () => {
    if (!active) return
    const rules = active.rules ?? []
    const newRule: RuleItem = {
      id: 'r' + Date.now().toString().slice(-4),
      field: 'overdue_days', operator: 'gt', value: '30', logic: 'AND',
    }
    updateActive({ rules: [...rules, newRule] })
  }
  const updateRule = (rid: string, patch: Partial<RuleItem>) => {
    if (!active?.rules) return
    updateActive({ rules: active.rules.map((r) => r.id === rid ? { ...r, ...patch } : r) })
  }
  const delRule = (rid: string) => {
    if (!active?.rules) return
    updateActive({ rules: active.rules.filter((r) => r.id !== rid) })
  }

  /* ---------- 动作参数操作 ---------- */
  const setActionType = (type: ActionType) => {
    const def = actionDef(type)
    const params: Record<string, any> = {}
    def?.params.forEach((p) => { if (p.default !== undefined) params[p.key] = p.default })
    updateActive({ action: { type, params } })
  }
  const setActionParam = (key: string, value: any) => {
    if (!active?.action) return
    updateActive({ action: { ...active.action, params: { ...active.action.params, [key]: value } } })
  }

  /* ---------- 节点卡片副标题 ---------- */
  const nodeSubtitle = (n: NodeT): string => {
    if (n.kind === 'cond') return ruleSummary(n.rules ?? [])
    if (n.kind === 'exec') return actionSummary(n.action)
    return n.detail
  }

  return (
    <>
    <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-4">
      <div className="min-w-0 overflow-hidden">
      <ZzCard title={`画布（${st.name}）`} extra={
        <div className="flex flex-wrap items-center gap-2">
          <ZzBtn sm onClick={() => addNode('cond')}>+ 条件</ZzBtn>
          <ZzBtn sm onClick={() => addNode('exec')}>+ 执行</ZzBtn>
          <ZzBtn sm onClick={() => addNode('start')}>+ 端点</ZzBtn>
          <span className="text-gray-300">|</span>
          <ZzBtn sm onClick={() => setZoom((z) => Math.max(0.3, +(z - 0.1).toFixed(2)))}>－</ZzBtn>
          <span className="w-12 text-center text-sm">{Math.round(zoom * 100)}%</span>
          <ZzBtn sm onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.1).toFixed(2)))}>＋</ZzBtn>
          <ZzBtn sm onClick={resetView}>重置视图</ZzBtn>
          <span className="text-gray-300">|</span>
          <ZzBtn sm onClick={() => {
            const verRows = (window as any).__zzVer ?? []
            const no = verRows.filter((v: any) => v.id === st.id).length + 1
            const snapshot = { id: st.id, nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }
            updateZzList<any>(ZZ_FILE.flows, (list) => {
              const i = list.findIndex((f) => f.id === st.id)
              return i >= 0 ? list.map((f) => (f.id === st.id ? snapshot : f)) : [snapshot, ...list]
            })
            updateZzList<any>(ZZ_FILE.strategyVer, (list) => [{
              id: st.id, version: 'v1.' + no, editor: '当前用户', time: new Date().toLocaleString('zh-CN'),
              note: '画布编辑保存', summary: `${nodes.length} 个节点 / ${edges.length} 条连线`,
              nodes: snapshot.nodes, edges: snapshot.edges,
            }, ...list])
            alert(`已保存：生成版本 v1.${no}（${nodes.length} 节点 / ${edges.length} 连线）`)
          }}>保存</ZzBtn>
          <ZzBtn sm primary onClick={() => {
            // 发布：按当前在催案件生成一条执行批次记录，执行监控可查真实命中
            const now = new Date().toLocaleString('zh-CN')
            updateZzList<any>(ZZ_FILE.exec, (list) => [{
              id: 'EX-' + Date.now().toString().slice(-6), name: st.name, time: now,
              batch: 'B-' + Date.now().toString().slice(-6),
              inflow: caseRows.filter((c: any) => !['已结清', '核销'].includes(c.status)).length,
              nodes: nodes.length, edges: edges.length, status: '执行中',
            }, ...list])
            alert(`「${st.name}」已发布，已生成执行批次，可在「执行监控」查看命中情况`)
          }}>发布</ZzBtn>
        </div>
      }>
        <div
          ref={canvasRef}
          className="relative h-[560px] w-full cursor-grab overflow-hidden rounded border bg-slate-50 active:cursor-grabbing"
          onMouseDown={onCanvasDown}
          onMouseMove={onCanvasMove}
          onMouseUp={onCanvasUp}
          onMouseLeave={onCanvasUp}
          onWheel={onWheel}
          onClick={() => linkFrom && setLinkFrom(null)}
        >
          {/* 网格背景 */}
          <div className="pointer-events-none absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }} />
          <div
            ref={wrapRef}
            className="absolute left-0 top-0"
            style={{
              width: CW, height: CH,
              transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            <svg className="pointer-events-none absolute inset-0" width={CW} height={CH}>
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
                onMouseUp={(e) => onNodeUp(e, n)}
                onClick={(e) => { e.stopPropagation(); onNodeClick(n) }}
                className="absolute cursor-move rounded-lg border bg-white px-3 py-2 text-center text-sm shadow-sm hover:shadow-md"
                style={{ left: n.x, top: n.y, width: NODE_W, borderColor: active?.id === n.id ? BLUE : (linkFrom === n.id ? '#16A34A' : '#e2e8f0') }}>
                <div className="font-medium leading-tight" style={{ color: color(n.kind) }}>{n.label}</div>
                <div className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-gray-500" style={{ maxWidth: NODE_W - 24 }}>{nodeSubtitle(n)}</div>
                <div title="点此或拖拽到目标节点完成连线" onMouseDown={(e) => { e.stopPropagation(); setLinkFrom(n.id) }} onClick={(e) => e.stopPropagation()}
                  className="absolute -right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 cursor-crosshair rounded-full border-2 border-white bg-[#1677ff]" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
          <span>滚轮缩放</span>
          <span>空白拖拽平移</span>
          <span>节点拖拽移动</span>
          <span>点蓝点或拖拽到目标节点连线</span>
          {linkFrom && <span className="text-[#1677ff]">连线中：点击目标节点完成连接</span>}
        </div>
      </ZzCard>
      </div>

      {/* ============ 右侧属性面板 ============ */}
      <div>
        <ZzCard title="节点属性" bodyClass="p-4 h-[560px] overflow-y-auto">
          {active ? (
            <div className="grid grid-cols-1 gap-3">
              <ZzField label="节点名称">
                <ZzInput value={active.label} onChange={(e) => updateActive({ label: e.target.value })} />
              </ZzField>
              <ZzField label="节点类型">
                <ZzSelect value={active.kind} onChange={(e) => updateActive({ kind: e.target.value as NodeT['kind'] })}>
                  <option value="cond">条件分支</option>
                  <option value="exec">执行节点</option>
                  <option value="start">开始/结束</option>
                </ZzSelect>
              </ZzField>

              {/* ===== 条件节点：结构化规则构建器 ===== */}
              {active.kind === 'cond' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">条件规则（全部满足时走真分支）</span>
                    <ZzBtn sm onClick={addRule}>+ 条件</ZzBtn>
                  </div>
                  {(active.rules ?? []).length === 0 && (
                    <div className="rounded border border-dashed border-gray-300 p-3 text-center text-xs text-gray-400">
                      点击「+ 条件」添加规则
                    </div>
                  )}
                  {(active.rules ?? []).map((r, idx) => {
                    const fdef = fieldDef(r.field)
                    return (
                      <div key={r.id} className="rounded border border-gray-200 bg-gray-50 p-2">
                        <div className="mb-1.5 flex items-center gap-1">
                          {idx > 0 ? (
                            <ZzSelect value={r.logic} onChange={(e) => updateRule(r.id, { logic: e.target.value as 'AND' | 'OR' })} className="w-16">
                              <option value="AND">且</option>
                              <option value="OR">或</option>
                            </ZzSelect>
                          ) : <span className="w-16 text-xs text-gray-400">条件{idx + 1}</span>}
                          <ZzBtn sm danger onClick={() => delRule(r.id)}>×</ZzBtn>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <ZzSelect value={r.field} onChange={(e) => updateRule(r.id, { field: e.target.value, value: '' })} className="flex-1 min-w-[100px]">
                            {RULE_FIELDS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                          </ZzSelect>
                          <ZzSelect value={r.operator} onChange={(e) => updateRule(r.id, { operator: e.target.value })} className="w-20">
                            {RULE_OPERATORS.map((op) => <option key={op.key} value={op.key}>{op.label}</option>)}
                          </ZzSelect>
                          {fdef?.type === 'enum' ? (
                            <ZzSelect value={r.value} onChange={(e) => updateRule(r.id, { value: e.target.value })} className="flex-1 min-w-[80px]">
                              <option value="">请选择</option>
                              {fdef.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                            </ZzSelect>
                          ) : (
                            <ZzInput type="number" value={r.value} placeholder="值" onChange={(e) => updateRule(r.id, { value: e.target.value })} className="flex-1 min-w-[60px]" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {(active.rules ?? []).length > 0 && (
                    <div className="rounded bg-blue-50 px-2 py-1.5 text-xs text-[#1677ff]">
                      规则摘要：{ruleSummary(active.rules ?? [])}
                    </div>
                  )}
                  <ZzField label="备注说明">
                    <ZzInput value={active.detail} onChange={(e) => updateActive({ detail: e.target.value })} placeholder="可选：对该条件节点的补充说明" />
                  </ZzField>
                </div>
              )}

              {/* ===== 执行节点：结构化动作配置器 ===== */}
              {active.kind === 'exec' && (
                <div className="space-y-3">
                  <ZzField label="动作类型">
                    <ZzSelect
                      value={active.action?.type ?? 'system'}
                      onChange={(e) => setActionType(e.target.value as ActionType)}
                    >
                      {ACTION_DEFS.map((a) => <option key={a.type} value={a.type}>{a.label}</option>)}
                    </ZzSelect>
                  </ZzField>

                  {active.action && actionDef(active.action.type)?.params.map((p) => {
                    const val = active.action!.params[p.key]
                    if (p.type === 'template') {
                      return (
                        <ZzField key={p.key} label={`${p.label}（来自 /zz/ai-template）`}>
                          <ZzSelect value={val ?? ''} onChange={(e) => setActionParam(p.key, e.target.value)}>
                            <option value="">请选择对话模板</option>
                            {ZZ_AI_TEMPLATES.filter((t: any) => t.enabled !== false).map((t: any) => (
                              <option key={t.id} value={t.id}>{t.id} · {t.name}（{t.scenario}）</option>
                            ))}
                          </ZzSelect>
                        </ZzField>
                      )
                    }
                    if (p.type === 'smsTemplate') {
                      return (
                        <ZzField key={p.key} label={p.label}>
                          <ZzSelect value={val ?? ''} onChange={(e) => setActionParam(p.key, e.target.value)}>
                            <option value="">请选择短信模板</option>
                            {SMS_TEMPLATES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
                          </ZzSelect>
                        </ZzField>
                      )
                    }
                    if (p.type === 'enum') {
                      return (
                        <ZzField key={p.key} label={p.label}>
                          <ZzSelect value={val ?? ''} onChange={(e) => setActionParam(p.key, e.target.value)}>
                            <option value="">请选择</option>
                            {p.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                          </ZzSelect>
                        </ZzField>
                      )
                    }
                    if (p.type === 'number') {
                      return (
                        <ZzField key={p.key} label={p.label}>
                          <ZzInput type="number" value={val ?? ''} placeholder={p.placeholder ?? ''} onChange={(e) => setActionParam(p.key, e.target.value === '' ? '' : Number(e.target.value))} />
                        </ZzField>
                      )
                    }
                    if (p.type === 'boolean') {
                      return (
                        <ZzField key={p.key} label={p.label}>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={!!val} onChange={(e) => setActionParam(p.key, e.target.checked)} />
                            <span>{val ? '开启' : '关闭'}</span>
                          </label>
                        </ZzField>
                      )
                    }
                    return (
                      <ZzField key={p.key} label={p.label}>
                        <ZzInput value={val ?? ''} placeholder={p.placeholder ?? ''} onChange={(e) => setActionParam(p.key, e.target.value)} />
                      </ZzField>
                    )
                  })}

                  {active.action && (
                    <div className="rounded bg-amber-50 px-2 py-1.5 text-xs text-amber-700">
                      动作摘要：{actionSummary(active.action)}
                    </div>
                  )}
                  <ZzField label="备注说明">
                    <ZzInput value={active.detail} onChange={(e) => updateActive({ detail: e.target.value })} placeholder="可选：对该动作节点的补充说明" />
                  </ZzField>
                </div>
              )}

              {/* ===== 端点节点 ===== */}
              {active.kind === 'start' && (
                <ZzField label="说明">
                  <ZzInput value={active.detail} onChange={(e) => updateActive({ detail: e.target.value })} />
                </ZzField>
              )}

              <div><ZzBtn sm danger onClick={() => delNode(active.id)}>删除节点</ZzBtn></div>
            </div>
          ) : <div className="text-sm text-gray-400">点击画布节点进行配置；滚轮缩放，空白拖拽平移，节点拖拽移动，拖右侧蓝点连线。</div>}
        </ZzCard>
      </div>
    </div>

    <div className="mt-4">
      <ZzCard title="合规管控配置">
        <div className="grid grid-cols-1 gap-3">
          <ZzField label="拨打时间窗口"><ZzInput value={callWindow} onChange={(e) => setPolicy({ callWindow: e.target.value })} /></ZzField>
          <ZzField label="单客户每日最大呼叫次数"><ZzInput type="number" value={maxCall} onChange={(e) => setPolicy({ maxCall: Number(e.target.value) })} /></ZzField>
          <div className="rounded bg-amber-50 p-2 text-xs text-amber-700">硬限制：22:00-08:00 禁止外呼；禁止骚扰第三方联系人。</div>
        </div>
      </ZzCard>
    </div>
    </>
  )
}

/* ---------------- 版本管理 ---------------- */
function VersionManager({ st, onRollback }: { st: ZzStrategy; onRollback: () => void }) {
  // 版本管理读共享数据层：画布保存产生的版本（ZZ_FILE.strategyVer）实时上列；
  // 同时保留 zzData 里的演示种子版本，二者按 id 合并展示
  const sharedVers = useZzList<any>(ZZ_FILE.strategyVer, [])
  const versions = [...sharedVers.filter((v) => v.id === st.id), ...ZZ_STRATEGY_VERSIONS.filter((v) => v.id === st.id)]
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
      <ZzTable stickyAction head={['版本号', '修改人', '修改时间', '版本备注', '画布概要', '操作']} rows={versions.map((v) => [
        <ZzBadge color={BLUE}>{v.version}</ZzBadge>, v.editor, v.time, v.note, v.summary,
        <div className="flex flex-nowrap gap-1">
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
