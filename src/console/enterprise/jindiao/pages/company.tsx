// 企业尽调报告 · 1:1 复刻文档（广州博鳌纵横网络科技有限公司）
import { useState, useRef } from 'react'
import { EpPage, EpBtn } from '../../epCommon'
import QixinScoreModal from './modals/QixinScoreModal'
import ShellCompanyModal from './modals/ShellCompanyModal'
import KechuangScoreModal from './modals/KechuangScoreModal'
import ContractDefaultModal from './modals/ContractDefaultModal'
import JudicialRiskModal from './modals/JudicialRiskModal'
import ComprehensiveModal from './modals/ComprehensiveModal'

/* ============ 数据 ============ */
const COMPANY = {
  name: '广州博鳌纵横网络科技有限公司',
  status: '在营（开业）企业',
  legalPerson: '谢旭辉',
  regCapital: '5651.1425万元人民币',
  estDate: '2012-04-11',
  creditCode: '91440101593739085M',
  entType: '其他有限责任公司',
  opStatus: '在营（开业）企业',
  regOrg: '广州市天河区市场监督管理局',
  regAddr: '广州市天河区科韵路16号自编第3栋601（部位：01）',
  industry: '软件和信息技术服务业',
  bizScope:
    '网络技术的研究、开发；计算机技术开发、技术服务；软件服务；软件开发；信息系统集成服务；信息技术咨询服务；数据处理和存储服务；数字动漫制作；游戏软件设计制作；地理信息加工处理；集成电路设计；信息技术咨询服务；企业管理咨询服务；企业形象策划服务；市场营销策划服务；会议及展览服务；大型活动组织策划服务；文化艺术咨询服务；文化娱乐经纪人；影视经纪代理服务；音像经纪代理服务；文学、艺（美）术经纪代理服务；美术展览经纪代理服务；动漫（动画）经纪代理服务；广播电视节目制作（具体经营范围以《广播电视节目制作经营许可证》为准）；电影和影视节目制作；电影和影视节目发行；录音制作；演出经纪代理服务；营业性文艺表演；文艺创作服务；艺术表演场馆管理服务；舞台灯光、音响设备安装服务；舞台安装、搭建服务；照明灯光设计服务；舞台机械设计安装服务；群众参与的文艺类演出、比赛等公益性文化活动的策划；文化推广（不含许可经营项目）；文化传播（不含许可经营项目）；文化研究；互联网商品销售（许可审批类商品除外）；互联网商品零售（许可审批类商品除外）；商品批发贸易（许可审批类商品除外）；商品零售贸易（许可审批类商品除外）；货物进出口（专营专控商品除外）；技术进出口；',
}

const ENT_TAGS = [
  '高新企业', '科技型中小企业', '小微企业', 'A级纳税人', '一般纳税人', '标准企业',
  '瞪羚企业', '品牌企业', '知名品牌', '著名商标', '守合同重信用', '知识产权优势企业',
  '创新型企业', '技术中心', '工程中心', '博士后工作站', '院士工作站', '企业技术中心',
  '工程技术研究中心', '重点实验室', '新型研发机构', '科技服务机构', '技术转移机构',
  '创新创业示范基地', '产业技术创新联盟',
]

const TABS = [
  '审核结果', '风险速览', '企业指数', '企业风险', '融资借款',
  '资质信用', '市场环境', '舆情公告', '财务分析', '关联关系', '企业图谱',
]

/* 审核结果 - 命中风险 */
const HIT_RISKS = [
  { id: 1, type: '法定代表人变更', date: '2021-03-15', desc: '张一鸣 → 张利东', level: '不通过', color: '#DC2626' },
  { id: 2, type: '注册资本变更', date: '2020-08-22', desc: '100万人民币 → 1000万人民币', level: '不通过', color: '#DC2626' },
  { id: 3, type: '经营范围变更', date: '2019-11-05', desc: '新增互联网文化活动、演出经纪等', level: '中风险', color: '#D97706' },
  { id: 4, type: '行政处罚', date: '2022-05-18', desc: '发布违法广告，罚款人民币20万元', level: '高风险', color: '#EA580C' },
  { id: 5, type: '司法诉讼', date: '2023-02-10', desc: '存在劳动争议及合同纠纷案件3条', level: '高风险', color: '#EA580C' },
  { id: 6, type: '关联企业风险', date: '-', desc: '控股股东100%持股，关联交易风险', level: '中风险', color: '#D97706' },
]

