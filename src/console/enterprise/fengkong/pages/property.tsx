// 企业风控 · 财产线索（fk-property）· 1:1 复刻「财产线索」截图
// 数据：本地样例 fkProperty.json（橘 Sam）
import { useState, type ReactNode } from 'react'
import { EpPage, EpCard, EpTag, EpBtn, useSample, Sam } from '../../epCommon'
import { RiskContentDrawer } from '../components/RiskContentDrawer'

const seed = {
  company: {
    name: '广州博鳌纵横网络科技有限公司',
    status: '存续',
    logoText: '博',
    qixinScore: '362',
    tags: ['企业健康度：362分', '发票抬头', '集团', '小微企业(官方）', '民营企业', '园区企业', '失信被执行人', '被执行人', '终本案件', '限制高消费', '司法拍卖', '破产案件', '非正常户', '网红经济', '有商标', '全部标签(26)'],
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
    { key: 'clue', label: '线索信息', count: 12 },
    { key: 'expand', label: '扩大主体', count: 14 },
    { key: 'asset', label: '资产状况', count: 14 },
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
      caseNo:  '（2026）京0108执7425号', restricted: '广州博鳌纵横网络科技有限公司', related: '谢旭辉',
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
    {
      id: '6', time: '2026-04-28', event: '新增股权冻结', type: '股权', diff: '高',
      caseNo: '（2026）粤0112财保88号', restricted: '广州博鳌纵横网络科技有限公司', related: '广州博鳌知识产权代理有限公司',
      applicant: '北京盈科（广州）律师事务所', reason: '股权转让纠纷诉前保全', amount: '12000000', court: '广州市黄埔区人民法院', status: '保全中',
      parse: '股权被冻结通常意味着企业存在未披露的债务或诉讼，冻结期间股权无法转让、质押，影响其融资与资本运作。',
    },
    {
      id: '7', time: '2026-03-30', event: '新增不动产登记查封', type: '不动产', diff: '高',
      caseNo: '（2026）粤0112执保521号', restricted: '广州市黄埔区科学大道231、233号裙楼', related: '广州博鳌纵横网络科技有限公司',
      applicant: '招商银行广州黄埔支行', reason: '金融借款合同纠纷', amount: '186000000', court: '广州市黄埔区人民法院', status: '查封中',
      parse: '核心办公不动产被查封将直接影响企业持续经营场所的稳定性，建议优先评估并制定资产处置预案。',
    },
    {
      id: '8', time: '2026-03-11', event: '新增一笔应收账款质押', type: '对外债权', diff: '中',
      caseNo: '（2026）穗仲字第447号', restricted: '账期12个月内应收账款', related: '广州博鳌纵横网络科技有限公司',
      applicant: '深圳前海某商业保理公司', reason: '保理融资', amount: '23000000', court: '-', status: '已登记',
      parse: '应收账款质押可增加短期流动性，但若底层贸易背景不实，可能形成潜在风险敞口，需核验合同与发票。',
    },
    {
      id: '9', time: '2026-02-22', event: '有被执行人记录', type: '其他类型', diff: '高',
      caseNo: '（2026）粤01执383号', restricted: '广州博鳌纵横网络科技有限公司', related: '谢旭辉',
      applicant: '广州市黄埔区税务局', reason: '欠税强制执行', amount: '4380000', court: '广州市中级人民法院', status: '执行中',
      parse: '被税务机关列为被执行人，反映企业现金流紧张且存在历史纳税义务履行瑕疵，需关注税务合规风险。',
    },
    {
      id: '10', time: '2026-01-18', event: '新增动产抵押', type: '动产', diff: '中',
      caseNo: '（2026）粤0106动抵登12号', restricted: '服务器及IDC机房设备一批', related: '广州博鳌纵横网络科技有限公司',
      applicant: '远东宏信（天津）融资租赁有限公司', reason: '融资租赁售后回租', amount: '4200000', court: '-', status: '已登记',
      parse: '动产抵押登记可盘活存量设备资产，但同时形成优先债权，处置资产时受偿顺序靠后需留意。',
    },
    {
      id: '11', time: '2025-12-05', event: '新增知识产权质押', type: '无形资产', diff: '低',
      caseNo: '（2025）粤知质押字第39号', restricted: '注册商标「博鳌」等42件', related: '广州博鳌纵横网络科技有限公司',
      applicant: '广州知识产权交易中心', reason: '知识产权质押融资', amount: '5400000', court: '-', status: '已登记',
      parse: '知识产权质押体现企业无形资产变现能力，相关权利稳定性（续展、异议）需持续跟踪。',
    },
    {
      id: '12', time: '2025-11-20', event: '有案件恢复执行', type: '其他类型', diff: '中',
      caseNo: '（2025）琼9021执恢233号', amount: '310000', court: '定安县人民法院', status: '已结案',
      parse: '案件恢复执行的原因有债权人向法院提供了财产线索或追加了当事人。',
    },
  ],
  // 扩大主体：补充内容（关联主体 / 疑似关联人员 / 分支机构）
  expand: [
    { id: 'e1', name: '广州博鳌知识产权代理有限公司', rel: '控股子公司', legal: '谢旭辉', risk: '中风险', reason: '同一法定代表人，疑似核心运营主体' },
    { id: 'e2', name: '谢旭辉', rel: '法定代表人 / 实际控制人', legal: '-', risk: '高风险', reason: '关联限制高消费、被执行记录' },
    { id: 'e3', name: '北京博鳌纵横科技有限公司', rel: '兄弟公司', legal: '陈晓丹', risk: '低风险', reason: '同集团品牌，异地运营主体' },
    { id: 'e4', name: '广州博鳌网络科技合伙企业（有限合伙）', rel: '股东平台', legal: '谢旭辉', risk: '中风险', reason: '员工持股平台，资金往来频繁' },
    { id: 'e5', name: '广州黄埔区博鳌孵化器有限公司', rel: '分支机构', legal: '谢旭辉', risk: '低风险', reason: '园区运营主体' },
    { id: 'e6', name: '海南纵横博鳌投资有限公司', rel: '对外投资', legal: '谢旭辉', risk: '中风险', reason: '对外投资控股平台' },
    { id: 'e7', name: '广州博鳌纵横网络科技合伙企业', rel: '对外投资', legal: '谢旭辉', risk: '低风险', reason: '横向业务投资平台' },
    { id: 'e8', name: '广州博鳌文化传媒有限公司', rel: '控股子公司', legal: '谢旭辉', risk: '中风险', reason: '集团品牌运营子公司，存在多起服务合同纠纷' },
    { id: 'e9', name: '广州博鳌信息科技有限公司', rel: '全资子公司', legal: '谢旭辉', risk: '中风险', reason: '集团数据业务承载主体，近期股权被冻结' },
    { id: 'e10', name: '博鳌国际知识产权运营（深圳）有限公司', rel: '联营企业', legal: '陈晓丹', risk: '低风险', reason: '跨区域知识产权运营平台' },
    { id: 'e11', name: '谢旭辉', rel: '疑似关联自然人 / 密切联系人', legal: '-', risk: '高风险', reason: '担任多家关联公司法定代表人且有被执行记录' },
    { id: 'e12', name: '广州博鳌纵横网络科技（海南）有限公司', rel: '分支机构', legal: '谢旭辉', risk: '低风险', reason: '海南自贸港运营主体' },
    { id: 'e13', name: '广州博鳌创业投资合伙企业（有限合伙）', rel: '对外投资', legal: '谢旭辉', risk: '中风险', reason: '早期项目投资平台，存在回购义务' },
    { id: 'e14', name: '广州博鳌智慧园区运营管理有限公司', rel: '控股子公司', legal: '谢旭辉', risk: '低风险', reason: '园区物业管理与招商主体' },
  ],
  assets: [
    { id: 'a1', type: '不动产', name: '广州市黄埔区科学大道231号裙楼B1B2栋', detail: '建筑面积约 12,800㎡，用途为办公及商业', value: '约 1.86 亿元', status: '已抵押', court: '-' },
    { id: 'a2', type: '股权', name: '持有的广州博鳌知识产权代理有限公司 100% 股权', detail: '注册资本 1,000 万人民币', value: '约 1,200 万元', status: '冻结', court: '广州市黄埔区人民法院' },
    { id: 'a3', type: '银行账户', name: '招商银行广州黄埔支行 对公账户', detail: '账户余额（2026-06 查）', value: '约 386 万元', status: '部分冻结', court: '广州市黄埔区人民法院' },
    { id: 'a4', type: '机动车', name: '奔驰 S400L 等公务用车 3 台', detail: '登记于公司名下', value: '约 260 万元', status: '正常', court: '-' },
    { id: 'a5', type: '知识产权', name: '注册商标「博鳌」等 42 件', detail: '第35/36/42 类', value: '评估约 540 万元', status: '正常', court: '-' },
    { id: 'a6', type: '对外投资', name: '北京博鳌纵横科技有限公司 30% 股权', detail: '注册资本 500 万人民币', value: '约 150 万元', status: '正常', court: '-' },
    { id: 'a7', type: '应收账款', name: '账期 1 年内应收账款', detail: '主要客户为中小企业', value: '约 2,300 万元', status: '部分涉诉', court: '广州市中级人民法院' },
    { id: 'a8', type: '设备资产', name: '服务器及办公设备一批', detail: 'IDC 机房托管设备', value: '约 420 万元', status: '正常', court: '-' },
    { id: 'a9', type: '不动产', name: '广州市天河区珠江新城写字楼 8 层', detail: '建筑面积约 2,100㎡，投资性房地产', value: '约 4,200 万元', status: '正常', court: '-' },
    { id: 'a10', type: '股权', name: '持有的广州博鳌文化传媒有限公司 60% 股权', detail: '注册资本 500 万人民币', value: '约 300 万元', status: '正常', court: '-' },
    { id: 'a11', type: '银行存款', name: '工商银行广州天河支行 一般户', detail: '账户余额（2026-06 查）', value: '约 92 万元', status: '正常', court: '-' },
    { id: 'a12', type: '知识产权', name: '发明专利「一种知识产权交易匹配方法」等 11 项', detail: '第42类，剩余保护期 12 年', value: '评估约 860 万元', status: '正常', court: '-' },
    { id: 'a13', type: '对外投资', name: '海南纵横博鳌投资有限公司 100% 股权', detail: '注册资本 2,000 万人民币', value: '约 1,800 万元', status: '质押', court: '海口市中级人民法院' },
    { id: 'a14', type: '应收账款', name: '账期 1-2 年应收账款', detail: '含履约保证金及质保金', value: '约 1,050 万元', status: '部分涉诉', court: '广州市黄埔区人民法院' },
  ],
  pagination: { total: 12, pageSize: 5, current: 1 },
}

