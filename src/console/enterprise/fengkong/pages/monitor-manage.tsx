// 企业风控 · 监控规则（fk-monitor-manage）· 1:1 复刻「监控规则」截图
// 数据：本地样例 fkMonManage.json（橘 Sam）
import { useState } from 'react'
import { EpPage, EpCard, EpTag, EpBtn, EpDrawer, DataTable, useSample, Sam } from '../../epCommon'
import type { Row, Column } from '../../../../components/ui'
import { usePageNav } from '../../../pageNav'

type MonData = typeof seed

const seed = {
  rules: [
    { id: 1, name: '外部供应链风险', type: '外部供应链风险', target: '北京首都国际机场，PEK BEIJING CAPITAL INTERNATIONAL AIRPORT）等共计59个', desc: '-', creator: '19156027703', createTime: '2026-08-17' },
    { id: 2, name: '企业征信推荐关键词', type: '关键词', target: '关键词舆情', desc: '-', creator: '19156027703', createTime: '2026-08-17' },
    { id: 3, name: '企业征信默认规则(国内)', type: '国内企业', target: '抖音有限公司等共计13家企业', desc: '-', creator: '企业征信', createTime: '2026-08-17' },
    { id: 4, name: '企业征信默认规则(境外)', type: '境外企业', target: 'Tesla, Inc.等共计3家海外企业', desc: '-', creator: '企业征信', createTime: '2026-08-17' },
  ],
  subscriptions: {
    国内企业: [
      { id: 1, name: '抖音有限公司', subscriber: '19156027703', time: '2026-08-17 10:22' },
      { id: 2, name: '北京首都国际机场', subscriber: '19156027703', time: '2026-08-17 10:22' },
    ],
    境外企业: [
      { id: 1, name: 'Tesla, Inc.', subscriber: '19156027703', time: '2026-08-16 14:05' },
    ],
    外部供应链风险: [
      { id: 1, name: '深圳市腾讯计算机系统有限公司', subscriber: '19156027703', time: '2026-08-15 09:11' },
    ],
    关键词: [
      { id: 1, name: '债务违约', subscriber: '19156027703', time: '2026-08-14 16:40' },
    ],
    微信公众号: [
      { id: 1, name: '企业征信风险观察', subscriber: '19156027703', time: '2026-08-13 11:30' },
    ],
  },
  detail: {
    ruleName: '企业征信默认规则(国内)',
    ruleNameMax: 20,
    ruleDesc: '默认工商 / 司法 / 经营风险监控',
    ruleDescMax: 150,
    totalDims: 823,
    monitoredDims: 457,
    levelCounts: { high: 129, mid: 159, low: 169, micro: 0, daily: 12 },
    categories: ['基本信息', '经营风险', '司法风险', '经营信息', '企业舆情', '供应链风险', '关联方风险'],
    dims: [
      { id: 1, category: '基本信息', name: '地址信息', grade: '中风险', score: 40, op: '变更', cond: '任意' },
      { id: 2, category: '基本信息', name: '经营范围', grade: '中风险', score: 40, op: '变更', cond: '任意' },
      { id: 3, category: '基本信息', name: '经营期限', grade: '低风险', score: 20, op: '小于等于', cond: '30天' },
      { id: 4, category: '基本信息', name: '法定代表人', grade: '高风险', score: 80, op: '变更', cond: '任意' },
      { id: 5, category: '基本信息', name: '注册资本', grade: '中风险', score: 50, op: '介于', cond: '10%~50%' },
      { id: 6, category: '基本信息', name: '注册资本减资比例', grade: '高风险', score: 85, op: '大于等于', cond: '20%' },
      { id: 7, category: '基本信息', name: '注册资本增加', grade: '低风险', score: 15, op: '大于等于', cond: '10%' },
      { id: 8, category: '经营风险', name: '股东信息', grade: '高风险', score: 75, op: '变更', cond: '任意' },
      { id: 9, category: '经营风险', name: '大股东变更', grade: '高风险', score: 90, op: '变更', cond: '任意' },
      { id: 10, category: '经营风险', name: '主要人员', grade: '中风险', score: 45, op: '变更', cond: '任意' },
      { id: 11, category: '经营风险', name: '企业名称', grade: '中风险', score: 30, op: '变更', cond: '任意' },
      { id: 12, category: '经营风险', name: '企业类型', grade: '中风险', score: 35, op: '变更', cond: '任意' },
      { id: 13, category: '经营风险', name: '分支机构', grade: '低风险', score: 20, op: '新增', cond: '任意' },
      { id: 14, category: '司法风险', name: '经营状态', grade: '高风险', score: 88, op: '等于', cond: '注销/吊销' },
      { id: 15, category: '经营信息', name: '邮箱变更', grade: '中风险', score: 40, op: '变更', cond: '任意' },
      { id: 16, category: '经营信息', name: '电话变更', grade: '中风险', score: 40, op: '变更', cond: '任意' },
      { id: 17, category: '经营信息', name: '新增网址', grade: '低风险', score: 18, op: '新增', cond: '任意' },
      { id: 18, category: '经营信息', name: '域名信息', grade: '低风险', score: 18, op: '变更', cond: '任意' },
      { id: 19, category: '企业舆情', name: '对外投资', grade: '中风险', score: 50, op: '新增', cond: '任意' },
      { id: 20, category: '关联方风险', name: '参保人数', grade: '高风险', score: 70, op: '小于', cond: '10人' },
    ],
  },
}

