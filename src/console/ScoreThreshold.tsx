import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useScore, updateScore, SCORE_PROD_LABEL, type ScoreProd, type ThresholdRow } from './scoreData'
import { PageShell } from './PageShell'
import { Panel, DataTable, Button, Modal, type Column, type Row } from '../components/ui'
import { Cfg } from './SourceTag'

function levelKind(level: string): 'red' | 'amber' | 'blue' | 'green' | 'gray' {
  if (level.includes('低') || level === 'A') return 'green'
  if (level.includes('中') || level === 'B') return 'blue'
  if (level.includes('高') || level === 'C') return 'amber'
  if (level === 'D') return 'red'
  return 'gray'
}

export default function ScoreThresholdPage() {
  const data = useScore()
  const [params] = useSearchParams()
  const [prod, setProd] = useState<ScoreProd>(((params.get('prod') as ScoreProd) || 'zhicha'))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [actionVal, setActionVal] = useState('')
  // 新增阈值弹窗
  const [newOpen, setNewOpen] = useState(false)
  const [draft, setDraft] = useState({ range: '', level: '', meaning: '', action: '' })

  const editKey = (t: ThresholdRow) => `${t.prod}|${t.range}|${t.level}`
  const findT = (id: string) => {
    const [p, range, level] = id.split('|')
    return data.thresholds.find((t) => t.prod === p && t.range === range && t.level === level)!
  }
  const startEdit = (id: string) => {
    setActionVal(findT(id).action)
    setEditingId(id)
  }
  const saveAction = (id: string) => {
    updateScore((d) => ({
      ...d,
      thresholds: d.thresholds.map((t) =>
        editKey(t) === id ? { ...t, action: actionVal } : t,
      ),
    }))
    setEditingId(null)
  }
  const openNew = () => {
    setDraft({ range: '', level: '', meaning: '', action: '' })
    setNewOpen(true)
  }
  const confirmNew = () => {
    const range = draft.range.trim()
    const level = draft.level.trim()
    if (!range || !level) return
    updateScore((d) => ({
      ...d,
      thresholds: [
        ...d.thresholds,
        { prod, range, level, meaning: draft.meaning.trim(), action: draft.action.trim() },
      ],
    }))
    setNewOpen(false)
  }

  const cols: Column[] = [
    { key: 'range', label: '分数区间', width: '160px' },
    { key: 'level', label: '等级', type: 'badge', badgeKind: 'gray', width: '120px' },
    { key: 'meaning', label: '含义' },
    {
      key: 'action',
      label: '建议动作',
      render: (r: Row) => {
        const id = r.id as string
        if (editingId === id) {
          return (
            <div className="flex items-center gap-2">
              <input
                value={actionVal}
                onChange={(e) => setActionVal(e.target.value)}
                className="w-40 rounded border border-slate-200 px-2 py-1 text-sm outline-none focus:border-brand-400"
              />
              <Button size="sm" variant="primary" onClick={() => saveAction(id)}>保存</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>取消</Button>
            </div>
          )
        }
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm">{r.action as string}</span>
            <Button size="sm" variant="ghost" onClick={() => startEdit(id)}>编辑</Button>
          </div>
        )
      },
    },
  ]
  const rows: Row[] = data.thresholds
    .filter((t) => t.prod === prod)
    .map((t) => ({
      id: editKey(t),
      range: t.range,
      level: { v: t.level, kind: levelKind(t.level) },
      meaning: t.meaning,
      action: t.action,
    }))

  return (
    <>
      <PageShell
        title="评分阈值"
        crumb="评分产品 / 策略配置"
        actions={<Button size="sm" variant="primary" onClick={openNew}>新增阈值</Button>}
      />
      <div className="space-y-4">
        <div className="flex gap-2">
          {(['zhicha', 'zhixin', 'zhirong'] as ScoreProd[]).map((p) => (
            <Button key={p} variant={p === prod ? 'primary' : 'secondary'} size="sm" onClick={() => setProd(p)}>
              {SCORE_PROD_LABEL[p]}
            </Button>
          ))}
        </div>
        <Panel title={`评分阈值配置 · ${SCORE_PROD_LABEL[prod]}`} desc="分数区间 → 等级 → 含义 → 建议动作" actions={<Cfg value="scoreData.json" />}>
          <DataTable columns={cols} rows={rows} empty="暂无阈值" pager defaultPageSize={10} />
        </Panel>
      </div>

      <Modal open={newOpen} onClose={() => setNewOpen(false)} title={`新增阈值 · ${SCORE_PROD_LABEL[prod]}`}>
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">分数区间（如 0-40 / 41-69）</span>
            <input value={draft.range} onChange={(e) => setDraft({ ...draft, range: e.target.value })} placeholder="0-40"
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">等级（如 高 / 中 / 低 或 A-E）</span>
            <input value={draft.level} onChange={(e) => setDraft({ ...draft, level: e.target.value })} placeholder="高"
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">含义</span>
            <input value={draft.meaning} onChange={(e) => setDraft({ ...draft, meaning: e.target.value })} placeholder="欺诈风险极高，直接拒绝"
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">建议动作</span>
            <input value={draft.action} onChange={(e) => setDraft({ ...draft, action: e.target.value })} placeholder="拒绝 / 审慎授信 / 标准额度"
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400" />
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setNewOpen(false)}>取消</Button>
          <Button size="sm" variant="primary" onClick={confirmNew}>确认新增</Button>
        </div>
      </Modal>
    </>
  )
}
