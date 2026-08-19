import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageShell } from './PageShell'
import { Panel, StatCard, Badge, Button, DataTable } from '../components/ui'
import type { Column, Row } from '../components/ui'

/* 数字营销 · AI营销 · 1:1 复刻（原生组件，非 iframe）
 * 源文件：
 *   record/qixin/营销 - AI营销.html        —— 主链接 / 输入页（自然语言输入框 + 示例 query + 生成按钮）
 *   record/qixin/营销 - AI营销 - 结果.html  —— 点击「生成营销方案」后的结果页
 * 页面类型：原生型（Vue SPA 快照，静态 DOM 仅含应用外壳，AI 内容由前端运行时渲染，未落入静态 HTML）。
 * 复刻铁律兜底：DOM 无真实字段 → 按结构捏硬编码样例。结构来自 qixin AI营销 范式：
 *   输入页 = 一句话找企业/客群/产品；结果页 = 需求理解 / 营销洞察 / 推荐企业名单 / 营销建议。
 * 跳转：企业名 → dm:ent-archive；加入营销名单 → dm:market-list；一键触达 → dm:market-lead。
 */

const EXAMPLES = [
  '@合合信息科技股份有限公司 访前营销一页纸分析',
  '上海市注册资本500万以下,成立3年以上,有联系方式的企业名单',
  '常州市新能源汽车产业链的上游供应商的企业名单',
  '我要找本地的科创金融企业客群名单',
  '最近 7 天上海市静安区应收帐款融资到期的企业',
]

