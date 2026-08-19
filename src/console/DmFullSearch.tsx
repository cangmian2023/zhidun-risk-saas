// 数字营销 · 全维搜索（原生型复刻）
// 来源：record/qixin/营销 - 全维搜索.html 等 6 个快照
// 页面类型：原生型（高级查询表单聚合页）
// 结构：顶部全局搜索 + 6 个 Tab（企业/人员/商机/风险/舆情/研报），
//       每个 Tab 一个高级查询筛选区 + 结果列表 + 分页统计。
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Panel, Badge, Button } from '../components/ui'
import { SourceTagLegend, Sam } from './SourceTag'

type TabKey = 'ent' | 'person' | 'clue' | 'risk' | 'monitor' | 'report'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'ent', label: '企业' },
  { key: 'person', label: '人员' },
  { key: 'clue', label: '商机' },
  { key: 'risk', label: '风险' },
  { key: 'monitor', label: '舆情' },
  { key: 'report', label: '研报' },
]

// ── 企业 Tab：高级查询维度（从源 DOM 抽取的真实字段组）──
const ENT_FILTER_GROUPS: { title: string; fields: string[] }[] = [
  { title: '企业类型', fields: ['有限责任公司', '股份有限公司', '国有企业', '外商投资企业', '个人独资企业', '合伙企业', '个体工商户'] },
  { title: '企业性质', fields: ['国有控股', '民营', '外资', '集体', '事业单位', '社会团体'] },
  { title: '投资商地区', fields: ['不限', '华北', '华东', '华南', '华中', '西南', '西北', '东北'] },
  { title: '标签', fields: ['乡村振兴', '金融机构', '外贸企业', '高新技术企业', '专精特新', '独角兽', '上市公司'] },
  { title: '资质认证', fields: ['发明专利', '实用新型', '外观设计', '软件著作权', 'ISO认证', 'CCC认证', '高新技术企业证书'] },
  { title: '融资', fields: ['天使轮', 'A轮', 'B轮', 'C轮', '战略投资', '已上市', '新三板'] },
  { title: '黑名单', fields: ['行政处罚', '失信被执行人', '经营异常', '严重违法', '限制高消费', '股权冻结'] },
]

// 空壳指数 slider 0-100；注册资本区间「最低/最高金额」，最高 100 亿
const ENT_SAMPLE_RESULTS = [
  { name: '北京智云科技有限公司', legal: '王立明', reg: '5,000万', area: '北京·海淀', industry: '软件和信息服务业' },
  { name: '上海浦江供应链管理有限公司', legal: '陈晓东', reg: '12,000万', area: '上海·浦东', industry: '商务服务业' },
  { name: '广东粤海新能源股份有限公司', legal: '李国华', reg: '30,000万', area: '广东·深圳', industry: '电力、热力生产' },
  { name: '浙江蚂蚁金融服务集团股份有限公司', legal: '井贤栋', reg: '1,057,307万', area: '浙江·杭州', industry: '其他金融业' },
  { name: '四川蜀道交通投资集团有限责任公司', legal: '唐勇', reg: '8,000,000万', area: '四川·成都', industry: '土木工程建筑业' },
  { name: '江苏恒瑞医药股份有限公司', legal: '孙飘扬', reg: '63,7900万', area: '江苏·连云港', industry: '医药制造业' },
  { name: '山东重工集团有限公司', legal: '谭旭光', reg: '500,000万', area: '山东·济南', industry: '专用设备制造业' },
  { name: '福建宁德时代新能源科技股份有限公司', legal: '曾毓群', reg: '43,9800万', area: '福建·宁德', industry: '电气机械和器材制造业' },
]

const PERSON_SAMPLE = [
  { name: '张伟', title: '法定代表人', ent: '北京智云科技有限公司', area: '北京', relation: '控股' },
  { name: '刘洋', title: '财务负责人', ent: '上海浦江供应链管理有限公司', area: '上海', relation: '任职' },
  { name: '赵敏', title: '执行董事', ent: '广东粤海新能源股份有限公司', area: '广东', relation: '控股' },
  { name: '孙强', title: '监事', ent: '江苏恒瑞医药股份有限公司', area: '江苏', relation: '任职' },
  { name: '周婷', title: '股东', ent: '福建宁德时代新能源科技股份有限公司', area: '福建', relation: '参股' },
]

