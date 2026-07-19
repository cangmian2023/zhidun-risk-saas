import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Badge, Button, DetailHeader, Panel } from '../components/ui'
import { getPreApps, buildInfoVerify, type AppRow, type InfoVerifyVM, type VResult } from './preApp'

/* ---------- 内部小组件 ---------- */
function maskName(s: string) {
  return s ? s.slice(0, 1) + '**' : '-'
}

/** 信息核验结论（自动为主、人工兜底）：复用 preApp.ts 的 buildInfoVerify，与申贷审核详情页「信息核验区」共用单一数据源 */
function buildVerify(r: AppRow, idx: number): InfoVerifyVM {
  return buildInfoVerify(r, idx)
}
type VerifyVM = InfoVerifyVM

const RESULT_MAP = {
  pass: { t: '通过', k: 'green' as const },
  fail: { t: '不通过', k: 'red' as const },
  pending: { t: '待人工', k: 'amber' as const },
  warn: { t: '关注', k: 'amber' as const },
}

function ResultTag({ result }: { result: VResult }) {
  const m = RESULT_MAP[result]
  return <Badge kind={m.k}>{m.t}</Badge>
}

function Shoto({ label }: { label: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100">
      <div className="flex h-32 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-4xl text-slate-300">
        🖼
      </div>
      <div className="px-3 py-1.5 text-xs text-slate-500">{label}</div>
    </div>
  )
}

