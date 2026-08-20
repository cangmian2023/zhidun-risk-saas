// 风控中心 · 监控列表（ep:fk-monitor-list）· 1:1 复刻「启信慧眼 - 监控列表」截图
// 布局：顶部标题栏 → 两行筛选条 → 操作条 → 表格 → 分页
import { useState } from 'react'
import { Sam } from '../../../SourceTag'
import { usePageNav } from '../../../pageNav'
import { AddMonitorDrawer } from '../components/AddMonitorDrawer'

type Avatar =
  | { kind: 'logo' }        // 抖音黑色logo方块
  | { kind: 'wave' }        // 蓝色波浪符（抖音视界等）
  | { kind: 'letter'; letter: string; color: string; bg: string }
  | { kind: 'building' }

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
  avatar: Avatar
}

const COMPANIES: Company[] = [
  { id: '1', name: '抖音视界有限公司', code: '9111010759963556...', area: '北京石景山区', addr: 1, rule: '启信慧眼默认规则(...', avatar: { kind: 'wave' } },
  { id: '2', name: '抖音有限公司', code: '91110105MA005AE...', area: '北京海淀区', addr: 1, rule: '启信慧眼默认规则(...', avatar: { kind: 'logo' } },
  { id: '3', name: '深圳书读科技有限公司', code: '91440300MA5HMF...', area: '广东深圳南山区', addr: 1, rule: '启信慧眼默认规则(...', avatar: { kind: 'letter', letter: '深', color: '#165DFF', bg: '#E8F3FF' } },
  { id: '4', name: 'Tesla, Inc.', code: '-', area: '德国柏林,美国加利...', addr: 2, rule: '启信慧眼默认规则(...', avatar: { kind: 'letter', letter: 'T', color: '#fff', bg: '#165DFF' } },
  { id: '5', name: 'Siemens', code: '-', area: '德国柏林', addr: 1, rule: '启信慧眼默认规则(...', avatar: { kind: 'letter', letter: 'S', color: '#0FC6C2', bg: '#E8FFFB' } },
  { id: '6', name: 'openai', code: '-', area: '美国加利福尼亚州', addr: 1, rule: '启信慧眼默认规则(...', avatar: { kind: 'letter', letter: 'o', color: '#00B42A', bg: '#E8FFEA' } },
  { id: '7', name: '军蒂粤信智能科技（北京）有限公司', code: '91110108MA01LQP...', area: '北京丰台区', addr: 1, rule: '启信慧眼默认规则(...', avatar: { kind: 'letter', letter: '军', color: '#165DFF', bg: '#E8F3FF' } },
  { id: '8', name: '广州粤信科技有限公司湘西分公司', code: '91433101MA4Q0A...', area: '湖南湘西吉首市', addr: 1, rule: '启信慧眼默认规则(...', avatar: { kind: 'building' } },
  { id: '9', name: '福州粤信知慧科技有限公司', code: '9135010457700179...', area: '福建福州台江区', addr: 1, rule: '启信慧眼默认规则(...', avatar: { kind: 'letter', letter: '福', color: '#165DFF', bg: '#E8F3FF' } },
  { id: '10', name: '北京粤信云鼎科技有限公司', code: '91110113MAEWW...', area: '北京顺义区', addr: 1, rule: '启信慧眼默认规则(...', avatar: { kind: 'letter', letter: '北', color: '#165DFF', bg: '#E8F3FF' } },
  { id: '11', name: '广东安家粤信科技有限公司', code: '91440101MA5D3N...', area: '广东广州天河区', addr: 1, rule: '启信慧眼默认规则(...', avatar: { kind: 'letter', letter: '广', color: '#165DFF', bg: '#E8F3FF' } },
  { id: '12', name: '湘西粤信数慧科技有限公司', code: '91433100MA4RMK...', area: '湖南湘西吉首市', addr: 1, rule: '启信慧眼默认规则(...', avatar: { kind: 'letter', letter: '湘', color: '#165DFF', bg: '#E8F3FF' } },
  { id: '13', name: '深圳粤信数慧科技有限公司', code: '91440300MA5G4GJ...', area: '广东深圳南山区', addr: 1, rule: '启信慧眼默认规则(...', avatar: { kind: 'letter', letter: '深', color: '#165DFF', bg: '#E8F3FF' } },
  { id: '14', name: '粤信数智种植产业发展（金寨）有限公司', code: '91341524MA8PCX5...', area: '安徽六安金寨县', addr: 1, rule: '启信慧眼默认规则(...', avatar: { kind: 'letter', letter: '粤', color: '#165DFF', bg: '#E8F3FF' } },
  { id: '15', name: '广州粤信科技有限公司北京分公司', code: '91110108MA01E7C...', area: '北京海淀区', addr: 1, rule: '启信慧眼默认规则(...', avatar: { kind: 'building' } },
  { id: '16', name: '合瑞云创网络信息（北京）有限公司', code: '91110108MA0050...', area: '北京海淀区', addr: 1, rule: '启信慧眼默认规则(...', avatar: { kind: 'letter', letter: '合', color: '#165DFF', bg: '#E8F3FF' } },
]

