// 企业风控 · 财产线索（fk-property）· 1:1 复刻「财产线索」截图
// 数据：本地样例 fkProperty.json（橘 Sam）
import { useState, type ReactNode } from 'react'
import { EpPage, EpCard, EpTag, EpBtn, useSample, Sam } from '../../epCommon'

const seed = {
  company: {
    name: '广州博鳌纵横网络科技有限公司',
    status: '存续',
    logoText: '博',
    qixinScore: '362',
    tags: ['启信分：362分', '发票抬头', '集团', '小微企业(官方）', '民营企业', '园区企业', '失信被执行人', '被执行人', '终本案件', '限制高消费', '司法拍卖', '破产案件', '非正常户', '网红经济', '有商标', '全部标签(26)'],
    info: {
      '统一社会信用代码': '91440106074639077N',
      '电话': '13360551699',
      '所处行业': '工程和技术研究和试验发展',
      '法定代表人': '谢旭辉',
      '邮箱': 'hupeng555@hotmail.com',
      '企业类型': '其他有限责任公司',
      '注册资本': '30872.97 万人民币',
      '官网': 'wtoip.com',
      '员工人数': '43人(2021年报)',
      '成立日期': '2013-07-30',
      '地址': '广州市黄埔区科学大道231、233号裙楼B1B2栋一层、三层、四层',
      '经营范围': '网络技术服务；认证咨询；人力资源服务（不含职业中介活动、劳务派遣服务）；...',
    },
    description: '广州博鳌纵横网络科技有限公司成立于2013年07月30日，注册地址为广州市黄埔区科学大道231、233号裙楼B1B2栋一层、三层、四层，法定代表人为谢旭辉，注册资本为30872.97万人民币，统一社会信用代码为91440106074639077N。',
  },
  tabs: [
    { key: 'clue', label: '线索信息', count: 75 },
    { key: 'expand', label: '扩大主体', count: 0 },
    { key: 'asset', label: '资产状况', count: 867 },
  ],
  filters: {
    flow: ['不限', '疑似流入', '疑似流出', '流向未知'],
    time: ['不限', '今天', '近7天', '近30天'],
    assetType: ['不限', '资本', '股权', '动产', '不动产', '无形资产', '涉诉资产', '商业合作', '对外债权', '非诉资产', '其他类型'],
    difficulty: ['不限', '高', '中', '低', '其他'],
  },
  clues: [
    {
      id: '1', time: '2026-07-15', event: '新增一条限制高消费', type: '其他类型', diff: '其他',
      caseNo: '（2026）京0108执7425号', restricted: '广州博鳌纵横网络科技有限公司', related: '谢旭辉',
      applicant: '海南道智君联信息科技股份有限公司', reason: '服务合同纠纷',
      parse: '当个人因为“有履行能力而拒不履行生效法律文书确定义务”原因被列入限制高消费名单时，很可能还有可被执行的资产。',
    },
    {
      id: '2', time: '2026-07-10', event: '有案件恢复执行', type: '其他类型', diff: '中',
      caseNo: '（2026）皖0802执恢419号', amount: '5624687', court: '安庆市迎江区人民法院', status: '已结案',
      parse: '案件恢复执行的原因有债权人向法院提供了财产线索或追加了当事人。',
    },
    {
      id: '3', time: '2026-05-19', event: '新增一条限制高消费', type: '其他类型', diff: '其他',
      caseNo: '（2026）粤0112执4927号', restricted: '广州博鳌纵横网络科技有限公司', related: '谢旭辉',
      applicant: '乙某某', reason: '劳动争议',
      parse: '当个人因为“有履行能力而拒不履行生效法律文书确定义务”原因被列入限制高消费名单时，很可能还有可被执行的资产。',
    },
    {
      id: '4', time: '2026-05-12', event: '有案件恢复执行', type: '其他类型', diff: '中',
      caseNo: '（2026）琼9021执恢168号', amount: '16000', court: '定安县人民法院', status: '已结案',
      parse: '案件恢复执行的原因有债权人向法院提供了财产线索或追加了当事人。',
    },
    {
      id: '5', time: '2026-05-12', event: '有案件恢复执行', type: '其他类型', diff: '中',
      caseNo: '（2026）琼9021执恢169号', amount: '88000', court: '定安县人民法院', status: '已结案',
      parse: '案件恢复执行的原因有债权人向法院提供了财产线索或追加了当事人。',
    },
  ],
  expand: [],
  assets: [],
  pagination: { total: 75, pageSize: 5, current: 1 },
}

type Data = typeof seed

