// 操作日志合并表格：信息核验报告「整体操作」与欺诈识别报告「操作日志」共享复用。
// 将单项操作(itemActions)与全量操作日志(opLogs)合并为一表，按时间排序。
import { Badge } from './ui'
import type { OpLog } from '../console/infoVerifyReport'

export function MergedOpTable({ itemActions, opLogs }: { itemActions: any[]; opLogs: OpLog[] }) {
  interface MergedRow {
    id: string; target: string; action: string; badgeKind: 'red' | 'amber' | 'blue' | 'gray' | 'green'
    operator: string; time: string; before: string; after: string; remark: string; attachments?: string[]
    reviewStatus?: string; reviewer?: string; reviewTime?: string
  }
  // 操作标签配色：信息核验原有关键字 + 欺诈识别扩展关键字（组件现已跨两份报告共享）
  const opBadge: Record<string, 'red' | 'amber' | 'blue' | 'gray' | 'green'> = {
    '重新核验': 'blue', '录入备注': 'blue', '标记豁免': 'amber', '查看回执': 'gray', '关联电核': 'blue',
    '规则豁免': 'amber', '确认欺诈': 'red', '误判放行': 'green', '加入黑名单': 'red', '提交复核': 'blue',
    '归档': 'gray', '全局备注': 'blue', '强制放行': 'green',
    '欺诈报告生成': 'gray', '黑名单命中': 'red', '团伙关联检测': 'red', '设备风险检测': 'red',
    '设备群控检测': 'red', '行为轨迹检测': 'red', '申请提交': 'blue',
  }
  const actKind: Record<string, 'red' | 'amber' | 'blue' | 'gray'> = {
    reject: 'red', pass: 'blue', warning: 'amber', neutral: 'gray',
  }
  const merged: MergedRow[] = [
    ...itemActions.map((a) => ({
      id: a.id, target: a.target, action: a.action,
      badgeKind: actKind[a.actionKind] ?? 'gray' as const,
      operator: a.operator, time: a.time,
      before: a.before, after: a.after,
      remark: a.reason,
    })),
    ...opLogs.map((l) => ({
      id: l.id, target: l.target, action: l.actionType,
      badgeKind: opBadge[l.actionType] ?? 'gray' as const,
      operator: l.operator, time: l.time,
      before: '-', after: '-',
      remark: l.remark,
      attachments: l.attachments,
      reviewStatus: l.reviewStatus, reviewer: l.reviewer, reviewTime: l.reviewTime,
    })),
  ].sort((a, b) => a.time.localeCompare(b.time))

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
      <table className="w-full min-w-[860px] text-sm">
        <thead>
          <tr className="sticky top-0 z-30 border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold text-slate-500">
            <th className="px-3 py-3 font-medium">操作对象（数据源）</th>
            <th className="px-3 py-3 font-medium">操作类型</th>
            <th className="px-3 py-3 font-medium">操作标签</th>
            <th className="px-3 py-3 font-medium">操作人</th>
            <th className="px-3 py-3 font-medium">操作时间</th>
            <th className="px-3 py-3 font-medium">变更前判定</th>
            <th className="px-3 py-3 font-medium">变更后判定</th>
            <th className="px-3 py-3 font-medium">操作原因 / 备注 &amp; 附件</th>
            <th className="px-3 py-3 font-medium">复核状态</th>
          </tr>
        </thead>
        <tbody>
          {merged.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-3 py-8 text-center text-xs text-slate-400">暂无操作记录</td>
            </tr>
          ) : (
            merged.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 align-top">
                <td className="px-3 py-3 text-xs font-medium text-slate-700">{r.target}</td>
                <td className="px-3 py-3 text-xs text-slate-600">{r.action}</td>
                <td className="px-3 py-3"><Badge kind={r.badgeKind === 'green' ? 'green' : r.badgeKind as any}>{r.badgeKind === 'red' ? '拒绝' : r.badgeKind === 'blue' ? '操作' : r.badgeKind === 'amber' ? '豁免' : r.badgeKind === 'green' ? '放行' : '操作'}</Badge></td>
                <td className="px-3 py-3 text-xs text-slate-500">{r.operator}</td>
                <td className="px-3 py-3 text-xs text-slate-500 whitespace-nowrap">{r.time}</td>
                <td className="px-3 py-3 text-xs text-slate-400">{r.before}</td>
                <td className="px-3 py-3 text-xs text-slate-700">{r.after}</td>
                <td className="px-3 py-3 max-w-[200px] text-xs text-slate-600">
                  <div className="leading-relaxed">{r.remark}</div>
                  {r.attachments && r.attachments.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {r.attachments.map((a, i) => (
                        <span key={i} className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">📎 {a}</span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 text-xs">
                  {r.reviewStatus ? (
                    r.reviewStatus === '已复核' ? (
                      <div>
                        <Badge kind="green">已复核</Badge>
                        <div className="mt-0.5 text-[11px] text-slate-400">{r.reviewer} · {r.reviewTime}</div>
                      </div>
                    ) : (
                      <Badge kind="amber">待复核</Badge>
                    )
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
