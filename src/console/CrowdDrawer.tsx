/* 客户分组 · 新增/编辑抽屉（共享组件：分组卡片页 + 客户列表页共用入口）
 * 规则用 CondBuilder（复用指标库条件构造器）；成员数实时求值返回（不可手输）；预览前 20 条。
 */
import { useEffect, useMemo, useState } from 'react'
import { Button, Badge, RightDrawer } from '../components/ui'
import { CondBuilder, emptyFilter, type VFilter } from './CondBuilder'
import { CROWD_FIELDS, crowdMembers, crowdRuleText, crowdRuleValid } from './crowdRule'
import type { MidCustomer } from './midData'
import type { CrowdGroup } from './scoreData'

const now = () => new Date().toISOString().slice(0, 10)
const PREVIEW_N = 20

function riskKindOf(level?: string): 'red' | 'amber' | 'green' {
  const l = (level ?? '').replace('风险', '')
  if (l === '高') return 'red'
  if (l === '中') return 'amber'
  return 'green'
}

export function CrowdDrawer({ open, onClose, editing, customers, onSave }: {
  open: boolean
  onClose: () => void
  editing: CrowdGroup | null          // null = 新增；非空 = 编辑该分组
  customers: MidCustomer[]
  onSave: (g: CrowdGroup) => void     // 保存回调（由调用方决定写回方式）
}) {
  const [name, setName] = useState('')
  const [filter, setFilter] = useState<VFilter>(emptyFilter())

  /* 每次打开时重置表单（编辑回填 / 新增清空） */
  useEffect(() => {
    if (!open) return
    setName(editing?.name ?? '')
    const list = (editing?.conds ?? []).filter((c) => c.field)
    setFilter({ logic: editing?.logic ?? 'and', groups: [], loose: list.length ? list : [{ field: '', op: 'eq', value: '' }] })
  }, [open, editing])

  const conds = filter.loose ?? []
  const members = useMemo(() => crowdMembers({ conds, logic: filter.logic }, customers), [conds, filter.logic, customers])
  const valid = crowdRuleValid(conds)
  const ruleText = useMemo(() => crowdRuleText(conds, filter.logic), [conds, filter.logic])
  // 规则未生效（未配置/无命中）时回落到样例客户，保证预览列表不为空，便于确认字段形态
  const matched = valid && members.length > 0
  const previewList = matched ? members : customers.slice(0, PREVIEW_N)

  const save = () => {
    const n = name.trim()
    if (!n || !valid) return
    const base = conds.filter((c) => c.field)
    const g: CrowdGroup = editing
      ? { ...editing, name: n, rule: ruleText, conds: base, logic: filter.logic, count: members.length, updatedAt: now() }
      : { id: 'g-' + Date.now().toString(36), name: n, rule: ruleText, conds: base, logic: filter.logic, count: members.length, createdAt: now(), updatedAt: now() }
    onSave(g)
    onClose()
  }

  return (
    <RightDrawer open={open} onClose={onClose} title={editing ? `编辑分组 · ${editing.name}` : '新增客户分组'} width={640}>
      <div className="space-y-4">
        <div>
          <div className="mb-1 text-xs text-slate-500">分组名称 *</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如：智融分大于 680 的客户"
            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink-900 outline-none focus:border-brand-400"
          />
        </div>

        {/* 规则编辑器（复用指标库条件构造器：选字段 / 操作符 / 值 / 且或） */}
        <div>
          <div className="mb-1 text-xs text-slate-500">分组规则（满足条件即入选）</div>
          <CondBuilder
            title="规则条件"
            value={filter}
            fields={CROWD_FIELDS.map((f) => ({ ref: f.ref, label: `${f.label}（${f.group}）` }))}
            onChange={setFilter}
            showLogicHint={false}
          />
          <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            规则：<span className="font-medium text-ink-900">{valid ? ruleText : '尚未完整配置规则'}</span>
          </div>
        </div>

        {/* 实时预览：成员数 + 前 20 条（成员数由规则返回，不可编辑；规则未生效时回落样例客户，列表不空） */}
        <div className="rounded-xl border border-slate-200 p-3">
          <div className="mb-2 flex items-baseline gap-3">
            <span className="text-sm font-semibold text-ink-900">规则预览</span>
            <span className="text-xs text-slate-400">{matched ? '成员数由规则计算返回，不可编辑' : '以下为样例客户（配置完整规则后展示命中结果）'}</span>
            <span className="ml-auto text-lg font-bold text-brand-600 tabular-nums">{matched ? members.length : customers.length}</span>
            <span className="text-xs text-slate-400">{matched ? `命中 / 共 ${customers.length} 客户` : '样例客户'}</span>
          </div>
          <div className="max-h-[300px] overflow-auto rounded-lg border border-slate-100">
            {previewList.map((c, i) => (
              <div
                key={c?.custId ?? ''}
                className="flex items-center gap-2 border-b border-slate-50 px-2 py-1.5 text-xs text-slate-500 last:border-b-0 hover:bg-slate-50"
              >
                <span className="w-5 text-right text-slate-300 tabular-nums">{i + 1}</span>
                <span className="font-medium text-ink-900">{c?.custId ?? '—'}</span>
                <span>{c?.name ?? '—'}</span>
                <span className="text-slate-400">{c?.product ?? '—'}</span>
                <Badge kind={riskKindOf(c?.riskLevel)}>{(c?.riskLevel ?? '—').replace('风险', '')}</Badge>
                <span className="ml-auto tabular-nums">智融 {c?.scores?.zhirong?.score ?? '—'}</span>
              </div>
            ))}
          </div>
          {matched && members.length > PREVIEW_N && (
            <div className="mt-1 text-right text-[11px] text-slate-400">仅展示前 {PREVIEW_N} 条，共命中 {members.length} 条</div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
          <Button size="sm" variant="ghost" onClick={onClose}>取消</Button>
          <Button size="sm" variant="primary" onClick={save} disabled={!name.trim() || !valid}>
            {editing ? '保存修改' : '确认新增'}
          </Button>
        </div>
      </div>
    </RightDrawer>
  )
}
