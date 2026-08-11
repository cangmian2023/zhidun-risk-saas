import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScore, SCORE_PROD_LABEL, updateScore, type ScoreProd, type ScoreRecord, type ScoreData } from './scoreData'
import { PageShell } from './PageShell'
import { Panel, StatCard, DataTable, Button, Badge, Modal } from '../components/ui'
import { Sam } from './SourceTag'

function levelKind(level: string): 'red' | 'amber' | 'green' | 'blue' {
  switch (level) {
    case '高': return 'red'
    case '中': return 'amber'
    case '低': return 'green'
    case 'A': return 'green'
    case 'B': return 'blue'
    case 'C': return 'amber'
    case 'D': return 'red'
    default: return 'gray'
  }
}

function modelKind(m: ScoreProd): 'red' | 'green' | 'violet' {
  return m === 'zhicha' ? 'red' : m === 'zhixin' ? 'green' : 'violet'
}

export default function ScoreRecordsPage() {
  const data = useScore()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [modelFilter, setModelFilter] = useState<'all' | ScoreProd>('all')
  const [importOpen, setImportOpen] = useState(false)
  const [csv, setCsv] = useState('')

  const filtered = data.records.filter((r) => {
    const matchQ = !q.trim() || r.custName.includes(q.trim()) || r.custId.includes(q.trim())
    const matchM = modelFilter === 'all' || r.model === modelFilter
    return matchQ && matchM
  })

  const failCount = data.records.filter((r) => r.status === 'fail').length

  const retry = (id: string) =>
    updateScore((d: ScoreData) => ({
      ...d,
      records: d.records.map((rec) => (rec.id === id ? { ...rec, status: 'success' as const } : rec)),
    }))

  const openImport = () => setImportOpen(true)
  const confirmImport = () => {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
    const recs: ScoreRecord[] = [
      { id: `R-IMP-${Date.now()}`, time: now, custId: 'CUST-IMPORT', custName: '导入客户', model: 'zhixin', score: 650, level: 'B', source: '批量', status: 'success' },
      { id: `R-IMP-${Date.now() + 1}`, time: now, custId: 'CUST-IMPORT', custName: '导入客户', model: 'zhirong', score: 720, level: 'A', source: '批量', status: 'success' },
    ]
    updateScore((d) => ({ ...d, records: [...recs, ...d.records] }))
    setImportOpen(false)
    setCsv('')
  }

  const columns = [
    { key: 'time', label: '时间' },
    {
      key: 'customer',
      label: '客户',
      render: (r: any) => (
        <div>
          <div className="font-medium text-ink-900">{r.custName}</div>
          <div className="text-xs text-slate-400">{r.custId}</div>
        </div>
      ),
    },
    {
      key: 'model',
      label: '模型',
      render: (r: any) => (
        <Badge kind={modelKind(r.model)}>{SCORE_PROD_LABEL[r.model]}</Badge>
      ),
    },
    { key: 'score', label: '分数', type: 'score' as const },
    {
      key: 'level',
      label: '等级',
      render: (r: any) => <Badge kind={levelKind(r.level)}>{r.level}</Badge>,
    },
    { key: 'source', label: '来源' },
    {
      key: 'status',
      label: '状态',
      render: (r: any) => (
        <Badge kind={r.status === 'success' ? 'green' : 'red'}>
          {r.status === 'success' ? '成功' : '失败'}
        </Badge>
      ),
    },
  ]

  const rows = filtered.map((r) => ({
    id: r.id,
    time: r.time,
    custName: r.custName,
    custId: r.custId,
    model: r.model,
    score: r.score,
    level: r.level,
    source: r.source,
    status: r.status,
  }))

  return (
    <>
      <PageShell title="评分记录" crumb="评分产品 / 在线评分" />
      <div className="space-y-4">
        {/* 概览统计 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="总调用次数" value={data.records.length.toLocaleString()} accent="brand" />
          <StatCard label="失败次数" value={failCount.toLocaleString()} accent="rose" />
          <StatCard label="本月次数" value={data.monthlyCount.toLocaleString()} accent="emerald" />
        </div>

        {/* 筛选栏 */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
          <span className="text-sm text-slate-500">模型</span>
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value as 'all' | ScoreProd)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink-900 outline-none focus:border-brand-400"
          >
            <option value="all">全部</option>
            <option value="zhicha">智察分</option>
            <option value="zhixin">智信分</option>
            <option value="zhirong">智融分</option>
          </select>
          <span className="text-sm text-slate-500">搜索</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="客户号/姓名"
            className="h-9 w-48 rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink-900 outline-none focus:border-brand-400"
          />
          <Button size="sm" variant="primary" onClick={openImport}>导入批量评分</Button>
          <span className="ml-auto text-xs text-slate-400">共 {filtered.length} 条</span>
        </div>

        {/* 明细表 */}
        <Panel
          title="历史评分调用明细"
          actions={<Sam value="scoreData.json" />}
        >
          <DataTable
            columns={columns as any}
            rows={rows as any}
            pager
            defaultPageSize={10}
            actions={(r: any) => (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => nav('/console/cr/mid-cust-score?cust=' + r.custId + '&prod=' + r.model)}>查看</Button>
                {r.status === 'fail' ? (
                  <Button size="sm" variant="ghost" onClick={() => retry(r.id)}>重试</Button>
                ) : null}
              </div>
            )}
          />
        </Panel>
      </div>

      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="批量评分导入">
        <p className="mb-3 text-xs text-slate-500">支持粘贴 CSV（客户号,模型,分数），确认后追加为评分记录。</p>
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          placeholder="粘贴 CSV（客户号,模型,分数）"
          className="h-40 w-full resize-none rounded-lg border border-slate-200 p-3 text-sm text-ink-900 outline-none focus:border-brand-400"
        />
        <p className="mt-2 text-[11px] text-slate-400">
          <Sam value="scoreData.json" /> 将生成示例记录（智信分/智融分）
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setImportOpen(false)}>取消</Button>
          <Button size="sm" variant="primary" onClick={confirmImport}>确认导入</Button>
        </div>
      </Modal>
    </>
  )
}