export default function FkProperty({ params }: { params: URLSearchParams }) {
  const [data] = useSample<Data>('fkProperty.json', seed)
  const [tab, setTab] = useState<'clue' | 'expand' | 'asset'>('clue')
  const [search, setSearch] = useState(data.company.name)
  const [flow, setFlow] = useState('不限')
  const [time, setTime] = useState('不限')
  const [assetType, setAssetType] = useState('不限')
  const [diff, setDiff] = useState('不限')
  const [parseOpen, setParseOpen] = useState(true)
  const [descOpen, setDescOpen] = useState(false)
  const [page, setPage] = useState(data.pagination.current)

  const totalPages = Math.max(1, Math.ceil(data.pagination.total / data.pagination.pageSize))

  return (
    <EpPage
      title="财产线索"
      subtitle="查企业线索信息、扩大主体、资产状况"
      crumb="风控中心 / 财产线索"
      actions={<Sam value="fkProperty.json" />}
    >
      {/* 企业搜索栏 */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="输入企业名、人名、产品名等"
          style={{ flex: 1, padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13 }}
        />
        <EpBtn
          variant="primary"
          size="sm"
          onClick={() => alert('开始查询')}
          style={{ background: '#F59E0B', borderColor: '#F59E0B', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <IconSearch />
          开始查询
        </EpBtn>
      </div>

      {/* 企业信息头卡 */}
      <EpCard>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', background: '#F59E0B', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, flexShrink: 0,
          }}>
            {data.company.logoText}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>{data.company.name}</span>
              <EpTag color="#0F766E" bg="#ECFDF5">{data.company.status}</EpTag>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {data.company.tags.map((t) => <CompanyTag key={t} text={t} />)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 24px', marginTop: 14, fontSize: 12, lineHeight: 1.8 }}>
              {Object.entries(data.company.info).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 6, minWidth: 0 }}>
                  <span style={{ color: '#94A3B8', whiteSpace: 'nowrap' }}>{k}：</span>
                  <span style={{ color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(v)}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: '#64748B', lineHeight: 1.7 }}>
              {descOpen ? data.company.description : data.company.description.slice(0, 90) + '...'}
              <a style={{ color: '#2563EB', cursor: 'pointer', marginLeft: 6 }} onClick={() => setDescOpen(!descOpen)}>
                {descOpen ? '收起' : '展开'}
              </a>
            </div>
          </div>
        </div>
      </EpCard>

      {/* Tabs + 导出 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '16px 0 12px' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {data.tabs.map((t) => (
            <div
              key={t.key}
              onClick={() => setTab(t.key as any)}
              style={{
                cursor: 'pointer', padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                color: tab === t.key ? '#fff' : '#475569', background: tab === t.key ? '#2563EB' : '#F1F5F9',
              }}
            >
              {t.label} {t.count}
            </div>
          ))}
        </div>
        <EpBtn variant="default" size="sm" onClick={() => alert('导出财产线索')}>导出</EpBtn>
      </div>

      {tab === 'clue' && (
        <>
          {/* 筛选区 */}
          <EpCard>
            <FilterRow label="资金流向">
              {data.filters.flow.map((f) => <Chip key={f} active={flow === f} onClick={() => setFlow(f)}>{f}</Chip>)}
            </FilterRow>
            <FilterRow label="发生时间">
              {data.filters.time.map((t) => <Chip key={t} active={time === t} onClick={() => setTime(time === t ? '不限' : t)}>{t}</Chip>)}
              <input placeholder="开始日期" style={{ padding: '5px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 12, width: 110 }} />
              <span style={{ color: '#94A3B8' }}>-</span>
              <input placeholder="结束日期" style={{ padding: '5px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 12, width: 110 }} />
            </FilterRow>
            <FilterRow label="资产类型">
              {data.filters.assetType.map((a) => <Chip key={a} active={assetType === a} onClick={() => setAssetType(a)}>{a}</Chip>)}
            </FilterRow>
            <FilterRow label="执行难度">
              {data.filters.difficulty.map((d) => <Chip key={d} active={diff === d} onClick={() => setDiff(diff === d ? '不限' : d)}>{d}</Chip>)}
            </FilterRow>
          </EpCard>

          {/* 结果标题 */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '14px 0 10px' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>财产线索 {data.pagination.total}</span>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>为保证线索时效性，仅展示近3年的线索信息</span>
          </div>

          {/* 线索表格 */}
          <EpCard pad={false}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={thStyle(110)}>发生时间</th>
                  <th style={thStyle(120)}>事件类型</th>
                  <th style={thStyle(90)}>资产类型</th>
                  <th style={thStyle(80)}>执行难度</th>
                  <th style={thStyle('auto')}>线索内容</th>
                  <th style={thStyle(90)}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      解析
                      <Toggle checked={parseOpen} onChange={setParseOpen} />
                    </div>
                  </th>
                  <th style={thStyle(70)}>操作</th>
                </tr>
              </thead>
              <tbody>
                {data.clues.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={tdStyle}>{c.time}</td>
                    <td style={tdStyle}><EpTag color="#7C3AED" bg="#F5F3FF">{c.event}</EpTag></td>
                    <td style={tdStyle}>{c.type}</td>
                    <td style={tdStyle}><DiffText d={c.diff} /></td>
                    <td style={{ ...tdStyle, minWidth: 280 }}>
                      <div style={{ color: '#0F172A', lineHeight: 1.8 }}>
                        {c.caseNo && <div>案号：{c.caseNo}</div>}
                        {c.restricted && <div>限制法人或组织：{c.restricted}</div>}
                        {c.related && <div>关联对象：{c.related}</div>}
                        {c.applicant && <div>申请人：{c.applicant}</div>}
                        {c.reason && <div>案由：{c.reason}</div>}
                        {c.amount && <div>执行标的：{c.amount}</div>}
                        {c.court && <div>执行法院：{c.court}</div>}
                        {c.status && <div>执行状态：{c.status}</div>}
                      </div>
                      {parseOpen && (
                        <div style={{ marginTop: 8, padding: '8px 10px', background: '#F8FAFC', borderRadius: 6, color: '#475569', fontSize: 12, lineHeight: 1.6 }}>
                          线索解析：{c.parse}
                        </div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {parseOpen && <span style={{ fontSize: 12, color: '#64748B' }}>已解析</span>}
                    </td>
                    <td style={tdStyle}>
                      <a style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => alert('查看线索详情')}>详情</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 分页 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, padding: '12px 16px', borderTop: '1px solid #F1F5F9', fontSize: 12, color: '#64748B' }}>
              <span>共 {data.pagination.total} 条</span>
              <span>{data.pagination.pageSize}条/页</span>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={pageBtnStyle}>上一页</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} style={{ ...pageBtnStyle, background: page === p ? '#2563EB' : '#fff', color: page === p ? '#fff' : '#475569', borderColor: page === p ? '#2563EB' : '#E2E8F0' }}>{p}</button>
              ))}
              {totalPages > 5 && <span>...</span>}
              {totalPages > 5 && <button style={pageBtnStyle}>{totalPages}</button>}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={pageBtnStyle}>下一页</button>
              <span>前往</span>
              <input defaultValue={page} style={{ width: 40, padding: '3px 6px', border: '1px solid #E2E8F0', borderRadius: 4, textAlign: 'center', fontSize: 12 }} />
              <span>页</span>
            </div>
          </EpCard>
        </>
      )}

      {tab === 'expand' && (
        <EpCard>
          <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>暂无扩大主体数据</div>
        </EpCard>
      )}

      {tab === 'asset' && (
        <EpCard>
          <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>暂无资产状况数据</div>
        </EpCard>
      )}
    </EpPage>
  )
}

