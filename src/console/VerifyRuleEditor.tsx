// 信息核验 — 核验规则编辑器（纯配置内容，无路由/无 Header）
// 左侧数据源列表（可增删改）+ 右侧选中数据源详细配置。
// 供 VerifyRuleConfig（独立页面）与 VerifyRuleList（抽屉内）共用。
import { useState } from 'react'
import { Panel, Button, Badge } from '../components/ui'

const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

/* ───────────────────────── 图标库 ───────────────────────── */
const ICONS: Record<string, string> = {
  shield: 'M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z',
  card: 'M3 8h18v8H3zM3 11h18',
  phone: 'M6 3h12v18H6zM9 7h6M9 11h6M9 15h3',
  device: 'M4 5h16v11H4zM8 20h8M12 16v4',
  network: 'M12 3l9 5v8l-9 5-9-5V8z',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  lock: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  fingerprint: 'M12 2a10 10 0 00-7.07 17.07M12 2a10 10 0 017.07 17.07M8 11v2a4 4 0 008 0v-2M12 22V11M8 15v2a4 4 0 008 0v-2',
  globe: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9m-9 9a9 9 0 019-9',
}

const ICON_OPTIONS = [
  { key: 'shield', label: '盾牌' },
  { key: 'card', label: '卡片' },
  { key: 'phone', label: '手机' },
  { key: 'device', label: '设备' },
  { key: 'network', label: '网络' },
  { key: 'user', label: '用户' },
  { key: 'lock', label: '锁' },
  { key: 'document', label: '文档' },
  { key: 'fingerprint', label: '指纹' },
  { key: 'globe', label: '地球' },
]

/* ───────────────────────── 类型 ───────────────────────── */
type Operator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'regex'
type ConclusionType = 'pass' | 'warning' | 'reject'

export interface JudgeRule {
  id: string
  name: string
  field: string
  operator: Operator
  value: string
  conclusion: ConclusionType
  priority: number
  enabled: boolean
}

export interface DataSourceConfig {
  id: string
  key: string
  label: string
  icon: string
  enabled: boolean
  required: boolean
  subFields: { key: string; label: string; type: string }[]
  // 接入参数
  apiChannel: string
  apiUrl: string
  apiTimeout: string
  apiRetry: string
  appKey: string
  appSecret: string
  // 字段映射
  fieldMappings: { systemField: string; targetField: string; type: string; required: boolean }[]
  // 判定规则
  judgeRules: JudgeRule[]
  // 结论映射
  conclusionMode: string
  defaultConclusion: string
  timeoutFallback: string
}

/* ───────────────────────── 常量 ───────────────────────── */
const OP_LABELS: Record<Operator, string> = {
  eq: '等于', ne: '不等于', gt: '大于', gte: '大于等于',
  lt: '小于', lte: '小于等于', in: '在集合中', regex: '正则匹配',
}

const CONCLUSION_BADGE: Record<ConclusionType, { kind: 'green' | 'amber' | 'red'; text: string }> = {
  pass: { kind: 'green', text: '通过' },
  warning: { kind: 'amber', text: '预警' },
  reject: { kind: 'red', text: '拒绝' },
}

