// 企业尽调 · 常规筛查结果页（jd-company-result）· 1:1 复刻「尽调结果」
// 数据：本地样例 jdCompanyResult.json（橘 Sam）
import { useState } from 'react';
import { EpPage, EpCard, EpTag, EpBtn, DataTable, useSample } from '../../epCommon';
import type { Row } from '../../../../components/ui';

type Data = {
  company: {
    name: string
    tags: string[]
    actions: string[]
    info: Record<string, string>
  }
  leftNav: string[]
  topTabs: string[]
  activeTab: string
  score: {
    title: string
    score: number
    result: string
    resultColor: string
    gauges: { label: string; value: number; color: string }[]
  }
  riskSummary: {
    title: string
    items: { label: string; count: number; trend: string }[]
  }
  riskSections: {
    key: string
    title: string
    badge: string
    subtitle: string
    emptyText?: string
    rows?: { date?: string; type?: string; content?: string; authority?: string; source?: string; title?: string; sentiment?: string }[]
  }[]
  relationRisk: {
    title: string
    score: number
    desc: string
    tags: string[]
  }
  history: {
    title: string
    items: { date: string; item: string; before: string; after: string }[]
  }
  persons: {
    title: string
    items: { name: string; position: string; risk: string }[]
  }
  source: string
}

const seed: Data = {
  company: {
    name: '广州博鳌纵横网络科技有限公司',
    tags: ['高新技术企业', '专精特新', '科技型中小企业', '小微企业', '民营企业'],
    actions: ['关注', '导出报告', '订阅监控'],
    info: {
      creditCode: '91440101MA59M8J99F',
      legal: '谢旭辉',
      capital: '3000万人民币',
      estDate: '2016-05-20',
      status: '存续',
      industry: '软件和信息技术服务业',
      address: '广州市越秀区广州大道北路193号26B05房自编B01',
      phone: '020-88888888',
      email: 'example@bqzh.com',
    },
  },
  leftNav: ['企业评分', '企业风险', '企业档案', '关联企业', '人员风险', '历史信息', '知识产权'],
  topTabs: ['企业档案', '企业风险', '关联企业', '人员风险', '历史信息', '知识产权', '招投标', '融资', '年报'],
  activeTab: '企业风险',
  score: {
    title: '企业评分',
    score: 22,
    result: '不通过',
    resultColor: '#DC2626',
    gauges: [
      { label: '关联风险', value: 85, color: '#DC2626' },
      { label: '司法风险', value: 42, color: '#F59E0B' },
      { label: '经营风险', value: 38, color: '#F59E0B' },
      { label: '信用风险', value: 25, color: '#22C55E' },
      { label: '知识产权风险', value: 12, color: '#22C55E' },
    ],
  },
  riskSummary: {
    title: '风险概览',
    items: [
      { label: '自身风险', count: 45, trend: '+3' },
      { label: '关联风险', count: 128, trend: '+12' },
      { label: '历史风险', count: 8, trend: '-1' },
      { label: '提示信息', count: 16, trend: '+2' },
    ],
  },
  riskSections: [
    {
      key: 'judicial',
      title: '司法风险',
      badge: '8',
      subtitle: '被执行人、失信信息、裁判文书、开庭公告、法院公告',
      emptyText: '暂无相关司法风险',
    },
    {
      key: 'operation',
      title: '经营风险',
      badge: '6',
      subtitle: '经营异常、行政处罚、严重违法、股权冻结、清算信息',
      rows: [
        { date: '2026-07-15', type: '经营异常', content: '通过登记的住所或者经营场所无法联系', authority: '广州市市场监督管理局' },
        { date: '2026-03-22', type: '行政处罚', content: '发布虚假广告，罚款2万元', authority: '广州市越秀区市场监督管理局' },
      ],
    },
    {
      key: 'credit',
      title: '信用风险',
      badge: '2',
      subtitle: '欠税信息、税收违法、债券违约、征信逾期',
      emptyText: '暂无相关信用风险',
    },
    {
      key: 'ip',
      title: '知识产权风险',
      badge: '1',
      subtitle: '专利、商标、著作权、软件著作权',
      emptyText: '暂无相关知识产权风险',
    },
    {
      key: 'publicOpinion',
      title: '舆情风险',
      badge: '3',
      subtitle: '负面舆情、监管通报、媒体报道',
      rows: [
        { date: '2026-08-10', source: '网络媒体', title: '某公司被曝经营困难，员工工资拖欠', sentiment: '负面' },
      ],
    },
  ],
  relationRisk: {
    title: '关联风险',
    score: 85,
    desc: '关联企业存在较多司法风险与经营异常，可能对本企业产生连带影响',
    tags: ['投资人', '高管任职', '同一控制', '担保关系'],
  },
  history: {
    title: '历史信息',
    items: [
      { date: '2026-06-10', item: '法定代表人变更', before: '张三', after: '谢旭辉' },
      { date: '2025-11-03', item: '注册资本变更', before: '1000万人民币', after: '3000万人民币' },
      { date: '2024-09-18', item: '经营范围变更', before: '软件开发', after: '软件开发；信息技术咨询服务；企业管理咨询' },
    ],
  },
  persons: {
    title: '人员风险',
    items: [
      { name: '谢旭辉', position: '法定代表人/执行董事/经理', risk: '关联企业行政处罚 1 条' },
      { name: '李四', position: '监事', risk: '无' },
    ],
  },
  source: 'jdCompanyResult.json',
}