const TABS = ['监控规则', '订阅管理'] as const
const gradeColor: Record<string, string> = { 高风险: '#DC2626', 中风险: '#F59E0B', 低风险: '#10B981', 轻微风险: '#94A3B8' }

function Filter({ placeholder, w = 150 }: { placeholder: string; w?: number }) {
  return (
    <select
      defaultValue=""
      style={{ padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13, color: '#64748B', width: w, background: '#fff' }}
    >
      <option value="">{placeholder}</option>
      <option>请选择</option>
    </select>
  )
}

const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

const IconDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

export default function FkMonitorManage({ params }: { params: URLSearchParams }) {
  const [data] = useSample<MonData>('fkMonManage.json', seed)
  const [tab, setTab] = useState<string>(TABS[0])
  const [detailOpen, setDetailOpen] = useState(false)
  const [detail, setDetail] = useState(data.detail)
  const [dimCat, setDimCat] = useState(data.detail.categories[0])
  const { goDetail } = usePageNav()

  const openDetail = (r?: typeof data.rules[number]) => {
    if (r) setDetail({ ...data.detail, ruleName: r.name, ruleDesc: r.desc })
    setDetailOpen(true)
  }

  const ruleCols: Column[] = [
    { key: 'idx', label: '序号', render: (r: Row) => r.id },
    { key: 'name', label: '规则名称', render: (r: Row) => <span style={{ fontWeight: 500 }}>{r.name}</span> },
    { key: 'type', label: '监控类型', render: (r: Row) => <EpTag color="#2563EB" bg="#EFF6FF">{String(r.type)}</EpTag> },
    { key: 'target', label: '规则应用对象' },
    { key: 'desc', label: '规则说明' },
    { key: 'creator', label: '创建人' },
    { key: 'createTime', label: '创建时间' },
    {
      key: 'op', label: '操作',
      render: (r: Row) => (
        <div style={{ display: 'flex', gap: 10, whiteSpace: 'nowrap' }}>
          <a style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => goDetail('/console/ep/fk-monitor-rule-detail?id=' + r.id)}>查看</a>
          <a style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => openDetail(r as unknown as typeof data.rules[number])}>修改</a>
          <a style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => alert('复制规则')}>复制</a>
          <a style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => alert('下载规则')}>下载</a>
          <a style={{ color: '#DC2626', cursor: 'pointer' }} onClick={() => alert('删除规则')}>删除</a>
        </div>
      ),
    },
  ]

  return (
    <EpPage
      title="监控规则"
      subtitle="风控中心监控规则与订阅管理"
      crumb="风控中心 / 监控规则"
      actions={<Sam value="fkMonManage.json" />}
    >
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid #E2E8F0', marginBottom: 16 }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
              fontSize: 14, fontWeight: tab === t ? 600 : 400,
              color: tab === t ? '#2563EB' : '#64748B',
              borderBottom: tab === t ? '2px solid #2563EB' : '2px solid transparent', marginBottom: -1,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === '监控规则' && (
        <>
          {/* 筛选工具栏 */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: '#64748B' }}>共{data.rules.length}条规则</div>
            <div style={{ flex: 1 }} />
            <div style={{ position: 'relative', width: 240 }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}><IconSearch /></span>
              <input
                placeholder="搜索规则"
                style={{ width: '100%', padding: '7px 10px 7px 30px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13 }}
              />
            </div>
            <Filter placeholder="请选择监控类型" />
            <Filter placeholder="请选择创建人" />
            <EpBtn variant="primary" size="sm" onClick={() => goDetail('/console/ep/fk-monitor-rule-create')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#2563EB', borderColor: '#2563EB' }}>
              创建新规则 <IconDown />
            </EpBtn>
          </div>

          <EpCard pad={false}>
            <DataTable columns={ruleCols} rows={data.rules as unknown as Row[]} exportable exportName="监控规则" empty="暂无数据" />
          </EpCard>
        </>
      )}

      {tab === '订阅管理' && (
        <SubManage data={data} />
      )}

      {/* 详情抽屉 */}
      <EpDrawer open={detailOpen} onClose={() => setDetailOpen(false)} title="监控规则 - 详情" width={720}>
        <DetailForm detail={detail} dimCat={dimCat} setDimCat={setDimCat} />
      </EpDrawer>
    </EpPage>
  )
}

