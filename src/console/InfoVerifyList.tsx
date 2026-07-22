// 信息核验列表页
// 列：申请编号 / 申请人 / 产品 / 渠道 / 申请额度 / 欺诈分 / 信用分 / 审核时间 / 系统自动审核结果 / 工单人工状态 / 操作人员 / 操作
// 操作按钮按（系统自动审核结果 × 工单人工状态）动态显示，点击查看进入报告详情页
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useModule } from '../store'
import { PageHeader, Panel, SingleSelect } from '../components/ui'
import { VerifyRowActions, SysResultBadge, WorkStatusBadge, type VerifyRow, type WorkStatus, type SysResult } from './VerifyOps'

const AUDIT_TIMES = [
  '2026-07-22 09:14',
  '2026-07-22 10:02',
  '2026-07-21 16:48',
  '2026-07-22 11:27',
  '2026-07-22 08:55',
  '2026-07-21 14:33',
  '2026-07-22 13:41',
  '2026-07-21 19:06',
  '2026-07-22 09:50',
  '2026-07-20 17:22',
]

const WORK_OPTIONS = [
  { value: 'all', label: '全部工单状态' },
  { value: '核验计算中', label: '核验计算中' },
  { value: '待确认归档', label: '待确认归档' },
  { value: '已办结确认', label: '已办结确认' },
  { value: '待审核处置', label: '待审核处置' },
  { value: '已提交双人复核', label: '已提交双人复核' },
  { value: '双人复核-放行办结', label: '双人复核-放行办结' },
  { value: '双人复核-拒绝办结', label: '双人复核-拒绝办结' },
  { value: '强制放行办结', label: '强制放行办结' },
] as const

function seedRows(): VerifyRow[] {
  const base: Array<Omit<VerifyRow, 'sysResult' | 'workStatus' | 'operator'>> = [
    { id: 'PRV-2041', name: '陈一', product: '极速贷', channel: 'APP 自有', amount: 80000, fraudScore: 12, creditScore: 701 },
    { id: 'PRV-2042', name: '赵二', product: '白领贷', channel: '应用商店', amount: 150000, fraudScore: 9, creditScore: 742 },
    { id: 'PRV-2043', name: '孙三', product: '小微经营贷', channel: '合作引流', amount: 300000, fraudScore: 5, creditScore: 768 },
    { id: 'PRV-2044', name: '李四', product: '车主贷', channel: '信息流广告', amount: 120000, fraudScore: 78, creditScore: 612 },
    { id: 'PRV-2045', name: '周五', product: '公积金贷', channel: '线下扫码', amount: 200000, fraudScore: 64, creditScore: 588 },
    { id: 'PRV-2046', name: '吴六', product: '极速贷', channel: 'APP 自有', amount: 50000, fraudScore: 81, creditScore: 599 },
    { id: 'PRV-2047', name: '郑七', product: '白领贷', channel: '合作引流', amount: 90000, fraudScore: 35, creditScore: 655 },
    { id: 'PRV-2048', name: '王八', product: '小微经营贷', channel: '应用商店', amount: 250000, fraudScore: 41, creditScore: 621 },
    { id: 'PRV-2049', name: '冯九', product: '车主贷', channel: '信息流广告', amount: 110000, fraudScore: 28, creditScore: 670 },
    { id: 'PRV-2050', name: '蒋十', product: '公积金贷', channel: '线下扫码', amount: 180000, fraudScore: 33, creditScore: 640 },
  ]
  const status: Array<{ sysResult: SysResult; workStatus: WorkStatus; operator: string }> = [
    { sysResult: '处理中', workStatus: '核验计算中', operator: '--' },
    { sysResult: '通过', workStatus: '待确认归档', operator: '--' },
    { sysResult: '通过', workStatus: '已办结确认', operator: '初审：审核员 1' },
    { sysResult: '拒绝', workStatus: '待确认归档', operator: '--' },
    { sysResult: '拒绝', workStatus: '已办结确认', operator: '初审：审核员 1' },
    { sysResult: '拒绝', workStatus: '强制放行办结', operator: '初审：审核员 1；终审：主管 1' },
    { sysResult: '预警', workStatus: '待审核处置', operator: '--' },
    { sysResult: '预警', workStatus: '已提交双人复核', operator: '初审：审核员 1' },
    { sysResult: '预警', workStatus: '双人复核-放行办结', operator: '初审：审核员 1；终审：主管 1' },
    { sysResult: '预警', workStatus: '双人复核-拒绝办结', operator: '初审：审核员 1；终审：主管 1' },
  ]
  return base.map((b, i) => ({ ...b, ...status[i], auditTime: AUDIT_TIMES[i] }))
}