/* 风险速览 - 按等级分组 */
const RISK_OVERVIEW = [
  {
    level: '不通过', color: '#DC2626', bg: '#FEF2F2', items: [
      { title: '法定代表人变更', time: '2021-03-15', desc: '张一鸣变更为张利东，需关注实际控制人变化' },
      { title: '注册资本变更', time: '2020-08-22', desc: '注册资本从100万增至1000万，增幅900%' },
    ],
  },
  {
    level: '高风险', color: '#EA580C', bg: '#FFF7ED', items: [
      { title: '行政处罚', time: '2022-05-18', desc: '发布违法广告，罚款人民币20万元，处罚机关：北京市海淀区市场监督管理局' },
      { title: '司法诉讼', time: '2023-02-10', desc: '存在劳动争议1条、著作权侵权1条、合同纠纷1条，合计标的额442.5万元' },
    ],
  },
  {
    level: '中风险', color: '#D97706', bg: '#FFFBEB', items: [
      { title: '经营范围变更', time: '2019-11-05', desc: '新增互联网文化活动、演出经纪、文艺表演等许可经营项目' },
      { title: '关联企业风险', time: '-', desc: '控股股东北京字节跳动科技有限公司100%持股，存在关联交易及利益输送风险' },
    ],
  },
  {
    level: '低风险', color: '#1677ff', bg: '#EFF6FF', items: [
      { title: '数据合规约谈', time: '2023-03-15', desc: '监管部门就用户数据合规问题进行约谈，要求限期整改，已完成整改' },
    ],
  },
  {
    level: '利好信息', color: '#16A34A', bg: '#F0FDF4', items: [
      { title: '高新企业认定', time: '2022-10-08', desc: '通过高新技术企业认定，有效期3年，享受税收优惠政策' },
      { title: 'A级纳税人', time: '2023-04-01', desc: '连续3年被评为A级纳税人，纳税信用良好' },
      { title: '最具创新力企业', time: '2023-06-01', desc: '入选年度最具创新力企业榜单，来源：经济日报' },
    ],
  },
]

/* 企业指数（经营指数 / 空壳指数 / 科创分 / 合同违约指数 / 司法风险）
 * 每个维度点击弹窗，弹出对应的 React 组件（见 ./modals/*，由原 HTML 1:1 转写） */
const INDICES = [
  { name: '经营指数', score: 65, color: '#1677ff', modal: 'qixin' },
  { name: '空壳指数', score: 72, color: '#D97706', modal: 'shell' },
  { name: '科创分', score: 81, color: '#7C3AED', modal: 'kechuang' },
  { name: '合同违约指数', score: 58, color: '#EA580C', modal: 'contract' },
  { name: '司法风险', score: 30, color: '#DC2626', modal: 'judicial' },
]

/* 企业风险 */
const ENT_RISKS = [
  { category: '经营风险', desc: '行业竞争加剧，用户增长放缓，短视频赛道进入存量竞争阶段', level: '中', color: '#D97706', suggestion: '拓展新业务曲线，强化内容生态，探索海外市场' },
  { category: '司法风险', desc: '存在劳动争议及合同纠纷案件，合计标的额442.5万元', level: '中', color: '#D97706', suggestion: '关注用工合规与合同管理，建立法律风险前置审核机制' },
  { category: '监管风险', desc: '数据合规被约谈并限期整改，互联网行业监管趋严', level: '高', color: '#EA580C', suggestion: '建立数据合规专项治理机制，定期开展合规审计' },
  { category: '关联风险', desc: '控股股东100%持股，存在关联交易及利益输送风险', level: '中', color: '#D97706', suggestion: '完善关联交易披露制度，建立独立的内控审计机制' },
]

/* 融资借款 */
const FINANCE = {
  financing: [
    { round: '天使轮', date: '2018-06-15', investor: '字节跳动', amount: '500万元', valuation: '5000万元' },
    { round: 'A轮', date: '2019-09-20', investor: '红杉资本、字节跳动', amount: '2亿元', valuation: '10亿元' },
  ],
  loans: [
    { bank: '中国建设银行北京海淀支行', amount: '500万元', rate: '4.35%', startDate: '2022-03-01', endDate: '2024-03-01', status: '正常' },
  ],
  guarantees: [
    { target: '抖音视界（上海）有限公司', amount: '300万元', type: '连带责任担保', date: '2022-06-15', status: '有效' },
  ],
  pledge: [
    { pledgor: '北京字节跳动科技有限公司', pledgee: '中国建设银行', amount: '200万元', date: '2022-03-01', status: '有效' },
  ],
}

/* 舆情公告 */
const NEWS = [
  { id: 1, date: '2023-06-01', title: '抖音有限公司入选年度最具创新力企业榜单', source: '经济日报', sentiment: '正面', summary: '抖音有限公司凭借在短视频与人工智能领域的持续投入，入选本年度最具创新力企业。' },
  { id: 2, date: '2023-03-15', title: '抖音因数据合规问题被约谈', source: '人民日报', sentiment: '负面', summary: '监管部门就用户数据合规问题对抖音有限公司进行约谈，要求限期整改。' },
  { id: 3, date: '2022-12-20', title: '抖音上线助农直播专区', source: '新华网', sentiment: '正面', summary: '抖音有限公司联合多地政府推出助农直播专区，助力农产品上行。' },
]

