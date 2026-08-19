// 尽调中心 · 批量尽调（jd-batch）· 查企业 / 查人员 Tab
// 数据：本地样例 jdBatch.json（橘 Sam）
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { EpPage, EpCard, EpBtn, useSample, Sam } from '../../epCommon'
import { usePageNav } from '../../../pageNav'

type Option = { label: string; type: string }
type TreeItem = { key: string; label: string; checked: boolean }
type TextBlock = { title: string; desc: string[] }
type TemplateItem = { key: string; name: string; type: string }
type TemplateDetail = {
  name: string
  description: string
  previewTitle: string
  columns: string[]
  rows: string[][]
}
type TemplateLibrary = {
  title: string
  tabs: string[]
  activeTab: string
  list: TemplateItem[]
  selected: string
  templates: Record<string, TemplateDetail>
  actions: { directUse: string; useAndSave: string }
}
type Data = {
  pageTitle: string
  tabs: { key: string; label: string }[]
  activeTab: string
  left: {
    tabs: string[]
    active: string
    searchPlaceholder: string
    selectAll: string
    total: number
    settings: string
    saveTemplate: string
    tree: TreeItem[]
    collapse: string
  }
  uploadCard: { title: string; options: Option[] }
  templateCard: { title: string; desc: string; iconCount: number }
  featured: {
    title: string
    left: TextBlock[]
    center: { title: string; btn: string }
    right: TextBlock[]
  }
  toggle: string
  templateLibrary: TemplateLibrary
}

const seed: Data = {
  pageTitle: '批量尽调',
  tabs: [
    { key: 'enterprise', label: '查企业' },
    { key: 'person', label: '查人员' },
  ],
  activeTab: 'enterprise',
  left: {
    tabs: ['选择指标', '我的模板', '精选模板'],
    active: '选择指标',
    searchPlaceholder: '请输入指标名称',
    selectAll: '全选',
    total: 203,
    settings: '设置',
    saveTemplate: '存为模板',
    tree: [
      { key: 'business', label: '工商信息', checked: true },
      { key: 'qixin', label: '启信指数', checked: false },
      { key: 'relation', label: '企业关系', checked: false },
      { key: 'judicial', label: '司法风险', checked: false },
      { key: 'operation', label: '经营风险', checked: false },
      { key: 'operInfo', label: '经营信息', checked: false },
      { key: 'ip', label: '知识产权', checked: false },
      { key: 'history', label: '历史信息', checked: false },
    ],
    collapse: '收起',
  },
  uploadCard: {
    title: '上传企业',
    options: [
      { label: 'Excel上传', type: 'excel' },
      { label: '输入上传', type: 'input' },
      { label: '存客列表上传', type: 'customer' },
    ],
  },
  templateCard: {
    title: '选择模板',
    desc: '快速使用行业尽调模板',
    iconCount: 4,
  },
  featured: {
    title: '精选模板',
    left: [
      {
        title: '精选模板',
        desc: ['提供多行业尽调模板，可快速应用', '客户画像、监管报送、贷后风控、内审合规'],
      },
      {
        title: '尽调结果筛选',
        desc: ['工商信息、风险信息、企业关系多维筛选', '常用筛选条件可保存，后续尽调筛选可快速复用'],
      },
    ],
    center: { title: '批量尽调', btn: '一键试用' },
    right: [
      {
        title: '多维尽调指标',
        desc: ['工商信息、司法/经营风险、经营信息', '启信慧眼特有指标、启信指数、企业关系等'],
      },
      {
        title: '尽调指标管理',
        desc: ['自定义尽调指标名称，满足不同业务需求', '定义尽调指标时间范围，提高尽调范围精准度'],
      },
    ],
  },
  toggle: '收起示例',
  templateLibrary: {
    title: '模板库',
    tabs: ['我的模板', '精选模板'],
    activeTab: '精选模板',
    list: [
      { key: 'customer', name: '客商画像分析', type: 'featured' },
      { key: 'regulatory', name: '监管报送', type: 'featured' },
      { key: 'postLoan', name: '贷后风险排查', type: 'featured' },
      { key: 'supplier', name: '供应商绩效评估', type: 'featured' },
      { key: 'aml', name: '反洗钱', type: 'featured' },
      { key: 'batchAccess', name: '客户批量准入', type: 'featured' },
      { key: 'internalAudit', name: '内审合规', type: 'featured' },
    ],
    selected: 'postLoan',
    templates: {
      postLoan: {
        name: '贷后风险排查',
        description:
          '工商变更、年报记录、清算组备案日期、实际控制人、受益所有人、工商股东、最新公示股东、立案信息、开庭公告、裁判文书、被执行人、失信被执行人、股权冻结、限制高消费、终本案件、司法协助、司法拍卖、经营异常、严重违法失信、行政处罚、违法违规建设、环保处罚、破产案件、强制清算、清算信息、股权出质、动产抵押、欠税信息、土地抵押、重大税收违法、非正常户、知识产权出质、简易注销、注销备案、股权质押、黑名单',
        previewTitle: '模板预览',
        columns: [
          '公司名称',
          '工商变更',
          '年报记录',
          '清算组备案日期',
          '实际控制人',
          '受益所有人',
          '工商股东',
          '最新公示股东',
          '立案信息',
          '开庭公告',
          '裁判文书',
          '被执行人',
          '失信被执行人',
          '股权冻结',
          '限制高消费',
          '终本案件',
          '司法协助',
          '司法拍卖',
          '经营异常',
          '严重违法失信',
          '行政处罚',
          '违法违规建设',
          '环保处罚',
          '破产案件',
          '强制清算',
          '清算信息',
          '股权出质',
          '动产抵押',
          '欠税信息',
          '土地抵押',
          '重大税收违法',
          '非正常户',
          '知识产权出质',
          '简易注销',
          '注销备案',
          '股权质押',
          '黑名单',
        ],
        rows: [
          [
            'xxx信息技术（北京）股份有限公司',
            '0',
            '0',
            '-',
            'xxx亭',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
          ],
          [
            'xxxx科技有限责任公司',
            '3',
            '0',
            '-',
            'x军',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
          ],
        ],
      },
    },
    actions: {
      directUse: '直接使用',
      useAndSave: '使用并保存',
    },
  },
}

function ExcelIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#10B981" />
      <path d="M16 16h10l6 6v10H16V16z" fill="#fff" fillOpacity="0.2" />
      <path d="M26 16v6h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 25l3 3m0-3l-3 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path d="M30 28h-8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function TemplateIcon({ type }: { type: number }) {
  const colors = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981']
  const c = colors[type % colors.length]
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="6" fill={c} fillOpacity="0.12" />
      {type === 0 && <path d="M8 14h12M14 8v12" stroke={c} strokeWidth="2" strokeLinecap="round" />}
      {type === 1 && <path d="M8 10h12M8 14h8M8 18h5" stroke={c} strokeWidth="2" strokeLinecap="round" />}
      {type === 2 && <path d="M14 7l3 4.5h4.5L19 14l1.5 4.5L14 16l-6.5 2.5L9 14l-2.5-2.5H11L14 7z" stroke={c} strokeWidth="1.5" strokeLinejoin="round" />}
      {type === 3 && <path d="M7 20l5-8 4 5 4-9" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  )
}

function BatchCircleIcon() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
      <circle cx="48" cy="48" r="46" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="2" />
      <rect x="34" y="32" width="28" height="32" rx="4" fill="#3B82F6" fillOpacity="0.12" />
      <path d="M42 40h12M42 48h12M42 56h8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <circle cx="66" cy="64" r="10" fill="#3B82F6" />
      <path d="M62 64h8M66 60v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ChevronDown({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <path d="M3 5l4 4 4-4" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <path d="M5 3l4 4-4 4" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="#94A3B8" strokeWidth="1.5" />
      <path d="M11 11l3 3" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CustomCheckbox({ checked, onChange }: { checked: boolean; onChange?: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        width: 14,
        height: 14,
        border: `1px solid ${checked ? '#2563EB' : '#CBD5E1'}`,
        borderRadius: 2,
        background: checked ? '#2563EB' : '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2 2 4-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 4l8 8M12 4L4 12" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TemplateLibraryModal({
  lib,
  onClose,
  onUse,
}: {
  lib: TemplateLibrary
  onClose: () => void
  onUse: (key: string, save: boolean) => void
}) {
  const [tab, setTab] = useState(lib.activeTab)
  const [selected, setSelected] = useState(lib.selected)
  const detail = lib.templates[selected] || Object.values(lib.templates)[0]

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 960,
          maxWidth: '92vw',
          height: 620,
          maxHeight: '90vh',
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <div style={{ fontSize: 17, fontWeight: 700, color: '#0F172A' }}>{lib.title}</div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex' }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left nav */}
          <div
            style={{
              width: 200,
              flexShrink: 0,
              borderRight: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {lib.list.map((item) => (
              <button
                key={item.key}
                onClick={() => setSelected(item.key)}
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  borderLeft: `3px solid ${selected === item.key ? '#2563EB' : 'transparent'}`,
                  background: selected === item.key ? '#EFF6FF' : '#fff',
                  color: selected === item.key ? '#2563EB' : '#334155',
                  fontSize: 14,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Right content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', paddingLeft: 20 }}>
              {lib.tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: '12px 0',
                    marginRight: 28,
                    border: 'none',
                    borderBottom: `2px solid ${tab === t ? '#2563EB' : 'transparent'}`,
                    background: 'transparent',
                    color: tab === t ? '#2563EB' : '#475569',
                    fontSize: 14,
                    fontWeight: tab === t ? 600 : 400,
                    cursor: 'pointer',
                    marginBottom: -1,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#0F172A',
                  marginBottom: 10,
                  paddingLeft: 10,
                  borderLeft: '3px solid #2563EB',
                }}
              >
                {detail.name}
              </div>
              <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, marginBottom: 20 }}>{detail.description}</div>

              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#0F172A',
                  marginBottom: 12,
                  paddingLeft: 10,
                  borderLeft: '3px solid #2563EB',
                }}
              >
                {detail.previewTitle}
              </div>

              <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ borderCollapse: 'collapse', minWidth: 1200, fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        {detail.columns.map((col, idx) => (
                          <th
                            key={idx}
                            style={{
                              padding: '10px 12px',
                              borderBottom: '1px solid #E2E8F0',
                              borderRight: '1px solid #E2E8F0',
                              color: '#475569',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              textAlign: 'left',
                            }}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {detail.rows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              style={{
                                padding: '10px 12px',
                                borderBottom: '1px solid #E2E8F0',
                                borderRight: '1px solid #E2E8F0',
                                color: '#0F172A',
                                whiteSpace: cIdx === 0 ? 'normal' : 'nowrap',
                                maxWidth: cIdx === 0 ? 220 : undefined,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 12,
            padding: '14px 20px',
            borderTop: '1px solid #E2E8F0',
          }}
        >
          <button
            onClick={() => onUse(selected, false)}
            style={{
              padding: '8px 18px',
              borderRadius: 6,
              border: '1px solid #CBD5E1',
              background: '#fff',
              color: '#475569',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {lib.actions.directUse}
          </button>
          <button
            onClick={() => onUse(selected, true)}
            style={{
              padding: '8px 18px',
              borderRadius: 6,
              border: 'none',
              background: '#F59E0B',
              color: '#fff',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {lib.actions.useAndSave}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function JdBatch({ params }: { params: URLSearchParams }) {
  const [data] = useSample<Data>('jdBatch.json', seed)
  const { goDetail } = usePageNav()
  const [tab, setTab] = useState(data.activeTab)
  const [kw, setKw] = useState('')
  const [checked, setChecked] = useState<Set<string>>(() => new Set(data.left.tree.filter((t) => t.checked).map((t) => t.key)))
  const [leftTab, setLeftTab] = useState(data.left.active)
  const [templateOpen, setTemplateOpen] = useState(false)

  const openUpload = () => goDetail('/console/ep/jd-batch-result', { upload: '1' })
  const openTemplate = () => setTemplateOpen(true)

  const filteredTree = data.left.tree.filter((t) => t.label.includes(kw.trim()))

  const toggleOne = (key: string) => {
    const next = new Set(checked)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setChecked(next)
  }

  const toggleAll = () => {
    if (checked.size === data.left.tree.length) setChecked(new Set())
    else setChecked(new Set(data.left.tree.map((t) => t.key)))
  }

  const handleLeftTab = (lt: string) => {
    if (lt === '我的模板' || lt === '精选模板') {
      setTemplateOpen(true)
    }
    setLeftTab(lt)
  }

  return (
    <EpPage title={data.pageTitle} actions={<Sam value="jdBatch.json" />}>
      {/* 顶部 Tab */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: 16 }}>
        {data.tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '10px 0',
              marginRight: 28,
              border: 'none',
              borderBottom: `2px solid ${tab === t.key ? '#2563EB' : 'transparent'}`,
              background: 'transparent',
              color: tab === t.key ? '#2563EB' : '#475569',
              fontSize: 15,
              fontWeight: tab === t.key ? 600 : 400,
              cursor: 'pointer',
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'person' ? (
        <EpCard>
          <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>查人员内容待补充</div>
        </EpCard>
      ) : (
        <div style={{ display: 'flex', gap: 16, position: 'relative' }}>
          {/* 左侧边栏 */}
          <div
            style={{
              width: 260,
              flexShrink: 0,
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* 左侧 Tab */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0' }}>
              {data.left.tabs.map((lt) => (
                <button
                  key={lt}
                  onClick={() => handleLeftTab(lt)}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    border: 'none',
                    background: leftTab === lt ? '#fff' : 'transparent',
                    color: leftTab === lt ? '#2563EB' : '#475569',
                    fontSize: 13,
                    fontWeight: leftTab === lt ? 600 : 400,
                    cursor: 'pointer',
                    borderLeft: leftTab === lt ? '3px solid #2563EB' : '3px solid transparent',
                  }}
                >
                  {lt}
                </button>
              ))}
            </div>

            {leftTab === '选择指标' && (
              <>
                <div style={{ padding: 14 }}>
                  {/* 搜索 */}
                  <div style={{ position: 'relative', marginBottom: 12 }}>
                    <input
                      value={kw}
                      onChange={(e) => setKw(e.target.value)}
                      placeholder={data.left.searchPlaceholder}
                      style={{
                        width: '100%',
                        padding: '7px 28px 7px 10px',
                        borderRadius: 6,
                        border: '1px solid #E2E8F0',
                        fontSize: 13,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                    <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
                      <SearchIcon />
                    </div>
                  </div>

                  {/* 工具栏 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <button
                      onClick={toggleAll}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#0F172A' }}
                    >
                      <CustomCheckbox checked={checked.size === data.left.tree.length && data.left.tree.length > 0} />
                      <span>
                        {data.left.selectAll}({data.left.total})
                      </span>
                    </button>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <EpBtn variant="ghost" size="sm">
                        {data.left.settings}
                      </EpBtn>
                      <EpBtn variant="primary" size="sm">
                        {data.left.saveTemplate}
                      </EpBtn>
                    </div>
                  </div>

                  {/* 指标树 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {filteredTree.map((item) => (
                      <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                        <ChevronRight />
                        <CustomCheckbox checked={checked.has(item.key)} onChange={() => toggleOne(item.key)} />
                        <span style={{ fontSize: 13, color: '#0F172A' }}>{item.label}</span>
                      </div>
                    ))}
                    {filteredTree.length === 0 && <div style={{ fontSize: 12, color: '#94A3B8', padding: 8 }}>暂无匹配指标</div>}
                  </div>
                </div>

                {/* 收起 */}
                <div style={{ marginTop: 'auto', padding: 12, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'center' }}>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 12px',
                      borderRadius: 12,
                      border: '1px solid #E2E8F0',
                      background: '#F8FAFC',
                      fontSize: 12,
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    <ChevronRight size={12} />
                    {data.left.collapse}
                  </button>
                </div>
              </>
            )}

            {(leftTab === '我的模板' || leftTab === '精选模板') && (
              <div style={{ padding: 16, color: '#64748B', fontSize: 13, textAlign: 'center' }}>
                点击已打开模板库弹窗
              </div>
            )}
          </div>

          {/* 右侧主内容 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* 上传 + 模板 双卡片 */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <EpCard className="flex-1" pad>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <ExcelIcon />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A' }}>{data.uploadCard.title}</div>
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#3B82F6' }}>
                      {data.uploadCard.options.map((opt, idx) => (
                        <span key={opt.type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button onClick={openUpload} style={{ border: 'none', background: 'transparent', color: '#3B82F6', cursor: 'pointer', fontSize: 13, padding: 0 }}>{opt.label}</button>
                          {idx < data.uploadCard.options.length - 1 && <span style={{ color: '#CBD5E1' }}>或</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </EpCard>

              <EpCard className="flex-1" pad>
                <div onClick={openTemplate} style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 28px)', gap: 6 }}>
                    {Array.from({ length: data.templateCard.iconCount }).map((_, i) => (
                      <TemplateIcon key={i} type={i} />
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A' }}>{data.templateCard.title}</div>
                    <div style={{ marginTop: 4, fontSize: 13, color: '#64748B' }}>{data.templateCard.desc}</div>
                  </div>
                </div>
              </EpCard>
            </div>

            {/* 精选模板大卡片 */}
            <EpCard title={data.featured.title} pad>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                {/* 左侧两块 */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 32 }}>
                  {data.featured.left.map((block) => (
                    <div key={block.title}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>{block.title}</div>
                      <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                        {block.desc.join('\n')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 中间大图标 */}
                <div style={{ width: 180, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <BatchCircleIcon />
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>{data.featured.center.title}</div>
                  <EpBtn variant="primary" size="sm" onClick={openUpload}>
                    {data.featured.center.btn}
                  </EpBtn>
                </div>

                {/* 右侧两块 */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 32 }}>
                  {data.featured.right.map((block) => (
                    <div key={block.title}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>{block.title}</div>
                      <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                        {block.desc.join('\n')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </EpCard>

            {/* 收起示例 */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  border: 'none',
                  background: 'transparent',
                  color: '#64748B',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {data.toggle}
                <ChevronDown />
              </button>
            </div>
          </div>
        </div>
      )}

      {templateOpen && (
        <TemplateLibraryModal
          lib={data.templateLibrary}
          onClose={() => setTemplateOpen(false)}
          onUse={(key, save) => {
            setTemplateOpen(false)
            // 实际业务：应用模板；演示直接进结果页
            goDetail('/console/ep/jd-batch-result')
          }}
        />
      )}
    </EpPage>
  )
}
