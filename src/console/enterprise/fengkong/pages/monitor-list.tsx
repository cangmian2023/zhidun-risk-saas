// 风控中心 · 监控列表（fk-monitor-list）· 1:1 复刻「风控 - 监控列表」
// 子快照「风控 - 监控列表 - 风险详情」（0KB，内容与「风控 - 风险预警 - 风险详情」同源）→ 抽屉渲染
// 数据：本地样例 fkMonitor.json（橘 Sam）
import { useState } from 'react'
import { EpPage, EpCard, EpStat, EpTag, EpBtn, EpDrawer, DataTable, useSample, Sam } from '../epCommon'
import type { Row, Column } from '../../../../components/ui'

type Company = {
  id: string
  name: string
  code: string
  area: string
  addr: number
  rule: string
  tag: string
  owner: string
  adder: string
  addTime: string
  note: string
}

type Dyn = {
  id: string
  subject: string
  level: string
  happen: string
  type: string
  content: string
  score: number
  push: string
  owner: string
  status: string
}

const seed = {
  synced: 0,
  quota: 17,
  monitorCount: 16,
  rule: '启信慧眼默认规则(国内)',
  companies: [
    { id: '1', name: '抖音视界有限公司', code: '91110107599635562F', area: '北京石景山区', addr: 1, rule: '启信慧眼默认规则(国内)', tag: '-', owner: '19156027703', adder: '19156027703', addTime: '2026-08-17 15:19', note: '-' },
    { id: '2', name: '抖音有限公司', code: '91110105MA005AEF36', area: '北京海淀区', addr: 1, rule: '启信慧眼默认规则(国内)', tag: '-', owner: '19156027703', adder: '19156027703', addTime: '2026-08-17 15:12', note: '-' },
    { id: '3', name: '深圳书读科技有限公司', code: '91440300MA5HMF811W', area: '广东深圳南山区', addr: 1, rule: '启信慧眼默认规则(国内)', tag: '-', owner: '19156027703', adder: '19156027703', addTime: '2026-08-17 15:12', note: '-' },
    { id: '4', name: 'Tesla, Inc.', code: '-', area: '德国柏林,美国加利福尼亚州', addr: 2, rule: '启信慧眼默认规则(境外)', tag: '-', owner: '19156027703', adder: '19156027703', addTime: '2026-08-17 13:00', note: '-' },
    { id: '5', name: 'Siemens', code: '-', area: '德国柏林', addr: 1, rule: '启信慧眼默认规则(境外)', tag: '-', owner: '19156027703', adder: '19156027703', addTime: '2026-08-17 13:00', note: '-' },
    { id: '6', name: 'openai', code: '-', area: '美国加利福尼亚州', addr: 1, rule: '启信慧眼默认规则(境外)', tag: '-', owner: '19156027703', adder: '19156027703', addTime: '2026-08-17 13:00', note: '-' },
    { id: '7', name: '军蒂粤信智能科技（北京）有限公司', code: '91110108MA01LQPE7U', area: '北京丰台区', addr: 1, rule: '启信慧眼默认规则(国内)', tag: '-', owner: '19156027703', adder: '19156027703', addTime: '2026-08-17 12:59', note: '-' },
    { id: '8', name: '广州粤信科技有限公司湘西分公司', code: '91433101MA4Q0ADG9U', area: '湖南湘西吉首市', addr: 1, rule: '启信慧眼默认规则(国内)', tag: '-', owner: '19156027703', adder: '19156027703', addTime: '2026-08-17 12:59', note: '-' },
    { id: '9', name: '福州粤信知慧科技有限公司', code: '91350104577001796Q', area: '福建福州台江区', addr: 1, rule: '启信慧眼默认规则(国内)', tag: '-', owner: '19156027703', adder: '19156027703', addTime: '2026-08-17 12:59', note: '-' },
    { id: '10', name: '北京粤信云鼎科技有限公司', code: '91110113MAEWWUAL33', area: '北京顺义区', addr: 1, rule: '启信慧眼默认规则(国内)', tag: '-', owner: '19156027703', adder: '19156027703', addTime: '2026-08-17 12:59', note: '-' },
    { id: '11', name: '广东安家粤信科技有限公司', code: '91440101MA5D3NR25U', area: '广东广州天河区', addr: 1, rule: '启信慧眼默认规则(国内)', tag: '-', owner: '19156027703', adder: '19156027703', addTime: '2026-08-17 12:59', note: '-' },
    { id: '12', name: '湘西粤信数慧科技有限公司', code: '91433100MA4RMK9K4G', area: '湖南湘西吉首市', addr: 1, rule: '启信慧眼默认规则(国内)', tag: '-', owner: '19156027703', adder: '19156027703', addTime: '2026-08-17 12:59', note: '-' },
    { id: '13', name: '深圳粤信数慧科技有限公司', code: '91440300MA5G4GJL93', area: '广东深圳南山区', addr: 1, rule: '启信慧眼默认规则(国内)', tag: '-', owner: '19156027703', adder: '19156027703', addTime: '2026-08-17 12:59', note: '-' },
    { id: '14', name: '粤信数智种植产业发展（金寨）有限公司', code: '91341524MA8PCX5T9Q', area: '安徽六安金寨县', addr: 1, rule: '启信慧眼默认规则(国内)', tag: '-', owner: '19156027703', adder: '19156027703', addTime: '2026-08-17 12:59', note: '-' },
    { id: '15', name: '广州粤信科技有限公司北京分公司', code: '91110108MA01E7CBX5', area: '北京海淀区', addr: 1, rule: '启信慧眼默认规则(国内)', tag: '-', owner: '19156027703', adder: '19156027703', addTime: '2026-08-17 12:59', note: '-' },
    { id: '16', name: '合瑞云创网络信息（北京）有限公司', code: '91110108MA0050MQ7N', area: '北京海淀区', addr: 1, rule: '启信慧眼默认规则(国内)', tag: '-', owner: '19156027703', adder: '19156027703', addTime: '2026-08-17 12:59', note: '-' },
  ] as Company[],
  detail: {
    name: '抖音有限公司',
    status: '存续',
    legal: '银平',
    capital: '10,000万人民币',
    found: '2016-05-04',
    area: '北京海淀区',
    code: '91110105MA005AEF36',
    country: '中国',
    address: '北京市海淀区北三环西路甲23号院1号楼3层327',
    email: '-',
    epNo: '-',
    shortName: '-',
    relatedEp: '-',
    epTag: '-',
    epGroup: '未分组',
    owner: '19156027703',
    note: '-',
    adder: '19156027703',
    addTime: '2026-08-17',
    rule: '启信慧眼默认规则(国内)',
    score: 180,
    riskTotal: 6,
    highRisk: 0,
    dist: [
      {
        type: '司法风险',
        count: 6,
        items: [
          { name: '开庭公告', num: '0条', level: '中风险', content: '暂无内容' },
          { name: '法院公告', num: '0条', level: '低风险', content: '暂无内容' },
        ],
      },
    ],
    dynamics: [
      { id: 'd1', subject: '抖音有限公司', level: '低风险', happen: '2026-06-23', type: '法院公告', content: '新增法院公告，其身份为被告，案号为（2025）京0108民初71962号，案由为确认不侵害著作权纠纷，是一则裁判文书的公告', score: 10, push: '2026-08-17', owner: '19156027703', status: '未处理' },
      { id: 'd2', subject: '抖音有限公司', level: '中风险', happen: '2026-06-08', type: '开庭公告', content: '新增开庭公告，其身份为被告，案由为买卖合同纠纷，案号（2026）赣0111民初1112号', score: 50, push: '2026-08-17', owner: '19156027703', status: '未处理' },
      { id: 'd3', subject: '抖音有限公司', level: '低风险', happen: '2026-04-27', type: '开庭公告', content: '新增开庭公告，相关当事人 上海格物致品网络科技有限公司，案由为买卖合同纠纷', score: 10, push: '2026-08-17', owner: '19156027703', status: '未处理' },
    ] as Dyn[],
  },
}

