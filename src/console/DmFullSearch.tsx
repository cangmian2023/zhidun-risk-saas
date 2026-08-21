import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from './PageShell'
import {
  SEARCH_KEYWORD, STATS, ENTERPRISES,
  PERSON_RESULTS, PERSON_SEARCH_KEYWORD, PERSON_STATS_TOTAL,
  BIZ_RESULTS, BIZ_STATS_TOTAL, BIZ_KEYWORD_PLACEHOLDER,
  RISK_RESULTS, RISK_STATS_TOTAL, RISK_KEYWORD_PLACEHOLDER,
  PUBLIC_RESULTS, PUBLIC_STATS_TOTAL, PUBLIC_KEYWORD_PLACEHOLDER,
  PUBLIC_TIME_TAGS, PUBLIC_CATEGORY_OPTIONS, PUBLIC_SENTIMENT_OPTIONS, PUBLIC_TOPIC_OPTIONS, PUBLIC_AUTHORITY_OPTIONS,
  type PublicOpinion, type PubSentiment,
  REPORT_RESULTS, REPORT_STATS_TOTAL, REPORT_KEYWORD_PLACEHOLDER,
  REPORT_TIME_TAGS, REPORT_TYPE_OPTIONS, REPORT_CATEGORY_OPTIONS, REPORT_FEATURE_OPTIONS, REPORT_PAGE_OPTIONS, REPORT_ORG_OPTIONS,
  type ResearchReport,
  type EntCard, type PersonResult, type BizResult, type RiskResult, type RiskEntity, type RiskParty,
} from './DmFullSearchData'

/* ---------- 颜色规范 ---------- */
const C = {
  primary: '#1677ff',
  text: '#333',
  sub: '#666',
  ph: '#999',
  border: '#e8e8e8',
  bg: '#f5f6f8',
  green: '#52c41a',
  greenBg: '#f6ffed',
  red: '#ff4d4f',
  orange: '#fa8c16',
  orangeBg: '#fff7e6',
  yellow: '#ffc53d', // 人员模块主色（查询主按钮、导航激活下划线）
  yellowText: '#5c3d00',
}
const STATUS_COLOR: Record<string, { c: string; bg: string }> = {
  存续: { c: C.green, bg: C.greenBg },
  在业: { c: C.green, bg: C.greenBg },
  迁出: { c: C.orange, bg: C.orangeBg },
  注销: { c: C.red, bg: '#fff1f0' },
  吊销: { c: C.red, bg: '#fff1f0' },
  其他状态: { c: C.ph, bg: '#fafafa' },
}

/* ---------- 路由跳转 ---------- */
function useGo() {
  const nav = useNavigate()
  return {
    ent: (name: string) => nav(`/console/dm/ent-archive-basic?name=${encodeURIComponent(name)}`),
    person: (name: string) => nav(`/console/dm/person-archive-basic?name=${encodeURIComponent(name)}`),
  }
}

/* ---------- 顶部模块导航 ---------- */
const MODULES = [
  { key: 'ent', label: '企业 AI' },
  { key: 'person', label: '人员' },
  { key: 'biz', label: '商机' },
  { key: 'risk', label: '风险' },
  { key: 'public', label: '舆情' },
  { key: 'report', label: '研报' },
]

/* ---------- 左侧筛选面板分组标题 ---------- */
const FILTER_STRUCTURE: { key: string; title: string }[] = [
  { key: 'basic', title: '基础筛选' },
  { key: 'org', title: '组织机构' },
  { key: 'tech', title: '科创筛选' },
  { key: 'capital', title: '资本市场' },
  { key: 'risk', title: '风险信息' },
]

/* 完整筛选项（用于真实渲染） */
const FILTER_OPTIONS: Record<string, { title: string; kind: 'check' | 'radio' | 'input' | 'select'; options?: string[] }[]> = {
  basic: [
    { title: '常用筛选', kind: 'select', options: ['省份地区', '所属行业', '所在园区', '特色区域类型'] },
    { title: '成立年限', kind: 'radio', options: ['3个月内', '半年以内', '1年内', '1年以上', '1-5年', '5-10年', '10年以上', '自定义'] },
    { title: '经营状态', kind: 'check', options: ['存续', '迁出', '注销', '吊销', '其他状态'] },
    { title: '注册资本区间', kind: 'input' },
    { title: '企业规模', kind: 'check', options: ['微型', '小型', '小微', '疑似小微', '中型', '大型', '规模以上企业'] },
    { title: '联系方式', kind: 'check', options: ['手机号', '座机号', '空号过滤', '邮箱地址', '企业地址', '代记账地址', '企业网址'] },
  ],
  org: [
    { title: '机构类型', kind: 'check', options: ['企业', '个体工商户', '机关单位', '事业单位', '医院', '学校', '律所', '会计师事务所', '农村机构', '社会组织', '其他'] },
    { title: '资本背景', kind: 'check', options: ['全选', '国有企业', '民营企业', '港澳台投资', '外商投资', '集体经济组织'] },
    { title: '特色类型', kind: 'check', options: ['乡村振兴', '协会', '金融机构', '外贸企业', '污染型企业', '业务概念', '政府采购代理机构', 'CNAS认证', '养老机构'] },
  ],
  tech: [
    { title: '科技认定', kind: 'select', options: ['请选择认定类型', '高新技术企业', '科技型中小企业', '专精特新'] },
    { title: 'S70企业', kind: 'check', options: ['S70企业'] },
    { title: '科创等级', kind: 'check', options: ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'CC', 'C', '科创分筛选'] },
  ],
  capital: [
    { title: '创投融资', kind: 'check', options: ['有无融资', '融资轮次', '融资特征'] },
    { title: '上市融资', kind: 'radio', options: ['上市进程中', '已上市', '退市企业', '上市公司子公司', '其他'] },
    { title: '债券融资', kind: 'check', options: ['发债企业', '主体评级', '债权融资', '双A及以上发债', '历史发债企业', '存续债券发行'] },
    { title: '政府扶持', kind: 'check', options: ['扶持基金', '产业引导基金', '政府参股穿透'] },
  ],
  risk: [
    { title: '风险类型', kind: 'check', options: ['失信被执行人', '被执行人', '法人被执行', '终本案件', '动产抵押', '限制高消费', '法人限高', '空壳指数', '破产清算', '1年内未结案件', '重大负面信息', '法人变更', '疑似实控人变更', '股权冻结', '欠税额度', '涉诉案件与金额'] },
    { title: '风险特征', kind: 'check', options: ['行政处罚', '环保处罚', '非正常户', '重大税收违法', '欠税信息', '历史欠税信息', '历史行政处罚', '政府采购失信名单', '供应商暂停名单', '严重违法', '票据逾期', '票据持续逾期', '票据信用未披露', '票据延迟披露'] },
  ],
}

const QUICK_TAG_GROUPS = [
  ['AI', '丁磊', '比亚迪', '半导体', '董明珠'],
  ['华为', '腾讯', '新能源', '芯片', '医药'],
  ['小米', '宁德时代', '光伏', '锂电', '机器人'],
]
const TEMPLATE_QUICK = ['新注册企业', '专精特新', '小微企业', '中小微企业', '中标政府采购项目']

/* 不限范围 下拉范围（同时作为检索字段维度） */
const SCOPE_OPTIONS = [
  '企业名称', '企业曾用名', '股东', '法人代表', '高管', '经营范围',
  '联系方式', '网址', '产品', '商标', '专利', '著作权作品名称', '软件著作权名称',
]

