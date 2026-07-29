// 审批弹窗（与报告模板「审核流程配置」对齐）：审核事项 → 审批结果 → 审批意见 → 附件
// 供信息核验 / 信用 / 欺诈 / 决策 四类报告复用，避免重复实现。
import { useEffect, useState } from 'react'
import { Modal, Button } from '../components/ui'
import { type AuditFlow, type ReviewResult } from './reportTemplateData'

// 审批意见预设项中，含"调整/利率/额度/金额/期限/减免"等需填写具体值的，渲染输入框；其余（如"打回重审"）直接采用标签值
function opinionNeedsInput(label: string): boolean {
  return /调整|利率|额度|金额|期限|减免|降息|加息|上浮|下调/.test(label)
}

export function ApprovalModal({
  open,
  title = '审批决策',
  conclusion,
  auditFlow,
  onClose,
  onConfirm,
}: {
  open: boolean
  title?: string
  conclusion?: string
  auditFlow: AuditFlow
  onClose: () => void
  onConfirm: (p: { result: ReviewResult; checks: string[]; opinionText: string; fileName: string }) => void
}) {
  const [result, setResult] = useState<ReviewResult>('通过')
  const [checks, setChecks] = useState<string[]>([])
  const [opinionKeys, setOpinionKeys] = useState<string[]>([])
  const [opinionValues, setOpinionValues] = useState<Record<string, string>>({})
  const [opinionExtra, setOpinionExtra] = useState('')
  const [fileName, setFileName] = useState('')

  // 弹窗打开时，按当前流程配置初始化审批结果与审核事项
  useEffect(() => {
    if (open && auditFlow) {
      setResult(auditFlow.results[0])
      setChecks(auditFlow.checkItems)
      setOpinionKeys([])
      setOpinionValues({})
      setOpinionExtra('')
      setFileName('')
    }
  }, [open, auditFlow])

  const confirm = () => {
    const opinionText = [
      ...opinionKeys.map((k) => opinionValues[k] ?? k),
      ...(opinionExtra.trim() ? [opinionExtra.trim()] : []),
    ].join('；')
    onConfirm({ result, checks, opinionText, fileName })
  }

  return (
    <Modal
      title={title}
      open={open}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button variant="primary" onClick={confirm}>
            确认审批
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="text-xs text-slate-400">
          本次审批对应流程节点：<span className="font-medium text-slate-600">{auditFlow.nodeLabel}</span>
        </div>
        {conclusion && (
          <div className="text-sm text-slate-600">
            审批结论：<span className="font-medium text-ink-900">{conclusion}</span>
          </div>
        )}

        {/* 审核事项：来自模板流程配置 checkItems */}
        <div>
          <div className="mb-1 text-xs text-slate-400">审核事项（按流程配置核对）</div>
          <div className="flex flex-wrap gap-1.5">
            {auditFlow.checkItems.map((c) => {
              const on = checks.includes(c)
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setChecks((p) => (on ? p.filter((x) => x !== c) : [...p, c]))}
                  className={`rounded-lg px-2.5 py-1 text-xs ring-1 ring-inset transition ${
                    on ? 'bg-violet-50 text-violet-700 ring-violet-200' : 'bg-slate-50 text-slate-500 ring-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {on ? '✓ ' : ''}
                  {c}
                </button>
              )
            })}
          </div>
        </div>

        {/* 审批结果：来自模板流程配置 results */}
        <div>
          <div className="mb-1 text-xs text-slate-400">审批结果（按流程配置可选）</div>
          <div className="flex flex-wrap gap-1.5">
            {auditFlow.results.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setResult(r)}
                className={`rounded-full px-3 py-1 text-xs transition ${
                  result === r ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* 审批意见：来自模板流程配置 opinionPresets[result]，多项可选、可填写 */}
        <div>
          <div className="mb-1 text-xs text-slate-400">审批意见（{result} 预设，可多选、可填写）</div>
          <div className="space-y-2">
            {auditFlow.opinionPresets[result].map((p) => {
              const on = opinionKeys.includes(p)
              const need = opinionNeedsInput(p)
              return (
                <div
                  key={p}
                  className={`flex items-start gap-2 rounded-lg border px-2.5 py-2 transition ${
                    on ? 'border-violet-200 bg-violet-50/50' : 'border-slate-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() =>
                      setOpinionKeys((p2) => {
                        if (p2.includes(p)) return p2.filter((x) => x !== p)
                        setOpinionValues((m) => ({ ...m, [p]: m[p] ?? p }))
                        return [...p2, p]
                      })
                    }
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-violet-600"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-slate-700">{p}</div>
                    {on && need && (
                      <input
                        value={opinionValues[p] ?? ''}
                        onChange={(e) => setOpinionValues((m) => ({ ...m, [p]: e.target.value }))}
                        placeholder={`请输入「${p}」的具体内容`}
                        className="mt-1 h-8 w-full rounded-md border border-slate-300 px-2 text-xs outline-none focus:border-violet-400"
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <textarea
            value={opinionExtra}
            onChange={(e) => setOpinionExtra(e.target.value)}
            placeholder="其他审批意见（可自填）"
            className="mt-2 h-16 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400"
          />
        </div>

        <div>
          <div className="mb-1 text-xs text-slate-400">附件上传</div>
          <input
            type="file"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
            className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-50 file:px-3 file:py-1.5 file:text-xs file:text-violet-600"
          />
          {fileName && <div className="mt-1 text-xs text-slate-400">已选：{fileName}</div>}
        </div>
      </div>
    </Modal>
  )
}