// 输入页（主链接）：对应 营销 - AI营销.html
export default function DmAiMarketing() {
  const nav = useNavigate()
  const [q, setQ] = useState('')

  const go = (query: string) => {
    const qq = query.trim()
    if (!qq) return
    nav(`/console/dm/ai-marketing-result?q=${encodeURIComponent(qq)}`)
  }

  return (
    <div style={{ padding: 24, maxWidth: 1360, margin: '0 auto' }}>
      <PageShell title="AI营销" crumb="数字营销 / 潜客挖掘" subtitle="一句话找企业、找客群、匹配产品" legend={false} />

      <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
        <h2 className="text-xl font-bold text-ink-900">一句话找企业、找客群、匹配产品</h2>
        <p className="mt-1.5 text-sm text-slate-500">
          输入企业 / 客群 / 金融产品，AI 自动生成营销方案；输入 <code className="rounded bg-slate-100 px-1">@企业名</code> 可精准搜索企业。
        </p>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <textarea
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="输入企业/客群/金融产品，生成营销方案，输入 @企业名 可搜索企业"
            rows={3}
            className="w-full resize-none border-0 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-xs text-slate-400">支持自然语言客群圈选、产业链挖掘、到期提醒等</span>
            <button
              disabled={!q.trim()}
              onClick={() => go(q)}
              className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              生成营销方案
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => go(ex)}
              className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs text-brand-700 transition hover:border-brand-400 hover:bg-brand-50"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// 解析自然语言 query → 需求理解 chips（让不同示例 query 产生合理的 AI 理解）
function parseIntent(q: string): { label: string; value: string }[] {
  const chips: { label: string; value: string }[] = []
  if (q.startsWith('@')) {
    const m = q.match(/^@(\S+)\s*(.*)$/)
    const name = m?.[1] ?? q.replace('@', '')
    const rest = (m?.[2] ?? '').trim() || '访前营销一页纸分析'
    chips.push({ label: '企业', value: name })
    chips.push({ label: '分析', value: rest })
    return chips
  }
  const city = q.match(/(上海|北京|广州|深圳|常州|杭州|南京|成都|武汉|重庆|天津|苏州|静安区|徐汇区|浦东新区)/)
  if (city) chips.push({ label: '地区', value: city[1] })
  const reg = q.match(/注册资本(\d+)万(以下|以上)/)
  if (reg) chips.push({ label: '注册资本', value: `${reg[2] === '以下' ? '≤' : '≥'}${reg[1]}万` })
  const yrs = q.match(/成立(\d+)年/)
  if (yrs) chips.push({ label: '成立年限', value: `≥${yrs[1]}年` })
  if (/有联系/.test(q)) chips.push({ label: '联系方式', value: '有' })
  const ind = q.match(/(.+?)产业链/)
  if (ind) chips.push({ label: '产业链', value: ind[1] })
  if (/科创金融|科创/.test(q)) chips.push({ label: '客群', value: '科创金融' })
  const due = q.match(/(.+?)到期/)
  if (due) chips.push({ label: '到期提醒', value: due[1] })
  if (chips.length === 0) chips.push({ label: '查询', value: '自然语言营销目标' })
  chips.push({ label: '排序', value: '匹配度' })
  return chips
}

// 推荐企业名单（按结构硬编码样例：上海 / 注册资本≤500万 / 成立≥3年 / 有联系方式）
const COMPANY_COLUMNS: Column[] = [
  { key: 'name', label: '企业名称', fixed: 'left' },
  { key: 'region', label: '地区' },
  { key: 'industry', label: '行业' },
  { key: 'reg', label: '注册资本' },
  { key: 'founded', label: '成立日期' },
  { key: 'phone', label: '联系电话' },
  { key: 'match', label: '匹配度', type: 'progress', progressColor: 'bg-emerald-500', align: 'left' },
]

const SAMPLE_COMPANIES: Row[] = [
  { id: '1', name: '上海辰星信息技术有限公司', region: '上海市·浦东新区', industry: '软件和信息技术服务业', reg: '300万元', founded: '2019-04-12', phone: '138****5621', match: 92 },
  { id: '2', name: '上海云栖网络科技有限公司', region: '上海市·徐汇区', industry: '科技推广和应用服务业', reg: '200万元', founded: '2018-11-03', phone: '139****8842', match: 90 },
  { id: '3', name: '上海禾悦生物科技有限公司', region: '上海市·闵行区', industry: '科技推广和应用服务业', reg: '450万元', founded: '2017-06-21', phone: '137****1190', match: 88 },
  { id: '4', name: '上海智联数据服务有限公司', region: '上海市·静安区', industry: '软件和信息技术服务业', reg: '500万元', founded: '2020-02-15', phone: '136****3344', match: 87 },
  { id: '5', name: '上海启明智能装备有限公司', region: '上海市·嘉定区', industry: '通用设备制造业', reg: '480万元', founded: '2016-09-08', phone: '135****7712', match: 85 },
  { id: '6', name: '上海润和环保科技有限公司', region: '上海市·杨浦区', industry: '生态保护和环境治理业', reg: '350万元', founded: '2019-12-30', phone: '133****9056', match: 84 },
  { id: '7', name: '上海博远教育科技有限公司', region: '上海市·普陀区', industry: '科技推广和应用服务业', reg: '280万元', founded: '2021-03-18', phone: '188****2233', match: 83 },
  { id: '8', name: '上海泰昌医疗科技有限公司', region: '上海市·宝山区', industry: '专用设备制造业', reg: '420万元', founded: '2018-05-27', phone: '186****4410', match: 81 },
  { id: '9', name: '上海景行文化传媒有限公司', region: '上海市·长宁区', industry: '商务服务业', reg: '260万元', founded: '2020-08-11', phone: '199****6677', match: 80 },
  { id: '10', name: '上海同辉电子有限公司', region: '上海市·松江区', industry: '计算机、通信和其他电子设备制造业', reg: '390万元', founded: '2017-01-09', phone: '177****8821', match: 78 },
]

const KPI: { label: string; value: string; hint: string; accent: 'brand' | 'cyan' | 'violet' | 'emerald' }[] = [
  { label: '匹配企业', value: '1,286', hint: '家', accent: 'brand' },
  { label: '覆盖行业', value: '18', hint: '个', accent: 'cyan' },
  { label: '覆盖地区', value: '1', hint: '个市级行政区', accent: 'violet' },
  { label: '平均匹配度', value: '86%', accent: 'emerald' },
]

const SUGGESTIONS = [
  '优先触达匹配度 ≥ 90% 的 6 家企业，预计可转化 2-3 家。',
  '该批企业以科技推广与软件服务业为主，可结合科创金融政策提供信用贷方案。',
  '建议通过「短信 + 企业微信」双通道触达，首轮以产品权益包切入。',
  '其中 6 家有公开联系方式，建议 24 小时内跟进，其余转入企微加粉流程。',
]

// 结果页：对应 营销 - AI营销 - 结果.html
export function DmAiMarketingResult() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const q = params.get('q') || '上海市注册资本500万以下,成立3年以上,有联系方式的企业名单'
  const intent = parseIntent(q)

  const openArchive = (name: string) => {
    const back = `/console/dm/ai-marketing-result?q=${encodeURIComponent(q)}`
    nav(`/console/dm/ent-archive?name=${encodeURIComponent(name)}&back=${encodeURIComponent(back)}`)
  }

  return (
    <div style={{ padding: 24, maxWidth: 1360, margin: '0 auto' }}>
      <PageShell
        title="AI营销"
        crumb="数字营销 / 潜客挖掘"
        subtitle="AI 生成的一站式智能营销方案"
        legend={false}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => nav('/console/dm/ai-marketing')}>← 返回</Button>
            <Button variant="primary" size="sm" onClick={() => nav('/console/dm/ai-marketing')}>重新生成</Button>
          </>
        }
      />

      {/* 需求回显 + AI 需求理解 */}
      <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
        <div className="text-xs text-slate-400">你的营销目标</div>
        <div className="mt-1 text-base font-semibold text-ink-900">{q}</div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">AI 需求理解</span>
          {intent.map((c) => (
            <span key={c.label} className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs text-brand-700">
              <span className="text-brand-400">{c.label}</span>
              <span className="font-medium">{c.value}</span>
            </span>
          ))}
        </div>
      </div>

      {/* 营销洞察 KPI */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPI.map((k) => (
          <StatCard key={k.label} label={k.label} value={k.value} hint={k.hint} accent={k.accent} />
        ))}
      </div>

      {/* 推荐企业名单 */}
      <div className="mt-5">
        <Panel
          title="推荐企业名单"
          desc={<span className="text-xs text-slate-400">基于需求理解智能匹配</span>}
          actions={
            <>
              <Button variant="secondary" size="sm" onClick={() => nav('/console/dm/market-list')}>加入营销名单</Button>
              <Button variant="primary" size="sm" onClick={() => nav('/console/dm/market-lead')}>一键触达</Button>
            </>
          }
        >
          <DataTable
            columns={COMPANY_COLUMNS}
            rows={SAMPLE_COMPANIES}
            clickableKey="name"
            onCellClick={(r) => openArchive(r.name as string)}
            pager
            exportable
            exportName="AI营销企业名单"
          />
        </Panel>
      </div>

      {/* 营销建议 */}
      <div className="mt-5">
        <Panel title="营销建议" desc={<span className="text-xs text-slate-400">AI 生成的触达策略</span>}>
          <ul className="space-y-2.5">
            {SUGGESTIONS.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-600">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}
