import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Badge, Button, DetailHeader, Panel } from '../components/ui'
import { getPreApps, type AppRow } from './preApp'

/* ---------- 工具 ---------- */
function maskId(s: string) {
  return s ? s.slice(0, 4) + '**********' + s.slice(-4) : '-'
}
function maskPhone(s: string) {
  return s ? s.slice(0, 3) + '****' + s.slice(-4) : '-'
}
function maskName(s: string) {
  return s ? s.slice(0, 1) + '**' : '-'
}

type VResult = 'pass' | 'fail' | 'pending' | 'warn'

interface VerifyVM {
  conclusion: '通过' | '不通过' | '待人工确认'
  mode: string
  verifyTime: string
  handler: string
  format: { label: string; value: string; result: VResult; note?: string }[]
  identity: { label: string; result: string; time: string }[]
  liveness: { live: string; score: string; threshold: string; judge: string }
  ocr: { confidence: string; antiFake: string }
  logic: { pass: boolean; conflicts: string[] }
  hasManual: boolean
  manual: { time: string; party: string; action: string; content: string }[]
}

function buildVerify(r: AppRow, idx: number): VerifyVM {
  const c = r.fraudScore
  const conclusion: VerifyVM['conclusion'] = c > 70 ? '不通过' : c > 55 ? '待人工确认' : '通过'
  const mode =
    r.product === '现金贷'
      ? '宽松模式'
      : r.product === '汽车金融' || r.product === '经营贷'
        ? '严格模式'
        : '标准模式'
  const verifyTime = String(r.applyTime).slice(0, 10) + ' 10:23'
  const handler = conclusion === '通过' ? '自动（STP）' : '人工兜底'
  const idInconsistent = conclusion === '不通过'
  const bankTail = String(((idx * 137 + 1234) % 9000) + 1000)

  const format = [
    { label: '姓名', value: maskName(r.name), result: 'pass' as VResult },
    {
      label: '身份证号',
      value: maskId(r.idNo),
      result: (idInconsistent ? 'fail' : 'pass') as VResult,
      note: idInconsistent ? '与申请填写年龄不一致' : undefined,
    },
    { label: '手机号', value: maskPhone(r.phone), result: 'pass' as VResult },
    {
      label: '银行卡号',
      value: '**** **** **** ' + bankTail,
      result: (conclusion === '不通过' ? 'fail' : 'pass') as VResult,
    },
  ]

  const identity = [
    { label: '二要素（姓名+身份证）', result: idInconsistent ? '不一致' : '一致', time: verifyTime },
    { label: '三要素（+银行卡）', result: idInconsistent ? '不一致' : '一致', time: verifyTime },
    {
      label: '四要素（+手机号）',
      result: conclusion === '待人工确认' ? '无法核实' : idInconsistent ? '不一致' : '一致',
      time: verifyTime,
    },
  ]

  const liveness = {
    live: conclusion === '不通过' ? '未通过' : '通过',
    score: conclusion === '待人工确认' ? '82.3%' : conclusion === '不通过' ? '61.2%' : '98.6%',
    threshold: '≥ 90%',
    judge: conclusion === '待人工确认' ? '临界·待人工目视复核' : conclusion === '不通过' ? '非同一人' : '同一人',
  }

  const ocr = {
    confidence: conclusion === '待人工确认' ? '76%' : conclusion === '不通过' ? '58%' : '98%',
    antiFake: conclusion === '不通过' ? '疑似伪造/篡改' : '正常',
  }

  const logic = {
    pass: !idInconsistent,
    conflicts: idInconsistent
      ? [`身份证推算年龄 23 岁 与 申请填写年龄 ${r.age} 岁 不一致`, '证件照与活体照相似度低于阈值']
      : [],
  }

  const hasManual = conclusion !== '通过'
  const manual = hasManual
    ? [
        {
          time: verifyTime,
          party: '系统',
          action: '自动核验',
          content: '格式 / OCR / 要素核验完成，落入「待人工确认」区间，自动转入异常件队列。',
        },
        {
          time: verifyTime + ':40',
          party: '复核员·李杭',
          action: '目视比对',
          content: `活体照与证件照相似度 ${liveness.score}，处于临界区间，人工目视复核中。`,
        },
        {
          time: verifyTime + ':55',
          party: '复核员·李杭',
          action: '处置结论',
          content:
            conclusion === '不通过'
              ? '证件疑似篡改，判定不通过并上报欺诈识别模块。'
              : '临界但可确认同一人，人工确认通过，结论回流引擎。',
        },
      ]
    : []

  return { conclusion, mode, verifyTime, handler, format, identity, liveness, ocr, logic, hasManual, manual }
}

/* ---------- 内部小组件 ---------- */
function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-700">{value}</dd>
    </div>
  )
}

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
          <Field label="总结论" value={<Badge kind={conclusionKind}>{vm.conclusion}</Badge>} />
          <Field label="核验模式" value={vm.mode} />
          <Field label="核验时间" value={vm.verifyTime} />
          <Field label="处理方式" value={vm.handler} />
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
              结构化字段：姓名 {maskName(row.name)} / 证件号 {maskId(row.idNo)} / 有效期 2026.01 - 2036.01
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