export default function JdCompanyResult({ params }: { params: URLSearchParams }) {
  const [data] = useSample<Data>('jdCompanyResult.json', seed)
  const [activeTopTab, setActiveTopTab] = useState(data.activeTab)
  const [activeLeftNav, setActiveLeftNav] = useState(data.leftNav[1])

  const infoEntries = Object.entries(data.company.info)

  return (
    <EpPage title="企业尽调" crumb="企业尽调 / 尽调结果">
      {/* 顶部公司信息头 */}
      <EpCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0F172A' }}>{data.company.name}</h2>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {data.company.tags.map((t) => (
                  <EpTag key={t} color="#1D4ED8" bg="#EFF6FF">
                    {t}
                  </EpTag>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px 24px', marginTop: 14, fontSize: 13, color: '#475569' }}>
              {infoEntries.map(([k, v]) => (
                <div key={k}>
                  <span style={{ color: '#94A3B8' }}>{labelMap[k] ?? k}：</span>
                  {v}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            {data.company.actions.map((a) => (
              <EpBtn key={a} variant={a === '导出报告' ? 'primary' : 'default'} size="sm">
                {a}
              </EpBtn>
            ))}
          </div>
        </div>
      </EpCard>

      {/* 顶部 Tab 栏 */}
      <div style={{ marginTop: 18, borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 140, zIndex: 20, background: '#fff' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {data.topTabs.map((t) => {
            const active = activeTopTab === t
            return (
              <button
                key={t}
                onClick={() => setActiveTopTab(t)}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: 14,
                  cursor: 'pointer',
                  color: active ? '#2563EB' : '#64748B',
                  fontWeight: active ? 600 : 400,
                  borderBottom: active ? '2px solid #2563EB' : '2px solid transparent',
                  marginBottom: -1,
                }}
              >
                {t}
              </button>
            )
          })}
        </div>
      </div>

      {/* 主体：左侧导航 + 右侧内容 */}
      <div style={{ display: 'flex', gap: 16, marginTop: 16, alignItems: 'flex-start' }}>
        {/* 左侧导航 */}
        <div style={{ width: 160, flexShrink: 0, position: 'sticky', top: 16 }}>
          {data.leftNav.map((item) => {
            const active = activeLeftNav === item
            return (
              <button
                key={item}
                onClick={() => setActiveLeftNav(item)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: active ? '#EFF6FF' : 'transparent',
                  color: active ? '#2563EB' : '#475569',
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                  marginBottom: 4,
                }}
              >
                {item}
              </button>
            )
          })}
        </div>

        {/* 右侧内容 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* 评分区 */}
          <EpCard>
            <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ textAlign: 'center', minWidth: 160 }}>
                <div style={{ fontSize: 14, color: '#64748B', marginBottom: 8 }}>{data.score.title}</div>
                <Gauge value={data.score.score} color="#DC2626" size={120} />
                <div style={{ marginTop: 8, fontSize: 24, fontWeight: 700, color: '#DC2626' }}>{data.score.score}</div>
                <div style={{ fontSize: 14, color: data.score.resultColor, fontWeight: 600 }}>评估结果：{data.score.result}</div>
              </div>
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>风险分布</div>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  {data.score.gauges.map((g) => (
                    <div key={g.label} style={{ textAlign: 'center', minWidth: 80 }}>
                      <Gauge value={g.value} color={g.color} size={72} />
                      <div style={{ marginTop: 6, fontSize: 13, color: '#475569' }}>{g.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </EpCard>

          {/* 风险概览 */}
          <EpCard style={{ marginTop: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>{data.riskSummary.title}</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {data.riskSummary.items.map((it) => (
                <div key={it.label} style={{ flex: 1, minWidth: 140, background: '#F8FAFC', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#0F172A' }}>{it.count}</div>
                  <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{it.label}</div>
                  <div style={{ fontSize: 12, color: it.trend.startsWith('+') ? '#DC2626' : '#22C55E', marginTop: 4 }}>{it.trend}</div>
                </div>
              ))}
            </div>
          </EpCard>

          {/* 关联风险 */}
          <EpCard style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{data.relationRisk.title}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#DC2626' }}>{data.relationRisk.score}</div>
            </div>
            <div style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>{data.relationRisk.desc}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {data.relationRisk.tags.map((t) => (
                <EpTag key={t} color="#B45309" bg="#FEF3C7">
                  {t}
                </EpTag>
              ))}
            </div>
          </EpCard>

          {/* 风险分块 */}
          {data.riskSections.map((sec) => (
            <EpCard key={sec.key} style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{sec.title}</span>
                <span style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 10 }}>{sec.badge}</span>
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 14 }}>{sec.subtitle}</div>
              {!sec.rows || sec.rows.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>{sec.emptyText}</div>
              ) : (
                <DataTable
                  columns={riskColumns(sec.key)}
                  rows={sec.rows as unknown as Row[]}
                  empty="暂无数据"
                />
              )}
            </EpCard>
          ))}

          {/* 历史信息 */}
          <EpCard style={{ marginTop: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>{data.history.title}</div>
            <DataTable
              columns={[
                { key: 'date', label: '变更日期', width: 120 },
                { key: 'item', label: '变更事项', width: 160 },
                { key: 'before', label: '变更前', width: 220 },
                { key: 'after', label: '变更后', width: 220 },
              ]}
              rows={data.history.items as unknown as Row[]}
              empty="暂无数据"
            />
          </EpCard>

          {/* 人员风险 */}
          <EpCard style={{ marginTop: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>{data.persons.title}</div>
            <DataTable
              columns={[
                { key: 'name', label: '姓名', width: 120 },
                { key: 'position', label: '职务', width: 220 },
                { key: 'risk', label: '风险提示', width: 260 },
              ]}
              rows={data.persons.items as unknown as Row[]}
              empty="暂无数据"
            />
          </EpCard>
        </div>
      </div>

      <div style={{ marginTop: 18, textAlign: 'center' }}>
      </div>
    </EpPage>
  )
}

const labelMap: Record<string, string> = {
  creditCode: '统一社会信用代码',
  legal: '法定代表人',
  capital: '注册资本',
  estDate: '成立日期',
  status: '经营状态',
  industry: '所属行业',
  address: '注册地址',
  phone: '联系电话',
  email: '联系邮箱',
}

function riskColumns(key: string) {
  if (key === 'operation') {
    return [
      { key: 'date', label: '日期', width: 110 },
      { key: 'type', label: '风险类型', width: 120 },
      { key: 'content', label: '内容', width: 360 },
      { key: 'authority', label: '决定机关', width: 180 },
    ]
  }
  if (key === 'publicOpinion') {
    return [
      { key: 'date', label: '日期', width: 110 },
      { key: 'source', label: '来源', width: 120 },
      { key: 'title', label: '标题', width: 420 },
      { key: 'sentiment', label: '情感', width: 100 },
    ]
  }
  return []
}

function Gauge({ value, color, size }: { value: number; color: string; size: number }) {
  const r = (size - 10) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - value / 100)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={8} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  )
}
