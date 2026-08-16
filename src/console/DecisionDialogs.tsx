// 决策引擎 · 弹窗组件（名单记录 / 新建名单库 / 编辑特征 / 关联模型 / 创建回放 / 创建批量决策 / 告警规则 / 通知渠道 / 审批）
import { useState } from 'react'
import { useDecision, updateDecision, type DeList, type DeFeature, type DeExternalApi, type DeListRecord, type DeAlertRule, type DeNotifyChannel } from './decisionData'
import { Modal, Button, DataTable, StatCard, RightDrawer, SingleSelect, SelectField, type Column, type Row } from '../components/ui'

const FIELD = 'mb-4'

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1 block text-sm text-slate-600">
      {required && <span className="mr-0.5 text-rose-500">*</span>}{children}
    </label>
  )
}

function inputCls(disabled?: boolean) {
  return `w-full rounded-lg border border-slate-200 px-3 py-2 text-sm ${disabled ? 'bg-slate-50 text-slate-400' : 'focus:border-brand-300 focus:outline-none'}`
}

/* ============================================================
 * 名单记录（管理记录弹窗）
 * ========================================================== */
export function ListRecordDialog({ list, open, onClose }: { list: DeList | null; open: boolean; onClose: () => void }) {
  const [kw, setKw] = useState('')
  const [sel, setSel] = useState<Set<string>>(new Set())
  const recs = (list?.records ?? []).filter((r) => !kw || r.value.includes(kw))
  const st = list?.stat ?? { valid: 0, expired: 0, expiring: 0 }

  const cols: Column[] = [
    { key: 'value', label: '键值', render: (r) => <code className="text-slate-700">{r.value}</code> },
    { key: 'ext', label: '扩展属性', render: (r) => <span className="text-slate-500">{r.ext || '—'}</span> },
    { key: 'expireAt', label: '过期时间', render: (r) => r.expireAt ? <span className="text-slate-500">{r.expireAt}</span> : <span className="text-slate-400">—</span> },
    { key: 'createdAt', label: '创建时间', width: '140px' },
  ]
  const rows: Row[] = recs.map((r) => ({
    id: r.id, value: r.value, ext: r.ext, expireAt: r.expireAt, createdAt: r.createdAt,
  }))

  const toggle = (id: string) => {
    setSel((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  return (
    <Modal open={open} onClose={onClose} title={`名单记录 - ${list?.name ?? ''}`} width="max-w-3xl"
      footer={<><Button variant="ghost" onClick={onClose}>关 闭</Button><Button onClick={onClose}>确 定</Button></>}>
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="有效记录" value={st.valid} accent="emerald" />
        <StatCard label="已过期" value={st.expired} accent="rose" />
        <StatCard label="即将过期(7天)" value={st.expiring} accent="amber" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="搜索键值"
          className="h-8 w-52 rounded-lg border border-slate-200 px-2 text-sm focus:outline-none" />
        <Button size="sm" variant="ghost">批量导入</Button>
        <Button size="sm" variant="ghost">批量导出</Button>
        <Button size="sm" variant="ghost">批量删除({sel.size})</Button>
        <Button size="sm" variant="ghost">批量延期</Button>
        <Button size="sm" variant="ghost">清理过期</Button>
        <Button size="sm" onClick={() => {}}>添加记录</Button>
      </div>
      <div className="mt-3">
        <DataTable columns={cols} rows={rows} pager defaultPageSize={10}
          actions={(r) => (
            <div className="flex gap-3 text-sm">
              <button className="text-brand-600 hover:underline">编辑</button>
              <button className="text-rose-600 hover:underline">删除</button>
              <button className="text-slate-500 hover:underline">延期</button>
            </div>
          )}
        />
      </div>
    </Modal>
  )
}

/* ============================================================
 * 新建名单库弹窗
 * ========================================================== */
export function NewListDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [kind, setKind] = useState<DeList['kind']>('黑名单')
  const [matchKey, setMatchKey] = useState('手机号')
  const [strategy, setStrategy] = useState('精确匹配')

  const submit = () => {
    updateDecision((dd) => ({
      ...dd,
      lists: [...dd.lists, {
        id: 'L-' + Date.now(), name, code, kind, matchKey, matchStrategy: strategy as DeList['matchStrategy'],
        source: '人工导入', recordCount: 0, createdAt: '2026-08-14', records: [], stat: { valid: 0, expired: 0, expiring: 0 },
      }],
    }))
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="新建名单库" width="max-w-lg"
      footer={<><Button variant="ghost" onClick={onClose}>取 消</Button><Button onClick={submit} disabled={!name || !code}>确 定</Button></>}>
      <div className={FIELD}>
        <Label required>名单名称</Label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入名单名称" className={inputCls()} />
      </div>
      <div className={FIELD}>
        <Label required>名单编码</Label>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="如: blacklist_xxx" className={inputCls()} />
      </div>
      <div className={FIELD}>
        <Label required>名单类型</Label>
        <SingleSelect label="选择名单类型" fullWidth value={kind} onChange={(v) => setKind(v as DeList['kind'])}
          options={[{ value: '黑名单', label: '黑名单' }, { value: '灰名单', label: '灰名单' }, { value: '白名单', label: '白名单' }]} />
      </div>
      <div className={FIELD}>
        <Label required>匹配键</Label>
        <SingleSelect label="选择匹配键" fullWidth value={matchKey} onChange={setMatchKey}
          options={['手机号', '身份证', 'IP', '设备ID', '地址', '城市', '姓名'].map((k) => ({ value: k, label: k }))} />
      </div>
      <div className={FIELD}>
        <Label required>匹配策略</Label>
        <SingleSelect label="选择匹配策略" fullWidth value={strategy} onChange={setStrategy}
          options={[{ value: '精确匹配', label: '精确匹配' }, { value: '模糊匹配', label: '模糊匹配' }, { value: '正则匹配', label: '正则匹配' }]} />
      </div>
    </Modal>
  )
}

/* ============================================================
 * 编辑特征弹窗
 * ========================================================== */
export function EditFeatureDialog({ feature, open, onClose }: { feature: DeFeature | null; open: boolean; onClose: () => void }) {
  const [name, setName] = useState(feature?.name ?? '')
  const [dataType, setDataType] = useState(feature?.dataType ?? 'NUMBER')
  const [mode, setMode] = useState<DeExternalApi['mode']>(feature?.externalApi?.mode ?? 'DATASOURCE')
  const [datasource, setDatasource] = useState(feature?.externalApi?.datasource ?? '91001')
  const [path, setPath] = useState(feature?.externalApi?.responsePath ?? 'data')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [desc, setDesc] = useState(feature?.desc ?? '')
  const isExternal = feature?.type === '外部'

  const addTag = () => { if (tagInput.trim()) { setTags([...tags, tagInput.trim()]); setTagInput('') } }

  const submit = () => {
    if (!feature) return
    updateDecision((dd) => ({
      ...dd,
      features: dd.features.map((f) => f.id === feature.id
        ? { ...f, name, dataType, desc, sceneTag: tags.length ? tags.join(',') : f.sceneTag, externalApi: isExternal ? { mode, datasource, responsePath: path } : f.externalApi } : f),
    }))
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="编辑特征" width="max-w-xl"
      footer={<><Button variant="ghost" onClick={onClose}>取 消</Button><Button onClick={submit}>确 定</Button></>}>
      <div className={FIELD}>
        <Label required>特征名称</Label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="输入特征名称" className={inputCls()} />
      </div>
      <div className={FIELD}>
        <Label required>特征编码</Label>
        <input value={feature?.code ?? ''} disabled placeholder="如: user_age" className={inputCls(true)} />
      </div>
      <div className={FIELD}>
        <Label required>特征类型</Label>
        <input value={feature?.type ?? ''} disabled className={inputCls(true)} />
      </div>
      <div className={FIELD}>
        <Label required>数据类型</Label>
        <SingleSelect label="选择数据类型" fullWidth value={dataType} onChange={setDataType}
          options={[{ value: 'NUMBER', label: 'NUMBER' }, { value: 'STRING', label: 'STRING' }, { value: 'BOOLEAN', label: 'BOOLEAN' }]} />
      </div>

      {isExternal && (
        <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50/40 p-3">
          <div className="mb-2 text-sm font-medium text-slate-700">外部API配置</div>
          <div className={FIELD}>
            <Label>取数方式</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 text-sm text-slate-600">
                <input type="radio" checked={mode === 'INLINE'} onChange={() => setMode('INLINE')} /> 内联HTTP配置
              </label>
              <label className="flex items-center gap-1.5 text-sm text-slate-600">
                <input type="radio" checked={mode === 'DATASOURCE'} onChange={() => setMode('DATASOURCE')} /> 选择已有数据源
              </label>
            </div>
          </div>
          {mode === 'DATASOURCE' ? (
            <div className={FIELD}>
              <Label required>数据源</Label>
              <SingleSelect label="选择数据源" fullWidth value={datasource} onChange={setDatasource}
                options={[{ value: '91001', label: '91001' }, { value: '91002', label: '91002' }, { value: '91003', label: '91003' }]} />
            </div>
          ) : (
            <div className={FIELD}>
              <Label required>HTTP 地址</Label>
              <input placeholder="https://api.example.com/feature" className={inputCls()} />
            </div>
          )}
          <div className={FIELD}>
            <Label>提取路径</Label>
            <input value={path} onChange={(e) => setPath(e.target.value)} placeholder="如: data.score 从JSON响应中提取" className={inputCls()} />
          </div>
        </div>
      )}

      <div className={FIELD}>
        <Label>场景标签</Label>
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 px-2 py-1.5">
          {tags.map((t) => (
            <span key={t} className="flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              {t}<button onClick={() => setTags(tags.filter((x) => x !== t))} className="text-slate-400">✕</button>
            </span>
          ))}
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
            placeholder={tags.length ? '' : '输入标签后回车添加'} className="min-w-24 flex-1 bg-transparent text-sm focus:outline-none" />
        </div>
      </div>
      <div className={FIELD}>
        <Label>描述</Label>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="特征描述" rows={2} className={`${inputCls()} resize-y`} />
      </div>
    </Modal>
  )
}

/* ============================================================
 * 关联模型弹窗
 * ========================================================== */
export function BindModelDialog({ feature, open, onClose }: { feature: DeFeature | null; open: boolean; onClose: () => void }) {
  const d = useDecision()
  const [sel, setSel] = useState<string[]>(() => feature?.boundModels?.length ? feature.boundModels : (feature?.linkedModels ? feature.linkedModels.split('、') : []))

  const toggle = (name: string) => {
    setSel((prev) => prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name])
  }

  const submit = () => {
    if (!feature) return
    updateDecision((dd) => ({
      ...dd,
      features: dd.features.map((f) => f.id === feature.id ? { ...f, linkedModels: sel.join('、'), boundModels: sel } : f),
    }))
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="关联模型" width="max-w-lg"
      footer={<><Button variant="ghost" onClick={onClose}>取 消</Button><Button onClick={submit}>确 定</Button></>}>
      <p className="mb-3 text-sm text-slate-500">选择使用此特征的模型：</p>
      <div className="flex flex-wrap gap-2">
        {d.models.map((m) => {
          const checked = sel.includes(m.name)
          return (
            <button key={m.id} onClick={() => toggle(m.name)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition ${checked ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              <span className="grid h-4 w-4 place-items-center rounded border text-[10px]" style={{ borderColor: checked ? '#3b82f6' : '#cbd5e1', background: checked ? '#3b82f6' : 'transparent' }}>
                {checked && <span className="text-white">✓</span>}
              </span>
              {m.name}
            </button>
          )
        })}
      </div>
    </Modal>
  )
}

/* ============================================================
 * 快照详情弹窗（版本管理 - 查看）
 * ========================================================== */
const SNAPSHOT_JSON = JSON.stringify({
  model: {
    modelName: '注册测试',
    modelCode: 'reg_test',
    createTime: '2026-07-20T11:47:07',
    status: 1,
  },
  policies: [
    { policyName: '账号质量评分卡', policyCode: 'account_score', policyType: 3, highScore: 70, medianScore: 40, configJson: { scoreItems: [
      { field: 'register_duration_seconds', weight: 1, ranges: [{ min: 0, max: 5, score: 35 }, { min: 5, max: 15, score: 15 }, { min: 15, max: 9999, score: 0 }] },
    ] } },
    { policyName: '名单匹配策略', policyCode: 'blacklist_match', policyType: 5, highScore: 80, medianScore: 50, configJson: { matches: [
      { watchlistId: 8004, keyField: 'ip', listName: 'IP黑名单', score: 70 },
      { watchlistId: 8005, keyField: 'ip', listName: '代理IP灰名单', score: 40 },
    ] } },
    { policyName: '机器特征策略', policyCode: 'machine_pattern', policyType: 1, highScore: 80, medianScore: 50, _rules: [
      { ruleName: '无人机操作轨迹', conditionExpr: 'mouse_move_count == 0 || keystroke_interval_variance < 0.01', score: 60, priority: 160 },
      { ruleName: '注册流程过快', conditionExpr: 'register_duration_seconds < 5', score: 50, priority: 150 },
    ] },
    { policyName: '注册风险分级表', policyCode: 'register_tier', policyType: 4, highScore: 85, medianScore: 55, configJson: { rows: [
      { rowName: 'IP批量+设备农场+机器昵称-高危', score: 80, conditions: [{ field: 'ip_register_count_1h', expr: 'ip_register_count_1h >= 10' }] },
    ] } },
  ],
}, null, 2)

export function SnapshotDetailDialog({ open, onClose, target, version }: { open: boolean; onClose: () => void; target: string; version: string }) {
  return (
    <Modal open={open} onClose={onClose} title="快照详情" width="max-w-2xl"
      footer={<><Button variant="ghost" onClick={onClose}>关 闭</Button></>}>
      <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-2 rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-sm">
        <div><span className="text-slate-400">版本</span><span className="ml-2 font-medium text-ink-900">{version}</span></div>
        <div><span className="text-slate-400">目标</span><span className="ml-2 font-medium text-ink-900">{target}</span></div>
        <div><span className="text-slate-400">创建人</span><span className="ml-2 font-medium text-ink-900">admin</span></div>
        <div><span className="text-slate-400">创建时间</span><span className="ml-2 font-medium text-ink-900">2026-07-20T11:47:22</span></div>
        <div className="col-span-2"><span className="text-slate-400">变更说明</span><span className="ml-2 font-medium text-ink-900">审批通过，发布模型</span></div>
      </div>
      <div className="mb-1 text-sm font-medium text-ink-900">快照数据</div>
      <textarea readOnly value={SNAPSHOT_JSON} rows={12}
        className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50/60 p-3 font-mono text-xs leading-relaxed text-slate-700 focus:outline-none" />
    </Modal>
  )
}

/* ============================================================
 * 创建回放任务弹窗
 * ========================================================== */
export function CreateReplayDialog({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (data: Record<string, string>) => void }) {
  const d = useDecision()
  const [name, setName] = useState('')
  const [model, setModel] = useState('')
  const [source, setSource] = useState('历史决策日志')
  const [targetVer, setTargetVer] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  const submit = () => {
    onCreate({ name, model, source, targetVer, start, end })
    setName(''); setModel(''); setSource('历史决策日志'); setTargetVer(''); setStart(''); setEnd('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="创建回放任务" width="max-w-xl"
      footer={<><Button variant="ghost" onClick={onClose}>取 消</Button><Button onClick={submit} disabled={!name || !model}>确 定</Button></>}>
      <div className={FIELD}>
        <Label required>任务名称</Label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="输入任务名称" className={inputCls()} />
      </div>
      <div className={FIELD}>
        <Label required>模型</Label>
        <SingleSelect label="选择模型" clearable fullWidth value={model} onChange={setModel}
          options={[{ value: '', label: '选择模型' }, ...d.models.map((m) => ({ value: m.code, label: m.name }))]} />
      </div>
      <div className={FIELD}>
        <Label>数据源类型</Label>
        <SingleSelect label="数据源类型" fullWidth value={source} onChange={setSource}
          options={[{ value: '历史决策日志', label: '历史决策日志' }, { value: '事件数据仓库', label: '事件数据仓库' }]} />
      </div>
      <div className={FIELD}>
        <Label>目标版本</Label>
        <input value={targetVer} onChange={(e) => setTargetVer(e.target.value)} placeholder="不填则使用当前发布版" className={inputCls()} />
      </div>
      <div className={FIELD}>
        <Label>开始时间</Label>
        <input value={start} onChange={(e) => setStart(e.target.value)} placeholder="2026-01-01T00:00:00" className={inputCls()} />
      </div>
      <div className={FIELD}>
        <Label>结束时间</Label>
        <input value={end} onChange={(e) => setEnd(e.target.value)} placeholder="2026-12-31T23:59:59" className={inputCls()} />
      </div>
    </Modal>
  )
}

/* ============================================================
 * 创建批量决策任务弹窗
 * ========================================================== */
export function CreateBatchDialog({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (data: Record<string, string>) => void }) {
  const d = useDecision()
  const [name, setName] = useState('')
  const [model, setModel] = useState('')
  const [targetVer, setTargetVer] = useState('')
  const [file, setFile] = useState<string | null>(null)

  const submit = () => {
    onCreate({ name, model, targetVer, file: file ?? '' })
    setName(''); setModel(''); setTargetVer(''); setFile(null)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="创建批量决策任务" width="max-w-xl"
      footer={<><Button variant="ghost" onClick={onClose}>取 消</Button><Button onClick={submit} disabled={!name || !model}>确 定</Button></>}>
      <div className={FIELD}>
        <Label required>任务名称</Label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="输入任务名称" className={inputCls()} />
      </div>
      <div className={FIELD}>
        <Label required>模型</Label>
        <SingleSelect label="选择模型" clearable fullWidth value={model} onChange={setModel}
          options={[{ value: '', label: '选择模型' }, ...d.models.map((m) => ({ value: m.code, label: m.name }))]} />
      </div>
      <div className={FIELD}>
        <Label>目标版本</Label>
        <input value={targetVer} onChange={(e) => setTargetVer(e.target.value)} placeholder="不填则使用当前发布版" className={inputCls()} />
      </div>
      <div className={FIELD}>
        <Label required>CSV 文件</Label>
        <label className="block cursor-pointer rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center transition hover:border-brand-300 hover:bg-white">
          <input type="file" accept=".csv" className="hidden" onChange={(e) => setFile(e.target.files?.[0]?.name ?? null)} />
          <div className="text-2xl text-slate-300">⇪</div>
          <div className="mt-1 text-sm text-slate-500">点击或拖拽 CSV 文件到此区域</div>
          <div className="mt-1 text-xs text-slate-400">第一行为字段名，其余每行为一组事件数据（单次不超过 10000 行）</div>
          {file && <div className="mt-2 rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-600">已选择: {file}</div>}
        </label>
      </div>
    </Modal>
  )
}

/* ============================================================
 * 告警规则编辑弹窗
 * ========================================================== */
export function AlertRuleDialog({ rule, open, onClose, onConfirm }: { rule: DeAlertRule | null; open: boolean; onClose: () => void; onConfirm?: (data: { id: string; name: string; metricType: string; condition: string; threshold: number; level: string }) => void }) {
  const [name, setName] = useState(rule?.name ?? '')
  const [metricType, setMetricType] = useState(rule?.metricType ?? '通过率')
  const [scope, setScope] = useState('模型')
  const [cond, setCond] = useState(rule?.condition ?? '大于')
  const [threshold, setThreshold] = useState(rule?.threshold ?? 50)
  const [level, setLevel] = useState(rule?.level ?? '严重')
  const [cooldown, setCooldown] = useState(5)

  return (
    <Modal open={open} onClose={onClose} title={rule ? '编辑告警规则' : '新建告警规则'} width="max-w-lg"
      footer={<>
        <Button variant="ghost" onClick={onClose}>取 消</Button>
        <Button onClick={() => { onConfirm?.({ id: rule?.id ?? `R${Date.now().toString(36)}`, name, metricType, condition: cond, threshold, level }); onClose() }}>确 定</Button>
      </>}>
      <div className={FIELD}>
        <Label required>规则名称</Label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="输入规则名称" className={inputCls()} />
      </div>
      <div className={FIELD}>
        <Label required>指标类型</Label>
        <SingleSelect label="指标类型" fullWidth value={metricType} onChange={setMetricType}
          options={['通过率', '拒绝率', '耗时', '错误率', '命中量'].map((x) => ({ value: x, label: x }))} />
      </div>
      <div className={FIELD}>
        <Label>指标范围</Label>
        <SingleSelect label="指标范围" fullWidth value={scope} onChange={setScope}
          options={[{ value: '模型', label: '模型' }, { value: '策略', label: '策略' }, { value: '全局', label: '全局' }]} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className={FIELD}>
          <Label required>条件</Label>
          <SingleSelect label="条件" fullWidth value={cond} onChange={setCond}
            options={[{ value: '大于', label: '大于' }, { value: '小于', label: '小于' }, { value: '等于', label: '等于' }]} />
        </div>
        <div className={FIELD}>
          <Label required>阈值</Label>
          <input type="number" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className={inputCls()} />
        </div>
      </div>
      <div className={FIELD}>
        <Label required>严重程度</Label>
        <SingleSelect label="严重程度" fullWidth value={level} onChange={setLevel}
          options={[{ value: '严重', label: '严重' }, { value: '警告', label: '警告' }, { value: '提示', label: '提示' }]} />
      </div>
      <div className={FIELD}>
        <Label>冷却时间(分)</Label>
        <input type="number" value={cooldown} onChange={(e) => setCooldown(Number(e.target.value))} className={inputCls()} />
      </div>
      <div className={FIELD}>
        <Label>通知渠道</Label>
        <SelectField label="选择通知渠道" options={[{ value: '', label: '选择通知渠道' }, { value: '短信', label: '短信' }, { value: '邮件', label: '邮件' }, { value: 'Webhook', label: 'Webhook' }]} />
      </div>
    </Modal>
  )
}

/* ============================================================
 * 通知渠道编辑弹窗
 * ========================================================== */
export function NotifyChannelDialog({ channel, open, onClose, onConfirm }: { channel: DeNotifyChannel | null; open: boolean; onClose: () => void; onConfirm?: (data: { id: string; name: string; type: string; target: string }) => void }) {
  const [name, setName] = useState(channel?.name ?? '')
  const [type, setType] = useState(channel?.type ?? 'Webhook')
  const [target, setTarget] = useState('')

  return (
    <Modal open={open} onClose={onClose} title={channel ? '编辑通知渠道' : '新建通知渠道'} width="max-w-lg"
      footer={<>
        <Button variant="ghost" onClick={onClose}>取 消</Button>
        <Button onClick={() => { onConfirm?.({ id: channel?.id ?? `C${Date.now().toString(36)}`, name, type, target }); onClose() }}>确 定</Button>
      </>}>
      <div className={FIELD}>
        <Label required>渠道名称</Label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="输入渠道名称" className={inputCls()} />
      </div>
      <div className={FIELD}>
        <Label required>渠道类型</Label>
        <SingleSelect label="渠道类型" fullWidth value={type} onChange={setType}
          options={[{ value: 'Webhook', label: 'Webhook' }, { value: '短信', label: '短信' }, { value: '邮件', label: '邮件' }, { value: '企业微信', label: '企业微信' }]} />
      </div>
      <div className={FIELD}>
        <Label required>接收人/群</Label>
        <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="如：运营群 / 风控值班组 / https://..." className={inputCls()} />
      </div>
    </Modal>
  )
}

/* ============================================================
 * 审批通过弹窗
 * ========================================================== */
export function ApproveDialog({ approval, open, onClose, onConfirm }: { approval: { target: string; id?: string } | null; open: boolean; onClose: () => void; onConfirm?: (data: { id: string; comment: string }) => void }) {
  const [comment, setComment] = useState('')
  return (
    <Modal open={open} onClose={onClose} title="审批通过" width="max-w-md"
      footer={<>
        <Button variant="ghost" onClick={onClose}>取 消</Button>
        <Button onClick={() => { onConfirm?.({ id: approval?.id ?? '', comment }); onClose() }}>确 定</Button>
      </>}>
      <p className="mb-3 text-sm text-slate-600">
        确认通过后，模型「{approval?.target ?? ''}」的发布操作将立即执行。
      </p>
      <div className={FIELD}>
        <Label>审批意见</Label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="可选填写审批意见" rows={3} className={`${inputCls()} resize-y`} />
      </div>
    </Modal>
  )
}

/* ============================================================
 * 审批详情抽屉
 * ========================================================== */
export function ApprovalDetailDrawer({ approval, open, onClose }: { approval: { target: string; targetType: string; action: string; status: string; applicant: string } | null; open: boolean; onClose: () => void }) {
  return (
    <RightDrawer open={open} onClose={onClose} title="审批详情" width="w-96">
      <div className="space-y-4 p-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-sm">
          <div className="grid grid-cols-2 gap-y-2.5">
            <div><span className="text-slate-400">目标名称</span><div className="font-medium text-ink-900">{approval?.target}</div></div>
            <div><span className="text-slate-400">目标类型</span><div className="font-medium text-ink-900">{approval?.targetType}</div></div>
            <div><span className="text-slate-400">操作类型</span><div className="font-medium text-ink-900">{approval?.action}</div></div>
            <div><span className="text-slate-400">状态</span><div className="font-medium text-ink-900">{approval?.status}</div></div>
            <div><span className="text-slate-400">申请人</span><div className="font-medium text-ink-900">{approval?.applicant}</div></div>
            <div><span className="text-slate-400">审批人</span><div className="font-medium text-ink-900">test</div></div>
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm font-medium text-ink-900">审批流程</div>
          <div className="space-y-0">
            <TimelineItem time="2026-08-14 12:12" title="发起申请" actor="test" active />
            <TimelineItem time="等待审批中" title="待审批" actor="" last />
          </div>
        </div>
      </div>
    </RightDrawer>
  )
}

function TimelineItem({ time, title, actor, active, last }: { time: string; title: string; actor: string; active?: boolean; last?: boolean }) {
  return (
    <div className="relative flex gap-3 pb-6">
      {!last && <span className="absolute left-[7px] top-4 h-full w-px bg-slate-200" />}
      <span className={`relative z-10 mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full ${active ? 'bg-brand-500' : 'bg-slate-300'}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
      </span>
      <div>
        <div className="text-sm font-medium text-ink-900">{title}</div>
        {actor && <div className="text-xs text-slate-500">{actor}</div>}
        <div className="text-xs text-slate-400">{time}</div>
      </div>
    </div>
  )
}
