// 企业风控 · 黑名单（fk-blacklist）· 1:1 复刻「黑名单」截图
// 数据：本地样例 fkBlacklist.json（橘 Sam）
import { useState, type ReactNode } from 'react'
import { EpPage, EpCard, EpTag, EpBtn, DataTable, useSample, Sam } from '../../epCommon'
import type { Row, Column } from '../../../../components/ui'

const seed = {
  stats: { blacklist: '30,000+', history: 23827 },
  filters: {
    time: ['今日', '近1个月', '近3个月', '近6个月', '近1年', '自定义'],
    blacklistType: ['重点行业黑名单', '采购黑名单', '信用惩戒', '其他'],
    basic: ['所在行业', '选择地区', '成立时间', '注册资本'],
  },
  rows: [
    {
      id: '1', name: '南京创盈达电气科技有限公司', type: '合作不良行为', listName: '国央企供应商不良行为黑名单', basis: '-',
      department: '国网江苏省电力有限公司', level: '企业', includeDate: '2026-08-10', removeDate: '-', result: '列入黑名单',
      source: '国网电子商务平台', status: '存续', industry: '批发和零售业',
    },
    {
      id: '2', name: '深圳市予能信息技术有限公司', type: '合作不良行为', listName: '国央企供应商不良行为黑名单', basis: '-',
      department: '国网江苏省电力有限公司', level: '企业', includeDate: '2026-08-08', removeDate: '-', result: '列入黑名单',
      source: '国网电子商务平台', status: '存续', industry: '信息传输、软件和信息技术服务业',
    },
    {
      id: '3', name: '江西中启建设工程有限公司', type: '政府合作', listName: '政府采购黑名单', basis: '《中华人民共和国政府采购法》第七十七条',
      department: '闽侯县财政局', level: '县级', includeDate: '2026-07-22', removeDate: '-', result: '禁止参加政府采购活动',
      source: '政府采购网', status: '存续', industry: '建筑业',
    },
    {
      id: '4', name: '屏边县交通建设投资开发有限公司', type: '政府合作', listName: '政府采购黑名单', basis: '《中华人民共和国政府采购法实施条例》',
      department: '屏边苗族自治县财政局', level: '县级', includeDate: '2026-07-15', removeDate: '-', result: '禁止参加政府采购活动',
      source: '政府采购网', status: '存续', industry: '交通运输、仓储和邮政业',
    },
    {
      id: '5', name: '汇恒成（吉林）能源科技有限公司', type: '假冒国企', listName: '假冒国企名单', basis: '来源国央企公告认定',
      department: '国央企认定', level: '其他', includeDate: '2026-06-30', removeDate: '-', result: '公示曝光',
      source: '国务院国资委', status: '存续', industry: '科学研究和技术服务业',
    },
    {
      id: '6', name: '华云信（吉林）科技发展有限公司', type: '假冒国企', listName: '假冒国企名单', basis: '来源国央企公告认定',
      department: '国央企认定', level: '其他', includeDate: '2026-06-28', removeDate: '-', result: '公示曝光',
      source: '国务院国资委', status: '存续', industry: '科学研究和技术服务业',
    },
    {
      id: '7', name: '金穗国宏（北京）科技产业有限公司', type: '假冒国企', listName: '假冒国企名单', basis: '来源国央企公告认定',
      department: '国央企认定', level: '其他', includeDate: '2026-06-25', removeDate: '-', result: '公示曝光',
      source: '国务院国资委', status: '存续', industry: '科学研究和技术服务业',
    },
    {
      id: '8', name: '翁源县忠光建材有限公司', type: '交通运输', listName: '交通运输行业黑名单', basis: '《关于对严重违法失信超限超载运输车辆实施联合惩戒的通知》',
      department: '广东省交通运输厅', level: '省级', includeDate: '2026-05-18', removeDate: '-', result: '限制从事交通运输业务',
      source: '交通运输部', status: '存续', industry: '交通运输、仓储和邮政业',
    },
    {
      id: '9', name: '广东边源建筑工程有限公司', type: '交通运输', listName: '交通运输行业黑名单', basis: '《关于对严重违法失信超限超载运输车辆实施联合惩戒的通知》',
      department: '广东省交通运输厅', level: '省级', includeDate: '2026-05-16', removeDate: '-', result: '限制从事交通运输业务',
      source: '交通运输部', status: '存续', industry: '建筑业',
    },
  ],
  pagination: { total: 30000, pageSize: 10, current: 1 },
}

type Data = typeof seed