/* ---------- 单张企业卡片 ---------- */
function EntCardView({ card, go }: { card: EntCard; go: ReturnType<typeof useGo> }) {
  const [more, setMore] = useState(false)
  const sc = STATUS_COLOR[card.status] || { c: C.ph, bg: '#fafafa' }
  const extra: [string, string][] = [
    ['曾用名', card.former], ['集团名称', card.group], ['简称', card.short],
    ['股东', card.shareholder], ['经营范围', card.scope], ['股票名称', card.stock],
  ].filter(([, v]) => v && v !== '-') as [string, string][]
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 12, transition: 'box-shadow .2s' }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.08)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}>
      {/* 头部：LOGO + 名称 + 状态 + 按钮 */}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <div style={{ width: 40, height: 40, borderRadius: 6, background: '#eef3ff', color: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, marginRight: 12, flexShrink: 0 }}>
          {card.name.slice(0, 1)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span onClick={() => go.ent(card.name)} style={{ color: C.primary, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>{card.name}</span>
            <span style={{ fontSize: 12, color: sc.c, background: sc.bg, border: `1px solid ${sc.c}33`, padding: '1px 6px', borderRadius: 4 }}>{card.status}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {['AI触达', '营销', '监控'].map((b) => (
            <button key={b} style={{ border: `1px solid ${C.border}`, background: '#fff', color: C.sub, borderRadius: 4, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>{b}</button>
          ))}
        </div>
      </div>

      {/* 标签行 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '10px 0' }}>
        <span style={{ fontSize: 12, color: C.primary, background: '#eef3ff', border: `1px solid ${C.primary}33`, padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>启信分 {card.score}</span>
        {card.tags.map((t, i) => (
          <span key={i} style={{ fontSize: 12, color: C.sub, background: '#f5f5f5', border: `1px solid ${C.border}`, padding: '2px 8px', borderRadius: 4 }}>{t}</span>
        ))}
        <span style={{ fontSize: 12, color: C.ph, background: '#fafafa', border: `1px solid ${C.border}`, padding: '2px 8px', borderRadius: 4 }}>全部标签</span>
      </div>

      {/* 基础信息行 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 24px', color: C.text, fontSize: 13, marginBottom: 6 }}>
        <span>法定代表人：<b>{card.legal || '-'}</b></span>
        <span>注册时间：{card.regTime || '-'}</span>
        <span>注册资本：{card.regCap || '-'}</span>
        <span>实缴资本：{card.paidCap || '-'}</span>
      </div>

      {/* 联系信息行 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 24px', color: C.sub, fontSize: 13, marginBottom: 6 }}>
        <span>邮箱地址：{card.email || '-'}</span>
        <span>联系电话：{card.phone || '-'} {card.phone && <a style={{ color: C.primary, cursor: 'pointer' }}>更多</a>}</span>
        <span>最新地址：{card.addr || '-'} {card.addr && <a style={{ color: C.primary, cursor: 'pointer' }}>更多</a>}</span>
      </div>

      {/* 扩展信息行 */}
      {extra.length > 0 && (
        <div style={{ borderTop: `1px dashed ${C.border}`, paddingTop: 8, marginTop: 4 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 24px', fontSize: 12, color: C.sub }}>
            {(more ? extra : extra.slice(0, 3)).map(([k, v], i) => (
              <span key={i}>{k}：{v.length > 28 ? v.slice(0, 28) + '…' : v}</span>
            ))}
          </div>
          {extra.length > 3 && (
            <a onClick={() => setMore(!more)} style={{ color: C.primary, fontSize: 12, cursor: 'pointer', display: 'inline-block', marginTop: 4 }}>{more ? '收起' : '更多'}</a>
          )}
        </div>
      )}
    </div>
  )
}

/* ---------- 筛选面板（全宽，置于搜索结果上边；外层由调用方套「一键收起」壳） ---------- */
function FilterPanel({ checked, toggle, expandedGroups, toggleGroup }: any) {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ padding: 0 }}>
        {Object.entries(FILTER_OPTIONS).map(([gkey, sections]) => (
          <div key={gkey} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 8, marginBottom: 8 }}>
            <div onClick={() => toggleGroup(gkey)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 700, color: C.text, fontSize: 14, padding: '4px 0' }}>
              <span>{FILTER_STRUCTURE.find((x) => x.key === gkey)!.title}</span>
              <span style={{ color: C.ph, fontSize: 12 }}>{expandedGroups.has(gkey) ? '收起' : '展开'}</span>
            </div>
            {expandedGroups.has(gkey) && sections.map((sec) => (
              <div key={sec.title} style={{ margin: '8px 0' }}>
                <div style={{ fontSize: 13, color: C.sub, marginBottom: 6, fontWeight: 600 }}>{sec.title}</div>
                {sec.kind === 'select' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {sec.options!.map((o) => (
                      <span key={o} style={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 4, padding: '3px 8px', color: C.ph, background: '#fafafa', cursor: 'pointer' }}>{o}</span>
                    ))}
                  </div>
                )}
                {sec.kind === 'radio' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px' }}>
                    {sec.options!.map((o) => (
                      <label key={o} style={{ fontSize: 13, color: C.text, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                        <input type="radio" name={gkey + sec.title} style={{ accentColor: C.primary }} />{o}
                      </label>
                    ))}
                  </div>
                )}
                {sec.kind === 'check' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px' }}>
                    {sec.options!.map((o) => (
                      <label key={o} style={{ fontSize: 13, color: C.text, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }} onClick={() => toggle(o)}>
                        <input type="checkbox" checked={!!checked[o]} style={{ accentColor: C.primary }} readOnly />{o}
                      </label>
                    ))}
                  </div>
                )}
                {sec.kind === 'input' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.sub }}>
                    <input placeholder="最低金额" style={{ width: 80, border: `1px solid ${C.border}`, borderRadius: 4, padding: '3px 6px' }} />
                    <span>—</span>
                    <input placeholder="最高金额" style={{ width: 80, border: `1px solid ${C.border}`, borderRadius: 4, padding: '3px 6px' }} />
                    <select style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '3px 6px' }}><option>万亿</option></select>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- 人员检索结果卡片 ---------- */
function PersonCardView({ p, primary, go }: { p: PersonResult; primary: boolean; go: ReturnType<typeof useGo> }) {
  const surname = p.name.slice(0, 1)
  const rows: [string, string[], 'person' | 'company'][] = [
    ['合作伙伴', p.partners, 'person'],
    ['担任法定代表人的企业', p.legal, 'company'],
    ['担任股东的企业', p.shareholder, 'company'],
    ['担任高管的企业', p.exec, 'company'],
  ]
  return (
    <div
      style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 12, display: 'flex', gap: 16, alignItems: 'flex-start', transition: 'background .15s' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#fafcff')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}>
      {/* 头像 / 姓氏占位：样式A=圆形(置顶优先) 样式B=方形 */}
      {primary
        ? <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#eef3ff', color: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, flexShrink: 0 }}>{surname}</div>
        : <div style={{ width: 48, height: 48, borderRadius: 6, background: '#f0f4ff', color: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, flexShrink: 0 }}>{surname}</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* 姓名（加粗，可点→人员档案） */}
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, cursor: 'pointer', marginBottom: 8 }} onClick={() => go.person(p.name)}>{p.name}</div>
        {/* 关系行：前缀(#666) + 可点链接(#1677ff)，超长单行省略+hover title */}
        {rows.filter((r) => r[1].length > 0).map(([label, names, type], ri) => (
          <div key={ri} style={{ fontSize: 13, color: C.sub, marginBottom: 5, display: 'flex', gap: 6, alignItems: 'baseline' }}>
            <span style={{ color: C.sub, flexShrink: 0 }}>{label}：</span>
            <span style={{ color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={names.join('、')}>
              {names.map((n, ni) => (
                <span key={ni}>
                  <span onClick={() => (type === 'person' ? go.person(n) : go.ent(n))} style={{ color: C.primary, cursor: 'pointer' }}>{n}</span>
                  {ni < names.length - 1 ? '、' : ''}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============ 商机模块 · 常量与组件 ============ */
interface BizFilterDef {
  key: string
  label: string
  type: 'list' | 'range' | 'date' | 'yn'
  options?: string[]
  unit?: string
}
/* 22 个横向筛选项（需求文档原样） */
const BIZ_FILTERS: BizFilterDef[] = [
  { key: 'biz', label: '选择商机', type: 'list', options: ['新成立公司', '备案核投资项目-进程', '新增中标', '新增供应商/项目'] },
  { key: 'date', label: '发生日期', type: 'date' },
  { key: 'value', label: '商机价值', type: 'range', unit: '万元' },
  { key: 'opp', label: '业务机会', type: 'list', options: ['存款', '授信', '代发工资', '票据贴现', '供应链金融'] },
  { key: 'bizType', label: '商机类型', type: 'list', options: ['新成立公司', '备案核投资项目-进程', '新增中标', '新增供应商/项目'] },
  { key: 'province', label: '省份地区', type: 'list', options: ['广东', '江苏', '浙江', '北京', '上海', '山东', '四川', '湖北', '福建', '湖南', '河南', '安徽'] },
  { key: 'industry', label: '所在行业', type: 'list', options: ['制造业', '软件和信息技术服务业', '批发和零售业', '建筑业', '科学研究和技术服务业', '金融业', '租赁和商务服务业', '交通运输、仓储和邮政业'] },
  { key: 'bg', label: '企业背景', type: 'list', options: ['国有企业', '民营企业', '港澳台投资', '外商投资'] },
  { key: 'orgType', label: '企业类型', type: 'list', options: ['有限责任公司', '股份有限公司', '个体工商户', '其他'] },
  { key: 'otherOrg', label: '其他组织', type: 'list', options: ['事业单位', '机关单位', '社会组织', '医院', '学校'] },
  { key: 'qualify', label: '资质标签', type: 'list', options: ['高新技术企业', '专精特新企业', '科技型中小企业', '规模以上企业'] },
  { key: 'listed', label: '上市信息', type: 'list', options: ['已上市', '上市进程中', '未上市'] },
  { key: 'scale', label: '企业规模', type: 'list', options: ['微型', '小型', '中型', '大型'] },
  { key: 'insured', label: '参保人数', type: 'range', unit: '人' },
  { key: 'regCap', label: '注册资本', type: 'range', unit: '万元' },
  { key: 'estab', label: '成立时间', type: 'date' },
  { key: 'score', label: '启信分', type: 'range', unit: '分' },
  { key: 'dishonest', label: '失信被执行人', type: 'yn' },
  { key: 'executed', label: '被执行人', type: 'yn' },
  { key: 'ended', label: '终本案件', type: 'yn' },
  { key: 'pledge', label: '动产抵押', type: 'yn' },
  { key: 'limit', label: '限制高消费', type: 'yn' },
]
const BIZ_FILTER_COLLAPSED_COUNT = 8 // 收起时默认展示的筛选项个数

/* 星级评分：实心黄色五角星 + 空心灰色五角星 */
function Stars({ n }: { n: number }) {
  return (
    <span style={{ fontSize: 13, letterSpacing: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= n ? C.yellow : '#ccc' }}>{i <= n ? '★' : '☆'}</span>
      ))}
    </span>
  )
}

/* 筛选面板：点击筛选项后在筛选栏下方展开的通栏面板 */
function BizFilterPanel({ filter, cond, onApply, onReset, onClose }: {
  filter: BizFilterDef
  cond: any
  onApply: (k: string, v: any) => void
  onReset: (k: string) => void
  onClose: () => void
}) {
  const [sel, setSel] = useState<any>(cond ?? (filter.type === 'list' ? [] : filter.type === 'yn' ? '' : {}))
  const apply = () => onApply(filter.key, sel)
  return (
    <div style={{ marginTop: 10, border: `1px solid ${C.border}`, borderTop: `2px solid ${C.primary}`, borderRadius: 6, background: '#fafbfc', padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{filter.label}</span>
        <span style={{ fontSize: 12, color: C.ph }}>配置筛选条件</span>
      </div>
      <div style={{ minHeight: 40 }}>
        {filter.type === 'list' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
            {filter.options!.map((o) => (
              <label key={o} style={{ fontSize: 13, color: C.text, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input type="checkbox" checked={(sel as string[]).includes(o)} onChange={(e) => setSel(e.target.checked ? [...sel, o] : (sel as string[]).filter((x) => x !== o))} style={{ accentColor: C.primary }} />{o}
              </label>
            ))}
          </div>
        )}
        {filter.type === 'range' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.sub }}>
            <input type="number" placeholder="最小值" value={sel.min ?? ''} onChange={(e) => setSel({ ...sel, min: e.target.value })} style={{ width: 120, border: `1px solid ${C.border}`, borderRadius: 4, padding: '5px 8px' }} />
            <span>—</span>
            <input type="number" placeholder="最大值" value={sel.max ?? ''} onChange={(e) => setSel({ ...sel, max: e.target.value })} style={{ width: 120, border: `1px solid ${C.border}`, borderRadius: 4, padding: '5px 8px' }} />
            <span>{filter.unit}</span>
          </div>
        )}
        {filter.type === 'date' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.sub }}>
            <input type="date" value={sel.from ?? ''} onChange={(e) => setSel({ ...sel, from: e.target.value })} style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '5px 8px' }} />
            <span>—</span>
            <input type="date" value={sel.to ?? ''} onChange={(e) => setSel({ ...sel, to: e.target.value })} style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '5px 8px' }} />
          </div>
        )}
        {filter.type === 'yn' && (
          <div style={{ display: 'flex', gap: 20 }}>
            {['是', '否'].map((o) => (
              <label key={o} style={{ fontSize: 13, color: C.text, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input type="radio" name={'yn-' + filter.key} checked={sel === o} onChange={() => setSel(o)} style={{ accentColor: C.primary }} />{o}
              </label>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={apply} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', cursor: 'pointer', fontSize: 13 }}>确定</button>
        <button onClick={() => { onReset(filter.key); onClose() }} style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.sub, borderRadius: 4, padding: '6px 18px', cursor: 'pointer', fontSize: 13 }}>重置</button>
        <button onClick={onClose} style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.sub, borderRadius: 4, padding: '6px 18px', cursor: 'pointer', fontSize: 13 }}>取消</button>
      </div>
    </div>
  )
}

/* 单条商机卡片：复选 + 企业名(可点) + 主体类型 + 标签 + 星级 + 绿色类型标签 + 详情文本 */
function BizCardView({ b, checked, onToggle, go }: { b: BizResult; checked: boolean; onToggle: () => void; go: ReturnType<typeof useGo> }) {
  return (
    <div style={{ display: 'flex', gap: 10, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: '14px 16px', marginBottom: 10, transition: 'box-shadow .15s, border-color .15s' }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,.07)'; e.currentTarget.style.borderColor = C.primary + '66' }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = C.border }}>
      <input type="checkbox" checked={checked} onChange={onToggle} style={{ marginTop: 4, accentColor: C.primary }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px 10px', marginBottom: 6 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.primary, cursor: 'pointer' }} onClick={() => go.ent(b.name)}>{b.name}</span>
          <span style={{ fontSize: 12, color: C.sub }}>（{b.orgType}）</span>
          {b.tags.map((t) => (
            <span key={t} style={{ fontSize: 12, color: '#8a5a00', background: '#fff7e6', border: '1px solid #ffd591', padding: '1px 8px', borderRadius: 4 }}>{t}</span>
          ))}
          <Stars n={b.stars} />
          <span style={{ fontSize: 12, color: '#fff', background: C.green, padding: '2px 10px', borderRadius: 4, fontWeight: 600 }}>{b.bizType}</span>
        </div>
        <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7, wordBreak: 'break-all' }} title={b.desc}>{b.desc}</div>
      </div>
    </div>
  )
}

/* 导出商机 CSV（勾选/全部） */
function exportBizRows(rows: BizResult[]) {
  if (rows.length === 0) return
  const head = '企业名称,主体类型,标签,星级,商机类型,发生日期,商机描述'
  const body = rows.map((r) => [r.name, r.orgType, r.tags.join('/'), r.stars, r.bizType, r.date, r.desc.replace(/[",\n]/g, ' ')].map((v) => `"${v}"`).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + head + '\n' + body], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '全维搜索-商机导出.csv'
  a.click()
  URL.revokeObjectURL(url)
}

/* ============ 风险模块 · 常量与组件 ============ */
const RISK_TIME_TAGS = [
  { key: 'today', label: '今日' },
  { key: 'yesterday', label: '昨日' },
  { key: '7d', label: '最近7天' },
  { key: '30d', label: '最近30天' },
]
const RISK_PROVINCES = ['广东', '江苏', '浙江', '北京', '上海', '山东', '四川', '湖北', '福建', '湖南']
const RISK_TYPE_OPTIONS = ['司法公告', '欠税公告', '开庭公告']
const RISK_EXPORT_FIELDS = ['风险类型', '标题/案号', '发布日期', '公告法院', '公告类型', '案由', '当事人', '欠税类型', '欠税余额', '新发生欠税额', '相关企业/人员']

/* 关键词高亮：命中部分标红加粗 */
function Highlight({ text, kw }: { text: string; kw: string }) {
  if (!kw || !text) return <>{text}</>
  const idx = text.toLowerCase().indexOf(kw.toLowerCase())
  if (idx < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ color: '#f53f3f', fontWeight: 700 }}>{text.slice(idx, idx + kw.length)}</span>
      {text.slice(idx + kw.length)}
    </>
  )
}

/* 风险主体链接：企业→企业档案，自然人→人员档案 */
function RiskLink({ name, kind, go }: { name: string; kind: 'ent' | 'person'; go: ReturnType<typeof useGo> }) {
  return <a style={{ color: C.primary, cursor: 'pointer', marginRight: 8 }} onClick={() => (kind === 'ent' ? go.ent(name) : go.person(name))}>{name}</a>
}

/* 风险字段行：标签 #666 + 值 #333（空值占位 - #999） */
function RiskField({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <span style={{ fontSize: 13, color: C.text, marginRight: 22, whiteSpace: 'normal' }}>
      <span style={{ color: C.sub }}>{label}：</span>
      {children ?? <span style={{ color: C.ph }}>-</span>}
    </span>
  )
}

/* 风险条目多模板动态渲染：judicial / tax / court / other 兜底 */
function RiskCard({ r, kw, checked, onToggle, go }: { r: RiskResult; kw: string; checked: boolean; onToggle: () => void; go: ReturnType<typeof useGo> }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '13px 16px', background: '#fff', borderBottom: `1px solid ${C.border}`, transition: 'background .15s' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#fafcff')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}>
      <input type="checkbox" checked={checked} onChange={onToggle} style={{ marginTop: 4, accentColor: C.primary }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {r.type === 'judicial' && (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6, wordBreak: 'break-all' }} title={r.title}>
              <Highlight text={r.title || ''} kw={kw} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 0', marginBottom: 4 }}>
              <RiskField label="发布日期">{r.date}</RiskField>
              <RiskField label="公告法院">{r.court}</RiskField>
              <RiskField label="公告类型">{r.noticeType}</RiskField>
            </div>
            {r.entities && r.entities.length > 0 && (
              <div style={{ fontSize: 13, color: C.text }}>
                <span style={{ color: C.sub }}>相关企业/人员：</span>
                {r.entities.map((e, i) => <RiskLink key={i} name={e.name} kind={e.kind} go={go} />)}
              </div>
            )}
          </>
        )}
        {r.type === 'tax' && (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6, wordBreak: 'break-all' }} title={r.title}>
              <Highlight text={r.title || ''} kw={kw} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 0', marginBottom: 4 }}>
              <RiskField label="欠税类型">{r.taxType}</RiskField>
              <RiskField label="欠税余额">{r.balance ? r.balance + ' 元' : undefined}</RiskField>
              <RiskField label="当前新发生的欠税额">{r.newTax && r.newTax !== '-' ? r.newTax + ' 元' : '-'}</RiskField>
              <RiskField label="发布日期">{r.date}</RiskField>
            </div>
          </>
        )}
        {r.type === 'court' && (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6, wordBreak: 'break-all' }} title={r.caseNo}>
              <Highlight text={r.caseNo || ''} kw={kw} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 0', marginBottom: 4 }}>
              <RiskField label="开庭日期">{r.date}</RiskField>
              <RiskField label="案由"><Highlight text={r.cause || ''} kw={kw} /></RiskField>
            </div>
            {r.parties && r.parties.length > 0 && (
              <div style={{ fontSize: 13, color: C.text, display: 'flex', flexWrap: 'wrap', gap: '2px 18px' }}>
                {r.parties.map((p, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'baseline' }}>
                    <span style={{ color: C.sub, marginRight: 4 }}>{p.role}：</span>
                    <RiskLink name={p.name} kind={p.kind} go={go} />
                  </span>
                ))}
              </div>
            )}
          </>
        )}
        {r.type === 'other' && (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6, wordBreak: 'break-all' }} title={r.title}>
              <Highlight text={r.title || '未知风险类型条目'} kw={kw} />
            </div>
            <div style={{ fontSize: 13, color: C.text, wordBreak: 'break-all' }} title={r.desc}>
              {r.desc ?? '该风险源暂不支持结构化展示，点击查看详情。'}
            </div>
            <RiskField label="发布日期">{r.date}</RiskField>
          </>
        )}
      </div>
    </div>
  )
}

