// 信用风控报告页
// 依据 doc/信用风控报告功能设计.md 与 doc/信用风控报告-示例数据.json 实现
import { useLocation, useNavigate } from 'react-router-dom'
import { Badge, Button, DetailHeader, Panel } from '../components/ui'
import {
  conclKind,
  getCreditReport,
  riskKind,
  severityKind,
  singleKind,
  type CreditReport,
} from './creditReport'

const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

export default function CreditReportDetail() {
  const nav = useNavigate()
  const id = new URLSearchParams(useLocation().search).get('id')
  const r = getCreditReport(id)
  return <ReportView r={r} onBack={() => nav('/console/cr:pre-credit')} />
}

function ReportView({ r, onBack }: { r: CreditReport; onBack: () => void }) {
  const cc = r.credit_conclusion
  return (
    <div>
      <DetailHeader
        title="信用风控报告"
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <span>进件号 {r.apply_no}</span>
            <span>·</span>
            <span>申请人 {r.applicant.name}</span>
            <span>·</span>
            <span>{r.applicant.id_no}</span>
          </span>
        }
        backLabel="信用风控列表"
        onBack={onBack}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost">复核</Button>
            <Button variant="primary">提交终审</Button>
          </div>
        }
      />

      {/* 结论横幅 */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <Badge kind={conclKind(cc.decision)} className="px-3 py-1 text-sm">
          {cc.decision}
        </Badge>
        <Badge kind={riskKind(cc.risk_level)}>{cc.risk_level}</Badge>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">信用分</span>
          <span className="text-lg font-semibold text-rose-600">{cc.credit_score}</span>
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-1.5">
          {cc.risk_tags.map((t) => (
            <Badge key={t} kind="amber">
              {t}
            </Badge>
          ))}
        </div>
        <span className="text-xs text-slate-400">报告号 {r.report_id} · 状态 {r.status}</span>
      </div>

      {/* 一、用户提交内容（原始） */}
      <Panel title="一、用户提交内容（原始）" id="raw" className="mb-4">
        <div className="grid gap-4 lg:grid-cols-3">
          <RawGroup title="基础信息" data={r.raw_inputs.base} />
          <RawGroup title="内部数据" data={r.raw_inputs.internal} />
          <RawGroup title="外部查询请求" data={r.raw_inputs.external_request} />
        </div>
      </Panel>

      {/* 二、结构化后的内容 */}
      <Panel title="二、结构化后的内容" id="struct" className="mb-4">
        <div className="grid gap-4 md:grid-cols-2">
          <StructGroup title="多头指标" data={r.structured['多头指标']} />
          <StructGroup title="负债" data={r.structured['负债']} />
          <StructGroup title="失信" data={r.structured['失信']} />
          <StructGroup title="关联" data={r.structured['关联']} />
        </div>
      </Panel>

      {/* 三、单项判断结果 */}
      <Panel title="三、单项判断结果" id="single" className="mb-4">
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {r.single_results.map((s) => (
            <div key={s.source} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-ink-900">{s.source}</div>
                <Badge kind={singleKind(s.status)}>{s.status}</Badge>
              </div>
              <div className="mb-3 space-y-1.5">
                {Object.entries(s.fields).map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-3 text-xs">
                    <span className="text-slate-500">{k}</span>
                    <span className="text-right font-medium text-slate-800">{v}</span>
                  </div>
                ))}
              </div>
              {s.risk_tags.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {s.risk_tags.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-rose-50 px-2 py-0.5 text-xs text-rose-600"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>回执 {s.receipt_code}</span>
                <span>耗时 {s.cost_ms}ms</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* 四、核验过程 */}
      <Panel title="四、核验过程" id="process" className="mb-4">
        <div className="space-y-3">
          {r.credit_process.parallel_threads.map((t, i) => (
            <ThreadRow key={t.thread + t.source} t={t} last={i === r.credit_process.parallel_threads.length - 1} />
          ))}
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            <span className="font-medium text-slate-700">聚合耗时</span>
            <span>{r.credit_process.aggregate_ms}ms（取最慢线程）</span>
          </div>
        </div>
      </Panel>

      {/* 五、核验结果（含交叉比对） */}
      <Panel title="五、核验结果（含交叉比对）" id="cross" className="mb-4">
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Badge kind={conclKind(cc.decision)} className="px-3 py-1 text-sm">
              {cc.decision}
            </Badge>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">风险等级</span>
              <Badge kind={riskKind(cc.risk_level)}>{cc.risk_level}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">信用分</span>
              <span className="text-lg font-semibold text-rose-600">{cc.credit_score}</span>
            </div>
            <div className="flex flex-1 flex-wrap items-center gap-1.5">
              {cc.risk_tags.map((t) => (
                <Badge key={t} kind="amber">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            {cc.decision_detail}
          </p>
        </div>

        <div className="mb-2 text-xs font-medium text-slate-500">交叉比对（跨源矛盾）</div>
        <div className="space-y-2">
          {cc.cross_fusion.map((c, i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-3">
              <div className="mb-1.5 flex items-center gap-2">
                <Badge kind={severityKind(c.severity)}>{c.severity}标</Badge>
                <span className="text-sm text-ink-900">{c.desc}</span>
              </div>
              <div className="text-xs text-slate-400">冲突来源：{c.sources}</div>
            </div>
          ))}
          {cc.cross_fusion.length === 0 && (
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400">
              无跨源矛盾
            </div>
          )}
        </div>
      </Panel>

      {/* 六、操作人对单项结果的进一步操作 */}
      <Panel title="六、操作人对单项结果的进一步操作" id="item-actions" className="mb-4">
        <ActionTable
          rows={r.item_actions}
          cols={[
            { key: 'item', label: '对象' },
            { key: 'action', label: '操作' },
            { key: 'operator', label: '操作人' },
            { key: 'time', label: '时间' },
            { key: 'result', label: '结果' },
            { key: 'note', label: '备注' },
          ]}
        />
      </Panel>

      {/* 七、整体报告的进一步操作 */}
      <Panel title="七、整体报告的进一步操作" id="report-actions" className="mb-4">
        <div className="mb-4 space-y-2">
          {r.report_actions.map((a, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 px-3 py-2.5">
              <Badge kind="blue">{a.action}</Badge>
              <div className="flex-1 text-sm text-slate-700">{a.note}</div>
              <div className="text-right text-xs text-slate-400">
                <div>{a.operator}</div>
                <div>{a.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mb-2 text-xs font-medium text-slate-500">操作审计轨迹</div>
        <ActionTable
          rows={r.audit_trail}
          cols={[
            { key: 'time', label: '时间' },
            { key: 'operator', label: '操作人' },
            { key: 'action', label: '动作' },
            { key: 'from', label: '变更前' },
            { key: 'to', label: '变更后' },
          ]}
        />
      </Panel>
    </div>
  )
}

function RawGroup({ title, data }: { title: string; data: Record<string, string> }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="mb-2 text-xs font-semibold text-slate-500">{title}</div>
      <div className="space-y-1.5">
        {Object.entries(data).map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-500">{k}</span>
            <span className="text-right font-medium text-slate-800">{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StructGroup({
  title,
  data,
}: {
  title: string
  data: Record<string, string | number>
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="mb-2 text-xs font-semibold text-slate-500">{title}</div>
      <div className="space-y-1.5">
        {Object.entries(data).map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-500">{k}</span>
            <span className="text-right font-medium text-slate-800">{String(v)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ThreadRow({
  t,
  last,
}: {
  t: { thread: string; source: string; send: string; recv: string; cost_ms: number; code: string }
  last: boolean
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-500" />
        {!last && <span className="w-px flex-1 bg-slate-200" />}
      </div>
      <div className="flex-1 pb-1">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-ink-900">
            <span className="text-slate-400">{t.thread}</span> {t.source}
          </div>
          <span className="text-xs text-slate-400">
            {t.send} → {t.recv}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
          <span>耗时 {t.cost_ms}ms</span>
          <span>回执 {t.code}</span>
        </div>
      </div>
    </div>
  )
}

function ActionTable({
  rows,
  cols,
}: {
  rows: Record<string, string>[]
  cols: { key: string; label: string }[]
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
            {cols.map((c) => (
              <th key={c.key} className="px-3 py-2 font-medium">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 align-top">
              {cols.map((c) => (
                <td key={c.key} className="px-3 py-2 text-slate-700">
                  {row[c.key]}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={cols.length} className="px-3 py-3 text-xs text-slate-400">
                暂无操作记录
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