export default function FkBlacklist({ params }: { params: URLSearchParams }) {
  const [data] = useSample<Data>('fkBlacklist.json', seed)
  const [search, setSearch] = useState('')
  const [time, setTime] = useState('')
  const [types, setTypes] = useState<string[]>([])
  const [basics, setBasics] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (v: string, list: string[], set: (s: string[]) => void) => {
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
  }

  const cols: Column[] = [
    { key: 'name', label: '企业名称', width: 280, render: (r: Row) => <NameCell name={String(r.name)} /> },
    { key: 'type', label: '黑名单类型', width: 120 },
    { key: 'listName', label: '黑名单名称', width: 210 },
    { key: 'basis', label: '黑名单认定依据', width: 280 },
    { key: 'department', label: '认定部门', width: 160 },
    { key: 'level', label: '认定等级', width: 120, render: (r: Row) => <LevelCell level={String(r.level)} /> },
    { key: 'includeDate', label: '列入时间', width: 110 },
    { key: 'removeDate', label: '移出日期', width: 110 },
    { key: 'result', label: '处罚结果', width: 200 },
    { key: 'source', label: '数据来源', width: 100 },
    { key: 'status', label: '企业状态', width: 90 },
    { key: 'industry', label: '企业行业', width: 160 },
  ]

  return (
    <EpPage
      title="黑名单"
      subtitle="黑名单排查 / 历史黑名单 / 来源说明"
      crumb="风控中心 / 黑名单"
      actions={<Sam value="fkBlacklist.json" />}
    >
      {/* 搜索 + 快捷入口 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="请输入企业名称"
            style={{ flex: 1, maxWidth: 420, padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13 }}
          />
          <EpBtn variant="primary" size="sm" onClick={() => alert('搜索黑名单')} style={{ background: '#F59E0B', borderColor: '#F59E0B', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <IconSearch /> 搜索
          </EpBtn>
        </div>
        <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
          <a style={{ color: '#2563EB', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => alert('批量排查黑名单')}>
            <IconBatch /> 批量排查黑名单 &gt;
          </a>
          <a style={{ color: '#2563EB', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => alert('黑名单来源说明')}>
            <IconDoc /> 黑名单来源说明
          </a>
        </div>
      </div>

      {/* 筛选区 */}
      <EpCard>
        <FilterRow label="列入时间">
          {data.filters.time.map((t) => (
            <Radio key={t} checked={time === t} onClick={() => setTime(time === t ? '' : t)}>{t}</Radio>
          ))}
        </FilterRow>
        <FilterRow label="黑名单类型">
          {data.filters.blacklistType.map((t) => (
            <Checkbox key={t} checked={types.includes(t)} onClick={() => toggle(t, types, setTypes)}>{t}</Checkbox>
          ))}
        </FilterRow>
        <FilterRow label="基本筛选">
          {data.filters.basic.map((b) => (
            <Checkbox key={b} checked={basics.includes(b)} onClick={() => toggle(b, basics, setBasics)}>{b}</Checkbox>
          ))}
        </FilterRow>
      </EpCard>

      {/* 统计 + 工具 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '16px 0 12px' }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'baseline' }}>
          <div style={{ fontSize: 14, color: '#0F172A' }}>
            黑名单 <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: 18 }}>{data.stats.blacklist}</span>
          </div>
          <div style={{ fontSize: 13, color: '#64748B' }}>
            历史黑名单 {data.stats.history.toLocaleString()}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <EpBtn variant="default" size="sm" onClick={() => alert('设置显示字段')}>
            <IconSetting /> 设置字段（12/12）
          </EpBtn>
          <EpBtn variant="default" size="sm" onClick={() => alert('导出列表')}>
            <IconExport /> 导出列表
          </EpBtn>
        </div>
      </div>

      {/* 表格 */}
      <EpCard pad={false}>
        <DataTable
          columns={cols}
          rows={data.rows as unknown as Row[]}
          selectable
          selected={selected}
          onSelectChange={setSelected}
          pager
          defaultPageSize={10}
          empty="暂无黑名单数据"
        />
      </EpCard>
    </EpPage>
  )
}

function NameCell({ name }: { name: string }) {
  return (
    <span style={{ fontWeight: 500, color: '#0F172A' }}>
      <span style={{ color: '#2563EB' }}>{name.slice(0, 1)}</span>
      {name.slice(1)}
    </span>
  )
}

function LevelCell({ level }: { level: string }) {
  const color =
    level === '省级' ? '#D97706' :
    level === '县级' ? '#2563EB' :
    level === '企业' ? '#0F766E' : '#64748B'
  return <span style={{ color, fontWeight: 600 }}>{level}</span>
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
      <span style={{ fontSize: 13, color: '#0F172A', fontWeight: 500, minWidth: 70 }}>{label}</span>
      {children}
    </div>
  )
}

function Radio({ children, checked, onClick }: { children: ReactNode; checked: boolean; onClick: () => void }) {
  return (
    <label onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: '#475569' }}>
      <span style={{
        width: 14, height: 14, borderRadius: '50%', border: '1px solid ' + (checked ? '#2563EB' : '#CBD5E1'),
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB' }} />}
      </span>
      <span>{children}</span>
    </label>
  )
}

function Checkbox({ children, checked, onClick }: { children: ReactNode; checked: boolean; onClick: () => void }) {
  return (
    <label onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: '#475569' }}>
      <span style={{
        width: 14, height: 14, borderRadius: 3, border: '1px solid ' + (checked ? '#2563EB' : '#CBD5E1'),
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: checked ? '#2563EB' : '#fff',
      }}>
        {checked && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <span>{children}</span>
    </label>
  )
}

const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

const IconBatch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

const IconDoc = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
)

const IconSetting = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

const IconExport = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)