/* 导出风险数据：按字段勾选与格式生成文件 */
function exportRiskRows(rows: RiskResult[], fields: Record<string, boolean>, format: 'csv' | 'json') {
  if (rows.length === 0) return
  const pick = (r: RiskResult): Record<string, string> => ({
    '风险类型': r.typeLabel,
    '标题/案号': r.caseNo || r.title || '',
    '发布日期': r.date,
    '公告法院': r.court || '-',
    '公告类型': r.noticeType || '-',
    '案由': r.cause || '-',
    '当事人': (r.parties || []).map((p) => `${p.role}:${p.name}`).join('；') || '-',
    '欠税类型': r.taxType || '-',
    '欠税余额': r.balance || '-',
    '新发生欠税额': r.newTax || '-',
    '相关企业/人员': (r.entities || []).map((e) => e.name).join('、') || '-',
  })
  if (format === 'json') {
    const data = rows.map((r) => Object.fromEntries(Object.entries(pick(r)).filter(([k]) => fields[k])))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '全维搜索-风险导出.json'
    a.click()
    URL.revokeObjectURL(url)
    return
  }
  const cols = RISK_EXPORT_FIELDS.filter((f) => fields[f])
  const head = cols.join(',')
  const body = rows.map((r) => cols.map((c) => `"${(pick(r)[c] || '').replace(/[",\n]/g, ' ')}"`).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + head + '\n' + body], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '全维搜索-风险导出.csv'
  a.click()
  URL.revokeObjectURL(url)
}

/* ---------- 关键词高亮（命中红色） ---------- */
function hl(text: string, kw: string): ReactNode {
  const k = kw.trim()
  if (!k) return text
  const lower = text.toLowerCase(); const kl = k.toLowerCase()
  const idx = lower.indexOf(kl)
  if (idx === -1) return text
  return (<>
    {text.slice(0, idx)}
    <span style={{ color: C.red }}>{text.slice(idx, idx + k.length)}</span>
    {text.slice(idx + k.length)}
  </>)
}

/* ---------- 多选筛选下拉（舆情/研报通用） ---------- */
function MultiFilterDropdown({ label, options, value, onChange, accent }: { label: string; options: string[]; value: string[]; onChange: (n: string[]) => void; accent: string }) {
  const [open, setOpen] = useState(false)
  const toggle = (o: string) => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o])
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen((o) => !o)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: value.length > 0 ? '#fff7e6' : '#fff', border: `1px solid ${open ? accent : C.border}`, borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontSize: 13, color: C.text }}>
        {label}{value.length > 0 && `（${value.length}）`} ▾
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,.12)', padding: 12, width: 240, zIndex: 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 10px', marginBottom: 10, maxHeight: 240, overflowY: 'auto' }}>
            {options.map((o) => (
              <label key={o} style={{ fontSize: 13, color: C.text, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input type="checkbox" checked={value.includes(o)} onChange={() => toggle(o)} style={{ accentColor: accent }} />{o}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onChange([])} style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.sub, borderRadius: 4, padding: '5px 16px', cursor: 'pointer', fontSize: 13 }}>清空</button>
            <button onClick={() => setOpen(false)} style={{ background: accent, color: '#fff', border: 'none', borderRadius: 4, padding: '5px 16px', cursor: 'pointer', fontSize: 13 }}>确定</button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- 舆情条目卡片 ---------- */
const PUB_SENT_COLOR: Record<PubSentiment, { c: string; bg: string }> = {
  积极: { c: C.green, bg: C.greenBg },
  中立: { c: C.primary, bg: '#eef3ff' },
  消极: { c: C.red, bg: '#fff1f0' },
  未知: { c: C.ph, bg: '#fafafa' },
}
function PubCard({ item, kw }: { item: PublicOpinion; kw: string }) {
  const sc = PUB_SENT_COLOR[item.sentiment]
  return (
    <div style={{ background: '#fafbfc', border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 16px', marginBottom: 12, transition: 'background .2s' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f3f7')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '#fafbfc')}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: C.text, fontWeight: 700, fontSize: 15, cursor: 'pointer' }} title={item.title}>{hl(item.title, kw)}</span>
            <span style={{ fontSize: 12, color: sc.c, background: sc.bg, border: `1px solid ${sc.c}33`, padding: '1px 8px', borderRadius: 4, flexShrink: 0 }}>{item.sentiment}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '8px 0' }}>
            <span style={{ fontSize: 12, color: C.green, background: C.greenBg, border: `1px solid ${C.green}33`, padding: '2px 8px', borderRadius: 4 }}>{item.category}</span>
            <span style={{ fontSize: 12, color: C.primary, background: '#eef3ff', border: `1px solid ${C.primary}33`, padding: '2px 8px', borderRadius: 4 }}>{item.authority}</span>
            {item.topics.map((t) => (
              <span key={t} style={{ fontSize: 12, color: C.sub, background: '#f5f5f5', border: `1px solid ${C.border}`, padding: '2px 8px', borderRadius: 4, cursor: 'pointer' }}>#{t}</span>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 13, color: C.ph, flexShrink: 0, paddingTop: 2, whiteSpace: 'nowrap' }}>{item.date.slice(5)}</div>
      </div>
    </div>
  )
}

/* ---------- 研报条目卡片 ---------- */
function ReportCard({ item, kw }: { item: ResearchReport; kw: string }) {
  const [dl, setDl] = useState(false)
  return (
    <div style={{ background: '#fff', borderBottom: `1px solid ${C.border}`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 16, transition: 'background .2s' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {item.isNew && <span style={{ fontSize: 12, color: C.green, background: C.greenBg, border: `1px solid ${C.green}33`, padding: '1px 6px', borderRadius: 4, flexShrink: 0 }}>新</span>}
          <span style={{ color: C.text, fontWeight: 700, fontSize: 15, cursor: 'pointer' }} title={item.title}>{hl(item.title, kw)}</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 8, fontSize: 13, color: C.sub }}>
          <span style={{ color: C.orange, background: C.orangeBg, border: `1px solid ${C.orange}33`, padding: '1px 8px', borderRadius: 4 }}>{item.category}</span>
          <span style={{ color: C.primary, background: '#eef3ff', border: `1px solid ${C.primary}33`, padding: '1px 8px', borderRadius: 4 }}>{item.reportType}</span>
          <span>{item.date}</span>
          <span>{item.org}</span>
          <span>共{item.pages}页</span>
        </div>
      </div>
      <button onClick={() => { setDl(true); window.setTimeout(() => setDl(false), 1200) }}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0, border: `1px solid ${C.border}`, background: '#fff', color: C.sub, borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}>
        {dl ? '下载中…' : `⬇ ${item.size || ''}`.trim()}
      </button>
    </div>
  )
}