const fmtAmount = (n: number) => '¥' + n.toLocaleString('zh-CN')

export default function InfoVerifyList() {
  const nav = useNavigate()
  const { flash } = useModule()
  const [rows, setRows] = useState<VerifyRow[]>(seedRows)
  const [work, setWork] = useState('all')
  const [q, setQ] = useState('')

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (work === 'all' || r.workStatus === work) &&
          (q.trim() === '' ||
            r.id.toLowerCase().includes(q.trim().toLowerCase()) ||
            r.name.includes(q.trim())),
      ),
    [rows, work, q],
  )

  const apply = (id: string, next: Partial<VerifyRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...next } : r)))

  const onView = (id: string) => nav(`/console/cr/pre-verify-detail?id=${id}`)

  return (
    <div className="space-y-6">
      <PageHeader
        title="信息核验"
        subtitle="贷前审核 · 核验 / 反欺诈 / 信用交叉结果 + 工单人工处置（操作随审核状态动态变化）"
      />

      <Panel
        title={`工单列表（${filtered.length}）`}
        actions={
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索申请编号 / 申请人"
              className="h-9 w-44 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-300"
            />
            <SingleSelect label="工单状态" value={work} onChange={setWork} options={WORK_OPTIONS as unknown as { value: string; label: string }[]} />
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="px-3 py-2.5 font-medium">申请编号</th>
                <th className="px-3 py-2.5 font-medium">申请人</th>
                <th className="px-3 py-2.5 font-medium">产品</th>
                <th className="px-3 py-2.5 font-medium">渠道</th>
                <th className="px-3 py-2.5 text-right font-medium">申请额度</th>
                <th className="px-3 py-2.5 text-right font-medium">欺诈分</th>
                <th className="px-3 py-2.5 text-right font-medium">信用分</th>
                <th className="w-[160px] px-3 py-2.5 font-medium">审核时间</th>
                <th className="px-3 py-2.5 font-medium">系统自动审核结果</th>
                <th className="px-3 py-2.5 font-medium">工单人工状态</th>
                <th className="px-3 py-2.5 font-medium">操作人员</th>
                <th className="px-3 py-2.5 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="px-3 py-3 font-mono text-xs text-slate-700">{r.id}</td>
                  <td className="px-3 py-3 text-slate-700">{r.name}</td>
                  <td className="px-3 py-3 text-slate-600">{r.product}</td>
                  <td className="px-3 py-3 text-slate-500">{r.channel}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-700">{fmtAmount(r.amount)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-700">{r.fraudScore}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-700">{r.creditScore}</td>
                  <td className="px-3 py-3 text-slate-500">{r.auditTime}</td>
                  <td className="px-3 py-3"><SysResultBadge value={r.sysResult} /></td>
                  <td className="px-3 py-3"><WorkStatusBadge value={r.workStatus} /></td>
                  <td className="px-3 py-3 text-slate-500">{r.operator}</td>
                  <td className="px-3 py-3 text-right">
                    <VerifyRowActions row={r} onApply={(next) => apply(r.id, next)} onView={() => onView(r.id)} flash={flash} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-3 py-10 text-center text-sm text-slate-400">
                    无符合条件的工单
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