/* 关联关系 */
const RELATIONS = [
  { type: '控股股东', name: '北京字节跳动科技有限公司', ratio: '100%', capital: '10000万人民币', legal: '张利东' },
  { type: '实际控制人', name: '张利东', ratio: '-', capital: '-', legal: '-' },
  { type: '最终受益人', name: '张利东', ratio: '100%', capital: '-', legal: '-' },
  { type: '关联企业', name: '抖音视界（上海）有限公司', ratio: '100%', capital: '5000万人民币', legal: '李英' },
  { type: '关联企业', name: '字跳智创（北京）科技有限公司', ratio: '35%', capital: '2000万人民币', legal: '王迪' },
  { type: '对外投资', name: '北京抖音信息服务有限公司', ratio: '100%', capital: '1000万人民币', legal: '张利东' },
]

/* 企业图谱 */
const GRAPH_ITEMS = [
  { title: '股权穿透', desc: '向上穿透至实际控制人', icon: '🔗' },
  { title: '实际控制人', desc: '展示最终控制链路', icon: '👤' },
  { title: '关联企业', desc: '关联企业全景图谱', icon: '🏢' },
  { title: '对外投资', desc: '对外投资企业分布', icon: '📈' },
  { title: '分支机构', desc: '分支机构地域分布', icon: '🌐' },
  { title: '最终受益人', desc: '受益人持股链路', icon: '💎' },
  { title: '历史股东', desc: '历史股东变更记录', icon: '📜' },
  { title: '疑似关系', desc: '疑似关联关系挖掘', icon: '🔍' },
]

/* 初始查询页数据（双 Tab：常规筛查 / AI 尽调助手） */
const JD_SEED = {
  pageTitle: '企业尽调',
  tabs: [
    { key: 'normal', label: '常规筛查' },
    { key: 'ai', label: 'AI 尽调助手', badge: 'beta' },
  ],
  topActions: { batchScreen: '批量筛查', settings: '筛查设置' },
  normal: {
    title: '一键筛查合作方资质风险',
    placeholder: '请输入企业名称/统一社会信用代码',
    defaultConfig: '默认配置',
    screenBtn: '筛查',
    trySearchPrefix: '试着搜索：',
    trySearch: [
      { name: '广州博鳌纵横网络科技有限公司' },
      { name: '中经汇通电子商务有限公司' },
    ],
    historyTitle: '历史筛查',
    batchDownload: '批量下载',
    more: '更多',
    failTag: '不通过',
    history: [
      { id: 1, name: '广州博鳌纵横网络科技有限公司', time: '2026-08-19 22:22' },
      { id: 2, name: '乐视网信息技术（北京）股份有限公司', time: '2026-08-19 22:17' },
      { id: 3, name: '广州博鳌纵横网络科技有限公司', time: '2026-08-19 21:21' },
    ],
  },
  ai: {
    title: '智能分析合作方资质风险',
    placeholder: '输入您的尽调需求。使用 @企业名称 选择企业',
    defaultConfig: '默认配置',
    prompts: [
      { label: '从供应商准入角度分析：', mention: '@乐视网信息技术（北京）股份有限公司' },
      { label: '从客户授信角度分析：', mention: '@广州粤信科技有限公司' },
    ],
    historyTitle: '历史会话',
    history: [
      { id: 1, title: '供应商准入视角下的乐视分析', time: '2026-08-17 18:12' },
      { id: 2, title: '分析乐视供应商准入', time: '2026-08-17 15:52' },
    ],
  },
}

/* ============ 样式常量 ============ */
const CARD_STYLE: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #E5E7EB',
  borderRadius: 12,
  marginBottom: 16,
}
const SECTION_TITLE: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: '#0F172A',
  padding: '14px 18px',
  borderBottom: '1px solid #F1F5F9',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}
const TABBAR_TOP = 178 // 吸顶 tabBar 高度 + 系统导航，用于锚点 scrollMarginTop

/* ============ 子组件 ============ */
function Gauge({ score, color, label, onClick }: { score: number; color: string; label: string; onClick?: () => void }) {
  const r = 42
  const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <svg width={110} height={110} viewBox="0 0 110 110">
        <circle cx={55} cy={55} r={r} fill="none" stroke="#F1F5F9" strokeWidth={8} />
        <circle
          cx={55} cy={55} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 55 55)"
        />
        <text x={55} y={52} textAnchor="middle" fontSize={22} fontWeight={800} fill={color}>{score}</text>
        <text x={55} y={70} textAnchor="middle" fontSize={11} fill="#94A3B8">分</text>
      </svg>
      <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>{label}</span>
    </div>
  )
}

function RiskBadge({ level, color }: { level: string; color: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 10px',
      borderRadius: 10, fontSize: 11, fontWeight: 600, color, background: color + '15',
    }}>{level}</span>
  )
}

function SentimentTag({ s }: { s: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    正面: { color: '#16A34A', bg: '#F0FDF4' },
    负面: { color: '#DC2626', bg: '#FEF2F2' },
    中性: { color: '#64748B', bg: '#F8FAFC' },
  }
  const m = map[s] || map.中性
  return <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, color: m.color, background: m.bg, fontWeight: 600 }}>{s}</span>
}