function Metric({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-2.5 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className={danger ? 'font-medium text-rose-600' : 'text-slate-700'}>{value}</span>
    </div>
  )
}
/* ---------- 页面 ---------- */
export default function PreVerifyDetail() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const [toast, setToast] = useState<string | null>(null)
  const showToast = (m: string) => {
    setToast(m)
    window.setTimeout(() => setToast(null), 2000)
  }
  const id = params.get('id')

  const all = useMemo(() => getPreApps(), [])
  const idx = all.findIndex((r) => r.id === id)
  const row = idx >= 0 ? all[idx] : null
  const vm = useMemo(() => (row ? buildVerify(row, idx) : null), [row, idx])

  if (!row || !vm) {
    return (
      <div className="space-y-4">
        <DetailHeader
          title="信息核验详情"
          backLabel="← 返回列表"
          onBack={() => nav('/console/cr/pre-verify')}
        />
        <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-400">
          未找到该笔核验记录（申请编号：{id ?? '-'}）
        </div>
      </div>
    )
  }

  const conclusionKind = vm.conclusion === '通过' ? 'green' : vm.conclusion === '不通过' ? 'red' : 'amber'
  const backToList = () => nav('/console/cr/pre-verify')
  return (
    <div className="space-y-4">
      <DetailHeader
        title="信息核验详情"
        subtitle={`申请编号 ${row.id} · 申请人 ${maskName(row.name)} · 渠道 ${row.channel}`}
        backLabel="← 返回列表"
        onBack={backToList}
      />

      {/* 1. 核验结论总览 */}
      <Panel title="核验结论总览" id="v-overview">
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs text-slate-400">总结论</dt>
            <dd className="mt-0.5 font-medium text-slate-700">
              <Badge kind={conclusionKind}>{vm.conclusion}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">核验模式</dt>
            <dd className="mt-0.5 font-medium text-slate-700">{vm.mode}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">核验时间</dt>
            <dd className="mt-0.5 font-medium text-slate-700">{vm.verifyTime}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">处理方式</dt>
            <dd className="mt-0.5 font-medium text-slate-700">{vm.handler}</dd>
          </div>
        </dl>
      </Panel>

      {/* 2. 格式校验 */}
      <Panel title="格式校验" id="v-format">
        <div className="space-y-2">
          {vm.format.map((f) => (
            <div
              key={f.label}
              className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-2.5"
            >
              <div>
                <p className="text-sm font-medium text-slate-700">{f.label}</p>
                {f.note && <p className="text-xs text-rose-500">{f.note}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-slate-600">{f.value}</span>
                <ResultTag result={f.result} />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* 3. 身份要素核验 */}
      <Panel title="身份要素核验" id="v-identity">
        <div className="space-y-2">
          {vm.identity.map((it) => (
            <div
              key={it.label}
              className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-2.5 text-sm"
            >
              <span className="text-slate-700">{it.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-slate-600">{it.result}</span>
                <span className="text-xs text-slate-400">{it.time}</span>
              </div>
            </div>
          ))}
          <p className="px-1 text-xs text-slate-400">
            注：「无法核实」≠「不一致」，处置方式不同（无法核实默认转人工）。
          </p>
        </div>
      </Panel>

      {/* 4. 活体与人脸比对 */}
      <Panel title="活体与人脸比对" id="v-liveness">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Shoto label="活体照（动作活体抓拍）" />
            <Shoto label="证件照（OCR 原图）" />
          </div>
          <div className="space-y-2">
            <Metric label="活体检测" value={vm.liveness.live} danger={vm.liveness.live !== '通过'} />
            <Metric
              label="人脸相似度"
              value={`${vm.liveness.score}（阈值 ${vm.liveness.threshold}）`}
              danger={vm.liveness.judge !== '同一人'}
            />
            <Metric label="判定" value={vm.liveness.judge} danger={vm.liveness.judge !== '同一人'} />
          </div>
        </div>
      </Panel>

      {/* 5. 证件 OCR 与防伪 */}
      <Panel title="证件 OCR 与防伪" id="v-ocr">
        <div className="grid gap-4 lg:grid-cols-2">
          <Shoto label="证件影像（OCR 原图）" />
          <div className="space-y-2">
            <Metric
              label="OCR 置信度"
              value={vm.ocr.confidence}
              danger={Number(vm.ocr.confidence.replace('%', '')) < 80}
            />
            <Metric label="防伪检测" value={vm.ocr.antiFake} danger={vm.ocr.antiFake !== '正常'} />
            <div className="rounded-xl border border-slate-100 p-3 text-xs text-slate-500">
              结构化字段：姓名 {maskName(row.name)} / 证件号 {row.idNo ? row.idNo.slice(0, 4) + '**********' + row.idNo.slice(-4) : '-'} / 有效期 2026.01 - 2036.01
            </div>
          </div>
        </div>
      </Panel>

      {/* 6. 字段逻辑一致性 */}
      <Panel title="字段逻辑一致性" id="v-logic">
        {vm.logic.pass ? (
          <p className="flex items-center gap-2 text-sm text-emerald-600">✓ 字段间逻辑一致，未发现矛盾。</p>
        ) : (
          <ul className="space-y-1.5">
            {vm.logic.conflicts.map((c, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50/50 px-4 py-2.5 text-sm text-rose-600"
              >
                ⚠ {c}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* 7. 人工处置记录 */}
      {vm.hasManual && (
        <Panel title="人工处置记录" id="v-manual">
          <ol className="space-y-4">
            {vm.manual.map((m, i) => (
              <li key={i} className="border-l-2 border-brand-200 pl-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{m.time}</span>
                  <span className="font-medium text-slate-600">{m.party}</span>
                  <span>{m.action}</span>
                </div>
                <p className="mt-1 text-sm text-slate-700">{m.content}</p>
              </li>
            ))}
          </ol>
        </Panel>
      )}

      {/* 底部操作区：仅待人工确认时提供处置动作；系统涉密，不提供任何导出 / 下载 */}
      {vm.conclusion === '待人工确认' && (
        <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/90 px-4 py-3 lg:-mx-8 lg:px-8">
          <Button variant="primary" onClick={() => showToast('已人工确认通过（示例）')}>
            通过
          </Button>
          <Button variant="secondary" onClick={() => showToast('已判定不通过（示例）')}>
            不通过
          </Button>
          <Button variant="ghost" onClick={() => showToast('已发起补充材料请求（示例）')}>
            要求补充材料
          </Button>
          <Button variant="ghost" onClick={() => showToast('已上报欺诈识别模块（示例）')}>
            疑似欺诈上报
          </Button>
        </div>
      )}

      {/* 轻提示 */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900/90 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