/* ───────────────────────── 默认数据源模板 ───────────────────────── */
const defaultDataSources: DataSourceConfig[] = [
  {
    id: 'ds-police', key: 'police', label: '公安实名身份核验', icon: 'shield',
    enabled: true, required: true,
    subFields: [
      { key: 'name', label: '姓名', type: 'string' },
      { key: 'idNo', label: '身份证号', type: 'string' },
      { key: 'faceScore', label: '人脸比对相似度', type: 'number' },
      { key: 'liveness', label: '活体检测结果', type: 'enum' },
    ],
    apiChannel: '同盾多源并行核验 API V2.0', apiUrl: 'https://api.tongdun.cn/v2/verify',
    apiTimeout: '3000', apiRetry: '1', appKey: 'TD********A1B2', appSecret: '********',
    fieldMappings: [
      { systemField: '姓名', targetField: 'name', type: 'string', required: true },
      { systemField: '身份证号', targetField: 'idNo', type: 'string', required: true },
      { systemField: '人脸比对相似度', targetField: 'faceScore', type: 'number', required: true },
      { systemField: '活体检测结果', targetField: 'liveness', type: 'enum', required: true },
    ],
    judgeRules: [
      { id: 'r1', name: '人脸高置信通过', field: 'faceScore', operator: 'gte', value: '95', conclusion: 'pass', priority: 1, enabled: true },
      { id: 'r2', name: '人脸中置信预警', field: 'faceScore', operator: 'gte', value: '80', conclusion: 'warning', priority: 2, enabled: true },
      { id: 'r3', name: '人脸低置信拒绝', field: 'faceScore', operator: 'lt', value: '80', conclusion: 'reject', priority: 3, enabled: true },
      { id: 'r4', name: '活体通过', field: 'liveness', operator: 'eq', value: '通过', conclusion: 'pass', priority: 1, enabled: true },
      { id: 'r5', name: '活体失败拒绝', field: 'liveness', operator: 'eq', value: '失败', conclusion: 'reject', priority: 2, enabled: true },
    ],
    conclusionMode: '一票否决', defaultConclusion: '通过', timeoutFallback: '返回超时标记',
  },
  {
    id: 'ds-unionpay', key: 'unionpay', label: '银行卡四要素核验', icon: 'card',
    enabled: true, required: false,
    subFields: [
      { key: 'cardNo', label: '卡号', type: 'string' },
      { key: 'name', label: '姓名', type: 'string' },
      { key: 'idNo', label: '身份证号', type: 'string' },
      { key: 'phone', label: '预留手机号', type: 'string' },
    ],
    apiChannel: '银联云闪付 API V1.5', apiUrl: 'https://api.unionpay.com/v1/verify',
    apiTimeout: '3000', apiRetry: '2', appKey: 'UP********C3D4', appSecret: '********',
    fieldMappings: [
      { systemField: '卡号', targetField: 'cardNo', type: 'string', required: true },
      { systemField: '姓名', targetField: 'name', type: 'string', required: true },
      { systemField: '身份证号', targetField: 'idNo', type: 'string', required: true },
      { systemField: '预留手机号', targetField: 'phone', type: 'string', required: true },
    ],
    judgeRules: [
      { id: 'r6', name: '四要素一致通过', field: 'cardNo', operator: 'eq', value: '（申请人填报）', conclusion: 'pass', priority: 1, enabled: true },
    ],
    conclusionMode: '一票否决', defaultConclusion: '通过', timeoutFallback: '返回超时标记',
  },
  {
    id: 'ds-operator', key: 'operator', label: '运营商手机号实名核验', icon: 'phone',
    enabled: true, required: false,
    subFields: [
      { key: 'phone', label: '手机号', type: 'string' },
      { key: 'realName', label: '实名姓名', type: 'string' },
      { key: 'tenureDays', label: '入网时长（天）', type: 'number' },
      { key: 'status', label: '在网状态', type: 'enum' },
    ],
    apiChannel: '中移互联 API V3.0', apiUrl: 'https://api.cmcc.cn/v3/verify',
    apiTimeout: '5000', apiRetry: '1', appKey: 'CM********E5F6', appSecret: '********',
    fieldMappings: [
      { systemField: '手机号', targetField: 'phone', type: 'string', required: true },
      { systemField: '实名姓名', targetField: 'realName', type: 'string', required: true },
      { systemField: '入网时长', targetField: 'tenureDays', type: 'number', required: true },
      { systemField: '在网状态', targetField: 'status', type: 'enum', required: true },
    ],
    judgeRules: [
      { id: 'r7', name: '入网时长预警', field: 'tenureDays', operator: 'lt', value: '30', conclusion: 'warning', priority: 1, enabled: true },
      { id: 'r8', name: '在网正常通过', field: 'status', operator: 'eq', value: '正常', conclusion: 'pass', priority: 1, enabled: true },
      { id: 'r9', name: '销号拒绝', field: 'status', operator: 'eq', value: '销号', conclusion: 'reject', priority: 2, enabled: true },
    ],
    conclusionMode: '一票否决', defaultConclusion: '通过', timeoutFallback: '返回超时标记',
  },
  {
    id: 'ds-device', key: 'device', label: '终端设备风险库核验', icon: 'device',
    enabled: true, required: true,
    subFields: [
      { key: 'deviceId', label: '设备指纹', type: 'string' },
      { key: 'relatedIds', label: '关联身份数', type: 'number' },
      { key: 'rooted', label: 'Root/越狱状态', type: 'enum' },
      { key: 'simulator', label: '模拟器检测', type: 'enum' },
    ],
    apiChannel: '同盾设备指纹 API V2.0', apiUrl: 'https://api.tongdun.cn/v2/device',
    apiTimeout: '3000', apiRetry: '1', appKey: 'TD********A1B2', appSecret: '********',
    fieldMappings: [
      { systemField: '设备指纹', targetField: 'deviceId', type: 'string', required: true },
      { systemField: '关联身份数', targetField: 'relatedIds', type: 'number', required: true },
      { systemField: 'Root/越狱状态', targetField: 'rooted', type: 'enum', required: true },
      { systemField: '模拟器检测', targetField: 'simulator', type: 'enum', required: true },
    ],
    judgeRules: [
      { id: 'r10', name: '设备群控拒绝', field: 'relatedIds', operator: 'gte', value: '3', conclusion: 'reject', priority: 1, enabled: true },
      { id: 'r11', name: 'Root/越狱拒绝', field: 'rooted', operator: 'eq', value: '是', conclusion: 'reject', priority: 1, enabled: true },
      { id: 'r12', name: '模拟器拒绝', field: 'simulator', operator: 'eq', value: '是', conclusion: 'reject', priority: 1, enabled: true },
    ],
    conclusionMode: '一票否决', defaultConclusion: '通过', timeoutFallback: '返回超时标记',
  },
  {
    id: 'ds-network', key: 'network', label: '跨行业联防联控交叉核验', icon: 'network',
    enabled: true, required: false,
    subFields: [
      { key: 'phoneBlacklist', label: '手机号黑名单', type: 'number' },
      { key: 'idNoBlacklist', label: '身份证黑名单', type: 'number' },
      { key: 'overdue', label: '关联逾期', type: 'number' },
      { key: 'coDebt', label: '共债网络', type: 'enum' },
    ],
    apiChannel: '百行征信联防 API V1.0', apiUrl: 'https://api.baihang.cn/v1/network',
    apiTimeout: '5000', apiRetry: '2', appKey: 'BH********G7H8', appSecret: '********',
    fieldMappings: [
      { systemField: '手机号黑名单', targetField: 'phoneBlacklist', type: 'number', required: true },
      { systemField: '身份证黑名单', targetField: 'idNoBlacklist', type: 'number', required: true },
      { systemField: '关联逾期', targetField: 'overdue', type: 'number', required: true },
      { systemField: '共债网络', targetField: 'coDebt', type: 'enum', required: true },
    ],
    judgeRules: [
      { id: 'r13', name: '手机号黑名单命中', field: 'phoneBlacklist', operator: 'gte', value: '1', conclusion: 'reject', priority: 1, enabled: true },
      { id: 'r14', name: '身份证黑名单命中', field: 'idNoBlacklist', operator: 'gte', value: '1', conclusion: 'reject', priority: 1, enabled: true },
      { id: 'r15', name: '关联逾期预警', field: 'overdue', operator: 'gte', value: '1', conclusion: 'warning', priority: 1, enabled: true },
    ],
    conclusionMode: '一票否决', defaultConclusion: '通过', timeoutFallback: '返回超时标记',
  },
]

