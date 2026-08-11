import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useScore, updateScore, SCORE_PROD_LABEL, type ScoreProd, type ThresholdRow } from './scoreData'
import { PageShell } from './PageShell'
import { Panel, DataTable, Button, type Column, type Row } from '../components/ui'
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
  const addRow = () =>
    updateScore((d) => ({
      ...d,
      thresholds: [...d.thresholds, { prod, range: '新增区间', level: '新', meaning: '', action: '' }],
    }))

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
        actions={<Button size="sm" variant="primary" onClick={addRow}>新增阈值</Button>}
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
    </>
  )
}
