import { useState } from 'react'
import { useScore, updateScore, type AlertRule } from './scoreData'
import { PageShell } from './PageShell'
import { Panel, DataTable, Button, Modal, type Column, type Row } from '../components/ui'
import { Cfg } from './SourceTag'

function levelKind(level: string): 'red' | 'amber' | 'blue' | 'green' | 'gray' {
  if (level === '高') return 'red'
  if (level === '中') return 'amber'
  if (level === '低') return 'blue'
  return 'gray'
}

export default function ScoreAlertRulePage() {
  const data = useScore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', cond: '', threshold: 0, level: '中' })

  const toggle = (id: string) =>
    updateScore((d) => ({
      ...d,
      alertRules: d.alertRules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    }))

  const addRule = () => {
    updateScore((d) => ({
      ...d,
      alertRules: [
        ...d.alertRules,
        { id: `AR-${Date.now()}`, name: form.name || '未命名规则', cond: form.cond || '自定义条件', threshold: Number(form.threshold) || 0, level: form.level, enabled: true },
      ],
    }))
    setForm({ name: '', cond: '', threshold: 0, level: '中' })
    setOpen(false)
  }

  const cols: Column[] = [
    { key: 'name', label: '规则名称', width: '200px' },
    { key: 'cond', label: '条件', width: '260px' },
    { key: 'threshold', label: '阈值', type: 'text', width: '100px' },
    { key: 'level', label: '等级', type: 'badge', badgeKind: 'gray', width: '100px' },
    { key: 'status', label: '生效状态', type: 'badge', badgeKind: 'gray', width: '100px' },
    {
      key: 'op',
      label: '操作',
      width: '100px',
      render: (r: Row) => {
        const id = r.id as string
        const r0 = data.alertRules.find((x) => x.id === id)!
        return (
          <Button size="sm" variant="ghost" onClick={() => toggle(id)}>
            {r0.enabled ? '停用' : '启用'}
          </Button>
        )
      },
    },
  ]
  const rows: Row[] = data.alertRules.map((r: AlertRule) => ({
    id: r.id,
    name: r.name,
    cond: r.cond,
    threshold: r.threshold,
    level: { v: r.level, kind: levelKind(r.level) },
    status: r.enabled ? { v: '启用', kind: 'green' } : { v: '停用', kind: 'gray' },
  }))

  return (
    <>
      <PageShell
        title="预警规则"
        crumb="评分产品 / 策略配置"
        actions={<Button size="sm" variant="primary" onClick={() => setOpen(true)}>新增规则</Button>}
      />
      <div className="space-y-4">
        <Panel title="预警规则" desc="阈值/规则命中触发预警，支持启停" actions={<Cfg value="scoreData.json" />}>
          <DataTable columns={cols} rows={rows} empty="暂无规则" pager defaultPageSize={10} />
        </Panel>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="新增预警规则">
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm text-slate-500">规则名称</span>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" />
          </label>
          <label className="block">
            <span className="text-sm text-slate-500">条件</span>
            <input value={form.cond} onChange={(e) => setForm((f) => ({ ...f, cond: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-slate-500">阈值</span>
              <input type="number" value={form.threshold} onChange={(e) => setForm((f) => ({ ...f, threshold: Number(e.target.value) }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" />
            </label>
            <label className="block">
              <span className="text-sm text-slate-500">等级</span>
              <select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400">
                <option value="高">高</option>
                <option value="中">中</option>
                <option value="低">低</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>取消</Button>
            <Button variant="primary" onClick={addRule}>确认新增</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