/* ---------- 主组件 ---------- */
export default function DmFullSearch() {
  const go = useGo()
  const [activeModule, setActiveModule] = useState('ent')
  const [keyword, setKeyword] = useState(SEARCH_KEYWORD)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['basic', 'org', 'tech', 'capital', 'risk']))
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [sortBy, setSortBy] = useState('default')
  const [page, setPage] = useState(1)
  const [quickIdx, setQuickIdx] = useState(0)
  const [showTop, setShowTop] = useState(false)
  const [scope, setScope] = useState('')
  // 企业 AI 筛选区：一键全部展开/收起
  const [filterPanelOpen, setFilterPanelOpen] = useState(true)
  // 商机模块状态
  const [bizKeyword, setBizKeyword] = useState('')
  const [bizSearchPanel, setBizSearchPanel] = useState<'batch' | 'advanced' | null>(null)
  const [bizFiltersOpen, setBizFiltersOpen] = useState(false)
  const [activeBizFilter, setActiveBizFilter] = useState<string | null>(null)
  const [bizCond, setBizCond] = useState<Record<string, any>>({})
  const [bizChecked, setBizChecked] = useState<Record<number, boolean>>({})
  const [bizPage, setBizPage] = useState(1)
  // 风险模块状态
  const [riskKeyword, setRiskKeyword] = useState('')
  const [riskSearchPanel, setRiskSearchPanel] = useState<'batch' | 'advanced' | null>(null)
  const [riskTime, setRiskTime] = useState('') // today / yesterday / 7d / 30d，与自定义区间互斥
  const [riskDate, setRiskDate] = useState<{ from: string; to: string }>({ from: '', to: '' })
  const [riskDropOpen, setRiskDropOpen] = useState<'province' | 'type' | null>(null)
  const [riskProvince, setRiskProvince] = useState<string[]>([])
  const [riskTypeSel, setRiskTypeSel] = useState<string[]>([])
  const [riskChecked, setRiskChecked] = useState<Record<number, boolean>>({})
  const [riskPage, setRiskPage] = useState(1)
  const [riskLoading, setRiskLoading] = useState(false)
  const [riskExportOpen, setRiskExportOpen] = useState(false)
  const [riskMoreOpen, setRiskMoreOpen] = useState(false)
  const [riskExportFormat, setRiskExportFormat] = useState<'csv' | 'json'>('csv')
  const [riskExportFields, setRiskExportFields] = useState<Record<string, boolean>>(Object.fromEntries(RISK_EXPORT_FIELDS.map((f) => [f, true])))

  const toggleAllFilters = () => {
    if (filterPanelOpen) {
      setFilterPanelOpen(false)
    } else {
      setFilterPanelOpen(true)
      setExpandedGroups(new Set(['basic', 'org', 'tech', 'capital', 'risk']))
    }
  }

  const activeFilterDef = BIZ_FILTERS.find((f) => f.key === activeBizFilter)
  const allBizChecked = BIZ_RESULTS.length > 0 && BIZ_RESULTS.every((_, i) => bizChecked[i])
  const toggleAllBiz = () => setBizChecked(allBizChecked ? {} : Object.fromEntries(BIZ_RESULTS.map((_, i) => [i, true])))
  const selectedBizRows = BIZ_RESULTS.filter((_, i) => bizChecked[i])
  const resetBiz = () => {
    setBizKeyword(''); setBizSearchPanel(null); setBizFiltersOpen(false); setActiveBizFilter(null); setBizCond({}); setBizChecked({}); setBizPage(1)
  }
  // 风险列表过滤：省份 + 风险类型 + 时间（快捷标签/自定义区间互斥）
  const riskFiltered = RISK_RESULTS.filter((r) => {
    if (riskProvince.length > 0 && !riskProvince.includes(r.region)) return false
    if (riskTypeSel.length > 0 && !riskTypeSel.includes(r.typeLabel)) return false
    const dt = new Date(r.date.slice(0, 10) + 'T00:00:00')
    const today = new Date(); today.setHours(0, 0, 0, 0)
    if (riskDate.from) { const f = new Date(riskDate.from + 'T00:00:00'); if (dt < f) return false }
    if (riskDate.to) { const t = new Date(riskDate.to + 'T00:00:00'); if (dt > t) return false }
    if (riskTime === 'today') return dt.getTime() === today.getTime()
    if (riskTime === 'yesterday') { const y = new Date(today); y.setDate(y.getDate() - 1); return dt.getTime() === y.getTime() }
    if (riskTime === '7d') { const w = new Date(today); w.setDate(w.getDate() - 7); return dt.getTime() >= w.getTime() }
    if (riskTime === '30d') { const m = new Date(today); m.setDate(m.getDate() - 30); return dt.getTime() >= m.getTime() }
    return true
  })
  const hasRiskFilter = riskTime !== '' || riskDate.from !== '' || riskDate.to !== '' || riskProvince.length > 0 || riskTypeSel.length > 0
  const riskStatTotal = hasRiskFilter ? riskFiltered.length : RISK_STATS_TOTAL
  const allRiskChecked = riskFiltered.length > 0 && riskFiltered.every((_, i) => riskChecked[RISK_RESULTS.indexOf(riskFiltered[i])])
  const toggleAllRisk = () => {
    const idxs = riskFiltered.map((r) => RISK_RESULTS.indexOf(r))
    if (allRiskChecked) setRiskChecked({})
    else setRiskChecked(Object.fromEntries(idxs.map((i) => [i, true])))
  }
  const selectedRiskRows = RISK_RESULTS.filter((_, i) => riskChecked[i])
  const doRiskSearch = () => { setRiskPage(1); setRiskLoading(true); window.setTimeout(() => setRiskLoading(false), 450) }
  const resetRisk = () => {
    setRiskKeyword(''); setRiskSearchPanel(null); setRiskTime(''); setRiskDate({ from: '', to: '' }); setRiskDropOpen(null)
    setRiskProvince([]); setRiskTypeSel([]); setRiskChecked({}); setRiskPage(1); setRiskLoading(false); setRiskExportOpen(false)
  }

  // 舆情模块状态
  const [pubKeyword, setPubKeyword] = useState('')
  const [pubSearchPanel, setPubSearchPanel] = useState<'batch' | 'advanced' | null>(null)
  const [pubTime, setPubTime] = useState('')
  const [pubDate, setPubDate] = useState<{ from: string; to: string }>({ from: '', to: '' })
  const [pubCat, setPubCat] = useState<string[]>([])
  const [pubSent, setPubSent] = useState<string[]>([])
  const [pubTopic, setPubTopic] = useState<string[]>([])
  const [pubAuth, setPubAuth] = useState<string[]>([])
  const [pubPage, setPubPage] = useState(1)
  const [pubLoading, setPubLoading] = useState(false)
  const doPubSearch = () => { setPubPage(1); setPubLoading(true); window.setTimeout(() => setPubLoading(false), 450) }
  const resetPub = () => { setPubKeyword(''); setPubSearchPanel(null); setPubTime(''); setPubDate({ from: '', to: '' }); setPubCat([]); setPubSent([]); setPubTopic([]); setPubAuth([]); setPubPage(1); setPubLoading(false) }

  // 研报模块状态
  const [repKeyword, setRepKeyword] = useState('')
  const [repSearchPanel, setRepSearchPanel] = useState<'batch' | 'advanced' | null>(null)
  const [repTime, setRepTime] = useState('')
  const [repDate, setRepDate] = useState<{ from: string; to: string }>({ from: '', to: '' })
  const [repType, setRepType] = useState<string[]>([])
  const [repCat, setRepCat] = useState<string[]>([])
  const [repFeat, setRepFeat] = useState<string[]>([])
  const [repPageSize, setRepPageSize] = useState('不限')
  const [repOrg, setRepOrg] = useState<string[]>([])
  const [repPage, setRepPage] = useState(1)
  const [repLoading, setRepLoading] = useState(false)
  const doRepSearch = () => { setRepPage(1); setRepLoading(true); window.setTimeout(() => setRepLoading(false), 450) }
  const resetRep = () => { setRepKeyword(''); setRepSearchPanel(null); setRepTime(''); setRepDate({ from: '', to: '' }); setRepType([]); setRepCat([]); setRepFeat([]); setRepPageSize('不限'); setRepOrg([]); setRepPage(1); setRepLoading(false) }

  const toDate = (d: string) => { const x = new Date(d + 'T00:00:00'); return isNaN(x.getTime()) ? null : x }
  const matchTime = (dateStr: string, quick: string, range: { from: string; to: string }) => {
    const dt = toDate(dateStr); if (!dt) return true
    const today = new Date(); today.setHours(0, 0, 0, 0)
    if (range.from) { const f = toDate(range.from); if (f && dt < f) return false }
    if (range.to) { const t = toDate(range.to); if (t && dt > t) return false }
    if (quick === 'today') return dt.getTime() === today.getTime()
    if (quick === 'yesterday') { const y = new Date(today); y.setDate(y.getDate() - 1); return dt.getTime() === y.getTime() }
    if (quick === '7d') { const w = new Date(today); w.setDate(w.getDate() - 7); return dt.getTime() >= w.getTime() }
    if (quick === '30d') { const w = new Date(today); w.setDate(w.getDate() - 30); return dt.getTime() >= w.getTime() }
    if (quick === '3m') { const w = new Date(today); w.setMonth(w.getMonth() - 3); return dt.getTime() >= w.getTime() }
    if (quick === '6m') { const w = new Date(today); w.setMonth(w.getMonth() - 6); return dt.getTime() >= w.getTime() }
    if (quick === '1y') { const w = new Date(today); w.setFullYear(w.getFullYear() - 1); return dt.getTime() >= w.getTime() }
    return true
  }

  // 舆情过滤
  const pubFiltered = PUBLIC_RESULTS.filter((r) => {
    if (pubKeyword.trim() && !r.title.toLowerCase().includes(pubKeyword.trim().toLowerCase())) return false
    if (pubCat.length > 0 && !pubCat.includes(r.category)) return false
    if (pubSent.length > 0 && !pubSent.includes(r.sentiment)) return false
    if (pubTopic.length > 0 && !r.topics.some((t) => pubTopic.includes(t))) return false
    if (pubAuth.length > 0 && !pubAuth.includes(r.authority)) return false
    return matchTime(r.date, pubTime, pubDate)
  })
  const hasPubFilter = pubTime !== '' || pubDate.from !== '' || pubDate.to !== '' || pubCat.length > 0 || pubSent.length > 0 || pubTopic.length > 0 || pubAuth.length > 0
  const pubStatTotal = hasPubFilter ? pubFiltered.length : PUBLIC_STATS_TOTAL

  // 研报过滤
  const repPageMatch = (pages: number) => {
    if (repPageSize === '大于5页') return pages > 5
    if (repPageSize === '大于10页') return pages > 10
    if (repPageSize === '大于20页') return pages > 20
    if (repPageSize === '大于50页') return pages > 50
    return true
  }
  const repFiltered = REPORT_RESULTS.filter((r) => {
    if (repKeyword.trim() && !r.title.toLowerCase().includes(repKeyword.trim().toLowerCase())) return false
    if (repType.length > 0 && !repType.includes(r.reportType)) return false
    if (repCat.length > 0 && !repCat.includes(r.category)) return false
    if (repFeat.length > 0 && !(r.features || []).some((f) => repFeat.includes(f))) return false
    if (repOrg.length > 0 && !repOrg.includes(r.org)) return false
    if (!repPageMatch(r.pages)) return false
    return matchTime(r.date, repTime, repDate)
  })
  const hasRepFilter = repTime !== '' || repDate.from !== '' || repDate.to !== '' || repType.length > 0 || repCat.length > 0 || repFeat.length > 0 || repPageSize !== '不限' || repOrg.length > 0
  const repStatTotal = hasRepFilter ? repFiltered.length : REPORT_STATS_TOTAL
  const accent = ['person', 'risk', 'public', 'report'].includes(activeModule) ? C.yellow : C.primary

  const toggle = (o: string) => setChecked((s) => ({ ...s, [o]: !s[o] }))
  const toggleGroup = (g: string) => setExpandedGroups((s) => { const n = new Set(s); n.has(g) ? n.delete(g) : n.add(g); return n })

  const statusChecked = Object.keys(checked).filter((k) => ['存续', '迁出', '注销', '吊销', '其他状态'].includes(k) && checked[k])
  let list = ENTERPRISES.filter((c) => statusChecked.length === 0 || statusChecked.includes(c.status))
  if (sortBy === 'scoreDesc') list = [...list].sort((a, b) => b.score - a.score)
  if (sortBy === 'scoreAsc') list = [...list].sort((a, b) => a.score - b.score)
  if (sortBy === 'regNew') list = [...list].sort((a, b) => (b.regTime || '').localeCompare(a.regTime || ''))

  // 滚动监听（回到顶部）
  if (typeof window !== 'undefined') {
    window.onscroll = () => setShowTop(window.scrollY > 300)
  }

  return (
    <div style={{ padding: '16px 24px 24px', maxWidth: 1440, margin: '0 auto' }}>
      <PageShell title="全维搜索" subtitle="基于集团、品牌、投资机构、企业、产品等多维度数据，全方位定位目标客户" crumb="数字营销 / 潜客挖掘 / 全维搜索" legend={false} />

      {/* 顶部模块导航 */}
      <div style={{ display: 'flex', gap: 4, borderBottom: `2px solid ${C.border}`, marginBottom: 12 }}>
        {MODULES.map((m) => {
          const navActive = activeModule === m.key
          const navColor = ['person', 'risk', 'public', 'report'].includes(activeModule) ? C.yellow : C.primary
          return (
            <div key={m.key}
              onClick={() => { setActiveModule(m.key); setKeyword(m.key === 'person' ? PERSON_SEARCH_KEYWORD : SEARCH_KEYWORD); setPage(1); resetBiz(); resetRisk(); resetPub(); resetRep() }}
              style={{ padding: '8px 18px', cursor: 'pointer', fontSize: 15, color: navActive ? navColor : C.sub, fontWeight: navActive ? 700 : 400, borderBottom: navActive ? `2px solid ${navColor}` : '2px solid transparent', marginBottom: -2 }}>
              {m.label}
            </div>
          )
        })}
      </div>

      {/* ============ 企业 AI 模块 ============ */}
      {activeModule === 'ent' && (
        <>
          {/* 搜索栏 */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <select value={scope} onChange={(e) => setScope(e.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '7px 8px', color: C.text }}>
                <option value="">不限范围</option>
                {SCOPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="请输入关键词" style={{ flex: 1, minWidth: 220, maxWidth: 420, border: `1px solid ${C.border}`, borderRadius: 4, padding: '7px 10px' }} />
              <button onClick={() => setPage(1)} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 4, padding: '8px 18px', cursor: 'pointer', fontSize: 14 }}>查询</button>
              <button style={{ border: `1px solid ${C.primary}`, color: C.primary, background: '#fff', borderRadius: 4, padding: '8px 14px', cursor: 'pointer' }}>AI找名单</button>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
                <a style={{ color: C.sub, fontSize: 13, cursor: 'pointer' }}>批量搜索</a>
                <a style={{ color: C.sub, fontSize: 13, cursor: 'pointer' }}>高级搜索</a>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {QUICK_TAG_GROUPS[quickIdx].map((t) => (
                <span key={t} onClick={() => setKeyword(t)} style={{ fontSize: 13, border: `1px solid ${C.border}`, borderRadius: 14, padding: '3px 12px', cursor: 'pointer', color: C.text }}>{t}</span>
              ))}
              <a onClick={() => setQuickIdx((i) => (i + 1) % QUICK_TAG_GROUPS.length)} style={{ color: C.primary, fontSize: 13, cursor: 'pointer' }}>换一批</a>
            </div>
          </div>

          {/* 主体：筛选区（一键全部收起/展开）+ 结果（下） */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px 12px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0 4px' }}>
              <span style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>条件筛选 <span style={{ color: C.ph, fontSize: 12, fontWeight: 400 }}>（分组可单独展开/收起）</span></span>
              <a onClick={toggleAllFilters} style={{ color: C.primary, fontSize: 13, cursor: 'pointer', flexShrink: 0 }}>{filterPanelOpen ? '收起筛选 ▲' : '展开筛选 ▼'}</a>
            </div>
            {filterPanelOpen && <FilterPanel checked={checked} toggle={toggle} expandedGroups={expandedGroups} toggleGroup={toggleGroup} />}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
              {/* 结果统计栏 */}
              <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ color: C.text, fontSize: 14 }}>为您找到 <b style={{ color: C.primary }}>{STATS.ent.toLocaleString()}</b> 家企业</span>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <label style={{ fontSize: 13, color: C.sub, display: 'flex', alignItems: 'center', gap: 4 }}><input type="checkbox" style={{ accentColor: C.primary }} />空号过滤</label>
                  <button onClick={() => setViewMode('card')} style={{ fontSize: 13, border: `1px solid ${viewMode === 'card' ? C.primary : C.border}`, color: viewMode === 'card' ? C.primary : C.sub, background: '#fff', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>卡片</button>
                  <button onClick={() => setViewMode('table')} style={{ fontSize: 13, border: `1px solid ${viewMode === 'table' ? C.primary : C.border}`, color: viewMode === 'table' ? C.primary : C.sub, background: '#fff', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>表格</button>
                  <a style={{ color: C.sub, fontSize: 13, cursor: 'pointer' }}>批量操作</a>
                  <a style={{ color: C.sub, fontSize: 13, cursor: 'pointer' }}>营销</a>
                  <a style={{ color: C.sub, fontSize: 13, cursor: 'pointer' }}>导出</a>
                  <a style={{ color: C.primary, fontSize: 13, cursor: 'pointer' }}>查看结果</a>
                </div>
              </div>

              {/* 排序 + 视图切换 行 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: C.sub }}>排序：</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px', color: C.text }}>
                  <option value="default">默认排序</option>
                  <option value="scoreDesc">启信分从高到低</option>
                  <option value="scoreAsc">启信分从低到高</option>
                  <option value="regNew">注册时间最新</option>
                </select>
              </div>

              {/* 企业列表 */}
              {viewMode === 'card' ? list.map((c, i) => <EntCardView key={i} card={c} go={go} />)
                : (
                  <div className="overflow-x-auto"><table style={{ width: '100%', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#fafafa', color: C.sub }}>
                        <th style={{ borderBottom: `1px solid ${C.border}`, padding: '8px 10px', textAlign: 'left' }}>企业名称</th>
                        <th style={{ borderBottom: `1px solid ${C.border}`, padding: '8px 10px', textAlign: 'left' }}>状态</th>
                        <th style={{ borderBottom: `1px solid ${C.border}`, padding: '8px 10px', textAlign: 'left' }}>启信分</th>
                        <th style={{ borderBottom: `1px solid ${C.border}`, padding: '8px 10px', textAlign: 'left' }}>法定代表人</th>
                        <th style={{ borderBottom: `1px solid ${C.border}`, padding: '8px 10px', textAlign: 'left' }}>注册资本</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((c, i) => (
                        <tr key={i} style={{ cursor: 'pointer' }} onClick={() => go.ent(c.name)}>
                          <td style={{ borderBottom: `1px solid ${C.border}`, padding: '8px 10px', color: C.primary }}>{c.name}</td>
                          <td style={{ borderBottom: `1px solid ${C.border}`, padding: '8px 10px' }}>{c.status}</td>
                          <td style={{ borderBottom: `1px solid ${C.border}`, padding: '8px 10px' }}>{c.score}</td>
                          <td style={{ borderBottom: `1px solid ${C.border}`, padding: '8px 10px' }}>{c.legal}</td>
                          <td style={{ borderBottom: `1px solid ${C.border}`, padding: '8px 10px' }}>{c.regCap}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                )}

              {/* 分页 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, fontSize: 13, color: C.sub }}>
                <span>共 {STATS.ent.toLocaleString()} 条 50条/页</span>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} style={{ border: `1px solid ${C.border}`, background: '#fff', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>上一页</button>
                {[1, 2, 3, 4, 5].map((p) => (
                  <button key={p} onClick={() => setPage(p)} style={{ border: `1px solid ${page === p ? C.primary : C.border}`, color: page === p ? C.primary : C.sub, background: page === p ? '#eef3ff' : '#fff', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>{p}</button>
                ))}
                <button onClick={() => setPage((p) => p + 1)} style={{ border: `1px solid ${C.border}`, background: '#fff', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>下一页</button>
                <span>前往 <input value={page} onChange={(e) => setPage(Number(e.target.value) || 1)} style={{ width: 44, border: `1px solid ${C.border}`, borderRadius: 4, padding: '3px 6px' }} /> 页</span>
              </div>
            </div>
        </>
      )}

      {/* ============ 人员 模块 ============ */}
      {activeModule === 'person' && (
        <>
          {/* 搜索操作栏：输入框 + 黄色查询 + 批量/高级搜索 + 省市/行业下拉 */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="请输入自然人姓名，检索同名人员主体" style={{ flex: 1, minWidth: 220, maxWidth: 420, border: `1px solid ${C.border}`, borderRadius: 4, padding: '7px 10px' }} />
              <button onClick={() => setPage(1)} style={{ background: C.yellow, color: C.yellowText, border: 'none', borderRadius: 4, padding: '8px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>查询</button>
              <div style={{ display: 'flex', gap: 12 }}>
                <a style={{ color: C.sub, fontSize: 13, cursor: 'pointer' }}>批量搜索</a>
                <a style={{ color: C.sub, fontSize: 13, cursor: 'pointer' }}>高级搜索</a>
              </div>
              <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                <select style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '7px 8px', color: C.text }}><option>省市地区</option></select>
                <select style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '7px 8px', color: C.text }}><option>所在行业</option></select>
              </div>
            </div>
          </div>

          {/* 结果统计栏 */}
          <div style={{ fontSize: 13, color: C.sub, marginBottom: 12 }}>
            找到 <b style={{ color: C.text, fontSize: 15 }}>{PERSON_STATS_TOTAL.toLocaleString()}</b> 条相关结果
          </div>

          {/* 人员结果列表（样式A 置顶 + 样式B 同名） */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {PERSON_RESULTS.map((p, i) => <PersonCardView key={i} p={p} primary={i === 0} go={go} />)}

            {/* 分页 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, fontSize: 13, color: C.sub }}>
              <span>共 {PERSON_STATS_TOTAL.toLocaleString()} 条 50条/页</span>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} style={{ border: `1px solid ${C.border}`, background: '#fff', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>上一页</button>
              {[1, 2, 3, 4, 5].map((pnum) => (
                <button key={pnum} onClick={() => setPage(pnum)} style={{ border: `1px solid ${page === pnum ? C.primary : C.border}`, color: page === pnum ? C.primary : C.sub, background: page === pnum ? '#eef3ff' : '#fff', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>{pnum}</button>
              ))}
              <button onClick={() => setPage((p) => p + 1)} style={{ border: `1px solid ${C.border}`, background: '#fff', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>下一页</button>
              <span>前往 <input value={page} onChange={(e) => setPage(Number(e.target.value) || 1)} style={{ width: 44, border: `1px solid ${C.border}`, borderRadius: 4, padding: '3px 6px' }} /> 页</span>
            </div>
          </div>
        </>
      )}

      {/* ============ 商机 模块 ============ */}
      {activeModule === 'biz' && (
        <>
          {/* 搜索栏：输入框 + 黄色查询 + 批量搜索/高级搜索 */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <input value={bizKeyword} onChange={(e) => setBizKeyword(e.target.value)} placeholder={BIZ_KEYWORD_PLACEHOLDER} style={{ flex: 1, minWidth: 240, maxWidth: 420, border: `1px solid ${C.border}`, borderRadius: 4, padding: '7px 10px' }} />
              <button onClick={() => { setBizPage(1); setActiveBizFilter(null) }} style={{ background: C.yellow, color: C.yellowText, border: 'none', borderRadius: 4, padding: '8px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>查询</button>
              <div style={{ display: 'flex', gap: 14, marginLeft: 6 }}>
                <a onClick={() => setBizSearchPanel(bizSearchPanel === 'batch' ? null : 'batch')} style={{ color: bizSearchPanel === 'batch' ? C.primary : C.sub, fontSize: 13, cursor: 'pointer' }}>批量搜索</a>
                <a onClick={() => setBizSearchPanel(bizSearchPanel === 'advanced' ? null : 'advanced')} style={{ color: bizSearchPanel === 'advanced' ? C.primary : C.sub, fontSize: 13, cursor: 'pointer' }}>高级搜索</a>
              </div>
            </div>
            {bizSearchPanel && (
              <div style={{ marginTop: 10, border: `1px solid ${C.border}`, borderRadius: 6, background: '#fafbfc', padding: 12, fontSize: 13 }}>
                {bizSearchPanel === 'batch' ? (
                  <>
                    <div style={{ fontWeight: 600, color: C.text, marginBottom: 6 }}>批量搜索：每行输入一个关键词，最多 100 行，提交后逐条检索商机</div>
                    <textarea rows={3} style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 4, padding: 8, resize: 'vertical', boxSizing: 'border-box' }} placeholder={'比亚迪\n华为\n腾讯'} />
                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                      <button onClick={() => setBizSearchPanel(null)} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 4, padding: '5px 16px', cursor: 'pointer' }}>开始批量检索</button>
                      <button onClick={() => setBizSearchPanel(null)} style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.sub, borderRadius: 4, padding: '5px 16px', cursor: 'pointer' }}>取消</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 600, color: C.text, marginBottom: 8 }}>高级搜索：组合多维度条件精准定位商机</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px', marginBottom: 8 }}>
                      <select style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px', color: C.text }}><option>商机类型</option><option>新成立公司</option><option>备案核投资项目-进程</option><option>新增中标</option><option>新增供应商/项目</option></select>
                      <select style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px', color: C.text }}><option>所在行业</option><option>制造业</option><option>软件和信息技术服务业</option><option>批发和零售业</option><option>建筑业</option></select>
                      <select style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px', color: C.text }}><option>省份地区</option><option>广东</option><option>江苏</option><option>浙江</option><option>北京</option></select>
                      <select style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px', color: C.text }}><option>企业类型</option><option>有限责任公司</option><option>股份有限公司</option><option>个体工商户</option></select>
                      <input type="date" style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '5px 8px' }} />
                      <span style={{ color: C.sub, lineHeight: '30px' }}>—</span>
                      <input type="date" style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '5px 8px' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setBizSearchPanel(null)} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 4, padding: '5px 16px', cursor: 'pointer' }}>确定检索</button>
                      <button onClick={() => setBizSearchPanel(null)} style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.sub, borderRadius: 4, padding: '5px 16px', cursor: 'pointer' }}>取消</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 横向筛选条件栏：可展开/收起，点击筛选项展开配置面板 */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 10px', alignItems: 'center' }}>
              {(bizFiltersOpen ? BIZ_FILTERS : BIZ_FILTERS.slice(0, BIZ_FILTER_COLLAPSED_COUNT)).map((f) => {
                const c = bizCond[f.key]
                const cnt = Array.isArray(c) ? c.length : c && typeof c === 'object' ? Object.values(c).filter(Boolean).length : c ? 1 : 0
                const active = activeBizFilter === f.key
                return (
                  <span key={f.key}
                    onClick={() => setActiveBizFilter(active ? null : f.key)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: C.text, border: `1px solid ${active ? C.primary : C.border}`, borderRadius: 4, padding: '5px 10px', cursor: 'pointer', background: active ? '#eef3ff' : '#fff' }}>
                    {f.label}
                    {cnt > 0 && <span style={{ background: C.primary, color: '#fff', borderRadius: 8, fontSize: 11, padding: '0 6px', lineHeight: '15px' }}>{cnt}</span>}
                  </span>
                )
              })}
              <a onClick={() => { setBizFiltersOpen(!bizFiltersOpen); setActiveBizFilter(null) }} style={{ color: C.primary, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {bizFiltersOpen ? '收起筛选 ▲' : '更多筛选 ▼'}
              </a>
            </div>
            {activeFilterDef && (
              <BizFilterPanel filter={activeFilterDef} cond={bizCond[activeFilterDef.key]}
                onApply={(k, v) => { setBizCond((s) => ({ ...s, [k]: v })); setActiveBizFilter(null) }}
                onReset={(k) => setBizCond((s) => { const n = { ...s }; delete n[k]; return n })}
                onClose={() => setActiveBizFilter(null)} />
            )}
          </div>

          {/* 结果工具栏：全选 + 统计 + 导出 */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 13, color: C.sub, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <input type="checkbox" checked={allBizChecked} onChange={toggleAllBiz} style={{ accentColor: C.primary }} />全选
            </label>
            <span style={{ fontSize: 14, color: C.text }}>找到 <b style={{ color: C.primary }}>{BIZ_STATS_TOTAL.toLocaleString()}</b> 条结果</span>
            <div style={{ marginLeft: 'auto' }}>
              <button onClick={() => exportBizRows(selectedBizRows.length > 0 ? selectedBizRows : BIZ_RESULTS)} style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.sub, borderRadius: 4, padding: '6px 16px', cursor: 'pointer', fontSize: 13 }}>导出</button>
            </div>
          </div>

          {/* 商机列表 */}
          <div>
            {BIZ_RESULTS.map((b, i) => (
              <BizCardView key={i} b={b} checked={!!bizChecked[i]} onToggle={() => setBizChecked((s) => ({ ...s, [i]: !s[i] }))} go={go} />
            ))}
          </div>

          {/* 底部分页：共17025条 10条/页 + 页码切换/跳转 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, fontSize: 13, color: C.sub, flexWrap: 'wrap' }}>
            <span>共 {BIZ_STATS_TOTAL.toLocaleString()} 条 10条/页</span>
            <button onClick={() => setBizPage((p) => Math.max(1, p - 1))} disabled={bizPage <= 1} style={{ border: `1px solid ${C.border}`, background: '#fff', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>上一页</button>
            {[1, 2, 3, 4, 5].map((p) => (
              <button key={p} onClick={() => setBizPage(p)} style={{ border: `1px solid ${bizPage === p ? C.primary : C.border}`, color: bizPage === p ? C.primary : C.sub, background: bizPage === p ? '#eef3ff' : '#fff', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>{p}</button>
            ))}
            <button onClick={() => setBizPage((p) => p + 1)} style={{ border: `1px solid ${C.border}`, background: '#fff', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>下一页</button>
            <span>前往 <input value={bizPage} onChange={(e) => setBizPage(Number(e.target.value) || 1)} style={{ width: 44, border: `1px solid ${C.border}`, borderRadius: 4, padding: '3px 6px' }} /> 页</span>
          </div>
        </>
      )}

      {/* ============ 风险 模块 ============ */}
      {activeModule === 'risk' && (
        <>
          {/* 搜索操作栏：输入框 + 黄色查询 + 批量/高级搜索 + 时间筛选 + 筛选下拉 */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <input value={riskKeyword} onChange={(e) => setRiskKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doRiskSearch()} placeholder={RISK_KEYWORD_PLACEHOLDER} style={{ flex: 1, minWidth: 240, maxWidth: 420, border: `1px solid ${C.border}`, borderRadius: 4, padding: '7px 10px' }} />
              <button onClick={doRiskSearch} style={{ background: C.yellow, color: C.yellowText, border: 'none', borderRadius: 4, padding: '8px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>查询</button>
              <div style={{ display: 'flex', gap: 14, marginLeft: 6 }}>
                <a onClick={() => setRiskSearchPanel(riskSearchPanel === 'batch' ? null : 'batch')} style={{ color: riskSearchPanel === 'batch' ? C.primary : C.sub, fontSize: 13, cursor: 'pointer' }}>批量搜索</a>
                <a onClick={() => setRiskSearchPanel(riskSearchPanel === 'advanced' ? null : 'advanced')} style={{ color: riskSearchPanel === 'advanced' ? C.primary : C.sub, fontSize: 13, cursor: 'pointer' }}>高级搜索</a>
              </div>
            </div>
            {riskSearchPanel && (
              <div style={{ marginTop: 10, border: `1px solid ${C.border}`, borderRadius: 6, background: '#fafbfc', padding: 12, fontSize: 13 }}>
                {riskSearchPanel === 'batch' ? (
                  <>
                    <div style={{ fontWeight: 600, color: C.text, marginBottom: 6 }}>批量搜索：每行输入一个关键词，提交后逐条检索风险信息</div>
                    <textarea rows={3} style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 4, padding: 8, resize: 'vertical', boxSizing: 'border-box' }} placeholder={'比亚迪\n华为\n腾讯'} />
                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                      <button onClick={() => { setRiskSearchPanel(null); doRiskSearch() }} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 4, padding: '5px 16px', cursor: 'pointer' }}>开始批量检索</button>
                      <button onClick={() => setRiskSearchPanel(null)} style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.sub, borderRadius: 4, padding: '5px 16px', cursor: 'pointer' }}>取消</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 600, color: C.text, marginBottom: 8 }}>高级搜索：案号 / 涉案金额 / 法院 / 税种 等复合条件</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px', marginBottom: 8, alignItems: 'center' }}>
                      <input placeholder="案号，如：（2026）粤0105民初27541号" style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px', width: 240 }} />
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><input type="number" placeholder="最低涉案金额" style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px', width: 110 }} />—<input type="number" placeholder="最高涉案金额" style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px', width: 110 }} /></span>
                      <input placeholder="法院名称，如：深圳市南山区人民法院" style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px', width: 220 }} />
                      <select style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px', color: C.text }}><option>税种</option><option>增值税</option><option>企业所得税</option><option>个人所得税</option><option>城市维护建设税</option></select>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { setRiskSearchPanel(null); doRiskSearch() }} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 4, padding: '5px 16px', cursor: 'pointer' }}>确定检索</button>
                      <button onClick={() => setRiskSearchPanel(null)} style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.sub, borderRadius: 4, padding: '5px 16px', cursor: 'pointer' }}>取消</button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 时间快速筛选区：快捷标签互斥 + 自定义区间 */}
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ color: C.sub, fontSize: 13 }}>时间：</span>
              {RISK_TIME_TAGS.map((t) => (
                <span key={t.key} onClick={() => setRiskTime(riskTime === t.key ? '' : t.key)}
                  style={{ fontSize: 13, cursor: 'pointer', padding: '4px 12px', borderRadius: 4, border: `1px solid ${riskTime === t.key ? C.primary : C.border}`, color: riskTime === t.key ? C.primary : C.text, background: riskTime === t.key ? '#eef3ff' : '#fff' }}>
                  {t.label}
                </span>
              ))}
              <input type="date" value={riskDate.from} onChange={(e) => { setRiskDate((s) => ({ ...s, from: e.target.value })); setRiskTime('') }} style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '4px 8px' }} />
              <span style={{ color: C.sub }}>—</span>
              <input type="date" value={riskDate.to} onChange={(e) => { setRiskDate((s) => ({ ...s, to: e.target.value })); setRiskTime('') }} style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '4px 8px' }} />
              {(riskTime !== '' || riskDate.from || riskDate.to) && (
                <a onClick={() => { setRiskTime(''); setRiskDate({ from: '', to: '' }) }} style={{ color: C.primary, fontSize: 13, cursor: 'pointer' }}>清除</a>
              )}
            </div>

            {/* 筛选下拉控件：省市地区 / 风险类型 + 更多筛选项 */}
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setRiskDropOpen(riskDropOpen === 'province' ? null : 'province')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: riskProvince.length > 0 ? '#eef3ff' : '#fff', border: `1px solid ${riskDropOpen === 'province' ? C.primary : C.border}`, borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontSize: 13, color: C.text }}>
                  省市地区{riskProvince.length > 0 && `（${riskProvince.length}）`} ▾
                </button>
                {riskDropOpen === 'province' && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,.12)', padding: 12, width: 330, zIndex: 10 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 10px', marginBottom: 10 }}>
                      {RISK_PROVINCES.map((p) => (
                        <label key={p} style={{ fontSize: 13, color: C.text, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                          <input type="checkbox" checked={riskProvince.includes(p)} onChange={(e) => setRiskProvince((s) => (e.target.checked ? [...s, p] : s.filter((x) => x !== p)))} style={{ accentColor: C.primary }} />{p}
                        </label>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { setRiskProvince([]); setRiskDropOpen(null) }} style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.sub, borderRadius: 4, padding: '5px 16px', cursor: 'pointer', fontSize: 13 }}>清空</button>
                      <button onClick={() => setRiskDropOpen(null)} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 4, padding: '5px 16px', cursor: 'pointer', fontSize: 13 }}>确定</button>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setRiskDropOpen(riskDropOpen === 'type' ? null : 'type')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: riskTypeSel.length > 0 ? '#eef3ff' : '#fff', border: `1px solid ${riskDropOpen === 'type' ? C.primary : C.border}`, borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontSize: 13, color: C.text }}>
                  风险类型{riskTypeSel.length > 0 && `（${riskTypeSel.length}）`} ▾
                </button>
                {riskDropOpen === 'type' && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,.12)', padding: 12, width: 220, zIndex: 10 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                      {RISK_TYPE_OPTIONS.map((t) => (
                        <label key={t} style={{ fontSize: 13, color: C.text, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                          <input type="checkbox" checked={riskTypeSel.includes(t)} onChange={(e) => setRiskTypeSel((s) => (e.target.checked ? [...s, t] : s.filter((x) => x !== t)))} style={{ accentColor: C.primary }} />{t}
                        </label>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { setRiskTypeSel([]); setRiskDropOpen(null) }} style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.sub, borderRadius: 4, padding: '5px 16px', cursor: 'pointer', fontSize: 13 }}>清空</button>
                      <button onClick={() => setRiskDropOpen(null)} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 4, padding: '5px 16px', cursor: 'pointer', fontSize: 13 }}>确定</button>
                    </div>
                  </div>
                )}
              </div>
              <a onClick={() => setRiskMoreOpen(!riskMoreOpen)} style={{ color: C.sub, fontSize: 13, cursor: 'pointer' }}>更多筛选项 {riskMoreOpen ? '▲' : '▼'}</a>
            </div>
            {riskMoreOpen && (
              <div style={{ marginTop: 10, border: `1px solid ${C.border}`, borderRadius: 6, background: '#fafbfc', padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>更多风险筛选维度（可扩展）：</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px', alignItems: 'center', fontSize: 13, color: C.sub }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>涉诉金额：<input type="number" placeholder="最低" style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '5px 8px', width: 90 }} />—<input type="number" placeholder="最高" style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '5px 8px', width: 90 }} /></span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>法院：<input placeholder="输入法院名称" style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '5px 8px', width: 190 }} /></span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>税种：<select style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '5px 8px', color: C.text }}><option>增值税</option><option>企业所得税</option><option>个人所得税</option></select></span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>公告类型：<select style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '5px 8px', color: C.text }}><option>起诉状副本及开庭传票</option><option>再审开庭公告</option></select></span>
                </div>
              </div>
            )}
          </div>

          {/* 结果统计与工具栏 */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, color: C.text }}>找到 <b style={{ color: C.primary }}>{riskStatTotal.toLocaleString()}</b> 条相关结果</span>
            {selectedRiskRows.length > 0 && <span style={{ fontSize: 12, color: C.ph }}>已选 {selectedRiskRows.length} 条</span>}
            <div style={{ marginLeft: 'auto' }}>
              <button onClick={() => setRiskExportOpen(true)} style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.sub, borderRadius: 4, padding: '6px 16px', cursor: 'pointer', fontSize: 13 }}>导出</button>
            </div>
          </div>

          {/* 风险列表：骨架屏 / 空态 / 多模板条目 */}
          {riskLoading ? (
            <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ marginBottom: i < 3 ? 14 : 0 }}>
                  <div style={{ width: i % 2 === 0 ? '55%' : '38%', height: 18, background: '#f0f1f3', borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ width: '88%', height: 14, background: '#f5f6f8', borderRadius: 4, marginBottom: 6 }} />
                  <div style={{ width: '64%', height: 14, background: '#f5f6f8', borderRadius: 4 }} />
                </div>
              ))}
            </div>
          ) : riskFiltered.length === 0 ? (
            <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: 56, textAlign: 'center', color: C.ph, fontSize: 14 }}>
              <div style={{ fontSize: 30, marginBottom: 10 }}>🔍</div>
              暂无匹配的风险数据，请调整关键词或清除筛选条件后重试
            </div>
          ) : (
            <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
              {riskFiltered.map((r) => {
                const idx = RISK_RESULTS.indexOf(r)
                return (
                  <RiskCard key={idx} r={r} kw={riskKeyword.trim()} checked={!!riskChecked[idx]}
                    onToggle={() => setRiskChecked((s) => ({ ...s, [idx]: !s[idx] }))} go={go} />
                )
              })}
            </div>
          )}

          {/* 分页：共xxx条 10条/页 + 页码 + 跳转 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, fontSize: 13, color: C.sub, flexWrap: 'wrap' }}>
            <span>共 {riskStatTotal.toLocaleString()} 条 10条/页</span>
            <button onClick={() => setRiskPage((p) => Math.max(1, p - 1))} disabled={riskPage <= 1} style={{ border: `1px solid ${C.border}`, background: '#fff', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>上一页</button>
            {[1, 2, 3, 4, 5].map((p) => (
              <button key={p} onClick={() => setRiskPage(p)} style={{ border: `1px solid ${riskPage === p ? C.primary : C.border}`, color: riskPage === p ? C.primary : C.sub, background: riskPage === p ? '#eef3ff' : '#fff', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>{p}</button>
            ))}
            <button onClick={() => setRiskPage((p) => p + 1)} style={{ border: `1px solid ${C.border}`, background: '#fff', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>下一页</button>
            <span>前往 <input value={riskPage} onChange={(e) => setRiskPage(Number(e.target.value) || 1)} style={{ width: 44, border: `1px solid ${C.border}`, borderRadius: 4, padding: '3px 6px' }} /> 页</span>
          </div>
        </>
      )}

      {/* ============ 舆情 模块 ============ */}
      {activeModule === 'public' && (
        <>
          {/* 搜索操作栏 */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <input value={pubKeyword} onChange={(e) => setPubKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doPubSearch()} placeholder={PUBLIC_KEYWORD_PLACEHOLDER} style={{ flex: 1, minWidth: 240, maxWidth: 420, border: `1px solid ${C.border}`, borderRadius: 4, padding: '7px 10px' }} />
              <button onClick={doPubSearch} style={{ background: C.yellow, color: C.yellowText, border: 'none', borderRadius: 4, padding: '8px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>查询</button>
              <div style={{ display: 'flex', gap: 14, marginLeft: 6 }}>
                <a onClick={() => setPubSearchPanel(pubSearchPanel === 'batch' ? null : 'batch')} style={{ color: pubSearchPanel === 'batch' ? accent : C.sub, fontSize: 13, cursor: 'pointer' }}>批量搜索</a>
                <a onClick={() => setPubSearchPanel(pubSearchPanel === 'advanced' ? null : 'advanced')} style={{ color: pubSearchPanel === 'advanced' ? accent : C.sub, fontSize: 13, cursor: 'pointer' }}>高级搜索</a>
              </div>
            </div>
            {pubSearchPanel && (
              <div style={{ marginTop: 10, border: `1px solid ${C.border}`, borderRadius: 6, background: '#fafbfc', padding: 12, fontSize: 13 }}>
                {pubSearchPanel === 'batch' ? (
                  <>
                    <div style={{ fontWeight: 600, color: C.text, marginBottom: 6 }}>批量搜索：每行输入一个关键词，提交后逐条检索舆情资讯</div>
                    <textarea rows={3} style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 4, padding: 8, resize: 'vertical', boxSizing: 'border-box' }} placeholder={'手机\n华为\n小米'} />
                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                      <button onClick={() => { setPubSearchPanel(null); doPubSearch() }} style={{ background: C.yellow, color: C.yellowText, border: 'none', borderRadius: 4, padding: '5px 16px', cursor: 'pointer', fontWeight: 600 }}>开始批量检索</button>
                      <button onClick={() => setPubSearchPanel(null)} style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.sub, borderRadius: 4, padding: '5px 16px', cursor: 'pointer' }}>取消</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 600, color: C.text, marginBottom: 8 }}>高级搜索：来源媒体 / 发布地区 / 文章字数 等复合条件</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px', marginBottom: 8, alignItems: 'center' }}>
                      <input placeholder="来源媒体，如：科技日报" style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px', width: 220 }} />
                      <input placeholder="发布地区，如：广东" style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px', width: 180 }} />
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><input type="number" placeholder="最少字数" style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px', width: 100 }} />—<input type="number" placeholder="最多字数" style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px', width: 100 }} /></span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { setPubSearchPanel(null); doPubSearch() }} style={{ background: C.yellow, color: C.yellowText, border: 'none', borderRadius: 4, padding: '5px 16px', cursor: 'pointer', fontWeight: 600 }}>确定检索</button>
                      <button onClick={() => setPubSearchPanel(null)} style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.sub, borderRadius: 4, padding: '5px 16px', cursor: 'pointer' }}>取消</button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 时间快速筛选区 */}
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ color: C.sub, fontSize: 13 }}>时间：</span>
              {PUBLIC_TIME_TAGS.map((t) => (
                <span key={t.key} onClick={() => setPubTime(pubTime === t.key ? '' : t.key)}
                  style={{ fontSize: 13, cursor: 'pointer', padding: '4px 12px', borderRadius: 4, border: `1px solid ${pubTime === t.key ? accent : C.border}`, color: pubTime === t.key ? accent : C.text, background: pubTime === t.key ? '#fff7e6' : '#fff' }}>
                  {t.label}
                </span>
              ))}
              <input type="date" value={pubDate.from} onChange={(e) => { setPubDate((s) => ({ ...s, from: e.target.value })); setPubTime('') }} style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '4px 8px' }} />
              <span style={{ color: C.sub }}>—</span>
              <input type="date" value={pubDate.to} onChange={(e) => { setPubDate((s) => ({ ...s, to: e.target.value })); setPubTime('') }} style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '4px 8px' }} />
              {(pubTime !== '' || pubDate.from || pubDate.to) && (
                <a onClick={() => { setPubTime(''); setPubDate({ from: '', to: '' }) }} style={{ color: accent, fontSize: 13, cursor: 'pointer' }}>清除</a>
              )}
            </div>

            {/* 筛选下拉控件：舆情分类 / 情感属性 / 主题分类 / 权威等级 */}
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <MultiFilterDropdown label="舆情分类" options={PUBLIC_CATEGORY_OPTIONS} value={pubCat} onChange={setPubCat} accent={accent} />
              <MultiFilterDropdown label="情感属性" options={PUBLIC_SENTIMENT_OPTIONS} value={pubSent} onChange={setPubSent} accent={accent} />
              <MultiFilterDropdown label="主题分类" options={PUBLIC_TOPIC_OPTIONS} value={pubTopic} onChange={setPubTopic} accent={accent} />
              <MultiFilterDropdown label="权威等级" options={PUBLIC_AUTHORITY_OPTIONS} value={pubAuth} onChange={setPubAuth} accent={accent} />
            </div>
          </div>

          {/* 结果统计区域 */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 14, color: C.text }}>
            找到 <b style={{ color: accent }}>{pubStatTotal.toLocaleString()}</b> 条相关结果
          </div>

          {/* 舆情列表：骨架屏 / 空态 / 条目 */}
          {pubLoading ? (
            <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ marginBottom: i < 3 ? 14 : 0 }}>
                  <div style={{ width: i % 2 === 0 ? '55%' : '38%', height: 18, background: '#f0f1f3', borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ width: '70%', height: 14, background: '#f5f6f8', borderRadius: 4 }} />
                </div>
              ))}
            </div>
          ) : pubFiltered.length === 0 ? (
            <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: 56, textAlign: 'center', color: C.ph, fontSize: 14 }}>
              <div style={{ fontSize: 30, marginBottom: 10 }}>🔍</div>
              暂无匹配的舆情数据，请调整关键词或清除筛选条件后重试
            </div>
          ) : (
            <div>
              {pubFiltered.map((r, i) => <PubCard key={i} item={r} kw={pubKeyword.trim()} />)}
            </div>
          )}

          {/* 分页 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, fontSize: 13, color: C.sub, flexWrap: 'wrap' }}>
            <span>共 {pubStatTotal.toLocaleString()} 条 10条/页</span>
            <button onClick={() => setPubPage((p) => Math.max(1, p - 1))} disabled={pubPage <= 1} style={{ border: `1px solid ${C.border}`, background: '#fff', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>上一页</button>
            {[1, 2, 3, 4, 5].map((p) => (
              <button key={p} onClick={() => setPubPage(p)} style={{ border: `1px solid ${pubPage === p ? accent : C.border}`, color: pubPage === p ? accent : C.sub, background: pubPage === p ? '#fff7e6' : '#fff', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>{p}</button>
            ))}
            <button onClick={() => setPubPage((p) => p + 1)} style={{ border: `1px solid ${C.border}`, background: '#fff', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>下一页</button>
            <span>前往 <input value={pubPage} onChange={(e) => setPubPage(Number(e.target.value) || 1)} style={{ width: 44, border: `1px solid ${C.border}`, borderRadius: 4, padding: '3px 6px' }} /> 页</span>
          </div>
        </>
      )}

      {/* ============ 研报 模块 ============ */}
      {activeModule === 'report' && (
        <>
          {/* 搜索操作栏 */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <input value={repKeyword} onChange={(e) => setRepKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doRepSearch()} placeholder={REPORT_KEYWORD_PLACEHOLDER} style={{ flex: 1, minWidth: 240, maxWidth: 420, border: `1px solid ${C.border}`, borderRadius: 4, padding: '7px 10px' }} />
              <button onClick={doRepSearch} style={{ background: C.yellow, color: C.yellowText, border: 'none', borderRadius: 4, padding: '8px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>查询</button>
              <div style={{ display: 'flex', gap: 14, marginLeft: 6 }}>
                <a onClick={() => setRepSearchPanel(repSearchPanel === 'batch' ? null : 'batch')} style={{ color: repSearchPanel === 'batch' ? accent : C.sub, fontSize: 13, cursor: 'pointer' }}>批量搜索</a>
                <a onClick={() => setRepSearchPanel(repSearchPanel === 'advanced' ? null : 'advanced')} style={{ color: repSearchPanel === 'advanced' ? accent : C.sub, fontSize: 13, cursor: 'pointer' }}>高级搜索</a>
              </div>
            </div>
            {repSearchPanel && (
              <div style={{ marginTop: 10, border: `1px solid ${C.border}`, borderRadius: 6, background: '#fafbfc', padding: 12, fontSize: 13 }}>
                {repSearchPanel === 'batch' ? (
                  <>
                    <div style={{ fontWeight: 600, color: C.text, marginBottom: 6 }}>批量搜索：每行输入一个关键词，提交后逐条检索研报数据</div>
                    <textarea rows={3} style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 4, padding: 8, resize: 'vertical', boxSizing: 'border-box' }} placeholder={'小米\n华为\n腾讯'} />
                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                      <button onClick={() => { setRepSearchPanel(null); doRepSearch() }} style={{ background: C.yellow, color: C.yellowText, border: 'none', borderRadius: 4, padding: '5px 16px', cursor: 'pointer', fontWeight: 600 }}>开始批量检索</button>
                      <button onClick={() => setRepSearchPanel(null)} style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.sub, borderRadius: 4, padding: '5px 16px', cursor: 'pointer' }}>取消</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 600, color: C.text, marginBottom: 8 }}>高级搜索：报告摘要 / 作者 / 文件大小 等复合条件</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px', marginBottom: 8, alignItems: 'center' }}>
                      <input placeholder="报告摘要关键词" style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px', width: 220 }} />
                      <input placeholder="作者 / 分析师" style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px', width: 180 }} />
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><input type="number" placeholder="最小(MB)" style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px', width: 90 }} />—<input type="number" placeholder="最大(MB)" style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px', width: 90 }} /></span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { setRepSearchPanel(null); doRepSearch() }} style={{ background: C.yellow, color: C.yellowText, border: 'none', borderRadius: 4, padding: '5px 16px', cursor: 'pointer', fontWeight: 600 }}>确定检索</button>
                      <button onClick={() => setRepSearchPanel(null)} style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.sub, borderRadius: 4, padding: '5px 16px', cursor: 'pointer' }}>取消</button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 时间快速筛选区 */}
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ color: C.sub, fontSize: 13 }}>时间：</span>
              {REPORT_TIME_TAGS.map((t) => (
                <span key={t.key} onClick={() => setRepTime(repTime === t.key ? '' : t.key)}
                  style={{ fontSize: 13, cursor: 'pointer', padding: '4px 12px', borderRadius: 4, border: `1px solid ${repTime === t.key ? accent : C.border}`, color: repTime === t.key ? accent : C.text, background: repTime === t.key ? '#fff7e6' : '#fff' }}>
                  {t.label}
                </span>
              ))}
              <input type="date" value={repDate.from} onChange={(e) => { setRepDate((s) => ({ ...s, from: e.target.value })); setRepTime('') }} style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '4px 8px' }} />
              <span style={{ color: C.sub }}>—</span>
              <input type="date" value={repDate.to} onChange={(e) => { setRepDate((s) => ({ ...s, to: e.target.value })); setRepTime('') }} style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '4px 8px' }} />
              {(repTime !== '' || repDate.from || repDate.to) && (
                <a onClick={() => { setRepTime(''); setRepDate({ from: '', to: '' }) }} style={{ color: accent, fontSize: 13, cursor: 'pointer' }}>清除</a>
              )}
            </div>

            {/* 筛选下拉控件：报告类型 / 行业分类 / 特色标签 / 报告页数 / 发布机构 */}
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <MultiFilterDropdown label="报告类型" options={REPORT_TYPE_OPTIONS} value={repType} onChange={setRepType} accent={accent} />
              <MultiFilterDropdown label="行业分类" options={REPORT_CATEGORY_OPTIONS} value={repCat} onChange={setRepCat} accent={accent} />
              <MultiFilterDropdown label="特色标签" options={REPORT_FEATURE_OPTIONS} value={repFeat} onChange={setRepFeat} accent={accent} />
              <select value={repPageSize} onChange={(e) => setRepPageSize(e.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px', color: C.text, fontSize: 13, background: '#fff' }}>
                {REPORT_PAGE_OPTIONS.map((o) => <option key={o} value={o}>{o === '不限' ? '报告页数' : o}</option>)}
              </select>
              <MultiFilterDropdown label="发布机构" options={REPORT_ORG_OPTIONS} value={repOrg} onChange={setRepOrg} accent={accent} />
            </div>
          </div>

          {/* 结果统计区域 */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 14, color: C.text }}>
            找到 <b style={{ color: accent }}>{repStatTotal.toLocaleString()}</b> 条相关结果
          </div>

          {/* 研报列表：骨架屏 / 空态 / 条目 */}
          {repLoading ? (
            <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ marginBottom: i < 3 ? 14 : 0 }}>
                  <div style={{ width: i % 2 === 0 ? '55%' : '38%', height: 18, background: '#f0f1f3', borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ width: '70%', height: 14, background: '#f5f6f8', borderRadius: 4 }} />
                </div>
              ))}
            </div>
          ) : repFiltered.length === 0 ? (
            <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: 56, textAlign: 'center', color: C.ph, fontSize: 14 }}>
              <div style={{ fontSize: 30, marginBottom: 10 }}>🔍</div>
              暂无匹配的研报数据，请调整关键词或清除筛选条件后重试
            </div>
          ) : (
            <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
              {repFiltered.map((r, i) => <ReportCard key={i} item={r} kw={repKeyword.trim()} />)}
            </div>
          )}

          {/* 分页 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, fontSize: 13, color: C.sub, flexWrap: 'wrap' }}>
            <span>共 {repStatTotal.toLocaleString()} 条 10条/页</span>
            <button onClick={() => setRepPage((p) => Math.max(1, p - 1))} disabled={repPage <= 1} style={{ border: `1px solid ${C.border}`, background: '#fff', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>上一页</button>
            {[1, 2, 3, 4, 5].map((p) => (
              <button key={p} onClick={() => setRepPage(p)} style={{ border: `1px solid ${repPage === p ? accent : C.border}`, color: repPage === p ? accent : C.sub, background: repPage === p ? '#fff7e6' : '#fff', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>{p}</button>
            ))}
            <button onClick={() => setRepPage((p) => p + 1)} style={{ border: `1px solid ${C.border}`, background: '#fff', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>下一页</button>
            <span>前往 <input value={repPage} onChange={(e) => setRepPage(Number(e.target.value) || 1)} style={{ width: 44, border: `1px solid ${C.border}`, borderRadius: 4, padding: '3px 6px' }} /> 页</span>
          </div>
        </>
      )}

      {/* 风险导出配置弹窗 */}
      {riskExportOpen && (
        <div onClick={() => setRiskExportOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 10, padding: 20, width: 500, maxWidth: '92vw', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>导出风险数据</div>
            <div style={{ fontSize: 12, color: C.ph, marginBottom: 14 }}>导出 {selectedRiskRows.length > 0 ? `已选 ${selectedRiskRows.length} 条` : `全部 ${riskStatTotal} 条`} 风险数据</div>
            <div style={{ fontSize: 13, color: C.sub, marginBottom: 6 }}>导出字段：</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginBottom: 14 }}>
              {RISK_EXPORT_FIELDS.map((f) => (
                <label key={f} style={{ fontSize: 13, color: C.text, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!riskExportFields[f]} onChange={(e) => setRiskExportFields((s) => ({ ...s, [f]: e.target.checked }))} style={{ accentColor: C.primary }} />{f}
                </label>
              ))}
            </div>
            <div style={{ fontSize: 13, color: C.sub, marginBottom: 6 }}>文件格式：</div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              {(['csv', 'json'] as const).map((fmt) => (
                <label key={fmt} style={{ fontSize: 13, color: C.text, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <input type="radio" checked={riskExportFormat === fmt} onChange={() => setRiskExportFormat(fmt)} style={{ accentColor: C.primary }} />{fmt.toUpperCase()}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setRiskExportOpen(false)} style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.sub, borderRadius: 4, padding: '6px 18px', cursor: 'pointer', fontSize: 13 }}>取消</button>
              <button onClick={() => { setRiskExportOpen(false); exportRiskRows(selectedRiskRows.length > 0 ? selectedRiskRows : riskFiltered.length > 0 ? riskFiltered : RISK_RESULTS, riskExportFields, riskExportFormat) }} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', cursor: 'pointer', fontSize: 13 }}>确认导出</button>
            </div>
          </div>
        </div>
      )}

      {/* 回到顶部 */}
      {showTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ position: 'fixed', right: 24, bottom: 32, width: 42, height: 42, borderRadius: '50%', background: C.primary, color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,.2)', fontSize: 18 }}>
          ↑
        </button>
      )}
    </div>
  )
}