// 补充目标表头所需字段（负责人/部门、添加人、添加时间、备注、标签），保持与 fkMonitor.json 一致
const OWNERS = ['银平 / 风控部', '李雪 / 贷中监控组', '夏绪宏 / 数据组', '张利东 / 法务部', '王敏 / 风控部']
const ADDERS = ['银平', '李雪', '夏绪宏', '张利东', '王敏']
const COMPANIES2: Company[] = COMPANIES.map((c, i) => ({
  ...c,
  tag: i % 3 === 0 ? '重点关注' : i % 3 === 1 ? '战略客户' : '常规监控',
  owner: OWNERS[i % OWNERS.length],
  adder: ADDERS[i % ADDERS.length],
  addTime: `2026-0${(i % 8) + 1}-1${i % 9} 1${i % 9}:0${i % 9}`,
  note: i % 4 === 0 ? '需季度复核' : i % 4 === 1 ? '客户主动要求监控' : i % 4 === 2 ? '关联交易排查' : '例行监控',
}))
const QUOTA = 17

export default function FkMonitorList(_: { params?: URLSearchParams } = {}) {
  const { goDetail } = usePageNav()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [addOpen, setAddOpen] = useState(false)
  const allSelected = selected.size === COMPANIES2.length && COMPANIES2.length > 0
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(COMPANIES2.map((c) => c.id)))
  const toggle = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })

  return (
    <>
    <div style={{ padding: '16px 20px 60px', background: '#F5F6F7', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1D2129' }}>监控列表</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#4E5969' }}>
            <BellIcon /> 剩余额度 <span style={{ color: '#F53F3F', fontWeight: 600 }}>{QUOTA}</span>
          </span>
          <button type="button" style={btnDefault}>
            <SettingIcon /> 风险和推送设置
          </button>
          <button type="button" style={btnPrimary} onClick={() => setAddOpen(true)}>
            <PlusIcon /> 添加监控
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 2, border: '1px solid #E5E6EB' }}>
        <div style={{ padding: '14px 16px 6px', borderBottom: '1px solid #F2F3F5' }}>
          <FilterRow label="企业信息">
            <CheckDropdown label="国内/境外" />
            <CheckDropdown label="国家地区" />
            <RadioDropdown label="关联地址" />
            <RadioDropdown label="联系邮箱" />
          </FilterRow>
          <FilterRow label="监控筛选">
            <CheckDropdown label="负责人/部门" />
            <CheckDropdown label="企业标签" />
            <CheckDropdown label="企业分组" />
            <CheckDropdown label="添加人" />
            <CheckDropdown label="监控规则" />
          </FilterRow>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid #F2F3F5' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1D2129', marginRight: 4 }}>
            监控企业数：{COMPANIES2.length}家
          </span>
          <div style={searchBox}>
            <SearchIcon />
            <input
              placeholder="请输入企业名称、编号、简称"
              style={{ border: 'none', outline: 'none', flex: 1, fontSize: 13, background: 'transparent', minWidth: 180 }}
            />
          </div>
          <ActionBtn icon={<EditRuleIcon />} label="监控规则修改" />
          <ActionBtn icon={<TagIcon />} label="设置标签" />
          <ActionBtn icon={<UserIcon />} label="负责人/部门设置" />
          <ActionBtn icon={<TrashIcon />} label="删除" />
          <ActionBtn icon={<ColumnsIcon />} label="展示字段 (10/31)" />
          <ActionBtn icon={<ExportIcon />} label="导出" />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F7F8FA', height: 38 }}>
                <Th w={40}><input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ cursor: 'pointer' }} /></Th>
                <Th al="left" w={260}>企业名称</Th>
                <Th al="left" w={180}>统一社会信用代码</Th>
                <Th al="left" w={170}>地区</Th>
                <Th al="center" w={90}>关联地址</Th>
                <Th al="left" w={200}>监控规则</Th>
                <Th al="center" w={60}>标签</Th>
                <Th al="left" w={170}>负责人/部门</Th>
                <Th al="left" w={120}>添加人</Th>
                <Th al="left" w={150}>添加时间 <SortCaret /></Th>
                <Th al="left" w={120}>备注</Th>
                <Th al="left" w={170}>操作</Th>
              </tr>
            </thead>
            <tbody>
              {COMPANIES2.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #F2F3F5', height: 44 }}>
                  <Td center>
                    <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} style={{ cursor: 'pointer' }} />
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CompanyAvatar c={c} />
                      <a style={lk}>{c.name}</a>
                    </div>
                  </Td>
                  <Td color="#4E5969">{c.code}</Td>
                  <Td color="#4E5969">{c.area}</Td>
                  <Td center><a style={lk}>{c.addr}</a></Td>
                  <Td color="#4E5969">{c.rule}</Td>
                  <Td center><span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: '#F2F3F5', color: '#4E5969', fontSize: 12 }}>{c.tag}</span></Td>
                  <Td color="#4E5969">{c.owner}</Td>
                  <Td color="#4E5969">{c.adder}</Td>
                  <Td color="#4E5969">{c.addTime}</Td>
                  <Td color="#4E5969">{c.note}</Td>
                  <Td>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                      <a style={lk} onClick={() => goDetail('/console/ep/fk-monitor-detail?id=' + c.id)}>查看</a>
                      <span style={{ color: '#E5E6EB' }}>|</span>
                      <a style={{ ...lk, display: 'inline-flex', alignItems: 'center', gap: 2 }}>编辑 <CaretDown /></a>
                      <span style={{ color: '#E5E6EB' }}>|</span>
                      <a style={lk}>移除</a>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '10px 16px', gap: 14, fontSize: 13, color: '#4E5969' }}>
          <span>共 {COMPANIES2.length} 条</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', border: '1px solid #E5E6EB', borderRadius: 2, padding: '3px 8px', color: '#1D2129', fontSize: 12 }}>
            20条/页 <CaretDown />
          </span>
          <Sam value="fkMonitor.json" />
        </div>
      </div>
    </div>
      <AddMonitorDrawer open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  )
}