const CLUE_SAMPLE = [
  { title: '某央企智慧园区一期弱电集成项目', ent: '中建三局集团有限公司', area: '湖北·武汉', amount: '2,380万', stage: '招标中' },
  { title: '市政务云扩容采购项目', ent: '中国电信股份有限公司', area: '广东·广州', amount: '1,150万', stage: '投标中' },
  { title: '新能源充电桩建设运营项目', ent: '国网电动汽车服务有限公司', area: '浙江·杭州', amount: '5,600万', stage: '意向' },
  { title: '智慧物流园区EPC总承包', ent: '顺丰控股股份有限公司', area: '广东·深圳', amount: '9,800万', stage: '招标中' },
  { title: '三甲医院信息化升级项目', ent: '东软集团股份有限公司', area: '辽宁·沈阳', amount: '3,200万', stage: '中标' },
]

const RISK_SAMPLE = [
  { ent: '深圳市前海某贸易有限公司', type: '经营异常', date: '2026-07-12', level: '中', desc: '通过登记的住所无法联系' },
  { ent: '成都某置业有限公司', type: '失信被执行', date: '2026-06-28', level: '高', desc: '未按时履行生效法律文书' },
  { ent: '苏州某精密机械有限公司', type: '行政处罚', date: '2026-05-19', level: '低', desc: '环保排放超标被处罚' },
  { ent: '武汉某建筑工程有限公司', type: '股权冻结', date: '2026-04-30', level: '中', desc: '股东股权被司法冻结' },
  { ent: '西安某餐饮管理有限公司', type: '限制高消费', date: '2026-03-15', level: '中', desc: '法定代表人被限制高消费' },
]

const MONITOR_SAMPLE = [
  { title: '某新能源龙头获百亿级战略融资', ent: '福建宁德时代新能源科技股份有限公司', date: '2026-08-10', source: '财经网', sentiment: '正面' },
  { title: '某医药企业核心产品纳入集采', ent: '江苏恒瑞医药股份有限公司', date: '2026-08-08', source: '证券时报', sentiment: '中性' },
  { title: '某地产集团债务展期引发关注', ent: '中国恒大集团', date: '2026-07-30', source: '澎湃新闻', sentiment: '负面' },
  { title: '某科技企业发布新一代大模型', ent: '百度在线网络技术有限公司', date: '2026-07-22', source: '36氪', sentiment: '正面' },
  { title: '某零售企业季度营收不及预期', ent: '永辉超市股份有限公司', date: '2026-07-18', source: '第一财经', sentiment: '负面' },
]

const REPORT_SAMPLE = [
  { title: '2026中国新能源汽车产业链投资白皮书', org: '中金公司', date: '2026-08-01', author: '研究部', pages: '128' },
  { title: '半导体设备国产化率提升路径分析', org: '中信证券', date: '2026-07-25', author: '电子组', pages: '96' },
  { title: '消费医疗赛道复苏节奏研判', org: '国泰君安', date: '2026-07-12', author: '医药组', pages: '74' },
  { title: 'AI Agent 商业落地年度报告', org: '华泰证券', date: '2026-06-30', author: '计算机组', pages: '152' },
  { title: '跨境电商出海东南亚机会清单', org: '招商证券', date: '2026-06-18', author: '零售组', pages: '88' },
]

function Tabs({ active, onChange }: { active: TabKey; onChange: (k: TabKey) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e5e7eb', marginBottom: 16 }}>
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: active === t.key ? 700 : 400,
            color: active === t.key ? '#2563eb' : '#64748b',
            borderBottom: active === t.key ? '2px solid #2563eb' : '2px solid transparent',
            marginBottom: -1,
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
      <div style={{ width: 110, color: '#475569', fontSize: 13, flexShrink: 0, textAlign: 'right' }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flex: 1 }}>{children}</div>
    </div>
  )
}

function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <span
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        padding: '4px 12px',
        borderRadius: 14,
        fontSize: 13,
        border: '1px solid ' + (active ? '#2563eb' : '#e2e8f0'),
        background: active ? '#eff6ff' : '#fff',
        color: active ? '#2563eb' : '#475569',
        userSelect: 'none',
      }}
    >
      {children}
    </span>
  )
}

function TextField({ ph, w = 200 }: { ph: string; w?: number }) {
  return (
    <input
      placeholder={ph}
      style={{
        width: w,
        padding: '7px 12px',
        borderRadius: 8,
        border: '1px solid #e2e8f0',
        fontSize: 13,
        outline: 'none',
      }}
    />
  )
}

