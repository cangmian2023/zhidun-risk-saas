import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  PageHeader,
  StatCard,
  Panel,
  DataTable,
  Drawer,
  Modal,
  Button,
  SingleSelect,
  type Column,
  type Row,
} from '../components/ui'
import { LineChart, BarChart, DonutChart } from '../components/charts'
import type { ModuleSpec } from './menus'
import ListPage from './ListPage'

export default function ModulePage({ spec }: { spec: ModuleSpec }) {
  const { sub } = useParams<{ sub: string }>()
  const nav = useNavigate()
  const [reportRow, setReportRow] = useState<Row | null>(null)
  const [modal, setModal] = useState<null | 'batch' | 'history'>(null)
  const [toast, setToast] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2000)
  }

  const rows = spec.rows ?? []

  const headerActions = (
    <>
      {spec.batchImport && (
        <Button variant="secondary" onClick={() => setModal('batch')}>
          批量导入
        </Button>
      )}
      {spec.historySearch && (
        <Button variant="secondary" onClick={() => setModal('history')}>
          历史检索
        </Button>
      )}
    </>
  )

  return (
    <div className="space-y-6">
      <PageHeader title={spec.title} crumb={spec.crumb} subtitle={spec.subtitle} actions={headerActions} />

      {spec.stats && spec.stats.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {spec.stats.map((s) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              delta={s.delta}
              deltaType={s.deltaType}
              accent={(s.accent as 'brand') ?? 'brand'}
            />
          ))}
        </div>
      )}

      {spec.charts && spec.charts.length > 0 && (
        <div className={`grid gap-6 ${spec.charts.length > 1 ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
          {spec.charts.map((c, i) => (
            <Panel key={i} title={c.title}>
              {c.type === 'line' && <LineChart labels={c.labels ?? []} series={c.series ?? []} unit={c.unit} />}
              {c.type === 'bar' && <BarChart labels={c.labels ?? []} series={c.series ?? []} unit={c.unit} />}
              {c.type === 'donut' && (
                <DonutChart data={c.donut ?? []} centerLabel={c.centerLabel} centerValue={c.centerValue} />
              )}
            </Panel>
          ))}
        </div>
      )}

      {spec.custom ? (
        <>{spec.custom}</>
      ) : spec.columns && spec.columns.length > 0 ? (
        <ListPage
          columns={spec.columns}
          rows={rows}
          searchable={!!spec.searchable}
          reportKey={spec.reportKey}
          title={spec.listTitle}
          note={spec.note}
          onView={spec.viewNavigate ? undefined : spec.reportKey ? (r) => setReportRow(r) : undefined}
          onExport={spec.viewNavigate ? undefined : () => showToast('已导出（示例数据）')}
          onViewRow={spec.viewNavigate ? (r) => nav(`/console/${sub}/${spec.viewNavigate}?id=${r.id}`) : undefined}
        />
      ) : (
        <Panel title="数据明细" note={spec.note}>
          <div className="px-4 py-10 text-center text-sm text-slate-400">暂无数据</div>
        </Panel>
      )}

      <Drawer
        open={!!reportRow}
        onClose={() => setReportRow(null)}
        title={reportRow ? `风险评估报告 · ${reportRow.id as string}` : '风险评估报告'}
      >
        {reportRow && <RiskReport row={reportRow} />}
      </Drawer>

      <Modal open={modal === 'batch'} onClose={() => setModal(null)} title="批量决策导入">
        <BatchImport onDone={() => setModal(null)} />
      </Modal>

      <Modal open={modal === 'history'} onClose={() => setModal(null)} title="历史进件检索">
        <HistorySearch rows={rows} onClose={() => setModal(null)} />
      </Modal>

      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-ink-900 px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}

/* ---------- 单笔风险评估报告（三维钻取） ---------- */
function ScoreTag({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-50 py-3 text-center">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums text-ink-900">{value}</p>
    </div>
  )
}

function DimCard({
  title,
  level,
  color,
  signals,
}: {
  title: string
  level: string
  color: string
  signals: string[]
}) {
  const levelColor = level === '高' ? 'text-rose-600' : level === '中' ? 'text-amber-600' : 'text-emerald-600'
  return (
    <div className="rounded-xl border border-slate-100 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-ink-900">{title}</h4>
        <span className={`text-xs font-medium ${levelColor}`}>风险等级：{level}</span>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
        {signals.map((s, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${color}`} />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function RiskReport({ row }: { row: Row }) {
  const fraud = Number(row.fraudScore ?? 0)
  const credit = Number(row.creditScore ?? 0)
  const amount = Number(row.amount ?? 0)

  const fraudLevel = fraud >= 70 ? '高' : fraud >= 40 ? '中' : '低'
  const fraudColor = fraud >= 70 ? 'bg-rose-500' : fraud >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
  const fraudSignals =
    fraud >= 70
      ? ['设备环境异常，疑似模拟器 / 群控', '命中欺诈情报团伙名单', '异地高频申请行为']
      : fraud >= 40
        ? ['存在弱风险信号，建议加强要素核验', '设备指纹信息部分缺失']
        : ['未见明显欺诈信号']

  const weak = credit < 600
  const relationSignals = weak
    ? ['关联 2 个高风险联系人', '关系网络存在风险传导链路']
    : ['关联网络整体处于低风险区间']
  const debtN = ((fraud + credit) % 9) + 1
  const debtRatio = (credit % 55) + 20
  const debtSignals = [`近 30 日多头借贷 ${debtN} 家`, `预估负债收入比 ${debtRatio}%`]
  if (weak) debtSignals.push('共债压力偏高，建议人工复核')

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <ScoreTag label="欺诈分" value={fraud} />
        <ScoreTag label="信用分" value={credit} />
        <ScoreTag label="申请额度" value={`¥${amount.toLocaleString()}`} />
      </div>

      <DimCard title="欺诈识别" level={fraudLevel} color={fraudColor} signals={fraudSignals} />
      <DimCard title="关联分析" level={weak ? '中' : '低'} color={weak ? 'bg-amber-500' : 'bg-emerald-500'} signals={relationSignals} />
      <DimCard title="共债防控" level={weak ? '中' : '低'} color={weak ? 'bg-amber-500' : 'bg-emerald-500'} signals={debtSignals} />

      <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
        本报告由决策引擎实时生成，结合专家规则与模型评分，结论可解释、可追溯，支持监管报送与复核。
      </div>
    </div>
  )
}

/* ---------- 批量决策导入 ---------- */
function BatchImport({ onDone }: { onDone: () => void }) {
  const [file, setFile] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">上传 Excel / CSV 文件，系统将按决策流批量跑分并返回每笔进件的决策结果。</p>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-6 py-10 text-center transition hover:border-brand-400">
        <span className="text-sm font-medium text-brand-700">{file ?? '点击选择文件'}</span>
        <span className="text-xs text-slate-400">支持 .xlsx / .csv，单文件 ≤ 5000 行</span>
        <input
          type="file"
          accept=".csv,.xlsx"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0]?.name ?? null)}
        />
      </label>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onDone}>
          取消
        </Button>
        <Button
          disabled={!file || submitting}
          onClick={() => {
            setSubmitting(true)
            window.setTimeout(() => {
              setSubmitting(false)
              onDone()
            }, 600)
          }}
        >
          {submitting ? '提交中…' : '开始批量决策'}
        </Button>
      </div>
    </div>
  )
}

/* ---------- 历史进件检索 ---------- */
function HistorySearch({ rows, onClose }: { rows: Row[]; onClose: () => void }) {
  const [range, setRange] = useState('30')
  const [shown, setShown] = useState<Row[] | null>(null)
  const cols: Column[] = [
    { key: 'id', label: '进件号', width: '140px' },
    { key: 'name', label: '申请人', type: 'mask-name' },
    { key: 'decision', label: '决策结果' },
  ]
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <SingleSelect
          label="时间范围"
          options={[
            { value: '7', label: '近 7 日' },
            { value: '30', label: '近 30 日' },
            { value: '90', label: '近 90 日' },
          ]}
          value={String(range)}
          onChange={(v) => setRange(v)}
        />
        <Button className="ml-auto" onClick={() => setShown(rows)}>
          检索
        </Button>
      </div>
      {shown && <DataTable columns={cols} rows={shown} />}
      <div className="flex justify-end">
        <Button variant="ghost" onClick={onClose}>
          关闭
        </Button>
      </div>
    </div>
  )
}