/* 得分详情弹窗已改为 React 组件（见 ./modals/*，由原 HTML 快照 1:1 转写），不再用 iframe 加载 HTML */

/* ============ 主组件 ============ */
export default function JdCompany() {
  const [started, setStarted] = useState(false)
  const [query, setQuery] = useState('')
  const [initTab, setInitTab] = useState<'normal' | 'ai'>('normal')
  const [activeTab, setActiveTab] = useState('审核结果')
  const [modalKey, setModalKey] = useState<string | null>(null)
  const tabScrollRef = useRef<HTMLDivElement>(null)

  const openReport = (name?: string) => {
    const q = (name ?? query).trim()
    if (!q) return
    setQuery(q)
    setStarted(true)
    setActiveTab('审核结果')
    requestAnimationFrame(() => {
      const el = document.getElementById('tab-审核结果')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const onTabClick = (t: string) => {
    setActiveTab(t)
    const el = document.getElementById('tab-' + t)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollTabs = (dir: number) => {
    const el = tabScrollRef.current
    if (el) el.scrollBy({ left: dir * 220, behavior: 'smooth' })
  }

  /* ===== 首页：双 Tab 查询（常规筛查 + AI 尽调助手） ===== */
  if (!started) {
    const isNormal = initTab === 'normal'
    const cfg = isNormal ? JD_SEED.normal : JD_SEED.ai
    const topActions = (
      <>
        <EpBtn variant="default" size="sm"><span style={{ marginRight: 4 }}>📊</span>{JD_SEED.topActions.batchScreen}</EpBtn>
        <EpBtn variant="default" size="sm"><span style={{ marginRight: 4 }}>⚙</span>{JD_SEED.topActions.settings}</EpBtn>
      </>
    )
    return (
      <EpPage title={JD_SEED.pageTitle} actions={topActions}>
        <div style={{ maxWidth: 820, margin: '0 auto', paddingBottom: 40 }}>
          {/* 主标题 */}
          <h1 style={{ textAlign: 'center', fontSize: 30, fontWeight: 700, color: '#0F172A', margin: '8px 0 26px 0' }}>{cfg.title}</h1>

          {/* Tab 切换 */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{ display: 'inline-flex', background: '#F1F5F9', borderRadius: 8, padding: 4 }}>
              {JD_SEED.tabs.map((t) => {
                const active = initTab === t.key
                return (
                  <button key={t.key} onClick={() => setInitTab(t.key as 'normal' | 'ai')} style={{
                    position: 'relative', padding: '7px 18px', borderRadius: 6, border: 'none', fontSize: 14, cursor: 'pointer',
                    color: active ? '#1677ff' : '#64748B', background: active ? '#fff' : 'transparent',
                    fontWeight: active ? 600 : 400, boxShadow: active ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {t.label}
                    {t.badge && <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#1677ff', color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 10, lineHeight: 1 }}>{t.badge}</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 常规筛查 */}
          {isNormal && (
            <>
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,.04)', display: 'flex', alignItems: 'center', padding: '6px 6px 6px 0', gap: 4 }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', fontSize: 14, color: '#475569', cursor: 'pointer', padding: '10px 14px', borderRight: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: 14 }}>⚙</span>{JD_SEED.normal.defaultConfig}
                </button>
                <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && openReport()} placeholder={JD_SEED.normal.placeholder} style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, padding: '10px 12px', color: '#0F172A', background: 'transparent' }} />
                <EpBtn variant="primary" size="md" onClick={() => openReport()} disabled={!query.trim()}>{JD_SEED.normal.screenBtn}</EpBtn>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16, fontSize: 13, color: '#64748B', flexWrap: 'wrap' }}>
                <span>{JD_SEED.normal.trySearchPrefix}</span>
                {JD_SEED.normal.trySearch.map((s, idx) => (
                  <span key={idx}>
                    <button onClick={() => openReport(s.name)} style={{ border: 'none', background: 'transparent', color: '#1677ff', cursor: 'pointer', fontSize: 13, padding: 0 }}>{s.name}</button>
                    {idx < JD_SEED.normal.trySearch.length - 1 && <span style={{ marginLeft: 12, color: '#CBD5E1' }}>|</span>}
                  </span>
                ))}
              </div>

              <div style={{ marginTop: 48, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{JD_SEED.normal.historyTitle}</span>
                    <button style={{ border: 'none', background: 'transparent', color: '#64748B', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><span>⬇</span>{JD_SEED.normal.batchDownload}</button>
                  </div>
                  <button style={{ border: 'none', background: 'transparent', color: '#64748B', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>{JD_SEED.normal.more}<span style={{ fontSize: 10 }}>▾</span></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {JD_SEED.normal.history.map((h) => (
                    <div key={h.id} onClick={() => openReport(h.name)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600, color: '#B91C1C', background: '#FEE2E2' }}>{JD_SEED.normal.failTag}</span>
                        <span style={{ fontSize: 14, color: '#1677ff' }}>{h.name}</span>
                      </div>
                      <span style={{ color: '#94A3B8', fontSize: 13, whiteSpace: 'nowrap' }}>{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* AI 尽调助手 */}
          {!isNormal && (
            <>
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,.04)', padding: '18px 20px 14px' }}>
                <textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder={JD_SEED.ai.placeholder} rows={3} style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', fontSize: 14, lineHeight: 1.6, color: '#0F172A', background: 'transparent' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', fontSize: 13, color: '#475569', cursor: 'pointer' }}><span style={{ fontSize: 14 }}>⚙</span>{JD_SEED.ai.defaultConfig}</button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button style={{ border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: 18, padding: 4 }} title="附件">📎</button>
                    <button onClick={() => openReport()} disabled={!query.trim()} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: query.trim() ? '#1677ff' : '#E2E8F0', color: '#fff', cursor: query.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>➤</button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
                {JD_SEED.ai.prompts.map((p, idx) => (
                  <button key={idx} onClick={() => setQuery(`${p.label}${p.mention}`)} style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid #E2E8F0', background: '#fff', fontSize: 13, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: '#94A3B8' }}>{p.label}</span><span style={{ color: '#1677ff' }}>{p.mention}</span>
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 48 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 16px 0' }}>{JD_SEED.ai.historyTitle}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {JD_SEED.ai.history.map((h) => (
                    <div key={h.id} onClick={() => openReport(h.title)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, color: '#0F172A', cursor: 'pointer', padding: '8px 4px', borderRadius: 6 }}>
                      <span>{h.title}</span><span style={{ color: '#94A3B8', fontSize: 13, whiteSpace: 'nowrap' }}>{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </EpPage>
    )
  }

  return (
    <EpPage title="企业尽调报告">
      <div style={{ background: '#F5F6F7', minHeight: 'calc(100vh - 112px)', margin: '-20px', padding: 20 }}>
        {/* ===== 顶部企业信息区 ===== */}
        <div style={{ ...CARD_STYLE, padding: 0 }}>
          <div style={{ padding: '20px 24px 16px' }}>
            {/* 企业名称 + 状态 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>{COMPANY.name}</h1>
              <span style={{
                padding: '4px 12px', borderRadius: 4, fontSize: 13, fontWeight: 600,
                color: '#16A34A', background: '#DCFCE7', border: '1px solid #BBF7D0',
              }}>{COMPANY.status}</span>
            </div>

            {/* 企业标签 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {ENT_TAGS.map((t, i) => (
                <span key={i} style={{
                  padding: '3px 10px', borderRadius: 4, fontSize: 12,
                  color: '#1677ff', background: '#EFF6FF', border: '1px solid #DBEAFE',
                  cursor: 'default',
                }}>{t}</span>
              ))}
            </div>

            {/* 基本信息网格 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 24px', marginBottom: 16 }}>
              {[
                ['法定代表人', COMPANY.legalPerson],
                ['注册资本', COMPANY.regCapital],
                ['成立日期', COMPANY.estDate],
                ['统一社会信用代码', COMPANY.creditCode],
                ['企业类型', COMPANY.entType],
                ['经营状态', COMPANY.opStatus],
                ['登记机关', COMPANY.regOrg],
                ['注册地址', COMPANY.regAddr],
                ['所属行业', COMPANY.industry],
              ].map(([k, v], i) => (
                <div key={i} style={{ display: 'flex', fontSize: 13, lineHeight: 1.6 }}>
                  <span style={{ color: '#94A3B8', minWidth: 110, flexShrink: 0 }}>{k}</span>
                  <span style={{ color: '#0F172A', fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* 经营范围 */}
            <div style={{ fontSize: 13, lineHeight: 1.8, color: '#475569', background: '#F8FAFC', padding: '12px 16px', borderRadius: 8 }}>
              <span style={{ color: '#94A3B8', fontWeight: 600 }}>经营范围：</span>
              {COMPANY.bizScope}
            </div>
          </div>
        </div>

        {/* ===== Tab 导航（箭头按钮顺位移动；点击锚点滚动，不切换隐藏） ===== */}
        <div style={{ ...CARD_STYLE, padding: 0, marginBottom: 16, position: 'sticky', top: 112, zIndex: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => scrollTabs(-1)}
              style={{ flexShrink: 0, width: 36, border: 'none', background: '#fff', cursor: 'pointer', fontSize: 18, color: '#64748B', borderRight: '1px solid #F1F5F9' }}
              title="向左"
            >‹</button>
            <div ref={tabScrollRef} className="tabbar-hide-scroll" style={{ display: 'flex', overflowX: 'auto', padding: '0 12px', borderBottom: '1px solid #F1F5F9', flex: 1 }}>
              {TABS.map((t) => {
                const active = activeTab === t
                return (
                  <button
                    key={t}
                    onClick={() => onTabClick(t)}
                    style={{
                      padding: '14px 18px', fontSize: 14, fontWeight: active ? 700 : 500,
                      color: active ? '#1677ff' : '#64748B', background: 'transparent',
                      border: 'none', borderBottom: active ? '2px solid #1677ff' : '2px solid transparent',
                      cursor: 'pointer', whiteSpace: 'nowrap', marginBottom: -1,
                    }}
                  >{t}</button>
                )
              })}
            </div>
            <button
              onClick={() => scrollTabs(1)}
              style={{ flexShrink: 0, width: 36, border: 'none', background: '#fff', cursor: 'pointer', fontSize: 18, color: '#64748B', borderLeft: '1px solid #F1F5F9' }}
              title="向右"
            >›</button>
          </div>
        </div>

        {/* ===== 审核结果 ===== */}
        <section id="tab-审核结果" style={{ scrollMarginTop: TABBAR_TOP }} className="mb-4">
          <div style={{ ...CARD_STYLE, padding: 0 }}>
            <div style={SECTION_TITLE}>
              <span style={{ width: 4, height: 16, background: '#1677ff', borderRadius: 2 }}></span>
              审核结果
            </div>
            <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 48, flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setModalKey('comprehensive')}>
                <div style={{ fontSize: 56, fontWeight: 800, color: '#DC2626', lineHeight: 1 }}>0</div>
                <div style={{ fontSize: 13, color: '#1677ff', marginTop: 4 }}>综合得分（点击查看说明）</div>
              </div>
              <div style={{ width: 1, height: 60, background: '#E5E7EB' }}></div>
              <div>
                <div style={{ fontSize: 14, color: '#94A3B8', marginBottom: 6 }}>评估结果</div>
                <span style={{
                  padding: '8px 24px', borderRadius: 8, fontSize: 20, fontWeight: 800,
                  color: '#fff', background: '#DC2626',
                }}>不通过</span>
              </div>
              <div style={{ width: 1, height: 60, background: '#E5E7EB' }}></div>
              <div>
                <div style={{ fontSize: 14, color: '#94A3B8', marginBottom: 6 }}>命中风险信息</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#EA580C' }}>6<span style={{ fontSize: 14, color: '#94A3B8', fontWeight: 400, marginLeft: 4 }}>条</span></div>
              </div>
            </div>
          </div>

          {/* 命中风险列表 */}
          <div style={{ ...CARD_STYLE, padding: 0 }}>
            <div style={SECTION_TITLE}>
              <span style={{ width: 4, height: 16, background: '#EA580C', borderRadius: 2 }}></span>
              命中风险明细
            </div>
            <div style={{ padding: '0 18px 18px' }}>
              {HIT_RISKS.map((r) => (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0',
                  borderBottom: '1px solid #F1F5F9',
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: r.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                    ⚠
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{r.type}</span>
                      <RiskBadge level={r.level} color={r.color} />
                      <span style={{ fontSize: 12, color: '#94A3B8' }}>{r.date}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#64748B' }}>{r.desc}</div>
                  </div>
                  <EpBtn variant="default" size="sm">查看详情</EpBtn>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 风险速览 ===== */}
        <section id="tab-风险速览" style={{ scrollMarginTop: TABBAR_TOP }} className="mb-4">
          <div style={{ ...CARD_STYLE, padding: 0 }}>
            <div style={SECTION_TITLE}>
              <span style={{ width: 4, height: 16, background: '#DC2626', borderRadius: 2 }}></span>
              风险速览
            </div>
            <div style={{ padding: '18px 24px 24px' }}>
              {RISK_OVERVIEW.map((group, gi) => (
                <div key={gi} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span style={{
                      padding: '4px 14px', borderRadius: 6, fontSize: 13, fontWeight: 700,
                      color: group.color, background: group.bg, border: `1px solid ${group.color}30`,
                    }}>{group.level}</span>
                    <span style={{ fontSize: 12, color: '#94A3B8' }}>{group.items.length} 条</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {group.items.map((item, ii) => (
                      <div key={ii} style={{
                        padding: '14px 18px', borderRadius: 8, background: group.bg,
                        borderLeft: `3px solid ${group.color}`,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{item.title}</span>
                          <span style={{ fontSize: 12, color: '#94A3B8' }}>{item.time}</span>
                        </div>
                        <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 企业指数 ===== */}
        <section id="tab-企业指数" style={{ scrollMarginTop: TABBAR_TOP }} className="mb-4">
          <div style={{ ...CARD_STYLE, padding: 0 }}>
            <div style={SECTION_TITLE}>
              <span style={{ width: 4, height: 16, background: '#7C3AED', borderRadius: 2 }}></span>
              企业指数
            </div>
            <div style={{ padding: '32px 24px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 24 }}>
              {INDICES.map((idx, i) => (
                <Gauge key={i} score={idx.score} color={idx.color} label={idx.name} onClick={() => setModalKey(idx.modal)} />
              ))}
            </div>
            <div style={{ padding: '0 24px 24px', fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>
              指数评分基于企业工商、司法、舆情、经营等多维度数据综合计算，点击维度可查看指标说明（仅供参考）
            </div>
          </div>
        </section>

        {/* ===== 企业风险 ===== */}
        <section id="tab-企业风险" style={{ scrollMarginTop: TABBAR_TOP }} className="mb-4">
          <div style={{ ...CARD_STYLE, padding: 0 }}>
            <div style={SECTION_TITLE}>
              <span style={{ width: 4, height: 16, background: '#EA580C', borderRadius: 2 }}></span>
              企业风险
            </div>
            <div style={{ padding: '18px 24px 24px', display: 'grid', gridTemplateColumns: '1fr  {1fr}', gap: 16 }}>
              {ENT_RISKS.map((r, i) => (
                <div key={i} style={{
                  padding: '18px', borderRadius: 10, border: '1px solid #E5E7EB',
                  background: '#fff',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>{r.category}</span>
                    <RiskBadge level={`${r.level}风险`} color={r.color} />
                  </div>
                  <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, marginBottom: 12 }}>{r.desc}</div>
                  <div style={{ fontSize: 12, color: '#1677ff', background: '#EFF6FF', padding: '8px 12px', borderRadius: 6, lineHeight: 1.6 }}>
                    <span style={{ fontWeight: 600 }}>建议：</span>{r.suggestion}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 融资借款 ===== */}
        <section id="tab-融资借款" style={{ scrollMarginTop: TABBAR_TOP }} className="mb-4">
          {[
            { title: '融资历史', data: FINANCE.financing, cols: ['轮次', '融资日期', '投资方', '融资金额', '估值', '操作'] },
            { title: '借款信息', data: FINANCE.loans, cols: ['贷款银行', '贷款金额', '年利率', '起始日期', '到期日期', '状态'] },
            { title: '担保信息', data: FINANCE.guarantees, cols: ['被担保方', '担保金额', '担保类型', '担保日期', '状态', '操作'] },
            { title: '股权出质', data: FINANCE.pledge, cols: ['出质人', '质权人', '出质金额', '出质日期', '状态', '操作'] },
          ].map((section, si) => (
            <div key={si} style={{ ...CARD_STYLE, padding: 0 }}>
              <div style={SECTION_TITLE}>
                <span style={{ width: 4, height: 16, background: '#1677ff', borderRadius: 2 }}></span>
                {section.title}
              </div>
              <div style={{ padding: '0 18px 18px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC' }}>
                      {section.cols.map((c, ci) => (
                        <th key={ci} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.data.map((row: any, ri) => (
                      <tr key={ri} style={{ borderTop: '1px solid #F1F5F9' }}>
                        {Object.values(row).map((v: any, vi) => (
                          <td key={vi} style={{ padding: '10px 12px', color: '#334155', verticalAlign: 'top' }}>
                            {vi === section.cols.length - 1 && section.title !== '借款信息' ? (
                              <span style={{ color: '#1677ff', cursor: 'pointer', fontSize: 12 }}>查看</span>
                            ) : v}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>

        {/* ===== 资质信用 ===== */}
        <section id="tab-资质信用" style={{ scrollMarginTop: TABBAR_TOP }} className="mb-4">
          <div style={{ ...CARD_STYLE, padding: 0 }}>
            <div style={SECTION_TITLE}>
              <span style={{ width: 4, height: 16, background: '#16A34A', borderRadius: 2 }}></span>
              资质信用
            </div>
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#94A3B8' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 14 }}>暂无资质信用数据</div>
            </div>
          </div>
        </section>

        {/* ===== 市场环境 ===== */}
        <section id="tab-市场环境" style={{ scrollMarginTop: TABBAR_TOP }} className="mb-4">
          <div style={{ ...CARD_STYLE, padding: 0 }}>
            <div style={SECTION_TITLE}>
              <span style={{ width: 4, height: 16, background: '#0891B2', borderRadius: 2 }}></span>
              市场环境
            </div>
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#94A3B8' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
              <div style={{ fontSize: 14 }}>暂无市场环境数据</div>
            </div>
          </div>
        </section>

        {/* ===== 舆情公告 ===== */}
        <section id="tab-舆情公告" style={{ scrollMarginTop: TABBAR_TOP }} className="mb-4">
          <div style={{ ...CARD_STYLE, padding: 0 }}>
            <div style={SECTION_TITLE}>
              <span style={{ width: 4, height: 16, background: '#7C3AED', borderRadius: 2 }}></span>
              舆情公告
            </div>
            <div style={{ padding: '0 18px 18px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#475569', width: 100 }}>日期</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#475569' }}>标题</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#475569', width: 100 }}>来源</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#475569', width: 70 }}>情感</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#475569', width: 80 }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {NEWS.map((n) => (
                    <tr key={n.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px', color: '#64748B', whiteSpace: 'nowrap' }}>{n.date}</td>
                      <td style={{ padding: '12px', color: '#0F172A', fontWeight: 500 }}>
                        <div style={{ marginBottom: 4 }}>{n.title}</div>
                        <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 400, lineHeight: 1.5 }}>{n.summary}</div>
                      </td>
                      <td style={{ padding: '12px', color: '#64748B' }}>{n.source}</td>
                      <td style={{ padding: '12px' }}><SentimentTag s={n.sentiment} /></td>
                      <td style={{ padding: '12px' }}><span style={{ color: '#1677ff', cursor: 'pointer', fontSize: 12 }}>详情</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* 分页 */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '16px', borderTop: '1px solid #F1F5F9' }}>
              <button style={{ padding: '6px 12px', border: '1px solid #E5E7EB', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 13, color: '#94A3B8' }}>上一页</button>
              <button style={{ padding: '6px 12px', border: '1px solid #1677ff', borderRadius: 6, background: '#1677ff', cursor: 'pointer', fontSize: 13, color: '#fff', fontWeight: 600 }}>1</button>
              <button style={{ padding: '6px 12px', border: '1px solid #E5E7EB', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 13, color: '#64748B' }}>下一页</button>
              <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 8 }}>共 3 条</span>
            </div>
          </div>
        </section>

        {/* ===== 财务分析 ===== */}
        <section id="tab-财务分析" style={{ scrollMarginTop: TABBAR_TOP }} className="mb-4">
          <div style={{ ...CARD_STYLE, padding: 0 }}>
            <div style={SECTION_TITLE}>
              <span style={{ width: 4, height: 16, background: '#0891B2', borderRadius: 2 }}></span>
              财务分析
            </div>
            <div style={{ padding: '60px 24px', textAlign: 'center', color: '#94A3B8' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📈</div>
              <div style={{ fontSize: 15, marginBottom: 6 }}>暂无财务数据</div>
              <div style={{ fontSize: 12 }}>该企业未公开财务报表，无法进行财务分析</div>
            </div>
          </div>
        </section>

        {/* ===== 关联关系 ===== */}
        <section id="tab-关联关系" style={{ scrollMarginTop: TABBAR_TOP }} className="mb-4">
          <div style={{ ...CARD_STYLE, padding: 0 }}>
            <div style={SECTION_TITLE}>
              <span style={{ width: 4, height: 16, background: '#0891B2', borderRadius: 2 }}></span>
              关联关系排查
            </div>
            <div style={{ padding: '18px 24px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
                {[
                  { label: '控股股东', value: '1 家', color: '#1677ff' },
                  { label: '实际控制人', value: '1 人', color: '#7C3AED' },
                  { label: '最终受益人', value: '1 人', color: '#16A34A' },
                  { label: '关联企业', value: '2 家', color: '#EA580C' },
                  { label: '分支机构', value: '0 家', color: '#94A3B8' },
                  { label: '对外投资', value: '1 家', color: '#0891B2' },
                ].map((s, i) => (
                  <div key={i} style={{ padding: '16px', borderRadius: 10, background: '#F8FAFC', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC' }}>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#475569', width: 100 }}>关系类型</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#475569' }}>名称</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#475569', width: 90 }}>持股比例</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#475569', width: 130 }}>注册资本</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#475569', width: 100 }}>法定代表人</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RELATIONS.map((r, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 12px' }}><span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, background: '#EFF6FF', color: '#1677ff', fontWeight: 600 }}>{r.type}</span></td>
                        <td style={{ padding: '10px 12px', color: '#0F172A', fontWeight: 500 }}>{r.name}</td>
                        <td style={{ padding: '10px 12px', color: '#64748B' }}>{r.ratio}</td>
                        <td style={{ padding: '10px 12px', color: '#64748B' }}>{r.capital}</td>
                        <td style={{ padding: '10px 12px', color: '#64748B' }}>{r.legal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 企业图谱 ===== */}
        <section id="tab-企业图谱" style={{ scrollMarginTop: TABBAR_TOP }} className="mb-4">
          <div style={{ ...CARD_STYLE, padding: 0 }}>
            <div style={SECTION_TITLE}>
              <span style={{ width: 4, height: 16, background: '#7C3AED', borderRadius: 2 }}></span>
              企业图谱
            </div>
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {GRAPH_ITEMS.map((g, i) => (
                <div key={i} style={{
                  padding: '24px 16px', borderRadius: 12, border: '1px dashed #CBD5E1',
                  background: '#F8FAFC', textAlign: 'center', cursor: 'pointer',
                  transition: 'all .2s',
                }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{g.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{g.title}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>{g.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '0 24px 24px', fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>
              点击卡片查看对应图谱详情
            </div>
          </div>
        </section>
      </div>

      {modalKey === 'qixin' && <QixinScoreModal onClose={() => setModalKey(null)} />}
      {modalKey === 'shell' && <ShellCompanyModal onClose={() => setModalKey(null)} />}
      {modalKey === 'kechuang' && <KechuangScoreModal onClose={() => setModalKey(null)} />}
      {modalKey === 'contract' && <ContractDefaultModal onClose={() => setModalKey(null)} />}
      {modalKey === 'judicial' && <JudicialRiskModal onClose={() => setModalKey(null)} />}
      {modalKey === 'comprehensive' && <ComprehensiveModal onClose={() => setModalKey(null)} />}
    </EpPage>
  )
}
