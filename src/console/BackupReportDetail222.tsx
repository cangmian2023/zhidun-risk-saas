/* ============================================================================
 * 方案222 备用信息核验报告（模板驱动 + 样例数据）
 *
 * 完全由「方案222 备用模板」(tpl-info-backup222) 驱动：
 *   - 报告内容（用户基本信息 / 证件照 / 多源核验 / 交叉融合 / 操作日志）全部读取模板 demo 字段
 *   - 评分卡 / 评分维度分布 / 特殊命中规则 / 构成项分解表 由模板 scoreDisplay + specialRules 驱动
 *   - 与现有信息核验页面（PreVerifyDetail / tpl-info-standard）完全隔离，不替换任何现有功能
 *   - 用途：验证「模板 + 样例数据 → 还原一份及格的报告内容」链路（0802 映射项 1–18）
 * ========================================================================== */
import { useNavigate } from 'react-router-dom'
import { Badge, DetailHeader, Panel } from '../components/ui'
import { ScoreVisual } from './ScoreVisual'
import { TemplateDimTable } from './TemplateDimTable'
import { useTemplate } from './templateStore'
import { DisplayModeToggle } from './DisplayModeToggle'
import { fieldGridClass, type SectionConfig } from './reportTemplateData'

type DemoStatus = 'pass' | 'warn' | 'reject'
const BADGE_KIND: Record<DemoStatus, 'green' | 'amber' | 'red'> = { pass: 'green', warn: 'amber', reject: 'red' }
const STATUS_LABEL: Record<DemoStatus, string> = { pass: '正常', warn: '关注', reject: '拒绝' }

/** 样例报告级元信息（来自模板 demoApplicant + 固定样例） */
const SAMPLE_RISK_SCORE = 18 // 综合异常值（越高风险越高），演示为「关注」
const SAMPLE_HIT_RULES = ['设备群控', '黑名单命中'] // 演示中命中的规则名

const OP_LOGS = [
  { time: '2026-07-21 15:00:22', actor: '系统', action: '生成报告', detail: '综合信用模型 V2.6 自动生成' },
  { time: '2026-07-21 15:00:12', actor: '数据源·运营商', action: '核验完成', detail: '运营商实名：已实名' },
  { time: '2026-07-21 15:00:05', actor: '数据源·公安', action: '核验完成', detail: '公安实名：一致' },
  { time: '2026-07-21 14:59:50', actor: '风控', action: '规则评估', detail: '命中「设备群控」→ 预警' },
]

