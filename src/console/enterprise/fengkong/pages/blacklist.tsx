// 风控中心 · 黑名单（fk-blacklist）· 1:1 复刻「黑名单」
// 数据：本地样例 fkBlacklist.json（橘 Sam）
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EpPage, EpCard, EpTag, EpBtn, EpDrawer, DataTable, useSample, Sam } from '../../epCommon'
import type { Row, Column } from '../../../../components/ui'
import seedJson from '../../../fkBlacklist.json'

const OUTER_SOURCES: { lv1: string; lv2: string; desc: string; src: string }[] = [
  { lv1: '重点行业黑名单', lv2: '交通运输黑名单', desc: '由各地交通运输部门认定的行业信用主体黑名单。', src: '各地交通运输部门' },
  { lv1: '重点行业黑名单', lv2: '金融黑名单', desc: '国家发改委、地方金融管理局发布的金融领域信用主体黑名单。', src: '国家发改委、地方金融管理局' },
  { lv1: '重点行业黑名单', lv2: '食品药品黑名单', desc: '各地食品药品监管部门发布的食品药品质量、广告等信用主体黑名单。', src: '各地食品药品监督管理部门、医疗保障局等' },
  { lv1: '重点行业黑名单', lv2: '文体旅游黑名单', desc: '各地文旅部门发布公示的文体旅游行业信用主体黑名单。', src: '各地文旅局' },
  { lv1: '重点行业黑名单', lv2: '房地产黑名单', desc: '各地住建局发布的房地产开发企业和中介机构黑名单。', src: '各地住建局' },
  { lv1: '重点行业黑名单', lv2: '工程建设黑名单', desc: '各地住建局发布的工程建设领域的信用主体黑名单。', src: '各地住建局' },
  { lv1: '重点行业黑名单', lv2: '科研教育黑名单', desc: '各地教育部门发布的培训机构黑名单。', src: '各地教育局' },
  { lv1: '重点行业黑名单', lv2: '电子商务黑名单', desc: '各地人民政府发布的电子商务领域信用主体黑名单。', src: '各地人民政府' },
  { lv1: '重点行业黑名单', lv2: '流通黑名单', desc: '地方信用发布的流通领域信用主体黑名单。', src: '地方信用' },
  { lv1: '重点行业黑名单', lv2: '供热行业黑名单', desc: '北京市政管理部门发布的供热行业信用主体黑名单。', src: '北京市政管理部门' },
  { lv1: '采购黑名单', lv2: '政府合作黑名单', desc: '依据《关于报送政府采购严重违法失信行为信息记录的通知》（财办库[2014]526号）发布公示的存在政府采购领域违法失信行为的信用主体名单；各地财政厅/人民政府发布的政府供应商不良行为信用主体黑名单、企业失信黑名单；各地财政厅依据《中华人民共和国政府采购法》等相关规定发布公示的存在政府采购失信的信用主体名单。', src: '中国政府采购网、各地财政厅、各地人民政府等' },
  { lv1: '采购黑名单', lv2: '军队采购黑名单', desc: '根据军队供应商管理相关规定发布公示的军队采购信用主体黑名单。', src: '军队采购网' },
  { lv1: '采购黑名单', lv2: '合作不良行为黑名单', desc: '国企、央企、名企发布的供应商合作不良行为信用主体黑名单。', src: '国企、央企、名企官网' },
  { lv1: '信用惩戒', lv2: '联合惩戒黑名单', desc: '市场监管局发布的联合惩戒信用主体黑名单。', src: '各地市场监管局' },
  { lv1: '信用惩戒', lv2: '失信行为黑名单', desc: '根据中共中央办公厅、国务院办公厅印发的《关于推进社会信用体系建设高质量发展促进形成新发展格局的意见》，发布公示的存在"屡禁不止、屡罚不改"等反复失信行为的市场主体名单；信用中国发布的企业失信行为主体信用黑名单。', src: '信用中国' },
  { lv1: '信用惩戒', lv2: '假冒国企黑名单', desc: '国务院国资委或国企央企官网发布的非国有企业通过伪造材料、虚假宣传、非法挂靠等手段，将自己伪装成国有企业或与国有企业存在隶属、关联关系的主体名单。', src: '国务院国资委、国/央企官网' },
  { lv1: '信用惩戒', lv2: '海关黑名单', desc: '海关总署发布的海关进出口信用主体黑名单。', src: '海关总署' },
  { lv1: '信用惩戒', lv2: '劳动保障黑名单', desc: '各地人社局发布的劳动保障领域违法信用主体名单。', src: '各地人力资源和社会保障局' },
  { lv1: '信用惩戒', lv2: '安全生产黑名单', desc: '依据《安全生产严重失信主体名单管理办法》发布公示的安全生产严重失信主体名单。', src: '中华人民共和国应急管理部' },
  { lv1: '信用惩戒', lv2: '环保黑名单', desc: '由生态环境部依法认定并予以公示的环保领域企业黑名单。', src: '信用中国、各地环保部门' },
  { lv1: '信用惩戒', lv2: '消费黑名单', desc: '市场监管局发布的产品、广告消费领域信用主体黑名单。', src: '各地市场监管局' },
  { lv1: '信用惩戒', lv2: '税务黑名单', desc: '税务局发布的税收违法信用主体黑名单。', src: '各地税务局' },
  { lv1: '信用惩戒', lv2: '维保黑名单', desc: '市场监管局发布的电梯维护保养主体黑名单。', src: '各地市场监管局' },
  { lv1: '信用惩戒', lv2: '社会组织黑名单', desc: '依据《社会组织信用信息管理办法》发布公示的列入活动异常或者严重违法失信名录的社会组织名单；各地民政局发布的假冒中华全国供销合作总社名义，进行宣传和开展活动的社会组织黑名单。', src: '中国社会组织政务服务平台、各地民政局等' },
  { lv1: '其他黑名单', lv2: '其他黑名单', desc: '无明确属性的其他类型黑名单数据。', src: '—' },
  { lv1: '境外制裁', lv2: 'UFLPA实体列表、BIS实体清单、BIS未经核实清单、世界银行不合格公司和个人名单、亚洲投资发展银行制裁清单、欧盟制裁名单、美国（OFAC）经济制裁SDN名单、联合国安全理事会综合名单、英国金融犯罪制裁名单', desc: '被境外国家或机构纳入出口管制风险企业清单，包括美国出口管制清单UFLPA实体列表、美国BIS出口管制实体清单、美国BIS出口管制未经核实清单、美国（OFAC）经济制裁SDN名单、世界银行不合格公司和个人名单、亚洲投资发展银行制裁清单、欧盟制裁名单、联合国安全理事会综合名单、英国金融犯罪制裁名单等。', src: '境外制裁机构' },
  { lv1: '境外制裁', lv2: 'FATF黑灰名单', desc: '由国际组织金融行动特别工作组（FATF）评估的洗钱、恐怖融资和扩散融资的高风险地区或国家。', src: 'FATF' },
]