function CompanyTag({ text }: { text: string }) {
  const riskTags = ['失信被执行人', '被执行人', '终本案件', '限制高消费', '司法拍卖', '破产案件', '非正常户']
  const isRisk = riskTags.includes(text)
  const isMain = text.startsWith('启信分')
  return (
    <span style={{
      fontSize: 12, padding: '2px 8px', borderRadius: 4,
      color: isRisk ? '#DC2626' : isMain ? '#D97706' : '#475569',
      background: isRisk ? '#FEF2F2' : isMain ? '#FFFBEB' : '#F1F5F9',
      border: '1px solid ' + (isRisk ? '#FECACA' : isMain ? '#FDE68A' : '#E2E8F0'),
    }}>
      {text}
    </span>
  )
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
      <span style={{ fontSize: 13, color: '#0F172A', fontWeight: 500, minWidth: 70 }}>{label}</span>
      {children}
    </div>
  )
}

function Chip({ children, active, onClick }: { children: ReactNode; active: boolean; onClick: () => void }) {
  return (
    <span
      onClick={onClick}
      style={{
        cursor: 'pointer', padding: '4px 12px', borderRadius: 999, fontSize: 12,
        color: active ? '#fff' : '#475569', background: active ? '#2563EB' : '#F1F5F9',
      }}
    >
      {children}
    </span>
  )
}

function DiffText({ d }: { d: string }) {
  const color = d === '高' ? '#DC2626' : d === '中' ? '#D97706' : d === '低' ? '#0F766E' : '#475569'
  return <span style={{ color, fontWeight: 600 }}>{d}</span>
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 32, height: 18, borderRadius: 9, background: checked ? '#2563EB' : '#CBD5E1',
        position: 'relative', cursor: 'pointer', transition: 'background .2s',
      }}
    >
      <div style={{
        width: 14, height: 14, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 2, left: checked ? 16 : 2, transition: 'left .2s',
      }} />
    </div>
  )
}

const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

const thStyle = (width: number | string): React.CSSProperties => ({
  padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 13,
  borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap', width,
})

const tdStyle: React.CSSProperties = { padding: '14px 16px', color: '#334155', verticalAlign: 'top' }

const pageBtnStyle: React.CSSProperties = {
  padding: '4px 10px', border: '1px solid #E2E8F0', borderRadius: 6, background: '#fff',
  color: '#475569', fontSize: 12, cursor: 'pointer',
}