/* ───────────────────────── 表单组件 ───────────────────────── */
function FormInput({ label, value, onChange, placeholder, type = 'text', disabled }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100',
          disabled && 'bg-slate-50 text-slate-400'
        )}
      />
    </div>
  )
}

function FormSelect({ label, value, onChange, options, disabled }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; disabled?: boolean
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100',
          disabled && 'bg-slate-50 text-slate-400'
        )}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <div className={cn('relative h-5 w-9 rounded-full transition', checked ? 'bg-brand-500' : 'bg-slate-300')}>
        <div className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition', checked ? 'left-[18px]' : 'left-0.5')} />
      </div>
      <input type="checkbox" className="hidden" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  )
}

/* ───────────────────────── 图标渲染 ───────────────────────── */
function IconSvg({ name, className }: { name: string; className?: string }) {
  const path = ICONS[name] || ICONS.document
  return (
    <svg className={className || 'h-4 w-4'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d={path} />
    </svg>
  )
}

/* ───────────────────────── 主组件 ───────────────────────── */
export interface VerifyRuleEditorProps {
  isNew?: boolean
  initialName?: string
  initialStatus?: '草稿' | '已生效' | '已下线'
  onSave?: () => void
  onCancel?: () => void
}

export default function VerifyRuleEditor({
  isNew = false,
  initialName,
  initialStatus,
  onSave,
  onCancel,
}: VerifyRuleEditorProps) {
  // 全局配置
  const [globalName, setGlobalName] = useState(isNew ? '' : (initialName ?? '标准进件核验规则 V2.6'))
  const [globalVersion, setGlobalVersion] = useState(isNew ? 'V1.0' : 'V2.6')
  const [globalStatus, setGlobalStatus] = useState<'草稿' | '已生效' | '已下线'>(isNew ? '草稿' : (initialStatus ?? '已生效'))
  const [globalScope, setGlobalScope] = useState(isNew ? '全产品' : '全产品')
  const [globalDesc, setGlobalDesc] = useState(isNew ? '' : '覆盖 5 项数据源的标准规则集')

  // 动态数据源列表（核心：可增删改）
  const [dataSources, setDataSources] = useState<DataSourceConfig[]>(defaultDataSources)
  const [activeDsId, setActiveDsId] = useState<string>(defaultDataSources[0]?.id ?? '')

  // 新增数据源弹窗
  const [showAddModal, setShowAddModal] = useState(false)
  const [newDsName, setNewDsName] = useState('')
  const [newDsIcon, setNewDsIcon] = useState('document')

  const activeDs = dataSources.find((d) => d.id === activeDsId) || dataSources[0]

  // 更新当前数据源
  const updateActiveDs = (patch: Partial<DataSourceConfig>) => {
    if (!activeDs) return
    setDataSources((prev) => prev.map((d) => (d.id === activeDs.id ? { ...d, ...patch } : d)))
  }

  // 添加数据源
  const addDataSource = () => {
    if (!newDsName.trim()) return
    const newDs: DataSourceConfig = {
      id: `ds-${Date.now()}`,
      key: `custom-${Date.now()}`,
      label: newDsName.trim(),
      icon: newDsIcon,
      enabled: true,
      required: false,
      subFields: [],
      apiChannel: '',
      apiUrl: '',
      apiTimeout: '3000',
      apiRetry: '1',
      appKey: '',
      appSecret: '',
      fieldMappings: [],
      judgeRules: [],
      conclusionMode: '一票否决',
      defaultConclusion: '通过',
      timeoutFallback: '返回超时标记',
    }
    setDataSources((prev) => [...prev, newDs])
    setActiveDsId(newDs.id)
    setShowAddModal(false)
    setNewDsName('')
    setNewDsIcon('document')
  }

  // 删除数据源
  const removeDataSource = (id: string) => {
    if (!confirm('确定删除该数据源？关联的判定规则将一并删除。')) return
    setDataSources((prev) => {
      const filtered = prev.filter((d) => d.id !== id)
      if (activeDsId === id && filtered.length > 0) {
        setActiveDsId(filtered[0].id)
      }
      return filtered
    })
  }

  // 判定规则操作
  const updateRule = (id: string, patch: Partial<JudgeRule>) => {
    if (!activeDs) return
    setDataSources((prev) =>
      prev.map((d) =>
        d.id === activeDs.id
          ? { ...d, judgeRules: d.judgeRules.map((r) => (r.id === id ? { ...r, ...patch } : r)) }
          : d
      )
    )
  }

  const addRule = () => {
    if (!activeDs) return
    const newRule: JudgeRule = {
      id: `r${Date.now()}`,
      name: '新规则',
      field: activeDs.subFields[0]?.key ?? '',
      operator: 'eq',
      value: '',
      conclusion: 'pass',
      priority: activeDs.judgeRules.length + 1,
      enabled: true,
    }
    setDataSources((prev) =>
      prev.map((d) => (d.id === activeDs.id ? { ...d, judgeRules: [...d.judgeRules, newRule] } : d))
    )
  }

  const removeRule = (id: string) => {
    if (!activeDs) return
    setDataSources((prev) =>
      prev.map((d) => (d.id === activeDs.id ? { ...d, judgeRules: d.judgeRules.filter((r) => r.id !== id) } : d))
    )
  }

  // 字段映射操作
  const addFieldMapping = () => {
    if (!activeDs) return
    const newMapping = { systemField: '', targetField: '', type: 'string', required: true }
    setDataSources((prev) =>
      prev.map((d) => (d.id === activeDs.id ? { ...d, fieldMappings: [...d.fieldMappings, newMapping] } : d))
    )
  }

  const updateFieldMapping = (idx: number, patch: Partial<DataSourceConfig['fieldMappings'][0]>) => {
    if (!activeDs) return
    setDataSources((prev) =>
      prev.map((d) =>
        d.id === activeDs.id
          ? { ...d, fieldMappings: d.fieldMappings.map((m, i) => (i === idx ? { ...m, ...patch } : m)) }
          : d
      )
    )
  }

  const removeFieldMapping = (idx: number) => {
    if (!activeDs) return
    setDataSources((prev) =>
      prev.map((d) => (d.id === activeDs.id ? { ...d, fieldMappings: d.fieldMappings.filter((_, i) => i !== idx) } : d))
    )
  }

  // 子字段操作
  const addSubField = () => {
    if (!activeDs) return
    const key = `field-${Date.now()}`
    const newField = { key, label: '新字段', type: 'string' }
    setDataSources((prev) =>
      prev.map((d) => (d.id === activeDs.id ? { ...d, subFields: [...d.subFields, newField] } : d))
    )
  }

  const updateSubField = (key: string, patch: Partial<{ label: string; type: string }>) => {
    if (!activeDs) return
    setDataSources((prev) =>
      prev.map((d) =>
        d.id === activeDs.id
          ? { ...d, subFields: d.subFields.map((f) => (f.key === key ? { ...f, ...patch } : f)) }
          : d
      )
    )
  }

  const removeSubField = (key: string) => {
    if (!activeDs) return
    setDataSources((prev) =>
      prev.map((d) => (d.id === activeDs.id ? { ...d, subFields: d.subFields.filter((f) => f.key !== key) } : d))
    )
  }

  return (
    <div className="space-y-5">
      {/* 全局配置（整体配置，独立于数据源 tab 之外） */}
      <Panel title="全局配置" actions={<Badge kind={globalStatus === '已生效' ? 'green' : globalStatus === '草稿' ? 'blue' : 'gray'}>{globalStatus}</Badge>}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormInput label="规则集名称" value={globalName} onChange={setGlobalName} placeholder="如：标准进件核验规则" />
          <FormInput label="版本号" value={globalVersion} onChange={setGlobalVersion} disabled />
          <FormSelect label="生效状态" value={globalStatus} onChange={(v) => setGlobalStatus(v as any)} options={['草稿', '已生效', '已下线']} />
          <FormSelect label="适用范围" value={globalScope} onChange={setGlobalScope} options={['全产品', '信用贷', '抵押贷', '经营贷']} />
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium text-slate-500">规则集描述</label>
          <textarea
            value={globalDesc}
            onChange={(e) => setGlobalDesc(e.target.value)}
            placeholder="说明本规则集的适用场景与变更原因..."
            className="h-20 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </Panel>

      <div className="flex h-[calc(100vh-8rem)] gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* ───── 左侧规则配置列表 ───── */}
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-slate-50">
        {/* 标题 */}
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-700">规则配置</h3>
          <p className="mt-0.5 text-[11px] text-slate-400">共 {dataSources.length} 项 · {dataSources.filter((d) => d.enabled).length} 项启用</p>
        </div>

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto py-2">
          {dataSources.map((ds) => {
            const active = ds.id === activeDsId
            return (
              <div
                key={ds.id}
                onClick={() => setActiveDsId(ds.id)}
                className={cn(
                  'group relative mx-2 mb-1 flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition',
                  active ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-slate-600 hover:bg-white hover:shadow-sm'
                )}
              >
                <IconSvg name={ds.icon} className={cn('h-4 w-4 shrink-0', active ? 'text-brand-600' : 'text-slate-400')} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-medium">{ds.label}</span>
                    {!ds.enabled && <span className="shrink-0 rounded bg-slate-200 px-1 py-0 text-[10px] text-slate-500">关</span>}
                    {ds.required && <span className="shrink-0 rounded bg-rose-100 px-1 py-0 text-[10px] text-rose-600">必</span>}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-400">{ds.judgeRules.length} 条判定规则</div>
                </div>
                {/* 删除按钮 */}
                <button
                  onClick={(e) => { e.stopPropagation(); removeDataSource(ds.id) }}
                  className="shrink-0 rounded p-1 text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
                  title="删除"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )
          })}
        </div>

        {/* 新增按钮 */}
        <div className="border-t border-slate-200 p-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-500 transition hover:border-brand-300 hover:text-brand-600"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14" /></svg>
            新增数据源
          </button>
        </div>
      </aside>

      {/* ───── 右侧配置区 ───── */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-5 p-6">
          {activeDs && (
            <>
              {/* 数据源基础信息 */}
              <Panel title={`${activeDs.label} — 基础信息`}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <FormInput label="数据源名称" value={activeDs.label} onChange={(v) => updateActiveDs({ label: v })} />
                  <FormInput label="数据源标识" value={activeDs.key} onChange={(v) => updateActiveDs({ key: v })} />
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">图标</label>
                    <div className="flex flex-wrap gap-2">
                      {ICON_OPTIONS.map((ico) => (
                        <button
                          key={ico.key}
                          onClick={() => updateActiveDs({ icon: ico.key })}
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-lg border transition',
                            activeDs.icon === ico.key
                              ? 'border-brand-400 bg-brand-50 text-brand-600'
                              : 'border-slate-200 text-slate-400 hover:border-slate-300'
                          )}
                          title={ico.label}
                        >
                          <IconSvg name={ico.key} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-8">
                  <Toggle
                    label="启用该数据源"
                    checked={activeDs.enabled}
                    onChange={(v) => updateActiveDs({ enabled: v })}
                  />
                  <Toggle
                    label="是否为必核项（结论为拒绝时直接触发系统级拦截）"
                    checked={activeDs.required}
                    onChange={(v) => updateActiveDs({ required: v })}
                  />
                </div>
              </Panel>

              {/* 子字段定义 */}
              <Panel
                title="子字段定义"
                actions={<Button variant="secondary" size="sm" onClick={addSubField}>+ 添加字段</Button>}
              >
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-3 py-2 text-left">字段标识</th>
                        <th className="px-3 py-2 text-left">字段名称</th>
                        <th className="px-3 py-2 text-left">数据类型</th>
                        <th className="px-3 py-2 text-left">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeDs.subFields.map((f) => (
                        <tr key={f.key} className="hover:bg-slate-50/60">
                          <td className="px-3 py-2 font-mono text-xs text-slate-500">{f.key}</td>
                          <td className="px-3 py-2">
                            <input
                              value={f.label}
                              onChange={(e) => updateSubField(f.key, { label: e.target.value })}
                              className="w-32 rounded border border-slate-300 px-2 py-1 text-sm"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={f.type}
                              onChange={(e) => updateSubField(f.key, { type: e.target.value })}
                              className="rounded border border-slate-300 px-2 py-1 text-sm"
                            >
                              {['string', 'number', 'enum', 'boolean', 'date'].map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <button onClick={() => removeSubField(f.key)} className="text-xs text-rose-500 hover:text-rose-700">删除</button>
                          </td>
                        </tr>
                      ))}
                      {activeDs.subFields.length === 0 && (
                        <tr><td colSpan={4} className="px-3 py-4 text-center text-sm text-slate-400">暂无字段，点击「添加字段」创建</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Panel>

              {/* 接入参数 */}
              <Panel title="数据源接入参数">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <FormInput label="API 渠道" value={activeDs.apiChannel} onChange={(v) => updateActiveDs({ apiChannel: v })} />
                  <FormInput label="调用地址" value={activeDs.apiUrl} onChange={(v) => updateActiveDs({ apiUrl: v })} />
                  <FormInput label="超时时间（ms）" value={activeDs.apiTimeout} onChange={(v) => updateActiveDs({ apiTimeout: v })} type="number" />
                  <FormInput label="重试次数" value={activeDs.apiRetry} onChange={(v) => updateActiveDs({ apiRetry: v })} type="number" />
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormInput label="AppKey / 商户号" value={activeDs.appKey} onChange={(v) => updateActiveDs({ appKey: v })} />
                  <FormInput label="AppSecret" value={activeDs.appSecret} onChange={(v) => updateActiveDs({ appSecret: v })} />
                </div>
              </Panel>

              {/* 字段映射 */}
              <Panel
                title="字段映射"
                actions={<Button variant="secondary" size="sm" onClick={addFieldMapping}>+ 添加映射</Button>}
              >
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-3 py-2 text-left">系统内部字段</th>
                        <th className="px-3 py-2 text-left">映射目标字段</th>
                        <th className="px-3 py-2 text-left">数据类型</th>
                        <th className="px-3 py-2 text-left">必填</th>
                        <th className="px-3 py-2 text-left">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeDs.fieldMappings.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="px-3 py-2">
                            <input
                              value={m.systemField}
                              onChange={(e) => updateFieldMapping(idx, { systemField: e.target.value })}
                              className="w-32 rounded border border-slate-300 px-2 py-1 text-sm"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              value={m.targetField}
                              onChange={(e) => updateFieldMapping(idx, { targetField: e.target.value })}
                              className="w-32 rounded border border-slate-300 px-2 py-1 text-sm"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={m.type}
                              onChange={(e) => updateFieldMapping(idx, { type: e.target.value })}
                              className="rounded border border-slate-300 px-2 py-1 text-sm"
                            >
                              {['string', 'number', 'enum', 'boolean', 'date'].map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={m.required}
                              onChange={(e) => updateFieldMapping(idx, { required: e.target.checked })}
                              className="h-4 w-4 rounded border-slate-300"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <button onClick={() => removeFieldMapping(idx)} className="text-xs text-rose-500 hover:text-rose-700">删除</button>
                          </td>
                        </tr>
                      ))}
                      {activeDs.fieldMappings.length === 0 && (
                        <tr><td colSpan={5} className="px-3 py-4 text-center text-sm text-slate-400">暂无映射，点击「添加映射」创建</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Panel>

              {/* 判定条件 */}
              <Panel
                title="判定条件"
                actions={<Button variant="primary" size="sm" onClick={addRule}>+ 添加规则</Button>}
              >
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-3 py-2 text-left">启用</th>
                        <th className="px-3 py-2 text-left">优先级</th>
                        <th className="px-3 py-2 text-left">规则名称</th>
                        <th className="px-3 py-2 text-left">字段</th>
                        <th className="px-3 py-2 text-left">运算符</th>
                        <th className="px-3 py-2 text-left">阈值</th>
                        <th className="px-3 py-2 text-center">结论</th>
                        <th className="px-3 py-2 text-left">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeDs.judgeRules.map((rule) => (
                        <tr key={rule.id} className={cn('hover:bg-slate-50/60', !rule.enabled && 'opacity-50')}>
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={rule.enabled}
                              onChange={(e) => updateRule(rule.id, { enabled: e.target.checked })}
                              className="h-4 w-4 rounded border-slate-300 text-brand-600"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={rule.priority}
                              onChange={(e) => updateRule(rule.id, { priority: Number(e.target.value) })}
                              className="w-14 rounded border border-slate-300 px-2 py-1 text-center text-sm"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              value={rule.name}
                              onChange={(e) => updateRule(rule.id, { name: e.target.value })}
                              className="w-32 rounded border border-slate-300 px-2 py-1 text-sm"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={rule.field}
                              onChange={(e) => updateRule(rule.id, { field: e.target.value })}
                              className="rounded border border-slate-300 px-2 py-1 text-sm"
                            >
                              {activeDs.subFields.map((f) => (
                                <option key={f.key} value={f.key}>{f.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={rule.operator}
                              onChange={(e) => updateRule(rule.id, { operator: e.target.value as Operator })}
                              className="rounded border border-slate-300 px-2 py-1 text-sm"
                            >
                              {Object.entries(OP_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              value={rule.value}
                              onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                              className="w-28 rounded border border-slate-300 px-2 py-1 text-sm"
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <Badge kind={CONCLUSION_BADGE[rule.conclusion].kind}>{CONCLUSION_BADGE[rule.conclusion].text}</Badge>
                          </td>
                          <td className="px-3 py-2">
                            <button onClick={() => removeRule(rule.id)} className="text-xs text-rose-500 hover:text-rose-700">删除</button>
                          </td>
                        </tr>
                      ))}
                      {activeDs.judgeRules.length === 0 && (
                        <tr><td colSpan={8} className="px-3 py-6 text-center text-sm text-slate-400">暂无判定规则，点击「添加规则」创建</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Panel>

              {/* 结论映射 */}
              <Panel title="结论映射规则">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <FormSelect label="汇总模式" value={activeDs.conclusionMode} onChange={(v) => updateActiveDs({ conclusionMode: v })} options={['一票否决', '加权计分', '自定义规则']} />
                  <FormSelect label="默认结论" value={activeDs.defaultConclusion} onChange={(v) => updateActiveDs({ defaultConclusion: v })} options={['通过', '预警', '拒绝']} />
                  <FormSelect label="超时降级策略" value={activeDs.timeoutFallback} onChange={(v) => updateActiveDs({ timeoutFallback: v })} options={['返回超时标记', '忽略该项', '阻断流程']} />
                </div>
                <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
                  <p className="font-medium text-slate-700">当前「{activeDs.conclusionMode}」模式说明：</p>
                  <p>· 任一子字段结论 = 拒绝 → 整体结论 = 拒绝</p>
                  <p>· 无拒绝但有子字段 = 预警 → 整体结论 = 预警</p>
                  <p>· 全部子字段 = 通过 → 整体结论 = 通过</p>
                </div>
              </Panel>
            </>
          )}

          {/* 规则变更日志 */}
          <Panel title="规则变更日志">
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">版本号</th>
                    <th className="px-3 py-2 text-left">操作类型</th>
                    <th className="px-3 py-2 text-left">操作人</th>
                    <th className="px-3 py-2 text-left">操作时间</th>
                    <th className="px-3 py-2 text-left">变更摘要</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/60">
                    <td className="px-3 py-2 font-mono text-xs text-slate-600">V2.6</td>
                    <td className="px-3 py-2"><Badge kind="green">生效</Badge></td>
                    <td className="px-3 py-2 text-slate-600">风控主管-王芳</td>
                    <td className="px-3 py-2 text-slate-500">2026-07-21 14:30</td>
                    <td className="px-3 py-2 text-slate-600">新增运营商入网时长阈值规则（&lt;30天预警）</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="px-3 py-2 font-mono text-xs text-slate-600">V2.5</td>
                    <td className="px-3 py-2"><Badge kind="blue">编辑</Badge></td>
                    <td className="px-3 py-2 text-slate-600">风控专员-张磊</td>
                    <td className="px-3 py-2 text-slate-500">2026-06-20 10:15</td>
                    <td className="px-3 py-2 text-slate-600">调整设备群控关联身份数阈值：2→3</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="px-3 py-2 font-mono text-xs text-slate-600">V2.4</td>
                    <td className="px-3 py-2"><Badge kind="gray">下线</Badge></td>
                    <td className="px-3 py-2 text-slate-600">系统管理员</td>
                    <td className="px-3 py-2 text-slate-500">2026-05-15 18:00</td>
                    <td className="px-3 py-2 text-slate-600">规则集下线归档，由 V2.5 替代</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Panel>

          {/* 底部操作栏（抽屉模式） */}
          {(onSave || onCancel) && (
            <div className="sticky bottom-0 -mx-6 -mb-6 border-t border-slate-200 bg-white px-6 py-3">
              <div className="flex items-center justify-end gap-2">
                {onCancel && <Button variant="ghost" onClick={onCancel}>取消</Button>}
                <Button variant="primary" onClick={onSave}>保存</Button>
                {globalStatus !== '已生效' && (
                  <Button variant="secondary" onClick={() => setGlobalStatus('已生效')}>上线</Button>
                )}
                {globalStatus === '已生效' && (
                  <Button variant="ghost" onClick={() => setGlobalStatus('已下线')}>下线</Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* ───── 新增数据源弹窗 ───── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-1 text-base font-semibold text-ink-900">新增数据源</h3>
            <p className="mb-4 text-xs text-slate-500">添加到当前规则集中，可后续配置字段与判定规则</p>
            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-slate-500">数据源名称</label>
              <input
                value={newDsName}
                onChange={(e) => setNewDsName(e.target.value)}
                placeholder="如：社保缴纳核验"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-slate-500">选择图标</label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((ico) => (
                  <button
                    key={ico.key}
                    onClick={() => setNewDsIcon(ico.key)}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg border transition',
                      newDsIcon === ico.key
                        ? 'border-brand-400 bg-brand-50 text-brand-600'
                        : 'border-slate-200 text-slate-400 hover:border-slate-300'
                    )}
                    title={ico.label}
                  >
                    <IconSvg name={ico.key} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>取消</Button>
              <Button variant="primary" onClick={addDataSource}>确认添加</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
