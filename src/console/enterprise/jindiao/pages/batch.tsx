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
type PersonUpload = {
  title: string
  sample: string
  tips: string[]
  fileName: string
  reUpload: string
  status: string
}
type PersonRow = {
  id: string
  name: string
  avatar: string
  partners: string[]
  legalRep: string[]
  shareholder: string[]
  executive: string[]
}
type PersonData = {
  uploadToolbar: PersonUpload
  resultToolbar: { selectAll: string; export: string; exportAll: string }
  loading: { text: string }
  summary: { matched: number; unmatched: number; empty: number }
  rows: PersonRow[]
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
  person: PersonData
}

const seed: Data = {
  pageTitle: '批量尽调',
  tabs: [
    { key: 'enterprise', label: '查企业' },
    { key: 'person', label: '查人员' },
  ],
  activeTab: 'enterprise',
  left: {
    tabs: ['选择指标'],
    active: '选择指标',
    searchPlaceholder: '请输入指标名称',
    selectAll: '全选',
    total: 203,
    settings: '设置',
    saveTemplate: '存为模板',
    tree: [
      { key: 'business', label: '工商信息', checked: true },
      { key: 'qixin', label: '企业健康度', checked: false },
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
        desc: ['工商信息、司法/经营风险、经营信息', '企业征信特有指标、企业健康度、企业关系等'],
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
  person: {
    uploadToolbar: {
      title: '准备Excel文件',
      sample: '查看样例',
      tips: ['支持最多1000条信息', '智能去重保证精确'],
      fileName: 'person.xlsx',
      upload: '上传',
      reUpload: '重新上传',
      status: '上传成功，共匹配查询到 {matched} 个人员，未匹配到 {unmatched} 个人员，人员姓名为空 {empty} 条数据',
    },
    resultToolbar: { selectAll: '全选', export: '导出', exportAll: '全部导出' },
    loading: { text: '正在查询人员信息...' },
    summary: { matched: 4, unmatched: 0, empty: 0 },
    rows: [
      {
        id: 'p1',
        name: '吴孟',
        avatar: 'https://placehold.co/80x80/334155/ffffff?text=吴',
        partners: ['赵凯', '贾跃亭', '邓伟', '刘秋萍', '贾跃芳', '李晋', '刘丰选', '徐展春', '张昭', '隋伟', '刘延峰', '毛丙龙', '李洪涛', '张胤', '刘淑青', '张巍', '梁军', '贾跃民', '张海亮', '高飞'],
        legalRep: ['乐视控股（北京）有限公司', '乐视汽车（北京）有限公司', '北京百乐文化传媒有限公司'],
        shareholder: ['北京东方车云信息技术有限公司', '乐为互联投资管理（北京）有限公司', '北京锦阳资产管理中心（有限合伙）'],
        executive: ['乐视网信息技术（北京）股份有限公司', '乐视控股（北京）有限公司', '乐融致新电子科技（天津）有限公司'],
      },
      {
        id: 'p2',
        name: '雷军',
        avatar: 'https://placehold.co/80x80/2563EB/ffffff?text=雷',
        partners: ['刘德', '王川', '孙谦', '邹涛', '洪锋', 'CHEWSHOUZI', '林斌', '马文静', '刘芹', '刘伟', '黎万强', '彭博', '求伟芹', '林世伟', '张彤', '曹莉平', '求伯君', '卢伟冰', '周受资', '龚道军'],
        legalRep: ['小米科技有限责任公司', '天津金星创业投资有限公司', '广东小米科技有限责任公司'],
        shareholder: ['小米科技有限责任公司', '广州华多网络科技有限公司', '北京口袋时尚科技有限公司'],
        executive: ['小米科技有限责任公司', '拉卡拉支付股份有限公司', '小米通讯技术有限公司'],
      },
    ],
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
              background: '#2563EB',
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

/* ================= 查人员 Tab ================= */
const AVATAR_COLORS = ['#334155', '#2563EB', '#7C3AED', '#DB2777', '#059669', '#D97706', '#DC2626']

function Avatar({ name }: { name: string }) {
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
  return (
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 6,
        background: color,
        color: '#fff',
        fontSize: 26,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {name.slice(0, 1)}
    </div>
  )
}

function UploadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function DocIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1677ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function Spinner() {
  return (
    <>
      <style>{`@keyframes ep-spin { to { transform: rotate(360deg); } }`}</style>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '3px solid #E2E8F0',
          borderTopColor: '#2563EB',
          margin: '0 auto',
          animation: 'ep-spin 1s linear infinite',
        }}
      />
    </>
  )
}

function InfoLine({ label, values }: { label: string; values: string[] }) {
  return (
    <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.7, color: '#334155' }}>
      <span style={{ color: '#64748B' }}>{label}</span>
      {values.map((v, i) => (
        <span key={v}>
          {i > 0 && <span style={{ color: '#CBD5E1' }}>、</span>}
          <span style={{ color: '#1677ff', cursor: 'pointer' }}>{v}</span>
        </span>
      ))}
    </div>
  )
}