export default function BackupReportDetail222() {
  const nav = useNavigate()
  const tpl = useTemplate('tpl-info-backup222')

  if (!tpl) {
    return (
      <div className="p-10 text-center text-slate-400">
        未找到方案222 备用模板（tpl-info-backup222）。
      </div>
    )
  }

  const applicant = tpl.demoApplicant ?? {}
  const reportId = applicant['报告ID'] ?? 'CR20260721001'
  const computedAt = applicant['计算时间'] ?? '2026-07-21 15:00:22'
  const applicantRows = Object.entries(applicant).filter(([k]) => k !== '报告ID' && k !== '计算时间')
  const contentSecs = tpl.sections.filter((s) => (s.homeTab ?? 'content') === 'content' && s.visible)

  // 异常值配色（越高风险越高）
  const anomalyColor = (v: number) => (v >= 51 ? 'text-rose-600' : v >= 21 ? 'text-amber-600' : 'text-emerald-600')
  const anomalySign = (v: number) => (v < 0 ? '−' : '+')

  // 构成项分解表（item 6）：由 specialRules 中带 score 的规则驱动
  const breakdown = (tpl.specialRules ?? []).filter((r) => typeof r.score === 'number')
  const breakdownTotal = breakdown.reduce((a, r) => a + (r.score ?? 0), 0)

  // 导航（item 18）
  const navCards = [
    { id: 'score', label: '异常值模型卡' },
    ...contentSecs.map((s) => ({ id: s.id, label: s.name })),
    { id: 'special', label: '特殊命中规则' },
    ...(tpl.showOpLog ? [{ id: 'oplogs', label: '操作日志' }] : []),
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <DetailHeader
        title={tpl.name}
        crumb="报告中心 / 信息核验 / 方案222 备用"
        subtitle={`${tpl.version} · 报告ID ${reportId} · 计算时间 ${computedAt}`}
        backLabel="返回模板详情"
        onBack={() => nav(`/console/cm/report-template?id=${tpl.id}`)}
        actions={<Badge kind="amber">方案222 · 备用验证 · 不影响现有功能</Badge>}
      />

      {/* 顶部导航（item 18）：提取所有卡片标题，点击快速定位 */}
      <div className="mx-auto max-w-5xl px-5 pt-4">
        <div className="flex flex-wrap gap-2">
          {navCards.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 transition hover:border-brand-400 hover:text-brand-700"
            >
              {n.label}
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-4 p-5">
        {/* 申请人概览（item 9 / 报告ID / 计算时间 / 申请人信息） */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400">综合异常值（越高风险越高）</div>
              <div className={`text-3xl font-bold ${anomalyColor(SAMPLE_RISK_SCORE)}`}>
                {anomalySign(SAMPLE_RISK_SCORE)}
                {Math.abs(SAMPLE_RISK_SCORE)}
              </div>
              <div className="mt-1 text-xs text-slate-500">规则版本 {tpl.version} · 报告ID {reportId}</div>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
              {applicantRows.map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-slate-400">{k}</span>
                  <span className="font-medium text-ink-900">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 异常值模型卡（item 1–3 / 6 / 8：综合信用模型名 / 分数值 / 构成项分解 / 规则版本） */}
        <Panel id="score" title="异常值模型卡" desc="分数值由评分卡形态驱动；构成项分解表由「特殊命中规则」配置驱动。">
          <div className="flex flex-wrap items-center gap-6">
            <div className="text-center">
              <div className={`text-5xl font-bold tabular-nums ${anomalyColor(SAMPLE_RISK_SCORE)}`}>
                {anomalySign(SAMPLE_RISK_SCORE)}
                {Math.abs(SAMPLE_RISK_SCORE)}
              </div>
              <div className="mt-1 text-xs text-slate-400">异常值（0-100，≥80 高危）</div>
            </div>
            <div className="min-w-[260px] flex-1">
              <ScoreVisual sd={tpl.scoreDisplay} rawScore={SAMPLE_RISK_SCORE} />
            </div>
          </div>

          {/* 构成项分解表（item 6） */}
          <div className="mt-4">
            <div className="mb-1 text-xs font-medium text-slate-500">构成项分解（风险维度 / 用户情况 / 得分 / 权重 / 等级）</div>
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-400">
                    <th className="px-3 py-2 font-medium">风险维度</th>
                    <th className="px-3 py-2 font-medium">用户情况</th>
                    <th className="px-3 py-2 text-right font-medium">得分</th>
                    <th className="px-3 py-2 text-right font-medium">权重</th>
                    <th className="px-3 py-2 text-center font-medium">等级</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((r) => {
                    const lvl = r.priority === 'decisive' ? '高' : r.priority === 'warning' ? '中' : '低'
                    const lvlCls = lvl === '高' ? 'bg-orange-100 text-orange-700' : lvl === '中' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    return (
                      <tr key={r.id} className="border-t border-slate-100">
                        <td className="px-3 py-2.5 font-medium text-ink-900">{r.ruleName}</td>
                        <td className="px-3 py-2.5 text-slate-500">{r.note ?? '—'}</td>
                        <td className={`px-3 py-2.5 text-right font-semibold ${anomalyColor(r.score ?? 0)}`}>{anomalySign(r.score ?? 0)}{Math.abs(r.score ?? 0)}</td>
                        <td className="px-3 py-2.5 text-right text-slate-400">{r.weight ?? 0}%</td>
                        <td className="px-3 py-2.5 text-center"><span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${lvlCls}`}>{lvl}</span></td>
                      </tr>
                    )
                  })}
                  <tr className="border-t border-slate-200 bg-slate-50">
                    <td className="px-3 py-2.5 font-semibold text-ink-900" colSpan={2}>合计</td>
                    <td className={`px-3 py-2.5 text-right font-bold ${anomalyColor(breakdownTotal)}`}>{anomalySign(breakdownTotal)}{Math.abs(breakdownTotal)}</td>
                    <td className="px-3 py-2.5 text-right text-slate-400">{breakdown.reduce((a, r) => a + (r.weight ?? 0), 0)}%</td>
                    <td className="px-3 py-2.5" />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 判定规则 + 审计栏（item 2 / 8） */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            <span>判定规则：异常值 ≥80 高危 / 20–80 警示·关注 / &lt;20 安全；命中决定规则直接定结论。</span>
            <span>模型版本 {tpl.version} · 计算时间 {computedAt}</span>
          </div>
        </Panel>

        {/* 评分维度分布（item 4 / 5：由模板 showSectionTotals 控制显示） */}
        {tpl.showSectionTotals && <TemplateDimTable templateId="tpl-info-backup222" title="评分维度分布（各集合加权）" />}

        {/* 报告内容配置各分段（item 10–13） */}
        {contentSecs.map((s) => (
          <Panel
            key={s.id}
            id={s.id}
            title={s.name}
            desc={s.desc}
            actions={
              <div className="flex items-center gap-3">
                <span className={`text-sm font-semibold ${anomalyColor(s.demoScore ?? 0)}`}>{anomalySign(s.demoScore ?? 0)}{Math.abs(s.demoScore ?? 0)}</span>
                <DisplayModeToggle reportType="info_verify" sectionId={s.id} />
              </div>
            }
          >
            <SectionBody section={s} />
            <div className="mt-2 text-right text-[11px] text-slate-400">
              本卡权重 {s.weight ?? 1}% · 显示方式 {(s.displayMode ?? 'list') === 'card' ? '小卡片' : '列表'}
            </div>
          </Panel>
        ))}

        {/* 特殊命中规则（item 5） */}
        <Panel id="special" title="特殊命中规则">
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400">
                  <th className="px-3 py-2 font-medium">规则名称</th>
                  <th className="px-3 py-2 font-medium">来源分段</th>
                  <th className="px-3 py-2 text-center font-medium">命中</th>
                  <th className="px-3 py-2 text-center font-medium">等级</th>
                  <th className="px-3 py-2 text-center font-medium">结论</th>
                  <th className="px-3 py-2 text-right font-medium">贡献分</th>
                </tr>
              </thead>
              <tbody>
                {(tpl.specialRules ?? []).map((r) => {
                  const hit = SAMPLE_HIT_RULES.includes(r.ruleName)
                  const lvl = r.priority === 'decisive' ? '高' : r.priority === 'warning' ? '中' : '低'
                  const lvlCls = lvl === '高' ? 'bg-orange-100 text-orange-700' : lvl === '中' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  return (
                    <tr key={r.id} className="border-t border-slate-100">
                      <td className="px-3 py-2.5 font-medium text-ink-900">{r.ruleName}</td>
                      <td className="px-3 py-2.5 text-slate-500">{r.sectionName}</td>
                      <td className="px-3 py-2.5 text-center">
                        {hit ? <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-medium text-rose-700">命中</span>
                          : <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">未命中</span>}
                      </td>
                      <td className="px-3 py-2.5 text-center"><span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${lvlCls}`}>{lvl}</span></td>
                      <td className="px-3 py-2.5 text-center text-slate-600">{r.autoResult}</td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${anomalyColor(r.score ?? 0)}`}>{anomalySign(r.score ?? 0)}{Math.abs(r.score ?? 0)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* 操作日志（item 7 / 17） */}
        {tpl.showOpLog && (
          <Panel id="oplogs" title="操作日志">
            <div className="space-y-2">
              {OP_LOGS.map((l, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 px-3 py-2 text-sm">
                  <span className="mt-0.5 text-xs text-slate-400">{l.time}</span>
                  <span className="mt-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">{l.actor}</span>
                  <span className="mt-0.5 font-medium text-ink-900">{l.action}</span>
                  <span className="mt-0.5 text-slate-500">{l.detail}</span>
                </div>
              ))}
            </div>
          </Panel>
        )}

        <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700">
          方案222 备用验证：本页内容完全由「报告模板 · {tpl.name}」+ 其样例数据驱动。在报告模板页编辑该模板（集合名称、权重、显隐、示例分值/字段、特殊命中规则）后，返回本页即可看到实时更新。当前不替换任何现有信息核验功能。
        </p>
      </div>
    </div>
  )
}

/* 分段字段渲染：优先读取模板 demoValues（样例数据），缺失时回落到字段名；支持内部分组 + 列表/小卡片切换 */
function SectionBody({ section }: { section: SectionConfig }) {
  const mode = section.displayMode ?? 'list'
  const groups = section.fieldGroups ?? []
  const fields = section.fields.filter((f) => f.visible !== false)
  const byGroup = (gid?: string) => fields.filter((f) => (f.group ?? groups[0]?.id) === gid)

  const renderRow = (fid: string, name: string, dv?: { value: string; status: DemoStatus }) => {
    const status = dv?.status ?? 'pass'
    const value = dv?.value ?? '—'
    if (mode === 'card') {
      return (
        <div key={fid} className="flex flex-col gap-1 rounded-lg border border-slate-100 px-3 py-2 text-sm">
          <span className="truncate text-xs text-slate-500" title={name}>{name}</span>
          <div className="flex items-center justify-between">
            <span className="font-medium text-ink-900">{value}</span>
            <Badge kind={BADGE_KIND[status]}>{STATUS_LABEL[status]}</Badge>
          </div>
        </div>
      )
    }
    return (
      <div key={fid} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
        <span className="text-slate-600">{name}</span>
        <div className="flex items-center gap-2">
          <span className="font-medium text-ink-900">{value}</span>
          <Badge kind={BADGE_KIND[status]}>{STATUS_LABEL[status]}</Badge>
        </div>
      </div>
    )
  }

  const wrapCls = mode === 'card' ? fieldGridClass('card') : 'space-y-1.5'

  if (groups.length === 0) {
    return <div className={wrapCls}>{fields.map((f) => renderRow(f.id, f.name, section.demoValues?.[f.id]))}</div>
  }
  return (
    <div className="space-y-4">
      {groups.map((g) => {
        const gFields = byGroup(g.id)
        if (gFields.length === 0) return null
        return (
          <div key={g.id}>
            <div className="mb-1 text-[11px] font-semibold text-slate-500">{g.name}</div>
            <div className={wrapCls}>{gFields.map((f) => renderRow(f.id, f.name, section.demoValues?.[f.id]))}</div>
          </div>
        )
      })}
    </div>
  )
}
