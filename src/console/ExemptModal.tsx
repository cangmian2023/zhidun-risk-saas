// 统一的「标记豁免」弹窗：信息核验 / 欺诈识别 / 信用风控 / 进件审核 四份报告共用同一套交互，
// 保证「是否可豁免」配置项在运行时表现一致（双人复核 + 原因留痕 + 附件 + 操作记录）。
import { useState } from 'react'
import { Button } from '../components/ui'

export interface ExemptSubmit {
  reason: string
  reviewer: string
  attachment?: string
}

export function ExemptModal({
  open,
  target,
  onClose,
  onSubmit,
}: {
  open: boolean
  target: string
  onClose: () => void
  onSubmit: (v: ExemptSubmit) => void
}) {
  const [reason, setReason] = useState('')
  const [reviewer, setReviewer] = useState('')
  const [fileName, setFileName] = useState('')
  const [step, setStep] = useState<'apply' | 'review'>('apply')
  if (!open) return null

  const reset = () => {
    setReason('')
    setReviewer('')
    setFileName('')
    setStep('apply')
  }
  const handleNext = () => {
    if (!reason.trim()) return
    setStep('review')
  }
  const handleSubmit = () => {
    if (!reviewer.trim()) return
    onSubmit({ reason: reason.trim(), reviewer: reviewer.trim(), attachment: fileName || undefined })
    reset()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-1 text-base font-semibold text-ink-900">
          {step === 'apply' ? '标记豁免 · 提交豁免申请' : '标记豁免 · 二级复核确认'}
        </h3>
        <p className="mb-3 text-xs text-slate-500">对象：{target}</p>

        {step === 'apply' ? (
          <>
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
              风险提示：豁免操作需双人复核，单人无法直接豁免风险。请填写豁免原因（可附证明材料）后进入复核环节。
            </div>
            <textarea
              className="mb-3 h-24 w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-brand-400"
              placeholder="请输入豁免原因..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-slate-500">豁免附件（选填）</label>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-center text-xs text-slate-400 transition hover:border-brand-300 hover:bg-brand-50/40">
                <span className="text-lg">📎</span>
                <span>{fileName ? `已选：${fileName}` : '点击上传豁免证明材料'}</span>
                <input type="file" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')} />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>取消</Button>
              <Button variant="primary" disabled={!reason.trim()} onClick={handleNext}>提交 → 进入二级复核</Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              <span className="text-xs text-slate-400">豁免原因：</span>{reason}
            </div>
            <div className="mb-3 rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3 text-xs text-amber-700">
              二级复核人须为独立审核人员，不得为豁免申请人本人。请确认复核人身份后填写姓名确认。
            </div>
            <input
              className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-brand-400"
              placeholder="复核人姓名"
              value={reviewer}
              onChange={(e) => setReviewer(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setStep('apply')}>返回修改</Button>
              <Button variant="primary" disabled={!reviewer.trim()} onClick={handleSubmit}>确认豁免</Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