type Data = typeof seed
type Clue = Data['clues'][number]
type Expand = Data['expand'][number]

const RISK_OF_DIFF: Record<string, string> = { 高: '高风险', 中: '中风险', 低: '低风险', 其他: '日常资讯' }

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
  const [started, setStarted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cur, setCur] = useState<Clue | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const totalPages = Math.max(1, Math.ceil(data.pagination.total / data.pagination.pageSize))

  const onStart = () => {
    setLoading(true)
    window.setTimeout(() => { setStarted(true); setLoading(false) }, 600)
  }

  const openDetail = (c: Clue) => { setCur(c); setDetailOpen(true) }

  // 线索行 → 风险内容弹窗所需 row
  const detailRow = cur ? {
    title: cur.event,
    content: clueText(cur),
    level: RISK_OF_DIFF[cur.diff] ?? '日常资讯',
    detail: { tag: cur.type, overview: clueText(cur), riskType: cur.type },
  } : null

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
          onClick={onStart}
          disabled={loading}
          style={{ background: '#1677ff', borderColor: '#1677ff', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <IconSearch />
          {loading ? '查询中…' : '开始查询'}
        </EpBtn>
      </div>

      {!started ? (
        <EpCard>
          <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8', fontSize: 13 }}>
            {loading ? '正在加载财产线索数据…' : '请输入企业信息后点击「开始查询」'}
          </div>
        </EpCard>
      ) : (
        <>
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
                  <a style={{ color: '#1677ff', cursor: 'pointer', marginLeft: 6 }} onClick={() => setDescOpen(!descOpen)}>
                    {descOpen ? '收起' : '展开'}
                  </a>
                </div>
              </div>
            </div>
          </EpCard>

          {/* Tabs + 导出 */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', margin: '16px 0 12px', position: 'sticky', top: 140, zIndex: 20, background: '#fff', borderBottom: '1px solid #E5E7EB', paddingBottom: 0 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {data.tabs.map((t) => (
                <div
                  key={t.key}
                  onClick={() => setTab(t.key as any)}
                  style={{
                    cursor: 'pointer', padding: '9px 18px', fontSize: 14, fontWeight: tab === t.key ? 600 : 500,
                    color: tab === t.key ? '#1677ff' : '#475569', background: tab === t.key ? '#fff' : 'transparent',
                    borderBottom: `2px solid ${tab === t.key ? '#1677ff' : 'transparent'}`,
                    marginTop: tab === t.key ? 0 : 0, position: 'relative', top: 1,
                  }}
                >
                  {t.label} {t.count}
                </div>
              ))}
            </div>
            <EpBtn variant="default" size="sm" onClick={() => alert('导出财产线索')} style={{ marginBottom: 6 }}>导出</EpBtn>
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

              {/* 线索表格 + 提示标签（同一区域） */}
              <EpCard pad={false} style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '14px 16px 0' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>财产线索 {data.pagination.total}</span>
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>为保证线索时效性，仅展示近3年的线索信息</span>
                </div>
                <div style={{ overflowX: 'auto', overflowY: 'hidden', padding: '0 16px 16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 8, minWidth: 1080 }}>
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
                      <th style={{ ...thStyle(70), position: 'sticky', right: 0, zIndex: 3, background: '#F8FAFC', borderLeft: '1px solid #E2E8F0', boxShadow: '-8px 0 10px -8px rgba(15,23,42,.12)' }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.clues.map((c) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9' }} className="fk-clue-row">
                        <td style={tdStyle}>{c.time}</td>
                        <td style={tdStyle}><EpTag color="#7C3AED" bg="#F5F3FF">{c.event}</EpTag></td>
                        <td style={tdStyle}>{c.type}</td>
                        <td style={tdStyle}><DiffText d={c.diff} /></td>
                        <td style={{ ...tdStyle, maxWidth: 360, minWidth: 280, whiteSpace: 'normal !important', overflow: 'hidden !important' }}>
                          <div style={{ color: '#0F172A', lineHeight: 1.8, overflow: 'hidden', wordBreak: 'break-all' }}>
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
                            <div style={{ marginTop: 8, padding: '8px 10px', background: '#F8FAFC', borderRadius: 6, color: '#475569', fontSize: 12, lineHeight: 1.6, overflow: 'hidden', wordBreak: 'break-all' }}>
                              线索解析：{c.parse}
                            </div>
                          )}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          {parseOpen && <span style={{ fontSize: 12, color: '#64748B' }}>已解析</span>}
                        </td>
                        <td style={{ ...tdStyle, position: 'sticky', right: 0, zIndex: 3, background: '#fff', borderLeft: '1px solid #E2E8F0', boxShadow: '-8px 0 10px -8px rgba(15,23,42,.12)' }}>
                          <a style={{ color: '#1677ff', cursor: 'pointer' }} onClick={() => openDetail(c)}>详情</a>
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
                    <button key={p} onClick={() => setPage(p)} style={{ ...pageBtnStyle, background: page === p ? '#1677ff' : '#fff', color: page === p ? '#fff' : '#475569', borderColor: page === p ? '#1677ff' : '#E2E8F0' }}>{p}</button>
                  ))}
                  {totalPages > 5 && <span>...</span>}
                  {totalPages > 5 && <button style={pageBtnStyle}>{totalPages}</button>}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={pageBtnStyle}>下一页</button>
                  <span>前往</span>
                  <input defaultValue={page} style={{ width: 40, padding: '3px 6px', border: '1px solid #E2E8F0', borderRadius: 4, textAlign: 'center', fontSize: 12 }} />
                  <span>页</span>
                </div>
                </div>
              </EpCard>
            </>
          )}

          {tab === 'expand' && (
            <EpCard pad={false} style={{ marginTop: 16 }}>
              <div style={{ padding: '14px 16px 0', fontSize: 14, fontWeight: 600, color: '#0F172A' }}>扩大主体 {data.expand.length}</div>
              <div style={{ overflowX: 'auto', padding: '0 16px 16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 8, minWidth: 760 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    <th style={thStyle('auto')}>关联主体</th>
                    <th style={thStyle(160)}>关联关系</th>
                    <th style={thStyle(120)}>法定代表人</th>
                    <th style={thStyle(90)}>风险等级</th>
                    <th style={thStyle(280)}>关联说明</th>
                  </tr>
                </thead>
                <tbody>
                  {data.expand.map((e: Expand) => (
                    <tr key={e.id} style={{ borderBottom: '1px solid #F1F5F9' }} className="fk-clue-row">
                      <td style={{ ...tdStyle, color: '#1677ff', fontWeight: 600 }}>{e.name}</td>
                      <td style={tdStyle}>{e.rel}</td>
                      <td style={tdStyle}>{e.legal}</td>
                      <td style={tdStyle}><DiffText d={e.risk.replace('风险', '')} /></td>
                      <td style={{ ...tdStyle, color: '#64748B' }}>{e.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </EpCard>
          )}

          {tab === 'asset' && (
            <EpCard pad={false} style={{ marginTop: 16 }}>
              <div style={{ padding: '14px 16px 0', fontSize: 14, fontWeight: 600, color: '#0F172A' }}>资产状况 {data.assets.length}</div>
              <div style={{ overflowX: 'auto', padding: '0 16px 16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 8, minWidth: 760 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    <th style={thStyle('auto')}>资产类型</th>
                    <th style={thStyle(220)}>资产名称</th>
                    <th style={thStyle(260)}>资产说明</th>
                    <th style={thStyle(120)}>估值 / 金额</th>
                    <th style={thStyle(100)}>状态</th>
                    <th style={thStyle(160)}>关联法院</th>
                  </tr>
                </thead>
                <tbody>
                  {data.assets.map((a) => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #F1F5F9' }} className="fk-clue-row">
                      <td style={{ ...tdStyle, color: '#1677ff', fontWeight: 600 }}>{a.type}</td>
                      <td style={tdStyle}>{a.name}</td>
                      <td style={{ ...tdStyle, color: '#64748B' }}>{a.detail}</td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{a.value}</td>
                      <td style={tdStyle}>
                        <span style={{ color: a.status.includes('冻结') || a.status.includes('抵押') || a.status.includes('涉诉') ? '#DC2626' : '#0F766E', fontWeight: 600 }}>{a.status}</span>
                      </td>
                      <td style={tdStyle}>{a.court}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </EpCard>
          )}
        </>
      )}

      {/* 线索详情弹窗（与风险预警 - 风险内容列单击事件弹窗一致） */}
      <RiskContentDrawer
        open={detailOpen}
        row={detailRow as any}
        read={cur ? { items: [{ k: '线索解析', v: cur.parse }] } : undefined}
        onClose={() => setDetailOpen(false)}
      />
    </EpPage>
  )
}

function clueText(c: Clue): string {
  return [
    c.caseNo && `案号：${c.caseNo}`,
    c.restricted && `限制法人或组织：${c.restricted}`,
    c.related && `关联对象：${c.related}`,
    c.applicant && `申请人：${c.applicant}`,
    c.reason && `案由：${c.reason}`,
    c.amount && `执行标的：${c.amount}`,
    c.court && `执行法院：${c.court}`,
    c.status && `执行状态：${c.status}`,
  ].filter(Boolean).join('；')
}

function CompanyTag({ text }: { text: string }) {
  const riskTags = ['失信被执行人', '被执行人', '终本案件', '限制高消费', '司法拍卖', '破产案件', '非正常户']
  const isRisk = riskTags.includes(text)
  const isMain = text.startsWith('企业健康度')
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
        color: active ? '#fff' : '#475569', background: active ? '#1677ff' : '#F1F5F9',
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
        width: 32, height: 18, borderRadius: 9, background: checked ? '#1677ff' : '#CBD5E1',
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