function PersonTab({
  data,
  phase,
  sel,
  setSel,
  onUpload,
  onRemoveFile,
  onNameClick,
}: {
  data: PersonData
  phase: 'idle' | 'loading' | 'done'
  sel: Set<string>
  setSel: (s: Set<string>) => void
  onUpload: () => void
  onRemoveFile: () => void
  onNameClick: (name: string) => void
}) {
  const { uploadToolbar: up, resultToolbar: rt, summary, rows } = data

  const toggleRow = (id: string) => {
    const next = new Set(sel)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSel(next)
  }
  const toggleAll = () => {
    if (sel.size === rows.length) setSel(new Set())
    else setSel(new Set(rows.map((r) => r.id)))
  }

  const downloadSample = () => {
    const header = '姓名,身份证号,手机号\n吴孟,110108199001011234,13800000001\n雷军,110108198702021235,13800000002\n'
    const blob = new Blob(['\ufeff' + header], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = up.fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const outlineBtn = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    borderRadius: 6,
    border: '1px solid #CBD5E1',
    background: '#fff',
    color: '#334155',
    fontSize: 13,
    cursor: 'pointer',
  }

  return (
    <div>
      {/* 上传卡片 */}
      <div style={{ background: '#f7f8fc', borderRadius: 10, border: '1px solid #EFF1F7', padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#1F2937' }}>{up.title}</span>
            <a onClick={downloadSample} style={{ fontSize: 13, color: '#1677ff', cursor: 'pointer' }}>{up.sample}</a>
          </div>
          <button
            onClick={onUpload}
            disabled={phase === 'loading'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 16px',
              borderRadius: 6,
              border: 'none',
              background: '#2563EB',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              opacity: phase === 'loading' ? 0.6 : 1,
            }}
          >
            <UploadIcon />
            {phase === 'idle' ? up.upload : up.reUpload}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 10 }}>
          {up.tips.map((t) => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94A3B8' }}>
              <CheckIcon />
              {t}
            </span>
          ))}
        </div>
        {phase !== 'idle' && (
          <div
            style={{
              marginTop: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#fff',
              borderRadius: 8,
              padding: '9px 14px',
              border: '1px solid #E2E8F0',
            }}
          >
            <DocIcon />
            <span style={{ fontSize: 13, color: '#1677ff', fontWeight: 500 }}>{up.fileName}</span>
            <button
              onClick={onRemoveFile}
              title="删除文件"
              style={{
                marginLeft: 'auto',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#94A3B8',
                display: 'inline-flex',
                padding: 4,
              }}
            >
              <CloseIcon />
            </button>
          </div>
        )}
      </div>

      {phase === 'idle' && (
        <div style={{ padding: 70, textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>上传 Excel 文件后开始排查人员关系</div>
      )}

      {phase === 'loading' && (
        <div style={{ padding: 70, textAlign: 'center' }}>
          <Spinner />
          <div style={{ marginTop: 14, fontSize: 14, color: '#64748B' }}>{data.loading.text}</div>
        </div>
      )}

      {phase === 'done' && (
        <>
          {/* 结果提示 */}
          <div style={{ marginTop: 16, fontSize: 14, color: '#1F2937' }}>
            上传成功，共匹配查询到 <span style={{ color: '#1677ff', fontWeight: 600 }}>{summary.matched}</span> 个人员，未匹配到{' '}
            <span style={{ color: '#1677ff', fontWeight: 600 }}>{summary.unmatched}</span> 个人员，人员姓名为空{' '}
            <span style={{ color: '#1677ff', fontWeight: 600 }}>{summary.empty}</span> 条数据
          </div>

          {/* 操作栏 */}
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
              <input type="checkbox" checked={rows.length > 0 && sel.size === rows.length} onChange={toggleAll} />
              {rt.selectAll}
            </label>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button style={outlineBtn}>
                <DownloadIcon />
                {rt.export}
              </button>
              <button style={outlineBtn}>
                <DownloadIcon />
                {rt.exportAll}
              </button>
            </div>
          </div>

          {/* 人员卡片列表 */}
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rows.map((r) => (
              <div
                key={r.id}
                style={{
                  display: 'flex',
                  gap: 16,
                  background: '#fff',
                  borderRadius: 10,
                  border: '1px solid #E2E8F0',
                  padding: '18px 20px',
                }}
              >
                <input type="checkbox" checked={sel.has(r.id)} onChange={() => toggleRow(r.id)} style={{ marginTop: 24, cursor: 'pointer' }} />
                <Avatar name={r.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{ fontSize: 18, fontWeight: 700, color: '#1677ff', cursor: 'pointer' }}
                    onClick={() => onNameClick(r.name)}
                  >
                    {r.name}
                  </div>
                  <InfoLine label="合作伙伴：" values={r.partners} />
                  <InfoLine label="担任法定代表人的企业：" values={r.legalRep} />
                  <InfoLine label="担任股东的企业：" values={r.shareholder} />
                  <InfoLine label="担任高管的企业：" values={r.executive} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
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
  const [personPhase, setPersonPhase] = useState<'idle' | 'loading' | 'done'>('idle')
  const [personSel, setPersonSel] = useState<Set<string>>(new Set())

  const startPersonCheck = () => {
    if (personPhase === 'loading') return
    setPersonPhase('loading')
    window.setTimeout(() => setPersonPhase('done'), 2000)
  }

  const removePersonFile = () => {
    setPersonPhase('idle')
    setPersonSel(new Set())
  }

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

  return (
    <EpPage title={data.pageTitle} actions={<Sam value="jdBatch.json" />}>
      {/* 顶部 Tab */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: 16, position: 'sticky', top: 140, zIndex: 20, background: '#fff' }}>
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
        <PersonTab
          data={data.person}
          phase={personPhase}
          sel={personSel}
          setSel={setPersonSel}
          onUpload={startPersonCheck}
          onRemoveFile={removePersonFile}
          onNameClick={(name) => goDetail('/console/dm/person-archive-basic?name=' + encodeURIComponent(name))}
        />
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
            {/* 左侧标题 */}
            <div style={{ padding: '12px 14px', borderBottom: '1px solid #E2E8F0', fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
              {data.left.active}
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
              </>
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