/* ---------------- 订阅管理 ---------------- */
function SubManage({ data }: { data: MonData }) {
  const [sk, setSk] = useState(Object.keys(data.subscriptions)[0])
  const rows = data.subscriptions[sk as keyof typeof data.subscriptions]
  const cols: Column[] = [
    { key: 'idx', label: '序号', render: (r: Row) => r.id },
    { key: 'name', label: '订阅对象' },
    { key: 'subscriber', label: '订阅人', render: (r: Row) => <EpTag color="#0EA5E9" bg="#E0F2FE">{String(r.subscriber)}</EpTag> },
    { key: 'time', label: '订阅时间' },
  ]
  return (
    <>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {Object.keys(data.subscriptions).map((k) => (
          <button
            key={k}
            onClick={() => setSk(k)}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
              border: '1px solid ' + (sk === k ? '#2563EB' : '#CBD5E1'),
              background: sk === k ? '#EFF6FF' : '#fff', color: sk === k ? '#2563EB' : '#475569',
            }}
          >
            {k}（{data.subscriptions[k as keyof typeof data.subscriptions].length}）
          </button>
        ))}
      </div>
      <EpCard title={`订阅管理 · ${sk}`} desc="当前订阅列表">
        <DataTable columns={cols} rows={rows as unknown as Row[]} exportable exportName={`订阅-${sk}`} empty="无匹配数据" />
      </EpCard>
    </>
  )
}

/* ---------------- 详情抽屉内容 ---------------- */
function DetailForm({
  detail,
  dimCat,
  setDimCat,
}: {
  detail: MonData['detail']
  dimCat: string
  setDimCat: (c: string) => void
}) {
  const [name, setName] = useState(detail.ruleName)
  const [desc, setDesc] = useState(detail.ruleDesc)
  const lc = detail.levelCounts

  const dimCols: Column[] = [
    { key: 'name', label: '监控维度' },
    { key: 'grade', label: '等级设置', render: (r: Row) => <EpTag color={gradeColor[String(r.grade)]} bg={gradeColor[String(r.grade)] + '22'}>{String(r.grade)}</EpTag> },
    {
      key: 'score', label: '风险分值（0-100分）',
      render: (r: Row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input defaultValue={String(r.score)} style={{ width: 64, padding: '4px 8px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 12 }} />
          <span style={{ fontSize: 12, color: '#94A3B8' }}>分</span>
        </div>
      ),
    },
    {
      key: 'cond', label: '触发条件',
      render: (r: Row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <EpTag color="#475569" bg="#F1F5F9">{String(r.op)}</EpTag>
          <span style={{ fontSize: 12, color: '#64748B' }}>{String(r.cond)}</span>
        </div>
      ),
    },
  ]

  const filtered = detail.dims.filter((d) => d.category === dimCat)

  return (
    <div>
      {/* 表单字段 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={{ fontSize: 13, color: '#475569', marginBottom: 4 }}>规则名称 <span style={{ color: '#DC2626' }}>*</span></div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, detail.ruleNameMax))}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13 }}
          />
          <div style={{ textAlign: 'right', fontSize: 11, color: '#94A3B8' }}>{name.length}/{detail.ruleNameMax}</div>
        </div>
        <div>
          <div style={{ fontSize: 13, color: '#475569', marginBottom: 4 }}>规则说明</div>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value.slice(0, detail.ruleDescMax))}
            rows={2}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13, resize: 'vertical' }}
          />
          <div style={{ textAlign: 'right', fontSize: 11, color: '#94A3B8' }}>{desc.length}/{detail.ruleDescMax}</div>
        </div>
      </div>

      {/* 规则指标 */}
      <div style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>规则指标</div>
          <div style={{ fontSize: 12, color: '#64748B' }}>
            共 <b style={{ color: '#2563EB' }}>{detail.totalDims}</b> 个维度，已监控 <b style={{ color: '#2563EB' }}>{detail.monitoredDims}</b> 个维度
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
          <Indicator label="高风险" value={lc.high} color="#DC2626" />
          <Indicator label="中风险" value={lc.mid} color="#F59E0B" />
          <Indicator label="低风险" value={lc.low} color="#10B981" />
          <Indicator label="轻微风险" value={lc.micro} color="#94A3B8" />
          <Indicator label="日常资讯" value={lc.daily} color="#0EA5E9" />
        </div>
      </div>

      {/* 维度分类 Tabs */}
      <div style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {detail.categories.map((c) => (
            <button
              key={c}
              onClick={() => setDimCat(c)}
              style={{
                padding: '5px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                border: '1px solid ' + (dimCat === c ? '#2563EB' : '#CBD5E1'),
                background: dimCat === c ? '#EFF6FF' : '#fff', color: dimCat === c ? '#2563EB' : '#475569',
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <div style={{ border: '1px solid #F1F5F9', borderRadius: 12, overflow: 'hidden' }}>
          <DataTable columns={dimCols} rows={filtered as unknown as Row[]} empty="暂无维度" />
        </div>
      </div>

      {/* 底部操作 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
        <EpBtn variant="default" onClick={() => alert('已取消')}>取消</EpBtn>
        <EpBtn variant="primary" onClick={() => alert('已保存规则')}>保存</EpBtn>
      </div>
    </div>
  )
}

function Indicator({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ borderRadius: 10, border: '1px solid #F1F5F9', padding: '10px 12px', textAlign: 'center' }}>
      <div style={{ fontSize: 12, color: '#94A3B8' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
    </div>
  )
}