const TYPE_COLOR: Record<string, { c: string; b: string }> = {
  合作不良行为: { c: '#B91C1C', b: '#FEE2E2' },
  政府合作: { c: '#C2410C', b: '#FFEDD5' },
  假冒国企: { c: '#9333EA', b: '#F3E8FF' },
  交通运输: { c: '#1D4ED8', b: '#EFF6FF' },
}

// 基本筛选项的可选项（保持与现有筛选一致的样式）
const BASIC_OPTS: Record<string, string[]> = {
  所在行业: ['不限', '批发和零售业', '建筑业', '科学研究和技术服务业', '制造业', '信息传输、软件和信息技术服务业'],
  选择地区: ['不限', '华北地区', '华东地区', '华南地区', '西南地区', '其他地区'],
  成立时间: ['不限', '近1年', '近3年', '近5年', '5年以上'],
  注册资本: ['不限', '0-100万', '100-1000万', '1000万-1亿', '1亿以上'],
}

export default function FkBlacklist({ params }: { params: URLSearchParams }) {
  const [data] = useSample('fkBlacklist.json', seedJson)
  const nav = useNavigate()
  const [time, setTime] = useState('近1个月')
  const [blType, setBlType] = useState('重点行业黑名单')
  const [kw, setKw] = useState('')
  const [sourceOpen, setSourceOpen] = useState(false)

  const rows = data.rows

  const columns: Column[] = [
    { key: 'name', label: '企业名称', width: 240, render: (r: Row) => (
      <span style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => nav(`/console/dm/ent-archive-basic?name=${encodeURIComponent(String(r.name))}`)}>
        {String(r.name)}
      </span>
    ) },
    { key: 'type', label: '黑名单类型', width: 120, render: (r: Row) => {
      const t = String(r.type); const m = TYPE_COLOR[t] ?? { c: '#475569', b: '#F1F5F9' }
      return <EpTag color={m.c} bg={m.b}>{t}</EpTag>
    } },
    { key: 'listName', label: '名单名称', width: 200 },
    { key: 'industry', label: '企业行业', width: 200 },
    { key: 'department', label: '认定部门', width: 180 },
    { key: 'level', label: '认定层级', width: 90 },
    { key: 'includeDate', label: '列入日期', width: 120 },
    { key: 'result', label: '处理结果', width: 160 },
    { key: 'source', label: '数据来源', width: 160 },
    { key: 'status', label: '状态', width: 90, render: (r: Row) => <EpTag color="#0F766E" bg="#CCFBF1">{String(r.status)}</EpTag> },
  ]

  return (
    <EpPage
      title="黑名单"
      desc="外部黑名单数据检索与排查"
      actions={<Sam value="fkBlacklist.json" />}
    >
      <EpCard pad={false}>
        {/* 标签 + 操作（与列表同一区域，不分离） */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'nowrap', padding: '12px 18px', borderBottom: '1px solid #F1F5F9' }}>
          <StatTag label="黑名单" value={data.stats.blacklist} />
          <StatTag label="历史黑名单" value={String(data.stats.history)} />
          <div style={{ flex: 1 }} />
          <EpBtn variant="default" size="sm" onClick={() => nav('/console/ep/batch-due')}>批量排查黑名单</EpBtn>
          <EpBtn variant="primary" size="sm">导出列表</EpBtn>
        </div>

        {/* 筛选条件 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '12px 18px', fontSize: 13 }}>
          <label style={fld}>时间
            <select value={time} onChange={(e) => setTime(e.target.value)} style={sel}>
              {data.filters.time.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label style={fld}>黑名单类型
            <select value={blType} onChange={(e) => setBlType(e.target.value)} style={sel}>
              {data.filters.blacklistType.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="企业名称 / 名单名称" style={{ ...sel, width: 220 }} />
          <span style={{ color: '#94A3B8', fontSize: 13, marginLeft: 4, marginRight: 2 }}>基本筛选</span>
          {data.filters.basic.map((b) => (
            <label key={b} style={fld}>
              {b}
              <select style={sel}>
                {BASIC_OPTS[b]?.map((o) => <option key={o}>{o}</option>) ?? <option>不限</option>}
              </select>
            </label>
          ))}
          <EpBtn variant="primary" size="sm">查询</EpBtn>
          <EpBtn variant="default" size="sm">重置</EpBtn>
          <span style={{ flex: 1 }} />
          <span style={{ color: '#2563EB', cursor: 'pointer', fontSize: 13 }} onClick={() => setSourceOpen(true)}>外部黑名单来源说明</span>
        </div>

        {/* 列表 */}
        <div style={{ padding: '0 18px 18px' }}>
          <DataTable columns={columns} rows={rows as unknown as Row[]} pager defaultPageSize={10} exportable exportName="黑名单" empty="暂无数据" />
        </div>
      </EpCard>

      {/* 外部黑名单来源说明弹窗 */}
      <EpDrawer open={sourceOpen} onClose={() => setSourceOpen(false)} title="外部黑名单来源说明" width={820}>
        <DataTable
          columns={[
            { key: 'lv1', label: '黑名单一级分类', width: 130 },
            { key: 'lv2', label: '黑名单二级分类', width: 240 },
            { key: 'desc', label: '来源说明', width: 380 },
            { key: 'src', label: '数据来源', width: 180 },
          ]}
          rows={OUTER_SOURCES as unknown as Row[]}
          pager
          defaultPageSize={10}
          exportable
          exportName="外部黑名单来源说明"
          empty="暂无数据"
        />
      </EpDrawer>
    </EpPage>
  )
}

function StatTag({ label, value }: { label: string; value: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: '#F1F5F9', fontSize: 13 }}>
      <b style={{ color: '#0F172A' }}>{value}</b>
      <span style={{ color: '#64748B' }}>{label}</span>
    </span>
  )
}

const fld: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, color: '#475569' }
const sel: React.CSSProperties = { padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff' }
