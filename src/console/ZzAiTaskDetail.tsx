// AI 外呼任务详情页（独立全屏页面，替代原弹窗形态）
// 七大模块：①基础信息 ②配置快照 ③指标看板 ④异常风险 ⑤运营复盘指引 ⑥通话明细 ⑦操作区+日志
import { useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ZzPage, ZzCard, ZzTable, ZzBadge, ZzBtn, ZzTabs, ZzFilterBar, ZzField, ZzSelect, ZzStat, ZzInput } from './zzUi'
import { ZZ_AI_TASKS, ZZ_AI_TASK_CONFIG, ZZ_AI_CALL_DETAILS, ZZ_AI_BATCHES, ZZ_AI_OPLOG } from './zzData'

const GREEN = '#16A34A'; const RED = '#DC2626'; const AMBER = '#D97706'; const BLUE = '#1677ff'; const GRAY = '#9CA3AF'
const statusColor: any = { 运行中: GREEN, 已暂停: AMBER, 已终止: RED, 待执行: BLUE, 已完成: GRAY }

export function ZzAiTaskDetail() {
  const nav = useNavigate()
  const loc = useLocation()
  const taskId = new URLSearchParams(loc.search).get('taskId') || ZZ_AI_TASKS[0].id
  const t = ZZ_AI_TASKS.find((x) => x.id === taskId) || ZZ_AI_TASKS[0]
  const isAuto = t.type === '自动周期'
  const cfg = ZZ_AI_TASK_CONFIG[t.id] || {}
  const calls = Array.isArray(ZZ_AI_CALL_DETAILS[t.id]) ? ZZ_AI_CALL_DETAILS[t.id] : []
  const batches = ZZ_AI_BATCHES[t.id] || []
  const oplog = ZZ_AI_OPLOG[t.id] || []
  const k = t.kpi

  const [tab, setTab] = useState('指标看板')
  const [cFilter, setCFilter] = useState('')
  const [cKw, setCKw] = useState('')

  const failTop = useMemo(() => Object.entries(t.fail || {}).map(([name, v]) => ({ name, v: v as number })).sort((a, b) => b.v - a.v), [t])

  const filteredCalls = useMemo(() => calls.filter((c) =>
    (!cKw || (c.cust + c.caseNo + c.callId).toLowerCase().includes(cKw.toLowerCase())) &&
    (!cFilter || c.result === cFilter || c.intent === cFilter)
  ), [calls, cKw, cFilter])

  const cards = [
    { label: '计划捞案总数', value: k.pending, tip: '按筛选条件命中的案件总量' },
    { label: '有效待呼叫数', value: Math.max(0, k.pending - (k.called || 0)), tip: '尚未发起呼叫的案件' },
    { label: '规则拦截数', value: Math.round(k.pending * 0.12), tip: '命中排除规则被过滤的案件' },
    { label: '无效号码过滤', value: (t.fail?.空号 || 0) + (t.fail?.号码错误 || 0), tip: '空号/号码错误未发起' },
    { label: '实际发起呼叫', value: k.called, tip: '已拨出呼叫总量', accent: BLUE },
    { label: '接通量', value: k.connected, tip: '客户接听总量', accent: GREEN },
    { label: '接通率', value: ((k.connectRate || 0) * 100).toFixed(1) + '%', tip: '接通/发起', accent: GREEN },
    { label: '成功PTP', value: k.promise, tip: '达成还款承诺户数', accent: GREEN },
    { label: '转人工跟进', value: k.toHuman, tip: '需人工接手户数', accent: AMBER },
  ]
  const failBreak = [
    { label: '关机', v: t.fail?.关机 || 0 }, { label: '空号', v: t.fail?.空号 || 0 },
    { label: '拒接', v: t.fail?.拒接 || 0 }, { label: '无人接听', v: k.noAnswer || 0 }, { label: '运营商拦截', v: t.fail?.号码错误 || 0 },
  ]

  return (
    <ZzPage
      title={`AI外呼任务详情 · ${t.name}`}
      crumb="催贷管理 / AI自动外呼 / 任务详情"
      subtitle="任务全生命周期全景复盘与业务闭环（只读查看 + 轻度操作）"
      actions={<ZzBtn kind="text" onClick={() => nav('/console/zz/ai-task')}>← 返回任务总览</ZzBtn>}
    >
      {/* 模块1 头部基础信息栏 */}
      <ZzCard title="① 任务基础信息">
        <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          {[
            ['任务ID', <span className="flex items-center gap-1 font-medium">{t.id}<ZzBtn sm kind="text" onClick={() => navigator.clipboard?.writeText(t.id)}>复制</ZzBtn></span>],
            ['任务类型', <ZzBadge color={isAuto ? BLUE : GRAY}>{t.type}</ZzBadge>],
            ['绑定话术模板', <ZzBtn sm kind="text" onClick={() => nav('/console/zz/ai-template')}>{t.template} ↗</ZzBtn>],
            ['当前状态', <ZzBadge color={statusColor[t.status]}>{t.status}</ZzBadge>],
            ['创建人', '话术管理员(7703)'],
            ['创建时间', '2026-08-19 10:00'],
            ['执行时间规则', isAuto ? t.schedule : t.schedule.replace('每日 ', '单次 ')],
            ['下次执行', isAuto ? (t.nextRun || '-') : '（手动任务无）'],
            ['任务备注', '—'],
          ].map(([key, val]) => (
            <div key={key} className="rounded border px-3 py-2"><div className="text-xs text-gray-400">{key}</div><div className="mt-0.5 font-medium">{val}</div></div>
          ))}
        </div>
      </ZzCard>

      <ZzTabs tabs={['指标看板', '配置快照', '异常风险', '通话明细', ...(isAuto ? ['执行批次'] : []), '操作日志']} active={tab} onChange={setTab} />

      {/* 模块3 指标看板 */}
      {tab === '指标看板' && (
        <div className="space-y-4">
          <ZzCard title="任务核心数据指标看板">
            <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
              {cards.map((c) => (
                <div key={c.label} className="rounded border px-3 py-3" title={c.tip}>
                  <div className="text-xs text-gray-400">{c.label}</div>
                  <div className="mt-1 text-xl font-semibold" style={{ color: c.accent }}>{c.value}</div>
                </div>
              ))}
            </div>
          </ZzCard>
          <ZzCard title="未接通原因分布">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {failBreak.map((f) => (
                <div key={f.label} className="rounded border px-3 py-3">
                  <div className="text-xs text-gray-400">{f.label}</div>
                  <div className="mt-1 text-lg font-semibold text-red-500">{f.v}</div>
                </div>
              ))}
            </div>
          </ZzCard>
          <ZzCard title="业务转化指标">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {[
                ['成功PTP户数', k.promise, GREEN], ['延期协商户数', 4, AMBER], ['主动还款户数', 3, GREEN],
                ['转人工跟进', k.toHuman, AMBER], ['无效沟通户', Math.max(0, k.connected - k.promise - 4 - 3), GRAY],
              ].map(([label, v, color]) => (
                <div key={label} className="rounded border px-3 py-3"><div className="text-xs text-gray-400">{label}</div><div className="mt-1 text-xl font-semibold" style={{ color } as any}>{v}</div></div>
              ))}
            </div>
          </ZzCard>
        </div>
      )}

      {/* 模块2 配置快照 */}
      {tab === '配置快照' && (
        <div className="space-y-4">
          <ZzCard title="案件筛选规则快照">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(cfg.filterSnapshot || {}).map(([key, val]) => (
                <div key={key} className="rounded border px-3 py-2"><div className="text-xs text-gray-400">{key}</div><div className="mt-0.5 font-medium">{val as string}</div></div>
              ))}
            </div>
          </ZzCard>
          <ZzCard title="外呼合规配置">
            <div className="grid grid-cols-3 gap-2 text-sm">
              {Object.entries(cfg.compliance || {}).map(([key, val]) => (
                <div key={key} className="rounded border px-3 py-2"><div className="text-xs text-gray-400">{key}</div><div className="mt-0.5 font-medium">{val as string}</div></div>
              ))}
            </div>
          </ZzCard>
          <ZzCard title="呼叫策略配置">
            <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
              {Object.entries(cfg.callStrategy || {}).map(([key, val]) => (
                <div key={key} className="rounded border px-3 py-2"><div className="text-xs text-gray-400">{key}</div><div className="mt-0.5 font-medium">{val as string}</div></div>
              ))}
            </div>
          </ZzCard>
          <ZzCard title="客户拦截规则">
            <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
              {Object.entries(cfg.intercept || {}).map(([key, val]) => (
                <div key={key} className="rounded border px-3 py-2"><div className="text-xs text-gray-400">{key}</div><div className="mt-0.5 font-medium">{val as string}</div></div>
              ))}
            </div>
          </ZzCard>
        </div>
      )}

      {/* 模块4 异常风险 */}
      {tab === '异常风险' && (
        <div className="space-y-4">
          <ZzCard title="呼叫失败 TOP 原因（按占比排序）">
            <ZzTable head={['失败原因', '数量', '占比']} rows={failTop.map((f) => [
              f.name, <span className="text-red-500">{f.v}</span>, ((f.v / Math.max(1, failTop.reduce((a, b) => a + b.v, 0))) * 100).toFixed(1) + '%',
            ])} />
          </ZzCard>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ZzCard title="低质量客户汇总"><div className="space-y-1 text-sm"><div>多次呼叫无应答：{k.noAnswer}</div><div>长期失联：{t.fail?.关机 || 0}</div><div>无还款意愿：{Math.max(0, k.connected - k.promise - 7)}</div></div></ZzCard>
            <ZzCard title="规则异常提示"><div className="space-y-1 text-sm text-amber-600"><div>重复呼叫预警：0</div><div>超频次呼叫：0</div><div>合规风险提示：夜间禁呼已拦截</div></div></ZzCard>
            <ZzCard title="数据异常告警"><div className="space-y-1 text-sm text-red-500"><div>接通率过低：否（{(k.connectRate * 100).toFixed(1)}%）</div><div>转化率异常：否</div><div>批量拦截异常：否</div></div></ZzCard>
          </div>
        </div>
      )}

      {/* 模块6 通话明细 */}
      {tab === '通话明细' && (
        <ZzCard title={`通话明细（${filteredCalls.length}）`}>
          <ZzFilterBar>
            <ZzField label="搜索"><ZzInput placeholder="客户/案件/通话ID" value={cKw} onChange={(e) => setCKw(e.target.value)} /></ZzField>
            <ZzField label="呼叫结果/意图"><ZzSelect value={cFilter} onChange={(e) => setCFilter(e.target.value)}><option value="">全部</option><option>接通</option><option>关机</option><option>空号</option><option>拒接</option><option>无人接听</option><option>运营商拦截</option><option>有还款意愿</option><option>无还款意愿</option><option>需协商分期</option><option>情绪激动</option></ZzSelect></ZzField>
            <ZzBtn onClick={() => alert('已导出通话明细')}>导出明细</ZzBtn>
          </ZzFilterBar>
          <ZzTable stickyAction head={['通话ID', '客户', '案件编号', '呼叫时间', '时长', '结果', '客户意图', 'PTP', '录音', '操作']} rows={filteredCalls.map((c) => [
            c?.callId ?? '-', c?.cust ?? '-', <ZzBtn sm kind="text" onClick={() => nav('/console/zz/case-detail?id=' + (c?.caseNo ?? ''))}>{c?.caseNo ?? '-'} ↗</ZzBtn>, c?.time ?? '-', (c?.duration ?? 0) + 's',
            <ZzBadge color={(c?.result ?? '') === '接通' ? GREEN : RED}>{c?.result ?? '-'}</ZzBadge>,
            <ZzBadge color={(c?.intent ?? '') === '有还款意愿' ? GREEN : (c?.intent ?? '') === '情绪激动' ? RED : GRAY}>{c?.intent ?? '-'}</ZzBadge>,
            (c?.ptp) ? <ZzBadge color={GREEN}>是</ZzBadge> : '否',
            c?.recording ? <ZzBtn sm onClick={() => alert('播放录音 ' + (c?.callId ?? ''))}>▶ 录音</ZzBtn> : '—',
            <div className="flex gap-1">
              <ZzBtn sm onClick={() => alert('通话详情 ' + (c?.callId ?? ''))}>详情</ZzBtn>
              {c?.asr && <ZzBtn sm onClick={() => alert('ASR 转写 ' + (c?.callId ?? ''))}>转写</ZzBtn>}
            </div>,
          ])} />
        </ZzCard>
      )}

      {/* 模块7-执行批次（仅自动任务） */}
      {tab === '执行批次' && isAuto && (
        <ZzCard title="历史执行批次（多批次对比复盘）">
          <ZzTable head={['批次', '执行时间', <span className="inline-flex items-center gap-1">捞案数<span className="cursor-help text-xs text-gray-400" title="从总案件池中按策略捞取（分配）给本次外呼任务进行催收的案件数量">ⓘ</span></span>, '发起呼叫', '接通率', 'PTP', '状态']} rows={batches.map((b) => [
            b.batch, b.time, b.fetched, b.called, b.connectRate, b.promise, <ZzBadge color={GRAY}>{b.status}</ZzBadge>,
          ])} />
        </ZzCard>
      )}

      {/* 模块7 操作区 + 全量日志 */}
      {tab === '操作日志' && (
        <div className="space-y-4">
          <ZzCard title="任务操作">
            <div className="flex flex-wrap gap-2">
              <ZzBtn sm onClick={() => alert('已刷新实时数据')}>刷新实时数据</ZzBtn>
              <ZzBtn sm onClick={() => alert('已导出任务全量报表')}>导出任务报表</ZzBtn>
              <ZzBtn sm onClick={() => alert('已导出通话明细')}>导出通话明细</ZzBtn>
              <ZzBtn sm onClick={() => alert('已批量标记无效客户')}>批量标记无效客户</ZzBtn>
              <ZzBtn sm onClick={() => alert('已加入拦截名单')}>批量加入拦截名单</ZzBtn>
              {isAuto && <><ZzBtn sm danger onClick={() => alert('任务已暂停')}>暂停任务</ZzBtn><ZzBtn sm onClick={() => alert('任务已重启')}>重启任务</ZzBtn><ZzBtn sm onClick={() => alert('修改下次执行规则')}>修改执行规则</ZzBtn></>}
            </div>
          </ZzCard>
          <ZzCard title="全生命周期操作日志">
            <ZzTable head={['操作时间', '操作人', '操作内容', 'IP溯源']} rows={oplog.map((o) => [o.time, o.operator, o.action, o.ip])} />
          </ZzCard>
        </div>
      )}
    </ZzPage>
  )
}