export default function DmFullSearch() {
  const nav = useNavigate()
  const [tab, setTab] = useState<TabKey>('ent')
  const [kw, setKw] = useState('')
  const [entType, setEntType] = useState<string[]>([])
  const [entNature, setEntNature] = useState<string[]>([])
  const [entArea, setEntArea] = useState('不限')
  const [entTag, setEntTag] = useState<string[]>([])
  const [entCert, setEntCert] = useState<string[]>([])
  const [entFin, setEntFin] = useState<string[]>([])
  const [entBlack, setEntBlack] = useState<string[]>([])
  const [shell, setShell] = useState(50)
  const [regMin, setRegMin] = useState('')
  const [regMax, setRegMax] = useState('')
  const [regRegion, setRegRegion] = useState('全国')

  const toggle = (arr: string[], v: string): string[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]

  return (
    <div style={{ padding: 24, background: '#f8fafc', minHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, margin: 0, fontWeight: 700 }}>全维搜索</h1>
          <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>跨企业 / 人员 / 商机 / 风险 / 舆情 / 研报的一站式高级查询 <Sam /></div>
        </div>
        <SourceTagLegend />
      </div>

      {/* 全局搜索框 */}
      <Panel className="mb-4">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder="输入企业名、人名、产品名等"
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              fontSize: 14,
              outline: 'none',
            }}
          />
          <Button variant="primary">搜索</Button>
          <Button variant="ghost">重置</Button>
        </div>
      </Panel>

      <Panel>
        <Tabs active={tab} onChange={setTab} />

        {tab === 'ent' && (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '4px 0 12px' }}>高级查询</div>
            <FilterRow label="企业名称 / 关键字">
              <TextField ph="如：科技、医疗、新能源" w={320} />
            </FilterRow>
            <FilterRow label="企业类型">
              {ENT_FILTER_GROUPS[0].fields.map((f) => (
                <Chip key={f} active={entType.includes(f)} onClick={() => setEntType(toggle(entType, f))}>{f}</Chip>
              ))}
            </FilterRow>
            <FilterRow label="企业性质">
              {ENT_FILTER_GROUPS[1].fields.map((f) => (
                <Chip key={f} active={entNature.includes(f)} onClick={() => setEntNature(toggle(entNature, f))}>{f}</Chip>
              ))}
            </FilterRow>
            <FilterRow label="投资商地区">
              {ENT_FILTER_GROUPS[2].fields.map((f) => (
                <Chip key={f} active={entArea === f} onClick={() => setEntArea(f)}>{f}</Chip>
              ))}
            </FilterRow>
            <FilterRow label="标签">
              {ENT_FILTER_GROUPS[3].fields.map((f) => (
                <Chip key={f} active={entTag.includes(f)} onClick={() => setEntTag(toggle(entTag, f))}>{f}</Chip>
              ))}
            </FilterRow>
            <FilterRow label="资质认证">
              {ENT_FILTER_GROUPS[4].fields.map((f) => (
                <Chip key={f} active={entCert.includes(f)} onClick={() => setEntCert(toggle(entCert, f))}>{f}</Chip>
              ))}
            </FilterRow>
            <FilterRow label="融资">
              {ENT_FILTER_GROUPS[5].fields.map((f) => (
                <Chip key={f} active={entFin.includes(f)} onClick={() => setEntFin(toggle(entFin, f))}>{f}</Chip>
              ))}
            </FilterRow>
            <FilterRow label="黑名单">
              {ENT_FILTER_GROUPS[6].fields.map((f) => (
                <Chip key={f} active={entBlack.includes(f)} onClick={() => setEntBlack(toggle(entBlack, f))}>{f}</Chip>
              ))}
            </FilterRow>
            <FilterRow label="空壳指数">
              <input type="range" min={0} max={100} value={shell} onChange={(e) => setShell(Number(e.target.value))} style={{ flex: 1, maxWidth: 320 }} />
              <span style={{ fontSize: 13, color: '#64748b' }}>{shell}（0=正常，100=高风险）</span>
            </FilterRow>
            <FilterRow label="注册资本">
              <TextField ph="最低金额" w={130} />
              <span style={{ color: '#94a3b8' }}>—</span>
              <TextField ph="最高金额" w={130} />
              <span style={{ fontSize: 13, color: '#94a3b8' }}>（最高 100 亿）</span>
            </FilterRow>
            <FilterRow label="注册地区">
              <Chip active={regRegion === '全国'} onClick={() => setRegRegion('全国')}>全国</Chip>
              {['北京', '上海', '广东', '浙江', '江苏', '山东', '四川', '福建'].map((r) => (
                <Chip key={r} active={regRegion === r} onClick={() => setRegRegion(r)}>{r}</Chip>
              ))}
            </FilterRow>

            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <Button variant="primary">查询</Button>
              <Button variant="ghost">重置条件</Button>
              <div style={{ flex: 1 }} />
              <span style={{ color: '#64748b', fontSize: 13, alignSelf: 'center' }}>结果 1-8 / 共 1,019 条 <Sam /></span>
            </div>

            {/* 结果列表 */}
            <div style={{ overflowX: 'auto', marginTop: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>企业名称</th>
                    <th style={{ padding: '10px 12px' }}>法定代表人</th>
                    <th style={{ padding: '10px 12px' }}>注册资本</th>
                    <th style={{ padding: '10px 12px' }}>地区</th>
                    <th style={{ padding: '10px 12px' }}>行业</th>
                    <th style={{ padding: '10px 12px' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {ENT_SAMPLE_RESULTS.map((r) => (
                    <tr key={r.name} style={{ borderBottom: '1px solid #eef2f7' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e293b', cursor: 'pointer' }} onClick={() => nav('/console/dm/ent-archive')}>{r.name}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{r.legal}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{r.reg}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{r.area}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{r.industry}</td>
                      <td style={{ padding: '10px 12px', display: 'flex', gap: 8 }}>
                        <Button variant="primary" onClick={() => nav('/console/dm/ent-archive')}>营销</Button>
                        <Button variant="ghost">导出</Button>
                        <Button variant="ghost">监控</Button>
                        <Button variant="ghost">触达</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'person' && (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '4px 0 12px' }}>人员高级查询</div>
            <FilterRow label="企业名称 / 关键字">
              <TextField ph="企业名称或关键字" w={320} />
            </FilterRow>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <Button variant="primary">查询</Button>
              <Button variant="ghost">重置</Button>
              <div style={{ flex: 1 }} />
              <span style={{ color: '#64748b', fontSize: 13, alignSelf: 'center' }}>结果 1-5 / 共 312 条 <Sam /></span>
            </div>
            <div style={{ overflowX: 'auto', marginTop: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>姓名</th>
                    <th style={{ padding: '10px 12px' }}>职位</th>
                    <th style={{ padding: '10px 12px' }}>关联企业</th>
                    <th style={{ padding: '10px 12px' }}>地区</th>
                    <th style={{ padding: '10px 12px' }}>关系</th>
                    <th style={{ padding: '10px 12px' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {PERSON_SAMPLE.map((r) => (
                    <tr key={r.name} style={{ borderBottom: '1px solid #eef2f7' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e293b', cursor: 'pointer' }} onClick={() => nav('/console/dm/person-archive')}>{r.name}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{r.title}</td>
                      <td style={{ padding: '10px 12px', color: '#475569', cursor: 'pointer' }} onClick={() => nav('/console/dm/ent-archive')}>{r.ent}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{r.area}</td>
                      <td style={{ padding: '10px 12px' }}><Badge kind="blue">{r.relation}</Badge></td>
                      <td style={{ padding: '10px 12px' }}><Button variant="primary" onClick={() => nav('/console/dm/person-archive')}>营销</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'clue' && (
          <>
            <SectionTitle>商机高级查询</SectionTitle>
            <FilterRow label="企业名称 / 关键字">
              <TextField ph="企业名称或关键字" w={320} />
            </FilterRow>
            <FilterRow label="省份地区">
              <Chip>全国</Chip>
              {['广东', '浙江', '江苏', '山东', '四川', '湖北'].map((r) => <Chip key={r}>{r}</Chip>)}
            </FilterRow>
            <FilterRow label="金额区间">
              <TextField ph="最小值" w={130} />
              <span style={{ color: '#94a3b8' }}>—</span>
              <TextField ph="最大值" w={130} />
              <span style={{ fontSize: 13, color: '#94a3b8' }}>（示例 200 / 1000 万）</span>
            </FilterRow>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <Button variant="primary">查询</Button>
              <Button variant="ghost">重置</Button>
              <div style={{ flex: 1 }} />
              <Button variant="ghost">导出</Button>
            </div>
            <div style={{ overflowX: 'auto', marginTop: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>商机名称</th>
                    <th style={{ padding: '10px 12px' }}>关联企业</th>
                    <th style={{ padding: '10px 12px' }}>地区</th>
                    <th style={{ padding: '10px 12px' }}>金额</th>
                    <th style={{ padding: '10px 12px' }}>阶段</th>
                  </tr>
                </thead>
                <tbody>
                  {CLUE_SAMPLE.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eef2f7' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e293b' }}>{r.title}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{r.ent}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{r.area}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{r.amount}</td>
                      <td style={{ padding: '10px 12px' }}><Badge kind="green">{r.stage}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'risk' && (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '4px 0 12px' }}>风险高级查询</div>
            <FilterRow label="企业名称 / 关键字">
              <TextField ph="企业名称或关键字" w={320} />
            </FilterRow>
            <FilterRow label="日期区间">
              <TextField ph="开始日期 (YYYY-MM-DD)" w={180} />
              <span style={{ color: '#94a3b8' }}>—</span>
              <TextField ph="结束日期 (YYYY-MM-DD)" w={180} />
            </FilterRow>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <Button variant="primary">查询</Button>
              <Button variant="ghost">重置</Button>
              <div style={{ flex: 1 }} />
              <Button variant="ghost">导出</Button>
            </div>
            <div style={{ overflowX: 'auto', marginTop: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>企业</th>
                    <th style={{ padding: '10px 12px' }}>风险类型</th>
                    <th style={{ padding: '10px 12px' }}>日期</th>
                    <th style={{ padding: '10px 12px' }}>等级</th>
                    <th style={{ padding: '10px 12px' }}>描述</th>
                  </tr>
                </thead>
                <tbody>
                  {RISK_SAMPLE.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eef2f7' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e293b', cursor: 'pointer' }} onClick={() => nav('/console/dm/ent-archive')}>{r.ent}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{r.type}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{r.date}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <Badge kind={r.level === '高' ? 'red' : r.level === '中' ? 'orange' : 'gray'}>{r.level}</Badge>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{r.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'monitor' && (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '4px 0 12px' }}>舆情高级查询</div>
            <FilterRow label="企业名称 / 关键字">
              <TextField ph="企业名称或关键字" w={320} />
            </FilterRow>
            <FilterRow label="日期区间">
              <TextField ph="开始日期 (YYYY-MM-DD)" w={180} />
              <span style={{ color: '#94a3b8' }}>—</span>
              <TextField ph="结束日期 (YYYY-MM-DD)" w={180} />
            </FilterRow>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <Button variant="primary">查询</Button>
              <Button variant="ghost">重置</Button>
            </div>
            <div style={{ overflowX: 'auto', marginTop: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>标题</th>
                    <th style={{ padding: '10px 12px' }}>关联企业</th>
                    <th style={{ padding: '10px 12px' }}>来源</th>
                    <th style={{ padding: '10px 12px' }}>日期</th>
                    <th style={{ padding: '10px 12px' }}>情感</th>
                  </tr>
                </thead>
                <tbody>
                  {MONITOR_SAMPLE.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eef2f7' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e293b' }}>{r.title}</td>
                      <td style={{ padding: '10px 12px', color: '#475569', cursor: 'pointer' }} onClick={() => nav('/console/dm/ent-archive')}>{r.ent}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{r.source}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{r.date}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <Badge kind={r.sentiment === '正面' ? 'green' : r.sentiment === '负面' ? 'red' : 'gray'}>{r.sentiment}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'report' && (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '4px 0 12px' }}>研报高级查询</div>
            <FilterRow label="机构名称">
              <TextField ph="如：中金、中信证券" w={320} />
            </FilterRow>
            <FilterRow label="日期区间">
              <TextField ph="开始日期 (YYYY-MM-DD)" w={180} />
              <span style={{ color: '#94a3b8' }}>—</span>
              <TextField ph="结束日期 (YYYY-MM-DD)" w={180} />
            </FilterRow>
            <FilterRow label="时间范围">
              <Chip>近 1 月</Chip>
              <Chip active>近 2 月</Chip>
              <Chip>近 3 月</Chip>
              <Chip>近 1 年</Chip>
            </FilterRow>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <Button variant="primary">查询</Button>
              <Button variant="ghost">重置</Button>
            </div>
            <div style={{ overflowX: 'auto', marginTop: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>报告标题</th>
                    <th style={{ padding: '10px 12px' }}>机构</th>
                    <th style={{ padding: '10px 12px' }}>作者</th>
                    <th style={{ padding: '10px 12px' }}>日期</th>
                    <th style={{ padding: '10px 12px' }}>页数</th>
                  </tr>
                </thead>
                <tbody>
                  {REPORT_SAMPLE.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eef2f7' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e293b' }}>{r.title}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{r.org}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{r.author}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{r.date}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{r.pages} 页</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* 分页 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          {['上一页', '1', '2', '3', '...', '102', '下一页'].map((p, i) => (
            <span
              key={i}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                fontSize: 13,
                color: p === '1' ? '#fff' : '#475569',
                background: p === '1' ? '#2563eb' : '#fff',
                cursor: 'pointer',
              }}
            >
              {p}
            </span>
          ))}
        </div>
      </Panel>
    </div>
  )
}
