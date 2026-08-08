// 业务流程流转确认弹窗（贷中监控版 · 轻量）
// 与报告详情页「审批弹窗」交互对齐：点流程按钮 → 弹窗 → 确认 → 状态流转
// 内容：流程名 + 状态流转（当前状态 →[操作]→ 目标状态）+ 可选的审批意见
import { useState } from 'react'
import { Modal, Button } from '../components/ui'

export function FlowConfirmModal({
  open,
  flowName,
  action,
  from,
  to,
  onClose,
  onConfirm,
}: {
  open: boolean
  flowName: string
  action: string
  from: string
  to: string
  onClose: () => void
  onConfirm: (opinion: string) => void
}) {
  const [opinion, setOpinion] = useState('')
  // 每次打开重置意见
  const [lastOpen, setLastOpen] = useState(open)
  if (open !== lastOpen) {
    setLastOpen(open)
    if (open) setOpinion('')
  }
  return (
    <Modal
      title={`${flowName} · ${action}`}
      open={open}
      onClose={onClose}
      zIndex={200}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={() => onConfirm(opinion.trim())}>确认流转</Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="text-xs text-slate-400">业务流程：<span className="font-medium text-slate-600">{flowName}</span></div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
          <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">{from}</span>
          <span className="text-slate-400">─[{action}]→</span>
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">{to}</span>
        </div>
        <div>
          <div className="mb-1 text-xs text-slate-400">审批意见（可选）</div>
          <textarea
            value={opinion}
            onChange={(e) => setOpinion(e.target.value)}
            placeholder="填写本次流转的审批意见…"
            className="h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>
      </div>
    </Modal>
  )
}