/* ---------- 表格单元格 ---------- */
function Th({ children, w, al = 'left' }: { children?: React.ReactNode; w?: number; al?: 'left' | 'center' | 'right' }) {
  return <th style={{ padding: '0 10px', fontSize: 13, fontWeight: 500, color: '#4E5969', textAlign: al, width: w, whiteSpace: 'nowrap' }}>{children}</th>
}
function Td({ children, center, color = '#1D2129' }: { children?: React.ReactNode; center?: boolean; color?: string }) {
  return <td style={{ padding: '0 10px', fontSize: 13, color, textAlign: center ? 'center' : 'left' }}>{children}</td>
}
const lk: React.CSSProperties = { color: '#165DFF', cursor: 'pointer', textDecoration: 'none' }

/* ---------- 筛选 ---------- */
function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 10, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#1D2129', minWidth: 60 }}>{label}</span>
      {children}
    </div>
  )
}
const chipBase: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#4E5969',
  cursor: 'pointer', padding: '2px 0', userSelect: 'none',
}
function CheckDropdown({ label }: { label: string }) {
  return (
    <label style={chipBase}>
      <input type="checkbox" style={{ margin: 0, cursor: 'pointer', accentColor: '#165DFF' }} />
      <span>{label}</span>
      <CaretDown />
    </label>
  )
}
function RadioDropdown({ label }: { label: string }) {
  return (
    <label style={chipBase}>
      <input type="radio" name={`r-${label}`} defaultChecked style={{ margin: 0, cursor: 'pointer', accentColor: '#165DFF' }} />
      <span>{label}</span>
      <CaretDown />
    </label>
  )
}

/* ---------- 操作条按钮 ---------- */
function ActionBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button type="button" style={actBtn}>
      <span style={{ fontSize: 14, display: 'inline-flex', alignItems: 'center' }}>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

/* ---------- 公司头像 ---------- */
function CompanyAvatar({ c }: { c: Company }) {
  const size = 22
  const base: React.CSSProperties = {
    width: size, height: size, borderRadius: 4, flexShrink: 0,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 600,
  }
  if (c.avatar.kind === 'building') {
    return (
      <span style={{ ...base, background: '#FFF1F0', color: '#F53F3F', fontSize: 13 }}>
        <BuildingIcon />
      </span>
    )
  }
  if (c.avatar.kind === 'logo') {
    return (
      <span style={{ ...base, background: '#000', color: '#fff', fontSize: 10, overflow: 'hidden' }}>
        <DouyinLogo />
      </span>
    )
  }
  if (c.avatar.kind === 'wave') {
    return (
      <span style={{ ...base, background: 'transparent', color: '#165DFF', fontSize: 14, fontWeight: 700 }}>
        <WaveIcon />
      </span>
    )
  }
  return (
    <span style={{ ...base, background: c.avatar.bg, color: c.avatar.color, fontSize: 11 }}>
      {c.avatar.letter}
    </span>
  )
}