const LEVEL_COLOR: Record<string, { c: string; b: string }> = {
  高风险: { c: '#B91C1C', b: '#FEE2E2' },
  中风险: { c: '#C2410C', b: '#FFEDD5' },
  低风险: { c: '#1D4ED8', b: '#EFF6FF' },
  轻微风险: { c: '#0F766E', b: '#CCFBF1' },
  日常资讯: { c: '#475569', b: '#F1F5F9' },
}

export default function FkMonitorList({ params }: { params: URLSearchParams }) {
  const [data] = useSample('fkMonitor.json', seed)
  const [kw, setKw] = useState('')
  const [scope, setScope] = useState('国内')
  const [country, setCountry] = useState('中国')
  const [hasAddr, setHasAddr] = useState('不限')
  const [hasEmail, setHasEmail] = useState('不限')
  const [rule, setRule] = useState('全部')
  const [group, setGroup] = useState('未分组')
  const [selected, setSelected] = useState<string[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [addTab, setAddTab] = useState('输入添加')
  const [detailOpen, setDetailOpen] = useState(false)
  const [curName, setCurName] = useState(params.get('name') || '抖音有限公司')

  const rows = data.companies.filter((c) => {
    if (kw && !c.name.includes(kw) && !c.code.includes(kw)) return false
    if (rule !== '全部' && c.rule !== rule) return false
    return true
  })

  const columns: Column[] = [
    { key: 'name', label: '企业名称', width: '200px', render: (r: Row) => (
      <a style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => { setCurName(String(r.name)); setDetailOpen(true) }}>{String(r.name)}</a>
    ) },
    { key: 'code', label: '统一社会信用代码', width: '170px' },
    { key: 'area', label: '地区', width: '160px' },
    { key: 'addr', label: '关联地址', align: 'center', render: (r: Row) => <a style={{ color: '#2563EB' }}>{String(r.addr)}</a> },
    { key: 'rule', label: '监控规则', width: '170px' },
    { key: 'tag', label: '标签' },
    { key: 'owner', label: '负责人/部门' },
    { key: 'adder', label: '添加人' },
    { key: 'addTime', label: '添加时间', width: '140px' },
    { key: 'note', label: '备注' },
    {
      key: 'op',
      label: '操作',
      fixed: 'right',
      width: '230px',
      render: (r: Row) => (
        <span style={{ display: 'inline-flex', gap: 8, whiteSpace: 'nowrap' }}>
          <a style={lk} onClick={() => { setCurName(String(r.name)); setDetailOpen(true) }}>查看</a>
          <span style={{ color: '#CBD5E1' }}>|</span>
          <a style={lk}>编辑企业</a>
          <a style={lk}>编辑地址</a>
          <span style={{ color: '#CBD5E1' }}>|</span>
          <a style={lk}>关联企业</a>
          <a style={{ ...lk, color: '#DC2626' }}>移除</a>
        </span>
      ),
    },
  ]

  return (
    <EpPage
      title="监控列表"
      subtitle="已同步企业 3 个月监控动态数据，按监控规则持续推送风险"
      crumb="风控中心 / 监控列表"
      actions={
        <span style={{ display: 'inline-flex', gap: 8 }}>
          <EpBtn variant="default">风险和推送设置</EpBtn>
          <EpBtn variant="primary" onClick={() => setAddOpen(true)}>添加监控</EpBtn>
        </span>
      }
    >
      {/* 顶部统计：已同步 X 家企业 3 个月监控动态数据 / 剩余额度 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
        <EpStat label="已同步" value={`${data.synced} 家`} sub="家企业3个月监控动态数据" accent="#2563EB" />
        <EpStat label="剩余额度" value={data.quota} sub="可继续添加监控企业数" accent="#0F766E" />
        <EpStat label="监控企业数" value={`${data.monitorCount} 家`} sub={data.rule} />
      </div>

      {/* 添加监控入口（输入添加 / Excel上传 / 从客户列表导入） */}
      <EpCard pad={false} className="mb-3.5">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: '#475569' }}>添加监控</span>
          {['输入添加', 'Excel上传', '从客户列表导入'].map((t) => (
            <EpBtn key={t} variant="default" size="sm" onClick={() => { setAddTab(t); setAddOpen(true) }}>{t}</EpBtn>
          ))}
          <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 8 }}>
            <input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="请输入企业名称、编号、简称" style={{ ...inp, width: 240 }} />
            <EpBtn variant="primary" size="sm">搜索</EpBtn>
          </span>
        </div>
      </EpCard>

      {/* 筛选：企业信息 + 监控筛选 */}
      <EpCard title="企业信息" pad={false}>
        <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
          <FilterRow label="国内/境外" opts={['国内', '境外']} value={scope} onChange={setScope} />
          <FilterRow label="国家地区" opts={['中国', '德国', '美国']} value={country} onChange={setCountry} />
          <FilterRow label="关联地址" opts={['不限', '有', '无']} value={hasAddr} onChange={setHasAddr} />
          <FilterRow label="联系邮箱" opts={['不限', '有', '无']} value={hasEmail} onChange={setHasEmail} />
        </div>
      </EpCard>

      <div style={{ marginTop: 12 }}>
        <EpCard title="监控筛选" pad={false}>
          <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: '#475569', width: 92 }}>负责人/部门</span>
              <select style={{ ...inp, width: 220 }}>
                <option>请选择</option>
                <option>19156027703</option>
              </select>
              <span style={{ color: '#475569', marginLeft: 12 }}>添加人</span>
              <select style={{ ...inp, width: 180 }}>
                <option>19156027703</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ color: '#475569', width: 92 }}>企业标签</span>
              {['全选', '默认分组'].map((t) => <Chip key={t} on={false}>{t}</Chip>)}
              <EpBtn variant="ghost" size="sm">编辑标签</EpBtn>
            </div>
            <FilterRow label="企业分组" opts={['未分组', '长时间未联系', '重点维护']} value={group} onChange={setGroup} extra={<EpBtn variant="ghost" size="sm">分组管理</EpBtn>} />
            <FilterRow
              label="监控规则"
              opts={['全部', '启信慧眼默认规则(国内)', '启信慧眼默认规则(境外)']}
              value={rule}
              onChange={setRule}
            />
          </div>
        </EpCard>
      </div>

      {/* 批量操作条 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '16px 0 10px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: '#0F172A', fontWeight: 600 }}>监控企业数：{data.monitorCount}家</span>
        <span style={{ marginLeft: 8, display: 'inline-flex', gap: 8, flexWrap: 'wrap' }}>
          <BatchMenu label="监控规则修改" items={['修改所选', '修改所有']} />
          <BatchMenu label="设置标签" items={['变更标签', '增加标签', '删除标签']} />
          <BatchMenu label="负责人/部门设置" items={['变更负责人/部门', '增加负责人/部门', '删除']} />
          <BatchMenu label="批量删除" items={['删除所选', '删除全部']} />
        </span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 8 }}>
          <EpBtn variant="default" size="sm">展示字段 (10/31)</EpBtn>
          <EpBtn variant="default" size="sm">导出</EpBtn>
        </span>
      </div>

      <EpCard desc={<Sam value="fkMonitor.json" />}>
        <DataTable
          columns={columns}
          rows={rows as unknown as Row[]}
          selectable
          selected={selected}
          onSelectChange={setSelected}
          pager
          exportable
          exportName="监控列表"
          empty="暂无监控企业，点击「添加监控」录入"
        />
      </EpCard>

      {/* 添加监控 */}
      <EpDrawer open={addOpen} onClose={() => setAddOpen(false)} title="添加监控" width={620}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {['输入添加', 'Excel上传', '从客户列表导入'].map((t) => (
            <span key={t} onClick={() => setAddTab(t)} style={tabStyle(addTab === t)}>{t}</span>
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#64748B', marginBottom: 8 }}>剩余额度 {data.quota}</div>
        {addTab === '输入添加' && (
          <>
            <textarea placeholder="企业信息可手动输入添加，也可直接复制粘贴，如：抖音有限公司" style={{ ...inp, height: 140, resize: 'vertical' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94A3B8', marginTop: 6 }}>
              <span>0 / 540</span>
              <span style={{ display: 'inline-flex', gap: 10 }}>
                <a style={lk}>清空</a>
                <a style={lk}>立即匹配</a>
              </span>
            </div>
          </>
        )}
        {addTab === 'Excel上传' && (
          <div>
            <div style={{ display: 'flex', gap: 10, fontSize: 12, color: '#64748B', marginBottom: 10 }}>
              {['1 上传名单', '2 数据校验', '3 信息校验', '4 上传完成'].map((s) => (
                <span key={s} style={{ padding: '3px 10px', borderRadius: 12, background: '#F1F5F9' }}>{s}</span>
              ))}
            </div>
            <div style={{ border: '1px dashed #CBD5E1', borderRadius: 12, padding: 30, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
              将Excel文件拖拽至框内上传
              <div style={{ fontSize: 12, marginTop: 6 }}>仅支持 Excel 格式文件(xls, xlsx)</div>
              <div style={{ marginTop: 10, display: 'inline-flex', gap: 10 }}>
                <EpBtn variant="primary" size="sm">点击上传</EpBtn>
                <EpBtn variant="default" size="sm">下载样例文件</EpBtn>
              </div>
            </div>
          </div>
        )}
        {addTab === '从客户列表导入' && (
          <div style={{ fontSize: 13, color: '#475569' }}>
            <input placeholder="请输入关键词搜索" style={{ ...inp, marginBottom: 10 }} />
            <DataTable
              columns={[
                { key: 'name', label: '选择本页' },
                { key: 'group', label: '分组' },
                { key: 'tag', label: '标签' },
                { key: 'owner', label: '负责人' },
                { key: 'time', label: '添加时间' },
              ]}
              rows={[
                { id: 'c1', name: '抖音有限公司', group: '未分组', tag: '开户', owner: '19156027703', time: '2026-08-17' },
                { id: 'c2', name: '抖音视界有限公司', group: '重点维护', tag: '贷款', owner: '19156027703', time: '2026-08-17' },
              ]}
              selectable
            />
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
          <EpBtn variant="default" onClick={() => setAddOpen(false)}>取消</EpBtn>
          <EpBtn variant="primary" onClick={() => setAddOpen(false)}>确定</EpBtn>
        </div>
      </EpDrawer>

      {/* 风险详情（快照：风控 - 监控列表 - 风险详情） */}
      <EpDrawer open={detailOpen} onClose={() => setDetailOpen(false)} title={`${curName} 风险详情`} width={720}>
        <RiskDetail d={data.detail} name={curName} />
      </EpDrawer>
    </EpPage>
  )
}

/* ---------- 风险详情（企业信息 / 风险概览 / 风险分布 / 风险动态） ---------- */
function RiskDetail({ d, name }: { d: typeof seed.detail; name: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>{name}</span>
        <EpTag color="#0F766E" bg="#CCFBF1">{d.status}</EpTag>
        <span style={{ fontSize: 12, color: '#64748B' }}>{d.legal}</span>
        <span style={{ fontSize: 12, color: '#64748B' }}>{d.capital}</span>
        <span style={{ fontSize: 12, color: '#64748B' }}>{d.found}</span>
        <span style={{ fontSize: 12, color: '#64748B' }}>{d.area}</span>
      </div>

      <EpCard title="企业信息" pad={false}>
        <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, margin: 0 }}>
          {[
            ['信用代码', d.code],
            ['国家/地区', d.country],
            ['详细地址', d.address],
            ['联系邮箱', d.email],
            ['企业编号', d.epNo],
            ['企业简称', d.shortName],
            ['关联企业', d.relatedEp],
            ['企业标签', d.epTag],
            ['企业分组', d.epGroup],
            ['负责人/部门', d.owner],
            ['备注信息', d.note],
            ['添加人员', d.adder],
            ['添加时间', d.addTime],
            ['监控规则', d.rule],
          ].map(([k, v]) => (
            <div key={k} style={{ padding: '9px 16px', borderBottom: '1px solid #F1F5F9', fontSize: 12 }}>
              <span style={{ color: '#94A3B8', marginRight: 8 }}>{k}</span>
              <span style={{ color: '#0F172A' }}>{v}</span>
            </div>
          ))}
        </dl>
      </EpCard>

      <EpCard title="风险概览" desc="推送时间 / 发生时间 · 今日 昨日 最近7天 最近30天 更多">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          <EpStat label="风险分数" value={d.score} accent="#DC2626" />
          <EpStat label="风险总数" value={d.riskTotal} />
          <EpStat label="高风险" value={d.highRisk} accent="#B91C1C" />
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: '#64748B' }}>
          风险分数趋势
          <span style={{ marginLeft: 10, display: 'inline-flex', gap: 6 }}>
            {['按天', '按周', '按月'].map((t) => <Chip key={t} on={t === '按天'}>{t}</Chip>)}
          </span>
          <div style={{ marginTop: 8, color: '#94A3B8' }}>2026年08月04日 · 风险分值 0 · 风险总数 0 · 已处理 0 · 风险分环比无变化</div>
        </div>
      </EpCard>

      <EpCard title="风险分布">
        {d.dist.map((g) => (
          <div key={g.type} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 6 }}>{g.type}{g.count}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {g.items.map((it) => (
                <div key={it.name} style={{ border: '1px solid #F1F5F9', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 13, color: '#0F172A' }}>
                    {it.name} <span style={{ color: '#64748B' }}>{it.num}</span>
                    <EpTag color={LEVEL_COLOR[it.level]?.c} bg={LEVEL_COLOR[it.level]?.b}>{it.level}</EpTag>
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>{it.content}</div>
                  <a style={{ ...lk, fontSize: 12 }}>查看更多 &gt;</a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </EpCard>

      <EpCard title="风险动态" desc={<Sam value="fkMonitor.json" />}>
        <DataTable
          columns={[
            { key: 'subject', label: '监控主体' },
            { key: 'level', label: '风险等级', render: (r: Row) => <EpTag color={LEVEL_COLOR[String(r.level)]?.c} bg={LEVEL_COLOR[String(r.level)]?.b}>{String(r.level)}</EpTag> },
            { key: 'happen', label: '发生时间' },
            { key: 'type', label: '风险类型' },
            { key: 'content', label: '风险内容', render: (r: Row) => <div style={{ maxWidth: 320, whiteSpace: 'normal' }}>{String(r.content)}</div> },
            { key: 'score', label: '风险评分' },
            { key: 'push', label: '推送时间' },
            { key: 'owner', label: '负责人' },
            { key: 'status', label: '处理状态' },
          ]}
          rows={d.dynamics as unknown as Row[]}
          empty="暂无数据"
        />
      </EpCard>
    </div>
  )
}

/* ---------- 小组件 ---------- */
function FilterRow({ label, opts, value, onChange, extra }: { label: string; opts: string[]; value: string; onChange: (v: string) => void; extra?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span style={{ color: '#475569', width: 92 }}>{label}</span>
      {opts.map((o) => (
        <span key={o} onClick={() => onChange(o)} style={chipStyle(value === o)}>{o}</span>
      ))}
      {extra}
    </div>
  )
}

function Chip({ children, on }: { children: React.ReactNode; on?: boolean }) {
  return <span style={chipStyle(!!on)}>{children}</span>
}

function BatchMenu({ label, items }: { label: string; items: string[] }) {
  const [open, setOpen] = useState(false)
  return (
    <span style={{ position: 'relative' }}>
      <EpBtn variant="default" size="sm" onClick={() => setOpen(!open)}>{label} ▾</EpBtn>
      {open && (
        <span
          style={{ position: 'absolute', top: 28, left: 0, zIndex: 20, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, boxShadow: '0 6px 18px rgba(15,23,42,.08)', minWidth: 150, padding: '4px 0' }}
        >
          {items.map((i) => (
            <span key={i} onClick={() => setOpen(false)} style={{ display: 'block', padding: '6px 12px', fontSize: 12, color: '#334155', cursor: 'pointer' }}>{i}</span>
          ))}
        </span>
      )}
    </span>
  )
}

const chipStyle = (on: boolean): React.CSSProperties => ({
  cursor: 'pointer',
  padding: '3px 12px',
  borderRadius: 14,
  fontSize: 12,
  border: `1px solid ${on ? '#2563EB' : '#E2E8F0'}`,
  background: on ? '#EFF6FF' : '#fff',
  color: on ? '#2563EB' : '#64748B',
})

const tabStyle = (on: boolean): React.CSSProperties => ({
  cursor: 'pointer',
  padding: '6px 14px',
  fontSize: 13,
  borderBottom: `2px solid ${on ? '#2563EB' : 'transparent'}`,
  color: on ? '#2563EB' : '#64748B',
  fontWeight: on ? 600 : 400,
})

const lk: React.CSSProperties = { color: '#2563EB', cursor: 'pointer' }

const inp: React.CSSProperties = {
  padding: '7px 12px',
  border: '1px solid #CBD5E1',
  borderRadius: 8,
  fontSize: 13,
  outline: 'none',
  width: '100%',
}
