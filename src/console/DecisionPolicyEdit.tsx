// 决策引擎 · 策略编辑页（策略管理 tab 点击「编辑」/策略名称进入）
// 左侧：基本信息（名称/编码/拒绝阈值/审核阈值）
// 右侧：决策表 - 行条件配置（可折叠行：行名/得分/条件列表，支持复制/删除/添加行/保存）
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDecision, updateDecision, DE_CONDITION_OPS, buildConditionExpr, type DeDecisionRow, type DePolicyCondition, type DeModelFeature } from './decisionData'
import { DetailHeader, Button, SingleSelect } from '../components/ui'
import { Sam } from './SourceTag'
import { useDecisionToast } from './useDecisionToast'

function PolicyRowCard({ row, index, open, onToggle, onChange, onCopy, onDelete, featureList }: {
  row: DeDecisionRow; index: number; open: boolean; onToggle: () => void;
  onChange: (row: DeDecisionRow) => void; onCopy: () => void; onDelete: () => void;
  /** 模型特征库：条件字段的候选池（标准化选择，替代手敲） */
  featureList: DeModelFeature[];
}) {
  const setScore = (v: number) => onChange({ ...row, score: v })
  const setCond = (i: number, c: DePolicyCondition) => {
    const conditions = row.conditions.map((x, j) => (j === i ? c : x))
    onChange({ ...row, conditions })
  }
  /** 选字段：从特征库选择并自动刷新操作符/值 */
  const pickField = (i: number, code: string) => {
    const feat = featureList.find((f) => f.code === code)
    const c = row.conditions[i]
    const next = {
      ...c,
      field: code,
      fieldName: feat?.name ?? '',
      op: feat ? DE_CONDITION_OPS[feat.dataType]?.[0] ?? '=' : '=',
      value: c.value ?? '',
      expr: feat && c.value ? buildConditionExpr(code, DE_CONDITION_OPS[feat.dataType]?.[0] ?? '=', c.value) : c.expr ?? '',
    }
    setCond(i, next)
  }
  const pickOp = (i: number, op: string) => {
    const c = row.conditions[i]
    setCond(i, { ...c, op, expr: c.value ? buildConditionExpr(c.field, op, c.value) : c.expr })
  }
  const pickValue = (i: number, value: string) => {
    const c = row.conditions[i]
    setCond(i, { ...c, value, expr: c.op ? buildConditionExpr(c.field, c.op, value) : c.expr })
  }
  const addCond = () => onChange({ ...row, conditions: [...row.conditions, { field: '', expr: '' }] })
  const delCond = (i: number) => onChange({ ...row, conditions: row.conditions.filter((_, j) => j !== i) })

  return (
    <div className="overflow-hidden rounded-xl border border-slate-100">
      <div className="flex items-center gap-3 bg-slate-50/50 px-4 py-2.5">
        <span className="cursor-grab text-slate-300">⠿</span>
        <button onClick={onToggle} className="text-slate-400 transition" title={open ? '折叠' : '展开'}>
          <span className={`inline-block transition ${open ? 'rotate-90' : ''}`}>▸</span>
        </button>
        <span className="text-sm font-medium text-ink-900">{row.name}</span>
        <span className="text-xs text-slate-400">得分: {row.score} | 条件: {row.conditions.length}</span>
        <span className="ml-auto flex items-center gap-3 text-sm">
          <button className="text-brand-600 hover:underline" onClick={onCopy}>复制</button>
          <button className="text-rose-600 hover:underline" onClick={onDelete}>删除</button>
        </span>
      </div>
      {open && (
        <div className="space-y-3 border-t border-slate-100 px-4 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-500">
              行名称
              <input value={row.name} onChange={(e) => onChange({ ...row, name: e.target.value })}
                className="h-8 w-56 rounded-lg border border-slate-200 px-2 text-sm focus:border-brand-300 focus:outline-none" />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-500">
              得分
              <input type="number" value={row.score} onChange={(e) => setScore(Number(e.target.value))}
                className="h-8 w-24 rounded-lg border border-slate-200 px-2 text-sm focus:border-brand-300 focus:outline-none" />
            </label>
          </div>

          {/* 条件列表：标准化「字段 / 操作符 / 值」编辑器，表达式自动拼装 */}
          <div className="space-y-2">
            {row.conditions.map((c, i) => {
              const feat = featureList.find((f) => f.code === c.field)
              const ops = DE_CONDITION_OPS[feat?.dataType ?? 'STRING'] ?? ['=', '!=']
              const isBool = feat?.dataType === 'BOOLEAN'
              return (
                <div key={i} className="flex items-center gap-2">
                  <SingleSelect label="字段…（从特征库选择）" clearable width={176} value={c.field} onChange={(v) => pickField(i, v)}
                    options={[{ value: '', label: '字段…（从特征库选择）' }, ...featureList.map((f) => ({ value: f.code, label: `${f.name}（${f.code}）· ${f.category}` }))]} />
                  <SingleSelect label="操作符" width={80} value={c.op ?? (ops[0] ?? '=')} onChange={(v) => pickOp(i, v)}
                    options={ops.map((o) => ({ value: o, label: o }))} />
                  {isBool ? (
                    <SingleSelect label="值…" clearable width={96} value={c.value ?? ''} onChange={(v) => pickValue(i, v)}
                      options={[{ value: '', label: '值…' }, { value: 'true', label: '是' }, { value: 'false', label: '否' }]} />
                  ) : (
                    <input value={c.value ?? ''} placeholder="值"
                      onChange={(e) => pickValue(i, e.target.value)}
                      className="h-8 w-32 rounded-lg border border-slate-200 px-2 text-sm focus:border-brand-300 focus:outline-none" />
                  )}
                  <code className="flex-1 truncate rounded bg-slate-50 px-2 py-1.5 font-mono text-xs text-slate-500">{c.expr || '—'}</code>
                  <button className="text-rose-600 hover:underline" onClick={() => delCond(i)}>−</button>
                </div>
              )
            })}
            {row.conditions.length === 0 && <div className="rounded border border-dashed border-slate-200 px-2 py-2 text-center text-xs text-slate-400">暂无条件，点击下方新增</div>}
            <Button size="sm" variant="ghost" onClick={addCond}>+ 条件</Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DecisionPolicyEditPage({ search }: { search: string }) {
  const d = useDecision()
  const nav = useNavigate()
  const toast = useDecisionToast()
  const [sp] = useSearchParams()
  const mid = sp.get('mid') ?? new URLSearchParams(search).get('mid') ?? ''
  const pid = sp.get('pid') ?? ''
  const model = d.models.find((m) => m.id === mid)
  const policy = model?.policies.find((p) => p.id === pid)

  const [name, setName] = useState(policy?.name ?? '')
  const [reject, setReject] = useState(policy?.rejectThreshold ?? 80)
  const [review, setReview] = useState(policy?.reviewThreshold ?? 50)
  const [rows, setRows] = useState<DeDecisionRow[]>(() => policy?.rows ?? [])
  const [openRows, setOpenRows] = useState<Record<number, boolean>>({})
  const [allExpanded, setAllExpanded] = useState(true)

  if (!model || !policy) {
    return (
      <>
        <DetailHeader title="策略详情" crumb="决策引擎 / 决策建模 / 模型管理 / 策略管理 / 策略详情" backTo={`/console/de/model-detail?mid=${mid}`} />
        <div className="mt-6 rounded-xl border border-slate-100 p-6 text-sm text-slate-400">未找到该策略，请返回策略管理。</div>
      </>
    )
  }

  const toggleRow = (i: number) => {
    setAllExpanded(true)
    setOpenRows((prev) => ({ ...prev, [i]: !isRowOpen(i) }))
  }

  const save = () => {
    updateDecision((dd) => ({
      ...dd,
      models: dd.models.map((m) => m.id === model.id
        ? { ...m, policies: m.policies.map((p) => (p.id === policy.id
            ? { ...p, name, rejectThreshold: reject, reviewThreshold: review, rows } : p)) }
        : m),
    }))
  }

  const isRowOpen = (i: number) => allExpanded ? (openRows[i] !== false) : (openRows[i] === true)

  return (
    <>
      <DetailHeader
        title={`策略详情 - ${policy.name}`}
        crumb="决策引擎 / 决策建模 / 模型管理 / 策略管理 / 策略详情"
        backTo={`/console/de/model-detail?mid=${model.id}`}
      />
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 左侧基本信息 */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-2xl border border-slate-100 bg-white shadow-card">
            <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-ink-900">基本信息</div>
            <div className="space-y-4 p-4">
              <div>
                <label className="mb-1 block text-sm text-slate-500">策略名称</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-500">策略编码</label>
                <input value={policy.code} disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-500">拒绝阈值</label>
                <input type="number" value={reject} onChange={(e) => setReject(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-500">审核阈值</label>
                <input type="number" value={review} onChange={(e) => setReview(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* 右侧决策表行条件配置 */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-100 bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <span className="text-sm font-semibold text-ink-900">决策表 - 行条件配置</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost">批量操作</Button>
                <Button size="sm" variant="ghost" onClick={() => setAllExpanded((v) => !v)}>全部{allExpanded ? '折叠' : '展开'}</Button>
                <Button size="sm" onClick={() => setRows((prev) => [...prev, { name: '新行', score: 0, conditions: [] }])}>添加行</Button>
              </div>
            </div>
            <div className="space-y-3 p-4">
              {rows.map((row, i) => (
                <PolicyRowCard key={i} row={row} index={i} open={isRowOpen(i)}
                  featureList={model.featureList}
                  onToggle={() => toggleRow(i)}
                  onChange={(r) => setRows((prev) => prev.map((x, j) => (j === i ? r : x)))}
                  onCopy={() => setRows((prev) => [...prev.slice(0, i + 1), { ...row, name: row.name + '-副本' }, ...prev.slice(i + 1)])}
                  onDelete={() => setRows((prev) => prev.filter((_, j) => j !== i))}
                />
              ))}
            </div>
            <div className="border-t border-slate-100 px-4 py-3">
              <Button onClick={() => { save(); toast.show('已保存决策表') }}>保存决策表</Button>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <Sam value="models.policies.rows" /> 决策表数据样例来自本地 JSON，后台按此契约实现接口后由后台更新。
          </div>
        </div>
      </div>
      {toast.toastEl}
    </>
  )
}
