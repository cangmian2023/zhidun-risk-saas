import { useState, useEffect, useRef, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from './PageShell'
import { RightDrawer } from '../components/ui'
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
  { key: 'datasource', title: '数据来源' },
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
  datasource: [
    { title: '数据来源', kind: 'check', options: ['园区金融(1)', '注册地址(5)', '工商(1)', '数据挖掘(12)', '招投标大数据(1)', '招投标知识数据(1)', '年报电话(1)', '年报邮箱(3)', '年报地址(5)'] },
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

/* 触达抽屉样例联系方式 */
const SAMPLE_CONTACTS = [
  { seq: 1, contact: '010-8888 6666', type: '座机', source: '招投标大数据', empty: '未检测' },
  { seq: 2, contact: '138 0013 8000', type: '电话', source: '注册地址', empty: '实号' },
  { seq: 3, contact: 'wang@demo.com', type: '邮箱', source: '年报邮箱', empty: '无需检测' },
  { seq: 4, contact: '北京市海淀区中关村南大街 1 号', type: '地址', source: '注册地址', empty: '无需检测' },
  { seq: 5, contact: '139 9999 0001', type: '电话', source: '数据挖掘', empty: '未检测' },
  { seq: 6, contact: '010-8888 7777', type: '座机', source: '工商', empty: '未检测' },
]

/* 营销主题选项 */
const MARKET_TOPICS = ['普惠信用贷', '设备更新贷', '供应链金融', '科创贷', '绿色金融', '乡村振兴贷']

/* ---------- 单张企业卡片 ---------- */
function EntCardView({ card, go, onContact, onMarket, onMonitor }: { card: EntCard; go: ReturnType<typeof useGo>; onContact: (n: string) => void; onMarket: (n: string) => void; onMonitor: () => void }) {
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
          <button onClick={() => onContact(card.name)} style={{ border: `1px solid ${C.border}`, background: '#fff', color: C.sub, borderRadius: 4, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>触达</button>
          <button onClick={() => onMarket(card.name)} style={{ border: `1px solid ${C.primary}`, background: '#fff', color: C.primary, borderRadius: 4, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>营销</button>
          <button onClick={() => onMonitor()} style={{ border: `1px solid ${C.border}`, background: '#fff', color: C.sub, borderRadius: 4, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>监控</button>
        </div>
      </div>

      {/* 标签行 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '10px 0' }}>
        <span style={{ fontSize: 12, color: C.primary, background: '#eef3ff', border: `1px solid ${C.primary}33`, padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>企业健康度 {card.score}</span>
        {card.tags.map((t, i) => (
          <span key={i} style={{ fontSize: 12, color: C.sub, background: '#f5f5f5', border: `1px solid ${C.border}`, padding: '2px 8px', borderRadius: 4 }}>{t}</span>
        ))}
        <span style={{ fontSize: 12, color: C.ph, background: '#fafafa', border: `1px solid ${C.border}`, padding: '2px 8px', borderRadius: 4 }}>全部标签</span>
      </div>

      {/* 基础信息行 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 24px', color: C.text, fontSize: 13, marginBottom: 6 }}>
        <span>法定代表人：{card.legal && card.legal !== '-' ? <b style={{ color: C.primary, cursor: 'pointer' }} onClick={() => go.person(card.legal)}>{card.legal}</b> : <b>{card.legal || '-'}</b>}</span>
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
        {Object.entries(FILTER_OPTIONS).map(([gkey, sections]) => {
          const isOpen = expandedGroups.has(gkey)
          return (
          <div key={gkey} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 8, marginBottom: 8 }}>
            <div onClick={() => toggleGroup(gkey)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 700, color: isOpen ? C.primary : C.text, fontSize: 14, padding: '6px 8px', borderRadius: 6, background: isOpen ? '#f0f4ff' : 'transparent', transition: 'background .15s,color .15s' }}>
              <span>{FILTER_STRUCTURE.find((x) => x.key === gkey)!.title}</span>
              <span style={{ color: isOpen ? C.primary : C.ph, fontSize: 12, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>▾</span>
            </div>
            {isOpen && sections.map((sec) => (
              <div key={sec.title} style={{ margin: '8px 0', paddingLeft: 8 }}>
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
          )
        })}
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
  { key: 'score', label: '企业健康度', type: 'range', unit: '分' },
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
function RiskCard({ r, kw, checked, onToggle, go, onTitleClick }: { r: RiskResult; kw: string; checked: boolean; onToggle: () => void; go: ReturnType<typeof useGo>; onTitleClick?: () => void }) {
  const titleText = r.type === 'court' ? (r.caseNo || '') : (r.title || (r.type === 'other' ? '未知风险类型条目' : ''))
  return (
    <div style={{ display: 'flex', gap: 10, padding: '13px 16px', background: '#fff', borderBottom: `1px solid ${C.border}`, transition: 'background .15s' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#fafcff')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}>
      <input type="checkbox" checked={checked} onChange={onToggle} style={{ marginTop: 4, accentColor: C.primary }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6, wordBreak: 'break-all', cursor: onTitleClick ? 'pointer' : 'default' }} title={titleText} onClick={onTitleClick}>
          <Highlight text={titleText} kw={kw} />
        </div>
        {r.type === 'judicial' && (
          <>
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

/* 风险详情抽屉表格单元 */
function DTh({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return <th style={{ border: '1px solid #E5E6EB', padding: '18px 20px', background: '#F7F8FA', color: '#4E5969', fontSize: 17, fontWeight: 600, width: 110, whiteSpace: 'nowrap', verticalAlign: 'middle', textAlign: 'left', ...style }}>{children}</th>
}
function DTd({ children, colSpan, style }: { children?: React.ReactNode; colSpan?: number; style?: React.CSSProperties }) {
  return <td colSpan={colSpan} style={{ border: '1px solid #E5E6EB', padding: '18px 20px', color: '#1D2129', fontSize: 17, lineHeight: 1.6, verticalAlign: 'middle', textAlign: 'left', ...style }}>{children}</td>
}

/* 风险详情抽屉内容：法院公告明细（设计稿 1:1） */
function RiskDetailContent({ r, go }: { r: RiskResult; go: ReturnType<typeof useGo> }) {
  const parties = r.parties || []
  const entities = r.entities || []
  const content = r.content || r.desc || '（暂无详细公告内容）'
  return (
    <div style={{ padding: 24 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: 110 }} /><col /><col style={{ width: 110 }} /><col />
        </colgroup>
        <tbody>
          <tr>
            <DTh>案号</DTh><DTd>{r.caseNo || '-'}</DTd>
            <DTh>公告日期</DTh><DTd>{r.date || '-'}</DTd>
          </tr>
          <tr>
            <DTh>案由</DTh><DTd>{r.cause || '-'}</DTd>
            <DTh>当事人</DTh>
            <DTd>
              {parties.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {parties.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ display: 'inline-flex', padding: '2px 10px', borderRadius: 4, fontSize: 15, fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0, background: p.role === '被告' ? '#FFECE8' : '#E8F3FF', color: p.role === '被告' ? '#F53F3F' : '#165DFF' }}>{p.role}</span>
                      {p.kind === 'person' && (
                        <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#E8F3FF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style={{ color: '#165DFF' }}><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                        </span>
                      )}
                      <a style={{ color: C.primary, cursor: 'pointer', fontWeight: 600 }} onClick={() => (p.kind === 'ent' ? go.ent(p.name) : go.person(p.name))}>{p.name}</a>
                    </div>
                  ))}
                </div>
              ) : entities.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {entities.map((e, i) => <a key={i} style={{ color: C.primary, cursor: 'pointer' }} onClick={() => (e.kind === 'ent' ? go.ent(e.name) : go.person(e.name))}>{e.name}</a>)}
                </div>
              ) : '-'}
            </DTd>
          </tr>
          <tr>
            <DTh>公告类型</DTh><DTd>{r.noticeType || '-'}</DTd>
            <DTh>公告法院</DTh><DTd>{r.court || '-'}</DTd>
          </tr>
          <tr>
            <DTh style={{ verticalAlign: 'top', paddingTop: 24 }}>公告内容</DTh>
            <DTd colSpan={3} style={{ verticalAlign: 'top', padding: '20px 24px', fontSize: 17, lineHeight: 1.85, textAlign: 'justify' }}>{content}</DTd>
          </tr>
        </tbody>
      </table>
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

/* ---------- Font Awesome → 内联 SVG 图标（CDN 不可用，转内联） ---------- */
const FA_PATHS: Record<string, string> = {
  save: 'M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4zm-5 16a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm3-10H5V5h10v4z',
  trash: 'M6 7h12l-1 14H7L6 7zm3-4h6l1 2H8l1-2z',
  plus: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  info: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  caretDown: 'M7 10l5 5 5-5z',
  search: 'M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z',
  fileText: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
  download: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
  user: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5z',
}
function FaIcon({ name, size = 14, color }: { name: string; size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color || 'currentColor'} aria-hidden style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d={FA_PATHS[name] || ''} />
    </svg>
  )
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
  积极: { c: '#166534', bg: '#86EFAC' },
  中立: { c: '#1e40af', bg: '#BFDBFE' },
  消极: { c: '#991b1b', bg: '#fecaca' },
  未知: { c: '#555', bg: '#e5e7eb' },
}
const PUB_CAT_COLOR: Record<string, { c: string; bg: string }> = {
  科技: { c: '#fff', bg: '#84CC16' },
}
const PUB_AUTH_COLOR: Record<string, { c: string; bg: string }> = {
  'A级': { c: '#fff', bg: '#3B82F6' },
  'B级': { c: '#fff', bg: '#6366F1' },
  'C级': { c: '#fff', bg: '#9CA3AF' },
}
function PubCard({ item, kw, onOpen }: { item: PublicOpinion; kw: string; onOpen?: () => void }) {
  const sc = PUB_SENT_COLOR[item.sentiment]
  const cat = PUB_CAT_COLOR[item.category] || { c: C.sub, bg: '#d1d5db' }
  const auth = PUB_AUTH_COLOR[item.authority] || { c: '#fff', bg: '#9CA3AF' }
  return (
    <div onClick={onOpen} style={{ borderBottom: `1px solid ${C.border}`, padding: '12px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, cursor: 'pointer', transition: 'background .2s' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#f7f9fc')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, color: C.text }} title={item.title}>{hl(item.title, kw)}</span>
          <span style={{ fontSize: 12, color: sc.c, background: sc.bg, padding: '1px 8px', borderRadius: 4, flexShrink: 0 }}>{item.sentiment}</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <span style={{ fontSize: 12, color: cat.c, background: cat.bg, padding: '1px 6px', borderRadius: 4 }}>{item.category}</span>
          <span style={{ fontSize: 12, color: auth.c, background: auth.bg, padding: '1px 6px', borderRadius: 4 }}>{item.authority}</span>
          <span style={{ fontSize: 12, color: C.sub }}>{item.topics.map((t) => `#${t}`).join(' ')}</span>
        </div>
      </div>
      <span style={{ fontSize: 13, color: C.ph, flexShrink: 0, paddingTop: 2, whiteSpace: 'nowrap' }}>{item.date.slice(5)}</span>
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
          {item.isNew && <span style={{ fontSize: 12, color: '#166534', background: '#BBF7D0', padding: '1px 6px', borderRadius: 4, flexShrink: 0 }}>新</span>}
          <span style={{ color: C.text, fontWeight: 600, fontSize: 16, cursor: 'pointer' }} title={item.title}>{hl(item.title, kw)}</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 13, color: C.sub }}>
          <span style={{ color: '#5c3d00', background: '#FBBF24', padding: '1px 8px', borderRadius: 4 }}>{item.category}</span>
          <span style={{ color: '#1e3a8a', background: '#93C5FD', padding: '1px 8px', borderRadius: 4 }}>{item.reportType}</span>
          {(item.features || []).map((f) => (
            <span key={f} style={{ color: '#1e3a8a', background: '#93C5FD', padding: '1px 8px', borderRadius: 4 }}>{f}</span>
          ))}
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['basic', 'org', 'tech', 'capital', 'risk', 'datasource']))
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [sortBy, setSortBy] = useState('default')
  const [page, setPage] = useState(1)
  const [quickIdx, setQuickIdx] = useState(0)
  const [showTop, setShowTop] = useState(false)
  const [scope, setScope] = useState('')
  // 企业 AI 模块：初始化不加载结果，点击查询后才出现
  const [loaded, setLoaded] = useState(false)
  // 企业 AI 卡片操作：触达抽屉 / 营销主题抽屉 / 轻量 toast 提示
  const [contact, setContact] = useState<{ company: string; contacts: any[] } | null>(null)
  const [market, setMarket] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const showToast = (msg: string) => { setToast(msg); window.setTimeout(() => setToast(null), 2000) }

  // 吸顶：顶部模块导航吸到 PageShell 标题下方
  const headerRef = useRef<HTMLDivElement>(null)
  const [headH, setHeadH] = useState(80)
  const [headH2, setHeadH2] = useState(56)
  const measureHeader = () => { if (headerRef.current) setHeadH(headerRef.current.offsetHeight) }
  useEffect(() => { measureHeader(); window.addEventListener('resize', measureHeader); return () => window.removeEventListener('resize', measureHeader) }, [])
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
  // 高级搜索（条件组合构造器）
  const [bizAdvOuter, setBizAdvOuter] = useState<'全部' | '任一'>('全部')
  const [bizAdvOuterConds, setBizAdvOuterConds] = useState<{ field: string; op: string; value: string }[]>([
    { field: '企业名称', op: '包含', value: '' },
    { field: '法人代表', op: '不包含', value: '' },
  ])
  const [bizAdvInner, setBizAdvInner] = useState<'任一' | '全部'>('任一')
  const [bizAdvInnerConds, setBizAdvInnerConds] = useState<{ field: string; op: string }[]>([
    { field: '进出口信息', op: '请选择' },
    { field: '动产抵押', op: '请选择' },
  ])
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
  const [riskDetail, setRiskDetail] = useState<RiskResult | null>(null) // 点击风险标题打开的法院公告详情

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
  const [pubDetail, setPubDetail] = useState<PublicOpinion | null>(null)
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
  const accent = C.primary

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
      <div ref={headerRef}>
        <PageShell title="全维搜索" subtitle="基于集团、品牌、投资机构、企业、产品等多维度数据，全方位定位目标客户" crumb="数字营销 / 潜客挖掘 / 全维搜索" legend={false} />
      </div>

      {/* 顶部模块导航（吸顶到标题下） */}
      <div style={{ display: 'flex', gap: 4, borderBottom: `2px solid ${C.border}`, marginBottom: 12, position: 'sticky', top: 56 + headH, zIndex: 30, background: '#fff' }}>
        {MODULES.map((m) => {
          const navActive = activeModule === m.key
          const navColor = C.primary
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
              <button onClick={() => { setPage(1); setLoaded(true); setFilterPanelOpen(false) }} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 4, padding: '8px 18px', cursor: 'pointer', fontSize: 14 }}>查询</button>
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
              <button onClick={toggleAllFilters} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: C.primary, fontSize: 13, cursor: 'pointer', flexShrink: 0, border: `1px solid ${C.primary}`, borderRadius: 4, padding: '5px 14px', background: '#fff', fontWeight: 600 }}>{filterPanelOpen ? '收起筛选 ▲' : '展开筛选 ▼'}</button>
            </div>
            {filterPanelOpen && <FilterPanel checked={checked} toggle={toggle} expandedGroups={expandedGroups} toggleGroup={toggleGroup} />}
          </div>

          {loaded ? (
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
                  <option value="scoreDesc">企业健康度从高到低</option>
                  <option value="scoreAsc">企业健康度从低到高</option>
                  <option value="regNew">注册时间最新</option>
                </select>
              </div>

              {/* 企业列表 */}
              {viewMode === 'card' ? list.map((c, i) => <EntCardView key={i} card={c} go={go} onContact={(n) => setContact({ company: n, contacts: SAMPLE_CONTACTS })} onMarket={(n) => setMarket(n)} onMonitor={() => showToast('添加成功')} />)
                : (
                  <div className="overflow-x-auto"><table style={{ width: '100%', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#fafafa', color: C.sub }}>
                        <th style={{ borderBottom: `1px solid ${C.border}`, padding: '8px 10px', textAlign: 'left' }}>企业名称</th>
                        <th style={{ borderBottom: `1px solid ${C.border}`, padding: '8px 10px', textAlign: 'left' }}>状态</th>
                        <th style={{ borderBottom: `1px solid ${C.border}`, padding: '8px 10px', textAlign: 'left' }}>企业健康度</th>
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
          ) : (
            <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: '48px 16px', textAlign: 'center', color: C.sub, fontSize: 14 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              请输入关键词并点击「查询」，开始全维搜索
            </div>
          )}
        </>
      )}

      {/* ============ 人员 模块 ============ */}
      {activeModule === 'person' && (
        <>
          {/* 搜索操作栏：输入框 + 黄色查询 + 批量/高级搜索 + 省市/行业下拉 */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="请输入自然人姓名，检索同名人员主体" style={{ flex: 1, minWidth: 220, maxWidth: 420, border: `1px solid ${C.border}`, borderRadius: 4, padding: '7px 10px' }} />
              <button onClick={() => setPage(1)} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 4, padding: '8px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>查询</button>
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
              <button onClick={() => { setBizPage(1); setActiveBizFilter(null) }} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 4, padding: '8px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>查询</button>
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
                  <div style={{ fontSize: 13, color: C.text }}>
                    {/* 查询条件标题 + 保存 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ fontWeight: 600 }}>查询条件</div>
                      <button onClick={() => setBizSearchPanel(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FFC107', color: '#5c3d00', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>
                        <FaIcon name="save" size={13} /> 保存查询条件
                      </button>
                    </div>

                    {/* 关键词行 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <span style={{ width: 64, color: C.sub, flexShrink: 0 }}>关键词</span>
                      <input placeholder="请输入主营业务/产品关键词，最多5个" style={{ width: 360, border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px', boxSizing: 'border-box' }} />
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px dashed #e8e8e8', margin: '12px 0' }} />

                    {/* 外层条件组 */}
                    <div style={{ marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ color: C.sub }}>满足下列</span>
                        <select value={bizAdvOuter} onChange={(e) => setBizAdvOuter(e.target.value as '全部' | '任一')} style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '5px 8px', color: C.text }}>
                          <option>全部</option><option>任一</option>
                        </select>
                        <span style={{ color: C.sub }}>条件</span>
                        <FaIcon name="info" size={13} color="#bbb" />
                      </div>
                      <div style={{ paddingLeft: 24, borderLeft: `1px solid ${C.border}` }}>
                        {bizAdvOuterConds.map((c, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0' }}>
                            <select value={c.field} onChange={(e) => setBizAdvOuterConds((s) => s.map((x, j) => j === i ? { ...x, field: e.target.value } : x))} style={{ width: 120, border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px', color: C.text }}>
                              {['企业名称', '法人代表', '经营范围', '注册资本', '成立日期', '注册地址'].map((o) => <option key={o}>{o}</option>)}
                            </select>
                            <select value={c.op} onChange={(e) => setBizAdvOuterConds((s) => s.map((x, j) => j === i ? { ...x, op: e.target.value } : x))} style={{ width: 100, border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px', color: C.text }}>
                              {['包含', '不包含'].map((o) => <option key={o}>{o}</option>)}
                            </select>
                            <input value={c.value} onChange={(e) => setBizAdvOuterConds((s) => s.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} placeholder="请输入关键字" style={{ width: 220, border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px' }} />
                            <button onClick={() => setBizAdvOuterConds((s) => s.filter((_, j) => j !== i))} style={{ color: '#bbb', background: 'none', border: 'none', cursor: 'pointer' }}><FaIcon name="trash" size={15} /></button>
                          </div>
                        ))}

                        {/* 内层条件组 */}
                        <div style={{ margin: '16px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <span style={{ color: C.sub }}>满足下列</span>
                            <select value={bizAdvInner} onChange={(e) => setBizAdvInner(e.target.value as '任一' | '全部')} style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '5px 8px', color: C.text }}>
                              <option>任一</option><option>全部</option>
                            </select>
                            <span style={{ color: C.sub }}>条件</span>
                          </div>
                          <div style={{ paddingLeft: 24, borderLeft: `1px solid ${C.border}` }}>
                            {bizAdvInnerConds.map((c, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0' }}>
                                <select value={c.field} onChange={(e) => setBizAdvInnerConds((s) => s.map((x, j) => j === i ? { ...x, field: e.target.value } : x))} style={{ width: 120, border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px', color: C.text }}>
                                  {['进出口信息', '动产抵押', '股权冻结', '欠税信息', '行政处罚', '司法案件'].map((o) => <option key={o}>{o}</option>)}
                                </select>
                                <select value={c.op} onChange={(e) => setBizAdvInnerConds((s) => s.map((x, j) => j === i ? { ...x, op: e.target.value } : x))} style={{ width: 140, border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 8px', color: C.text }}>
                                  {['请选择', '有', '无'].map((o) => <option key={o}>{o}</option>)}
                                </select>
                                <button onClick={() => setBizAdvInnerConds((s) => s.filter((_, j) => j !== i))} style={{ color: '#bbb', background: 'none', border: 'none', cursor: 'pointer' }}><FaIcon name="trash" size={15} /></button>
                              </div>
                            ))}
                            <button onClick={() => setBizAdvInnerConds((s) => [...s, { field: '进出口信息', op: '请选择' }])} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 4, padding: '5px 12px', color: C.sub, cursor: 'pointer', marginTop: 4 }}>
                              <FaIcon name="plus" size={12} /> 添加条件 <FaIcon name="caretDown" size={12} />
                            </button>
                          </div>
                        </div>

                        <button onClick={() => setBizAdvOuterConds((s) => [...s, { field: '企业名称', op: '包含', value: '' }])} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 4, padding: '5px 12px', color: C.sub, cursor: 'pointer', marginTop: 4 }}>
                          <FaIcon name="plus" size={12} /> 添加条件 <FaIcon name="caretDown" size={12} />
                        </button>
                      </div>
                    </div>

                    {/* 底部按钮 */}
                    <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                      <button onClick={() => setBizSearchPanel(null)} style={{ background: '#FFC107', color: '#5c3d00', border: 'none', borderRadius: 4, padding: '7px 24px', cursor: 'pointer', fontWeight: 600 }}>查询</button>
                      <button onClick={() => { setBizAdvOuterConds([{ field: '企业名称', op: '包含', value: '' }, { field: '法人代表', op: '不包含', value: '' }]); setBizAdvInnerConds([{ field: '进出口信息', op: '请选择' }, { field: '动产抵押', op: '请选择' }]); setBizAdvOuter('全部'); setBizAdvInner('任一') }} style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.sub, borderRadius: 4, padding: '7px 24px', cursor: 'pointer' }}>清空</button>
                    </div>
                  </div>
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
              <button onClick={doRiskSearch} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 4, padding: '8px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>查询</button>
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
                    onToggle={() => setRiskChecked((s) => ({ ...s, [idx]: !s[idx] }))} go={go}
                    onTitleClick={() => setRiskDetail(r)} />
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
              <button onClick={doPubSearch} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 4, padding: '8px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>查询</button>
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
                      <button onClick={() => { setPubSearchPanel(null); doPubSearch() }} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 4, padding: '5px 16px', cursor: 'pointer', fontWeight: 600 }}>开始批量检索</button>
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
                      <button onClick={() => { setPubSearchPanel(null); doPubSearch() }} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 4, padding: '5px 16px', cursor: 'pointer', fontWeight: 600 }}>确定检索</button>
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
              {pubFiltered.map((r, i) => <PubCard key={i} item={r} kw={pubKeyword.trim()} onOpen={() => setPubDetail(r)} />)}
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
              <button onClick={doRepSearch} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 4, padding: '8px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>查询</button>
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
                      <button onClick={() => { setRepSearchPanel(null); doRepSearch() }} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 4, padding: '5px 16px', cursor: 'pointer', fontWeight: 600 }}>开始批量检索</button>
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
                      <button onClick={() => { setRepSearchPanel(null); doRepSearch() }} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 4, padding: '5px 16px', cursor: 'pointer', fontWeight: 600 }}>确定检索</button>
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

      {/* 舆情明细（点击舆情条目打开） */}
      <RightDrawer open={!!pubDetail} onClose={() => setPubDetail(null)} title="舆情详情" width={900} level={2}>
        {pubDetail && (() => {
          const dLink = '#165DFF'
          const dsc = { 积极: { bg: '#86EFAC', c: '#166534' }, 中立: { bg: '#dbeafe', c: '#2563eb' }, 消极: { bg: '#fecaca', c: '#991b1b' }, 未知: { bg: '#e5e7eb', c: '#555' } }[pubDetail.sentiment]
          const dCat = pubDetail.category === '科技' ? { bg: '#84CC16', c: '#fff' } : { bg: '#d1d5db', c: C.sub }
          const dAuth = { 'A级': { bg: '#3B82F6', c: '#fff' }, 'B级': { bg: '#6366F1', c: '#fff' }, 'C级': { bg: '#9CA3AF', c: '#fff' } }[pubDetail.authority] || { bg: '#9CA3AF', c: '#fff' }
          const themeWords = ['#查看(26)', '#详情(26)', '#发布(19)', '#华为(17)', '#鸿蒙(17)']
          const relatedOrgs = ['华为技术有限公司', '比亚迪股份有限公司', '阿里巴巴（中国）有限公司', '上海寻梦信息技术有限公司', '北京京东世纪贸易有限公司', '武汉联动设计股份有限公司', '京东物流股份有限公司']
          const relatedPersons = ['余承东', '周杰伦', '冯骥', '曾清林', '古尔曼', '弗里亚尔', '王兴']
          return (
            <div style={{ display: 'flex', gap: 0 }}>
              {/* 左侧详情主体 */}
              <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <h1 style={{ fontSize: 16, fontWeight: 400, color: C.text, margin: 0, flex: 1, minWidth: 280 }}>{pubDetail.title}</h1>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <span style={{ fontSize: 12, color: dsc.c, background: dsc.bg, padding: '2px 8px', borderRadius: 4 }}>{pubDetail.sentiment}</span>
                    <span style={{ fontSize: 12, color: dCat.c, background: dCat.bg, padding: '2px 8px', borderRadius: 4 }}>{pubDetail.category}</span>
                    <span style={{ fontSize: 12, color: dAuth.c, background: dAuth.bg, padding: '2px 8px', borderRadius: 4 }}>{pubDetail.authority}</span>
                  </div>
                </div>

                {/* 标签 + 来源时间 */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, margin: '8px 0' }}>
                  {pubDetail.topics.map((t) => (
                    <span key={t} style={{ fontSize: 12, color: '#2563eb', background: '#eff6ff', border: '1px solid #dbeafe', padding: '1px 6px', borderRadius: 4 }}>{t}</span>
                  ))}
                  <span style={{ fontSize: 13, color: C.ph }}>{(pubDetail.date || '') + (pubDetail.source ? '  ' + pubDetail.source : '')}</span>
                  <span style={{ marginLeft: 'auto', color: dLink, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                    <FaIcon name="caretDown" size={12} color={dLink} />相关组织/人物/企业
                  </span>
                </div>

                {/* 主题词栏 */}
                <div style={{ background: '#f8fafc', padding: 8, borderRadius: 4, margin: '12px 0', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: C.ph, fontSize: 13 }}>主题词：</span>
                  {themeWords.map((w) => (
                    <span key={w} style={{ color: dLink, fontSize: 13, cursor: 'pointer' }}>{w}</span>
                  ))}
                </div>

                {/* 查看原文 */}
                <div style={{ margin: '8px 0' }}>
                  <a style={{ color: dLink, fontSize: 13, cursor: 'pointer' }}>查看原文&gt;</a>
                </div>

                {/* 正文 */}
                <div style={{ marginTop: 12, lineHeight: 1.8, fontSize: 14, color: C.text }}>
                  <p style={{ marginBottom: 12 }}>“IT早报”时间，大家好，现在是 2026 年 8 月 21 日星期五，今天的重要科技资讯有：</p>
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 15, fontWeight: 500, margin: '0 0 4px' }}>1. 曝奕境汽车南昌门店活动送仿版 Labubu，品牌总经理<span style={{ color: dLink }}>曾清林</span>发文回应</p>
                    <p style={{ color: C.sub, margin: 0 }}>有网友反映奕境汽车南昌门店活动送出了仿版 Labubu。奕境汽车品牌总经理曾清林 8 月 20 日发文就此事进行了回应，称礼品管控、风险审核这套管理体系没有跟上业务增长的节奏，才造成这次失误，将向公司报告，申请采购一万件正版 Labubu，用于全国门店到店 / 试驾权益。&gt;&gt; 查看详情</p>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 15, fontWeight: 500, margin: '0 0 4px' }}>2. 享界 G9 及鸿蒙智行新品发布会一文汇总：<span style={{ color: '#ef4444' }}>华为</span>首款阔直板惊喜亮相，<span style={{ color: dLink }}>余承东</span>狂甩“四张车牌”</p>
                    <p style={{ color: C.sub, margin: 0 }}>在 8 月 20 日的鸿蒙智行新品发布会上，<span style={{ color: dLink }}>余承东</span>不仅带来了全新硬派 SUV 享界 G9，还预告了智界 RX、享界 V8，并发布了问界 M6 新版本。最令人惊喜的是，全球首款阔直板手机<span style={{ color: dLink }}>华为</span> Pura X View 也一同亮相，首发鸿蒙 HarmonyOS 7 系统。&gt;&gt; 查看详情</p>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 15, fontWeight: 500, margin: '0 0 4px' }}>3. 《黑神话：钟馗》全新 15 分钟游戏实机演示公布，首次展示主角战斗与部分剧情片段</p>
                    <p style={{ color: C.sub, margin: 0 }}>由游戏科学开发的黑神话系列第二部作品《黑神话：钟馗》，8 月 20 日带来全新 15 分钟游戏实机演示，首次展示主角战斗与部分剧情片段。&gt;&gt; 查看详情</p>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 15, fontWeight: 500, margin: '0 0 4px' }}>4. 曝<span style={{ color: dLink }}>周杰伦</span>将代言 vivo 手机，广告片拍摄现场画面曝光</p>
                    <p style={{ color: C.sub, margin: 0 }}>据博主 @周杰伦的床边故事推广大使 分享，<span style={{ color: dLink }}>周杰伦</span>正在给 vivo 手机拍摄广告片。有网友询问<span style={{ color: dLink }}>周杰伦</span>是否会代言 vivo 手机，博主称：“应该是，等官宣。” &gt;&gt; 查看详情</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 500, margin: '0 0 4px' }}>5. 骁龙 8 Elite Gen 6/Pro？高通称将在骁龙峰会推出两款芯片</p>
                  </div>
                </div>
              </div>

              {/* 右侧边栏 */}
              <div style={{ width: 320, borderLeft: `1px solid ${C.border}`, paddingLeft: 16, flexShrink: 0 }}>
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontWeight: 500, paddingBottom: 8, borderBottom: `1px solid ${C.border}`, marginBottom: 12, fontSize: 14 }}>相关企业</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: C.text }}>
                    {relatedOrgs.map((o) => <div key={o}>{o}</div>)}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 4, padding: 12 }}>
                  <h3 style={{ fontWeight: 500, paddingBottom: 8, borderBottom: `1px solid ${C.border}`, marginBottom: 12, fontSize: 14 }}>相关人物</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: C.text }}>
                    {relatedPersons.map((p) => (
                      <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FaIcon name="user" size={14} color="#999" />{p}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </RightDrawer>

      {/* 风险明细（点击风险条目标题打开 · 法院公告详情） */}
      <RightDrawer open={!!riskDetail} onClose={() => setRiskDetail(null)} title="法院公告" width={820} level={2}>
        {riskDetail && <RiskDetailContent r={riskDetail} go={go} />}
      </RightDrawer>

      {/* 企业 AI 卡片 · 触达抽屉（与区域商机一致） */}
      <RightDrawer open={!!contact} onClose={() => setContact(null)} title={contact ? `${contact.company} - 全部联系方式` : ''} width={820} level={2}>
        {contact && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>{contact.company}</div>
            <div style={{ fontWeight: 600, fontSize: 14, margin: '12px 0 8px' }}>全部联系方式</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: C.sub, marginBottom: 10 }}>
              <span>联系类型：<b style={{ color: C.text }}>不限</b></span>
              <span>空号筛选：<b style={{ color: C.text }}>不限</b></span>
              <span>数据来源：<b style={{ color: C.text }}>不限</b></span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#fafafa', color: C.sub }}>
                  <th style={{ border: `1px solid ${C.border}`, padding: '8px 10px', textAlign: 'left', width: 48 }}>序号</th>
                  <th style={{ border: `1px solid ${C.border}`, padding: '8px 10px', textAlign: 'left' }}>联系方式</th>
                  <th style={{ border: `1px solid ${C.border}`, padding: '8px 10px', textAlign: 'left', width: 80 }}>类型</th>
                  <th style={{ border: `1px solid ${C.border}`, padding: '8px 10px', textAlign: 'left' }}>来源</th>
                  <th style={{ border: `1px solid ${C.border}`, padding: '8px 10px', textAlign: 'left', width: 96 }}>空号筛选</th>
                </tr>
              </thead>
              <tbody>
                {(contact.contacts ?? []).map((c) => (
                  <tr key={c.seq}>
                    <td style={{ border: `1px solid ${C.border}`, padding: '8px 10px' }}>{c.seq}</td>
                    <td style={{ border: `1px solid ${C.border}`, padding: '8px 10px' }}>{c.contact}</td>
                    <td style={{ border: `1px solid ${C.border}`, padding: '8px 10px' }}>{c.type}</td>
                    <td style={{ border: `1px solid ${C.border}`, padding: '8px 10px' }}>{c.source}</td>
                    <td style={{ border: `1px solid ${C.border}`, padding: '8px 10px' }}>{c.empty}</td>
                  </tr>
                ))}
                {(contact.contacts ?? []).length === 0 && (
                  <tr><td colSpan={5} style={{ border: `1px solid ${C.border}`, padding: 16, textAlign: 'center', color: C.ph, fontSize: 13 }}>暂无联系方式示例数据</td></tr>
                )}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 12, color: C.sub }}>
              <span>共 {contact.contacts?.length ?? 0} 条</span>
              <button style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>{'<'}</button>
              <button style={{ background: C.primary, color: '#fff', border: `1px solid ${C.primary}`, borderRadius: 4, padding: '2px 8px' }}>1</button>
              <button style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>2</button>
              <button style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>3</button>
              <button style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>{'>'}</button>
            </div>
            <div style={{ marginTop: 16, fontWeight: 600, fontSize: 14 }}>存客触达</div>
            <div style={{ fontSize: 13, color: C.sub, marginTop: 6 }}>您的存客中暂未发现与该企业的关联关系。可<span style={{ color: C.primary, cursor: 'pointer' }} onClick={() => showToast('请上传更多存客名单')}>上传更多存客名单</span>，查看更多触达路径。</div>
          </div>
        )}
      </RightDrawer>

      {/* 企业 AI 卡片 · 营销主题抽屉 */}
      <RightDrawer open={!!market} onClose={() => setMarket(null)} title={market ? `${market} - 选择营销主题` : ''} width={520} level={2}>
        {market && (
          <div>
            <div style={{ fontSize: 13, color: C.sub, marginBottom: 12 }}>请选择要执行的营销主题，系统将据此创建营销任务。</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {MARKET_TOPICS.map((t) => (
                <button key={t} onClick={() => { setMarket(null); showToast(`已添加营销任务：${t}`) }} style={{ textAlign: 'left', border: `1px solid ${C.border}`, borderRadius: 6, padding: '10px 14px', fontSize: 14, color: C.text, cursor: 'pointer', background: '#fff' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </RightDrawer>

      {/* 轻量 toast 提示 */}
      {toast && (
        <div style={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,.78)', color: '#fff', padding: '8px 18px', borderRadius: 6, fontSize: 14, zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,.2)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