/* ---------- 图标（14~16px inline SVG） ---------- */
const ic = (d: string, size = 14, color = 'currentColor') => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)
const BellIcon = () => ic('M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0')
const SettingIcon = () => ic('M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z')
const PlusIcon = () => ic('M12 5v14 M5 12h14', 14)
const SearchIcon = () => ic('M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35', 14, '#86909C')
const EditRuleIcon = () => ic('M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z', 14, '#4E5969')
const TagIcon = () => ic('M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01', 14, '#4E5969')
const UserIcon = () => ic('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 14, '#4E5969')
const TrashIcon = () => ic('M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', 14, '#4E5969')
const ColumnsIcon = () => ic('M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18', 14, '#4E5969')
const ExportIcon = () => ic('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3', 14, '#4E5969')
const CaretDown = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)
const SortCaret = () => (
  <span style={{ display: 'inline-flex', flexDirection: 'column', verticalAlign: 'middle', marginLeft: 2, lineHeight: 0.6, fontSize: 9, color: '#86909C' }}>
    <span style={{ transform: 'rotate(180deg)' }}>▲</span>
    <span>▼</span>
  </span>
)
const BuildingIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 8v14h20V8L12 2zm-5 9H5v-2h2v2zm0 4H5v-2h2v2zm0 4H5v-2h2v2zm6-8h-2V9h2v2zm0 4h-2v-2h2v2zm0 4h-2v-2h2v2zm6-8h-2v-2h2v2zm0 4h-2v-2h2v2zm0 4h-2v-2h2v2z"/>
  </svg>
)

const WaveIcon = () => (
  <svg width="16" height="14" viewBox="0 0 24 16" fill="none">
    <path d="M2 8c3-4 6 4 10 0s7 4 10 0" stroke="#00C6C2" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M2 4c3-4 6 4 10 0s7 4 10 0" stroke="#165DFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
  </svg>
)

/* 抖音logo简化 */
const DouyinLogo = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
    <path d="M36.4 7.4c-.2 3.2-1.8 6.2-4.4 8.2v14.6c0 7.6-6.2 13.8-13.8 13.8S4.4 37.8 4.4 30.2s6.2-13.8 13.8-13.8c.5 0 .9 0 1.4.1v6.6c-.5-.1-.9-.2-1.4-.2-4 0-7.2 3.3-7.2 7.3s3.2 7.3 7.2 7.3 7.2-3.3 7.2-7.3V6h6.4c.2 0 .4 0 .6.1.2 0 .4.1.6.2v.1c.8.2 1.6.5 2.4 1z" fill="#fff"/>
    <path d="M36.4 7.4h-4c0 4.4-3.6 8-8 8v4c2.4 0 4.6-.9 6.2-2.4 1.2-1.2 2-2.6 2.4-4.2V7.4h3.4z" fill="#FF0050"/>
    <path d="M33 9.5c-.2 2.4-1.4 4.6-3.2 6.2-1.6 1.4-3.6 2.3-5.8 2.5V22c2-.2 4-1 5.6-2.2 2-1.6 3.4-3.8 3.8-6.4l-.4-3.9z" fill="#00F2EA"/>
  </svg>
)

/* ---------- 按钮/输入样式 ---------- */
const btnDefault: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 4,
  border: '1px solid #C9CDD4',
  background: '#fff',
  color: '#1D2129',
  fontSize: 13,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  lineHeight: 1.4,
}
const btnPrimary: React.CSSProperties = {
  padding: '6px 16px',
  borderRadius: 4,
  border: '1px solid #FFAA00',
  background: '#FFAA00',
  color: '#fff',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  lineHeight: 1.4,
}
const actBtn: React.CSSProperties = {
  padding: '5px 10px',
  borderRadius: 4,
  border: '1px solid #E5E6EB',
  background: '#fff',
  color: '#4E5969',
  fontSize: 13,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  lineHeight: 1.4,
}
const searchBox: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '5px 10px',
  border: '1px solid #E5E6EB',
  borderRadius: 4,
  background: '#fff',
  marginRight: 4,
}
