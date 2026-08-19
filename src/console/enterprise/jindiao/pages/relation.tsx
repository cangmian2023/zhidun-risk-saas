// 尽调中心 · 关系尽调（jd-relation）· 集中排查 Tab
// 数据：本地样例 jdRelation.json（橘 Sam）
import { useState, useEffect } from 'react'
import { EpPage, EpBtn, useSample, Sam } from '../../epCommon'
import { usePageNav } from '../../../pageNav'

type Target = { id: string; name: string; type: 'company' | 'person' }
type Filter = { key: string; label: string }
type ResultItem = { id: string; level: number; levelLabel: string; content: string; paths: number }
type SummaryPart = { text: string; highlight?: boolean; color?: string }
type LegendItem = { label: string; color: string }
type GraphNode = { id: string; label: string; type: 'company' | 'person' | 'target'; x: number; y: number }
type GraphEdge = { from: string; to: string; label: string }
type ChainSegment = { type: 'target' | 'company' | 'edge'; name?: string; tag?: string; label?: string }
type Chain = { level: string; segments: ChainSegment[] }
type GroupData = {
  config: {
    title: string
    clear: string
    settings: string
    groups: { id: string; label: string; count: string }[]
    addGroup: string
    modeTitle: string
    modes: { key: string; label: string }[]
    modeDefault: string
    startCheck: string
  }
  result: {
    download: string
    ratio: string
    sort: string
    summary: string
    relationSelect: string
    items: { id: string; label: string; paths: number; chains: Chain[] }[]
  }
  main: {
    title: string
    legend: LegendItem[]
    toolbar: string[]
    graph: { width: number; height: number; nodes: GraphNode[]; edges: GraphEdge[] }
    watermark: string
    disclaimer: string
  }
}
type RelatedData = {
  search: { placeholder: string; btn: string }
  filter: {
    typeTitle: string
    types: { key: string; label: string; checked: boolean; arrow: boolean }[]
    settings: string
    excludeTitle: string
    excludes: { key: string; label: string; checked: boolean }[]
  }
  templates: {
    title: string
    items: { key: string; label: string; icon: string }[]
  }
  diagram: {
    center: string
    left: string[]
    right: string[]
    try: string
    collapse: string
  }
  records: {
    title: string
    count: number
    filters: { key: string; placeholder: string }[]
    columns: string[]
    rows: {
      id: number
      name: string
      running: boolean
      result: string
      resultCount: number | null
      person: string
      startTime: string
      endTime: string
    }[]
    actions: string[]
  }
}
type Data = {
  source: string
  pageTitle: string
  tabs: { key: string; label: string; badge?: string }[]
  activeTab: string
  left: {
    targetTitle: string
    targetCount: number
    clear: string
    settings: string
    batchAdd: string
    targets: Target[]
    inputPlaceholder: string
    addTarget: string
    startCheck: string
    result: {
      title: string
      filters: Filter[]
      summaryLabel: string
      summaryValue: string
      summaryArrow: string
      items: ResultItem[]
    }
  }
  main: {
    summary: { parts: SummaryPart[] }
    aiBtn: string
    legend: LegendItem[]
    graph: { width: number; height: number; nodes: GraphNode[]; edges: GraphEdge[] }
    loading: { text: string; spinText: string }
  }
  group: GroupData
  related: RelatedData
}

const seed: Data = {
  source: 'fkSam',
  pageTitle: '关系尽调',
  tabs: [
    { key: 'central', label: '集中排查', badge: 'AI' },
    { key: 'group', label: '组与组排查' },
    { key: 'related', label: '关联方识别' },
  ],
  activeTab: 'central',
  left: {
    targetTitle: '关系目标',
    targetCount: 2,
    clear: '清空',
    settings: '关系设置',
    batchAdd: '+ 批量添加',
    targets: [
      { id: 't1', name: '万科企业股份有限公司', type: 'company' },
      { id: 't2', name: '王健林', type: 'person' },
    ],
    inputPlaceholder: '请输入企业/人员',
    addTarget: '+ 新增关系目标',
    startCheck: '开始排查',
    result: {
      title: '关系结果',
      filters: [
        { key: 'level', label: '层级' },
        { key: 'degree', label: '关联度' },
        { key: 'ratio', label: '比例' },
        { key: 'sort', label: '排序' },
      ],
      summaryLabel: '关系排查结果：',
      summaryValue: '高关联',
      summaryArrow: '›',
      items: [
        {
          id: 'r1',
          level: 4,
          levelLabel: '4层',
          content:
            '万科企业股份有限公司 十大股东：1.23% 香港中央结算有限公司 十大股东：0.67% 浙江华策影视股份有限公司 历史股东：0.71% 儒意前程影视传媒有限公司 历史股东 王健林',
          paths: 50,
        },
        {
          id: 'r2',
          level: 4,
          levelLabel: '4层',
          content:
            '万科企业股份有限公司 十大股东：1.23% 香港中央结算有限公司 十大股东：1.01% 永辉超市股份有限公司 历史股东：1.50% 大连万达商业管理集团股份有限公司 工商股东：1.60%，历史法定代表人 王健林',
          paths: 45,
        },
        {
          id: 'r3',
          level: 4,
          levelLabel: '4层',
          content: '万科企业股份有限公司 十大股东：1.23% 香港中央结算有限公司 十大股东：...',
          paths: 30,
        },
      ],
    },
  },
  main: {
    summary: {
      parts: [
        { text: '万科企业股份有限公司和王健林', highlight: false },
        { text: '是', highlight: false },
        { text: '高关联关系', highlight: true, color: '#EF4444' },
        { text: '，共产生', highlight: false },
        { text: '50', highlight: true, color: '#EF4444' },
        { text: '条关系路径 其中', highlight: false },
        { text: '5', highlight: true, color: '#EF4444' },
        { text: '条高风险路径，', highlight: false },
        { text: '45', highlight: true, color: '#F59E0B' },
        { text: '条中风险路径，', highlight: false },
        { text: '0', highlight: true, color: '#22C55E' },
        { text: '条低风险路径', highlight: false },
      ],
    },
    aiBtn: 'AI 分析',
    legend: [
      { label: '公司', color: '#3B82F6' },
      { label: '人员', color: '#F43F5E' },
      { label: '目标', color: '#F97316' },
    ],
    graph: {
      width: 820,
      height: 480,
      nodes: [
        { id: 'n1', label: '万科企业股份有限公司', type: 'target', x: 80, y: 280 },
        { id: 'n2', label: '上海中城联盟投资管理股份有限公司', type: 'company', x: 220, y: 120 },
        { id: 'n3', label: '香港中央结算有限公司', type: 'company', x: 360, y: 280 },
        { id: 'n4', label: '金丰投资有限公司', type: 'company', x: 360, y: 100 },
        { id: 'n5', label: '赵勇', type: 'person', x: 520, y: 80 },
        { id: 'n6', label: '方正科技集团股份有限公司', type: 'company', x: 520, y: 200 },
        { id: 'n7', label: '江月芳', type: 'person', x: 520, y: 320 },
        { id: 'n8', label: '北京国能公益有限公司', type: 'company', x: 680, y: 100 },
        { id: 'n9', label: '金建华', type: 'person', x: 680, y: 260 },
        { id: 'n10', label: '东方国际创业股份有限公司', type: 'company', x: 520, y: 400 },
        { id: 'n11', label: '王彤', type: 'person', x: 680, y: 380 },
        { id: 'n12', label: '王健林', type: 'target', x: 760, y: 280 },
      ],
      edges: [
        { from: 'n1', to: 'n2', label: '十大股东：1.65%' },
        { from: 'n1', to: 'n3', label: '十大股东：1.23%' },
        { from: 'n2', to: 'n4', label: '十大股东：1.88%' },
        { from: 'n2', to: 'n6', label: '十大股东：4.73%' },
        { from: 'n3', to: 'n4', label: '十大股东：1.39%' },
        { from: 'n3', to: 'n6', label: '十大股东：1.39%' },
        { from: 'n3', to: 'n10', label: '十大股东：0.85%' },
        { from: 'n4', to: 'n5', label: '历史股东' },
        { from: 'n4', to: 'n7', label: '历史股东' },
        { from: 'n5', to: 'n8', label: '董事' },
        { from: 'n6', to: 'n9', label: '历史股东：5.42%' },
        { from: 'n6', to: 'n10', label: '十大股东：0.85%' },
        { from: 'n7', to: 'n8', label: '历史股东' },
        { from: 'n9', to: 'n11', label: '监事' },
        { from: 'n10', to: 'n11', label: '历史股东' },
        { from: 'n8', to: 'n12', label: '历史股东' },
        { from: 'n11', to: 'n12', label: '历史法定代表人' },
      ],
    },
    loading: {
      text: '关系排查中…',
      spinText: '正在计算关系路径',
    },
  },
  group: {
    config: {
      title: '关系组 ②',
      clear: '清空',
      settings: '关系设置',
      groups: [
        { id: 'g1', label: '万科企业股份有限公…', count: '等2个目标' },
        { id: 'g2', label: '万科企业股份有限公…', count: '等2个目标' },
      ],
      addGroup: '+新增关系组',
      modeTitle: '排查方式',
      modes: [
        { key: 'between', label: '组间排查' },
        { key: 'inner', label: '组内排查' },
      ],
      modeDefault: 'between',
      startCheck: '开始排查',
    },
    result: {
      download: '下载数据',
      ratio: '比例',
      sort: '排序',
      summary: '2个排查目标中，共找到2个目标1对关联关系。',
      relationSelect: '组1和组2的关系',
      items: [
        {
          id: 'gr1',
          label: '王健林 组2 和 万科企业股份有限公司 组1',
          paths: 50,
          chains: [
            {
              level: '3层',
              segments: [
                { type: 'target', name: '王健林', tag: '组2' },
                { type: 'edge', label: '工商股东：0.24%，董事，法定代表人' },
                { type: 'company', name: '大连万达集团股份有限公司' },
                { type: 'edge', label: '供应关系' },
                { type: 'company', name: '北京东方雨虹防水技术股份有限公司' },
                { type: 'edge', label: '供应关系' },
                { type: 'target', name: '万科企业股份有限公司', tag: '组1' },
              ],
            },
            {
              level: '3层',
              segments: [
                { type: 'target', name: '王健林', tag: '组2' },
                { type: 'edge', label: '工商股东：0.24%，董事，法定代表人' },
                { type: 'company', name: '中国建筑股份有限公司' },
                { type: 'edge', label: '供应关系' },
                { type: 'company', name: '北京东方雨虹防水技术股份有限公司' },
                { type: 'edge', label: '供应关系' },
                { type: 'target', name: '万科企业股份有限公司', tag: '组1' },
              ],
            },
            {
              level: '3层',
              segments: [
                { type: 'target', name: '王健林', tag: '组2' },
                { type: 'edge', label: '工商股东：0.24%，董事，法定代表人' },
                { type: 'company', name: '大连万达集团股份有限公司' },
                { type: 'edge', label: '供应关系' },
                { type: 'company', name: '上海建工集团股份有限公司' },
                { type: 'edge', label: '供应关系' },
                { type: 'target', name: '万科企业股份有限公司', tag: '组1' },
              ],
            },
          ],
        },
      ],
    },
    main: {
      title: '王健林和万科企业股份有限公司共产生50对关系',
      legend: [
        { label: '公司', color: '#3B82F6' },
        { label: '人员', color: '#F43F5E' },
        { label: '目标', color: '#F97316' },
      ],
      toolbar: ['放大', '缩小', '全屏', '重置视图', '导出'],
      graph: {
        width: 820,
        height: 460,
        nodes: [
          { id: 'gn1', label: '王健林', type: 'target', tag: '组2', x: 70, y: 240 },
          { id: 'gc1', label: '大连万达集团股份有限公司', type: 'company', x: 260, y: 100 },
          { id: 'gc2', label: '北京东方雨虹防水技术股份有限公司', type: 'company', x: 430, y: 240 },
          { id: 'gc3', label: '中国建筑股份有限公司', type: 'company', x: 260, y: 380 },
          { id: 'gc4', label: '上海建工集团股份有限公司', type: 'company', x: 590, y: 120 },
          { id: 'gc5', label: '恒信永基置业有限公司', type: 'company', tag: '吊销', x: 590, y: 360 },
          { id: 'gc6', label: '深圳万科金色家园房地产开发有限公司', type: 'company', tag: '注销', x: 700, y: 240 },
          { id: 'gn2', label: '万科企业股份有限公司', type: 'target', tag: '组1', x: 780, y: 400 },
        ],
        edges: [
          { from: 'gn1', to: 'gc1', label: '工商股东：0.24%，董事，法定代表人' },
          { from: 'gn1', to: 'gc3', label: '供应关系' },
          { from: 'gc1', to: 'gc2', label: '供应关系' },
          { from: 'gc3', to: 'gc2', label: '供应关系' },
          { from: 'gc2', to: 'gc4', label: '供应关系' },
          { from: 'gc2', to: 'gc6', label: '供应关系' },
          { from: 'gc4', to: 'gn2', label: '供应关系' },
          { from: 'gc5', to: 'gn2', label: '历史股东' },
          { from: 'gc6', to: 'gn2', label: '历史法定代表人' },
        ],
      },
      watermark: '启信慧眼',
      disclaimer: '数据基于公开数据动态分析，仅供参考',
    },
  },
  related: {
    search: {
      placeholder: '请输入企业名称/统一社会信用代码',
      btn: '查询',
    },
    filter: {
      typeTitle: '关系类型',
      types: [
        { key: 'controller', label: '实控人', checked: false, arrow: true },
        { key: 'beneficiary', label: '受益所有人', checked: false, arrow: false },
        { key: 'legal', label: '法定代表人', checked: false, arrow: true },
        { key: 'branch', label: '分支机构', checked: false, arrow: true },
        { key: 'director', label: '董监高', checked: true, arrow: true },
        { key: 'shareholder', label: '股东', checked: true, arrow: true },
        { key: 'investment', label: '对外投资', checked: true, arrow: true },
        { key: 'coop', label: '商业合作', checked: false, arrow: true },
        { key: 'contact', label: '联系方式', checked: false, arrow: true },
        { key: 'other', label: '其他关系', checked: false, arrow: true },
      ],
      settings: '设置',
      excludeTitle: '关系剔除',
      excludes: [
        { key: 'abnormal', label: '经营状态异常企业', checked: false },
        { key: 'organ', label: '机关、事业单位', checked: false },
      ],
    },
    templates: {
      title: '精选模板：',
      items: [
        { key: 'acc', label: '会计准则', icon: 'doc' },
        { key: 'exchange', label: '深交所上交所', icon: 'wave' },
        { key: 'regulator', label: '金融监管总局', icon: 'building' },
      ],
    },
    diagram: {
      center: '关联方识别',
      left: ['实控人', '受益所有人', '法人', '股东', '董监高'],
      right: ['分支机构', '对外投资', '商业合作', '联系方式', '其他类型'],
      try: '一键试用',
      collapse: '收起示例',
    },
    records: {
      title: '排查记录',
      count: 4,
      filters: [
        { key: 'person', placeholder: '请选择排查人' },
        { key: 'result', placeholder: '请选择排查结果' },
      ],
      columns: ['序号', '排查目标', '排查结果', '排查人', '排查时间', '完成时间', '操作'],
      rows: [
        { id: 1, name: '乐视网信息技术（北京）股份有限公司', running: true, result: '—', resultCount: null, person: '19156027703', startTime: '2026-08-19 23:44', endTime: '—' },
        { id: 2, name: '乐视网信息技术（北京）股份有限公司', running: false, result: '已完成', resultCount: 2986, person: '19156027703', startTime: '2026-08-19 15:02', endTime: '2026-08-19 15:05' },
        { id: 3, name: '乐视网信息技术（北京）股份有限公司', running: false, result: '已完成', resultCount: 2969, person: '19156027703', startTime: '2026-08-18 20:28', endTime: '2026-08-18 20:31' },
        { id: 4, name: '乐视网信息技术（北京）股份有限公司', running: false, result: '已完成', resultCount: 3007, person: '19156027703', startTime: '2026-08-17 15:59', endTime: '2026-08-17 16:02' },
      ],
      actions: ['详情', '下载报告', '重新排查'],
    },
  },
}

function TargetChip({ name, type, onRemove }: { name: string; type: 'company' | 'person'; onRemove: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        padding: '10px 12px',
        borderRadius: 8,
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
      }}
    >
      <span style={{ fontSize: 14, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name}
      </span>
      <button
        onClick={onRemove}
        style={{
          border: 'none',
          background: 'transparent',
          color: '#94A3B8',
          cursor: 'pointer',
          fontSize: 16,
          lineHeight: 1,
          padding: 0,
        }}
      >
        ×
      </button>
    </div>
  )
}

function GraphView({ data }: { data: Data['main']['graph'] }) {
  const nodeMap = new Map(data.nodes.map((n) => [n.id, n]))
  const nodeColor = (type: string) => {
    if (type === 'target') return '#F97316'
    if (type === 'person') return '#F43F5E'
    return '#3B82F6'
  }
  const nodeRadius = (type: string) => (type === 'target' ? 34 : 28)

  return (
    <svg width={data.width} height={data.height} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 L2,4 Z" fill="#94A3B8" />
        </marker>
      </defs>
      {data.edges.map((e, idx) => {
        const a = nodeMap.get(e.from)
        const b = nodeMap.get(e.to)
        if (!a || !b) return null
        return (
          <g key={idx}>
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="#CBD5E1"
              strokeWidth={1}
              markerEnd="url(#arrowhead)"
            />
            <text
              x={(a.x + b.x) / 2}
              y={(a.y + b.y) / 2 - 4}
              textAnchor="middle"
              style={{ fontSize: 10, fill: '#64748B' }}
            >
              {e.label}
            </text>
          </g>
        )
      })}
      {data.nodes.map((n) => {
        const r = nodeRadius(n.type)
        const lines = n.label.length > 10 ? [n.label.slice(0, 10), n.label.slice(10)] : [n.label]
        return (
          <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
            <circle r={r} fill={nodeColor(n.type)} opacity={0.18} />
            <circle r={r - 4} fill={nodeColor(n.type)} />
            <text
              y={-(r - 10)}
              textAnchor="middle"
              style={{ fontSize: 10, fill: '#FFFFFF', fontWeight: 600 }}
            >
              {lines.map((line, i) => (
                <tspan key={i} x={0} dy={12}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ================ 组与组排查 ================ */
function GroupGraphView({ data }: { data: { width: number; height: number; nodes: GraphNode[]; edges: GraphEdge[] } }) {
  const [zoom, setZoom] = useState(1)
  const nodeMap = new Map(data.nodes.map((n) => [n.id, n]))
  const nodeColor = (type: string) => {
    if (type === 'target') return '#F97316'
    if (type === 'person') return '#F43F5E'
    return '#3B82F6'
  }
  const nodeRadius = (type: string) => (type === 'target' ? 36 : 30)

  return (
    <div style={{ position: 'relative' }}>
      <svg
        width={data.width}
        height={data.height}
        style={{ width: '100%', height: 'auto', display: 'block', transition: 'transform 0.25s ease' }}
      >
        <defs>
          <marker id="garrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 L2,4 Z" fill="#94A3B8" />
          </marker>
        </defs>
        <g transform={`translate(${(data.width * (1 - zoom)) / 2}, ${(data.height * (1 - zoom)) / 2}) scale(${zoom})`}>
          {/* 水印 */}
          <text
            x={data.width / 2}
            y={data.height / 2}
            textAnchor="middle"
            style={{ fontSize: 72, fill: '#F1F5F9', fontWeight: 800, userSelect: 'none' }}
          >
            启信慧眼
          </text>

          {data.edges.map((e, idx) => {
            const a = nodeMap.get(e.from)
            const b = nodeMap.get(e.to)
            if (!a || !b) return null
            return (
              <g key={idx}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#CBD5E1" strokeWidth={1} markerEnd="url(#garrow)" />
                <text
                  x={(a.x + b.x) / 2}
                  y={(a.y + b.y) / 2 - 6}
                  textAnchor="middle"
                  style={{ fontSize: 10, fill: '#64748B' }}
                >
                  {e.label}
                </text>
              </g>
            )
          })}

          {data.nodes.map((n) => {
            const r = nodeRadius(n.type)
            const maxLen = n.type === 'target' ? 8 : 10
            const name = n.label.length > maxLen * 2 ? n.label.slice(0, maxLen * 2 - 1) + '…' : n.label
            const lines = name.length > maxLen ? [name.slice(0, maxLen), name.slice(maxLen)] : [name]
            const tag = (n as GraphNode & { tag?: string }).tag
            return (
              <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
                <circle r={r} fill={nodeColor(n.type)} opacity={0.16} />
                <circle r={r - 4} fill={nodeColor(n.type)} />
                <text textAnchor="middle" style={{ fontSize: n.type === 'target' ? 11 : 9.5, fill: '#FFFFFF', fontWeight: 600 }}>
                  {lines.map((line, i) => (
                    <tspan key={i} x={0} dy={i === 0 ? 3 : 11}>
                      {line}
                    </tspan>
                  ))}
                </text>
                {tag && (
                  <g transform={`translate(0, ${r + 8})`}>
                    <rect x={-22} y={-9} width={44} height={18} rx={9} fill={tag === '吊销' || tag === '注销' ? '#FEE2E2' : '#FEF3C7'} stroke={tag === '吊销' || tag === '注销' ? '#FCA5A5' : '#FCD34D'} strokeWidth={0.5} />
                    <text textAnchor="middle" y={4} style={{ fontSize: 9, fill: tag === '吊销' || tag === '注销' ? '#DC2626' : '#B45309', fontWeight: 600 }}>
                      {tag}
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {/* 缩放工具栏（右下角） */}
      <div
        style={{
          position: 'absolute',
          right: 10,
          bottom: 10,
          display: 'flex',
          gap: 4,
          background: '#fff',
          borderRadius: 8,
          border: '1px solid #E2E8F0',
          padding: 3,
        }}
      >
        {[
          { key: 'in', label: '+', title: '放大' },
          { key: 'out', label: '−', title: '缩小' },
          { key: 'reset', label: '↺', title: '重置视图' },
        ].map((b) => (
          <button
            key={b.key}
            title={b.title}
            onClick={() => {
              if (b.key === 'in') setZoom((z) => Math.min(1.6, z + 0.2))
              if (b.key === 'out') setZoom((z) => Math.max(0.6, z - 0.2))
              if (b.key === 'reset') setZoom(1)
            }}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 14,
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function GroupTab({ data }: { data: GroupData }) {
  const [mode, setMode] = useState(data.config.modeDefault)
  const [phase, setPhase] = useState<'idle' | 'loading' | 'done'>('idle')
  const [resultOpen, setResultOpen] = useState(true)

  const startCheck = () => {
    if (phase === 'loading') return
    setPhase('loading')
    setTimeout(() => setPhase('done'), 2500)
  }

  const cfg = data.config
  const res = data.result
  const main = data.main
  const item = res.items[0]
  const showResult = phase !== 'idle'

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      {/* 左侧面板 */}
      <div
        style={{
          width: 300,
          flexShrink: 0,
          borderRadius: 12,
          background: '#fff',
          border: '1px solid #E2E8F0',
          padding: '16px 14px',
        }}
      >
        {/* 关系组配置 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 600, color: '#0F172A' }}>
            {cfg.title}
            <span
              title="帮助"
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: '1px solid #94A3B8',
                color: '#94A3B8',
                fontSize: 10,
                lineHeight: '12px',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              ?
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#64748B' }}>
            <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}>{cfg.clear}</button>
            <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}>{cfg.settings}</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cfg.groups.map((g, i) => (
            <div
              key={g.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                padding: '10px 12px',
                borderRadius: 8,
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
              }}
            >
              <span style={{ fontSize: 14, color: '#0F172A' }}>
                <span style={{ color: '#94A3B8' }}>组{i + 1}：</span>
                {g.label} <span style={{ color: '#64748B', fontSize: 12 }}>{g.count}</span>
              </span>
              <button
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  fontSize: 16,
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button
          style={{
            marginTop: 12,
            border: 'none',
            background: 'transparent',
            color: '#3B82F6',
            fontSize: 14,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {cfg.addGroup}
        </button>

        <div style={{ marginTop: 14, fontSize: 13, color: '#64748B' }}>{cfg.modeTitle}</div>
        <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
          {cfg.modes.map((m) => (
            <label
              key={m.key}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 14,
                color: '#0F172A',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="groupMode"
                checked={mode === m.key}
                onChange={() => setMode(m.key)}
                style={{ accentColor: '#2563EB' }}
              />
              {m.label}
            </label>
          ))}
        </div>

        <EpBtn
          onClick={startCheck}
          variant="primary"
          style={{
            width: '100%',
            marginTop: 16,
            height: 42,
            fontSize: 15,
            fontWeight: 600,
            background: '#F59E0B',
            borderColor: '#F59E0B',
            color: '#1F2937',
          }}
        >
          {cfg.startCheck}
        </EpBtn>

        {/* 关系结果 */}
        <div style={{ marginTop: 18, borderTop: '1px solid #E2E8F0', paddingTop: 14, position: 'relative' }}>
          <div
            onClick={() => setResultOpen((v) => !v)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: 10 }}
          >
            <span style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>关系结果</span>
            <span style={{ color: '#94A3B8', fontSize: 13 }}>{resultOpen ? '▾' : '▸'}</span>
          </div>

          {phase === 'idle' ? (
            <div style={{ padding: '28px 10px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
              暂无排查结果
              <br />
              点击「开始排查」后展示
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {phase === 'loading' && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    background: 'rgba(255,255,255,0.88)',
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      border: '3px solid #E2E8F0',
                      borderTopColor: '#3B82F6',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  <div style={{ fontSize: 13, color: '#64748B' }}>正在计算关系路径</div>
                </div>
              )}

              {resultOpen && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                    <button
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 13,
                        color: '#3B82F6',
                        border: '1px solid #DBEAFE',
                        background: '#EFF6FF',
                        borderRadius: 6,
                        padding: '4px 10px',
                        cursor: 'pointer',
                      }}
                    >
                      ⬇ {res.download}
                    </button>
                    <button style={{ fontSize: 13, color: '#64748B', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                      {res.ratio} ▼
                    </button>
                    <button style={{ fontSize: 13, color: '#64748B', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                      {res.sort} ⇪
                    </button>
                  </div>

                  <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, marginBottom: 10 }}>{res.summary}</div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 13, color: '#0F172A' }}>{res.relationSelect}</span>
                    <span style={{ color: '#94A3B8', fontSize: 12 }}>▾</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <span style={{ fontSize: 12, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: 12, color: '#3B82F6', fontWeight: 600, marginLeft: 6 }}>共 {item.paths} 条</span>
                  </div>

                  {/* 链路列表 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                    {item.chains.map((c, idx) => (
                      <div key={idx} style={{ padding: 10, borderRadius: 8, background: '#F8FAFC' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span
                            style={{
                              padding: '1px 6px',
                              borderRadius: 4,
                              background: '#FEF3C7',
                              color: '#B45309',
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            {c.level}
                          </span>
                        </div>
                        <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.7 }}>
                          {c.segments.map((s, i) => {
                            if (s.type === 'edge') {
                              return (
                                <span key={i} style={{ color: '#94A3B8' }}>
                                  {' '}【{s.label}】{' '}
                                </span>
                              )
                            }
                            if (s.type === 'target') {
                              return (
                                <span key={i} style={{ color: '#F97316', fontWeight: 600 }}>
                                  {s.name}
                                  <span style={{ color: '#94A3B8', fontWeight: 400, fontSize: 11 }}>（{s.tag}）</span>
                                </span>
                              )
                            }
                            return (
                              <span key={i} style={{ color: '#3B82F6' }}>
                                {s.name}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 右侧图谱区 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            borderRadius: 12,
            background: '#fff',
            border: '1px solid #E2E8F0',
            padding: 16,
            minHeight: 560,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {phase === 'idle' ? (
            <div
              style={{
                height: 520,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
                fontSize: 14,
                gap: 8,
              }}
            >
              <span style={{ fontSize: 40, opacity: 0.5 }}>🕸</span>
              配置关系组后点击「开始排查」
              <span style={{ fontSize: 12, color: '#CBD5E1' }}>排查结果与关系图谱将在此展示</span>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>{main.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {main.legend.map((l) => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748B' }}>
                      <span style={{ width: 9, height: 9, borderRadius: '50%', background: l.color }} />
                      {l.label}
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 2, marginLeft: 6 }}>
                    {main.toolbar.map((t) => (
                      <span
                        key={t}
                        title={t}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          border: '1px solid #E2E8F0',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          color: '#64748B',
                          cursor: 'pointer',
                          background: '#fff',
                        }}
                      >
                        {t === '放大' ? '+' : t === '缩小' ? '−' : t === '全屏' ? '⛶' : t === '重置视图' ? '↺' : '⬇'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <GroupGraphView data={main.graph} />
                {phase === 'loading' && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255,255,255,0.9)',
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        border: '4px solid #E2E8F0',
                        borderTopColor: '#3B82F6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                    <div style={{ marginTop: 14, fontSize: 15, fontWeight: 600, color: '#0F172A' }}>关系排查中…</div>
                    <div style={{ marginTop: 4, fontSize: 13, color: '#64748B' }}>正在计算关系路径</div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 10, textAlign: 'right', fontSize: 11, color: '#CBD5E1' }}>{main.disclaimer}</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ================ 关联方识别 ================ */
function RelatedTab({ data, onSearch }: { data: RelatedData; onSearch: () => void }) {
  const [typeSel, setTypeSel] = useState<Set<string>>(
    () => new Set(data.filter.types.filter((t) => t.checked).map((t) => t.key))
  )
  const [excludeSel, setExcludeSel] = useState<Set<string>>(
    () => new Set(data.filter.excludes.filter((e) => e.checked).map((e) => e.key))
  )
  const [diagramOpen, setDiagramOpen] = useState(true)
  const [kw, setKw] = useState('')

  const toggleType = (key: string) => {
    const next = new Set(typeSel)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setTypeSel(next)
  }
  const toggleExclude = (key: string) => {
    const next = new Set(excludeSel)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setExcludeSel(next)
  }

  const rec = data.records
  const checkStyle = { accentColor: '#1677ff' as const, width: 15, height: 15, cursor: 'pointer' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 顶部搜索栏 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        <div style={{ display: 'flex', width: 640, maxWidth: '100%' }}>
          <input
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder={data.search.placeholder}
            style={{
              flex: 1,
              padding: '11px 16px',
              borderRadius: '8px 0 0 8px',
              border: '1px solid #E2E8F0',
              borderRight: 'none',
              background: '#F5F7FA',
              fontSize: 14,
              color: '#334155',
              outline: 'none',
            }}
          />
          <button
            onClick={onSearch}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '0 22px',
              borderRadius: '0 8px 8px 0',
              border: 'none',
              background: '#ffc53d',
              color: '#1F2937',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.5" y2="16.5" />
            </svg>
            {data.search.btn}
          </button>
        </div>
      </div>

      {/* 关系筛选条件区 */}
      <div style={{ background: '#f5f7fa', borderRadius: 10, padding: '14px 18px' }}>
        {/* 第一行：关系类型 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: '#334155', width: 78, flexShrink: 0, marginTop: 1 }}>
            {data.filter.typeTitle}
            <span style={{ fontSize: 11, color: '#94A3B8', border: '1px solid #94A3B8', borderRadius: '50%', width: 13, height: 13, textAlign: 'center', lineHeight: '12px', cursor: 'pointer' }}>
              ?
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', flex: 1 }}>
            {data.filter.types.map((t) => (
              <label key={t.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#334155', cursor: 'pointer' }}>
                <input type="checkbox" checked={typeSel.has(t.key)} onChange={() => toggleType(t.key)} style={checkStyle} />
                {t.label}
                {t.arrow && <span style={{ fontSize: 9, color: '#94A3B8' }}>▾</span>}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#1677ff', cursor: 'pointer', marginLeft: 'auto', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            {data.filter.settings}
          </div>
        </div>

        {/* 第二行：关系剔除 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: '#334155', width: 78, flexShrink: 0, marginTop: 1 }}>
            {data.filter.excludeTitle}
            <span style={{ fontSize: 11, color: '#94A3B8', border: '1px solid #94A3B8', borderRadius: '50%', width: 13, height: 13, textAlign: 'center', lineHeight: '12px', cursor: 'pointer' }}>
              ?
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
            {data.filter.excludes.map((e) => (
              <label key={e.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#334155', cursor: 'pointer' }}>
                <input type="checkbox" checked={excludeSel.has(e.key)} onChange={() => toggleExclude(e.key)} style={checkStyle} />
                {e.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 精选模板区 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 3, height: 16, background: '#1677ff', borderRadius: 2 }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{data.templates.title}</span>
        </div>
        <div style={{ display: 'flex', gap: 12, flex: 1 }}>
          {data.templates.items.map((t) => (
            <div
              key={t.key}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              <span style={{ color: '#1677ff', display: 'inline-flex' }}>
                {t.icon === 'doc' ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="8" y1="13" x2="16" y2="13" />
                    <line x1="8" y1="17" x2="16" y2="17" />
                  </svg>
                ) : t.icon === 'wave' ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M2 12c2 0 2-6 5-6s3 12 5 12 2-12 5-12 3 6 5 6" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18" />
                    <path d="M5 21V7l7-4 7 4v14" />
                    <path d="M9 21v-6h6v6" />
                  </svg>
                )}
              </span>
              <span style={{ fontSize: 13.5, color: '#334155', fontWeight: 500 }}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 关联方识别示意图 */}
      <div style={{ borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff', overflow: 'hidden' }}>
        {diagramOpen && (
          <div style={{ padding: '6px 10px 4px' }}>
            <svg viewBox="0 0 760 250" style={{ width: '100%', height: 'auto', display: 'block' }}>
              <defs>
                <radialGradient id="relatedCenter" cx="50%" cy="40%" r="70%">
                  <stop offset="0%" stopColor="#BFDCFF" />
                  <stop offset="100%" stopColor="#7BB8FF" />
                </radialGradient>
              </defs>
              {/* 左侧胶囊 + 虚线 */}
              {data.diagram.left.map((label, i) => {
                const y = 30 + i * 42
                return (
                  <g key={label}>
                    <line x1={220} y1={130} x2={252} y2={y + 15} stroke="#CBD5E1" strokeWidth={1} strokeDasharray="4 4" />
                    <rect x={120} y={y} width={132} height={30} rx={15} fill="#f0f2f5" />
                    <text x={186} y={y + 20} textAnchor="middle" style={{ fontSize: 12.5, fill: '#334155' }}>
                      {label}
                    </text>
                  </g>
                )
              })}
              {/* 右侧胶囊 + 虚线 */}
              {data.diagram.right.map((label, i) => {
                const y = 30 + i * 42
                return (
                  <g key={label}>
                    <line x1={540} y1={130} x2={508} y2={y + 15} stroke="#CBD5E1" strokeWidth={1} strokeDasharray="4 4" />
                    <rect x={508} y={y} width={132} height={30} rx={15} fill="#f0f2f5" />
                    <text x={574} y={y + 20} textAnchor="middle" style={{ fontSize: 12.5, fill: '#334155' }}>
                      {label}
                    </text>
                  </g>
                )
              })}
              {/* 中心节点 */}
              <circle cx={380} cy={130} r={58} fill="url(#relatedCenter)" />
              <circle cx={380} cy={130} r={58} fill="none" stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="3 3" />
              <g transform="translate(380, 108)">
                <circle cx="0" cy="0" r="3.5" fill="#2563EB" />
                <line x1="6" y1="0" x2="20" y2="0" stroke="#2563EB" strokeWidth="1.5" />
                <line x1="0" y1="6" x2="0" y2="20" stroke="#2563EB" strokeWidth="1.5" />
                <circle cx="22" cy="0" r="3" fill="#2563EB" />
                <circle cx="0" cy="22" r="3" fill="#2563EB" />
              </g>
              <text x={380} y={142} textAnchor="middle" style={{ fontSize: 14, fill: '#1D4ED8', fontWeight: 700 }}>
                {data.diagram.center}
              </text>
              {/* 一键试用 */}
              <text x={380} y={212} textAnchor="middle" style={{ fontSize: 13, fill: '#1677ff', cursor: 'pointer' }}>
                {data.diagram.try}
              </text>
            </svg>
          </div>
        )}
        <div
          onClick={() => setDiagramOpen((v) => !v)}
          style={{
            background: '#f5f7fa',
            textAlign: 'center',
            padding: '8px 0',
            fontSize: 13,
            color: '#64748B',
            cursor: 'pointer',
          }}
        >
          {diagramOpen ? data.diagram.collapse + ' ⌃' : '展开示例 ⌄'}
        </div>
      </div>

      {/* 排查记录表格 */}
      <div style={{ borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #EFF1F7' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>
            {rec.title} <span style={{ color: '#1677ff' }}>{rec.count}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {rec.filters.map((f) => (
              <select
                key={f.key}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #E2E8F0',
                  background: '#fff',
                  fontSize: 13,
                  color: '#64748B',
                  outline: 'none',
                }}
              >
                <option value="">{f.placeholder}</option>
              </select>
            ))}
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#FAFAFA' }}>
              {rec.columns.map((c, idx) => (
                <th
                  key={c}
                  style={{
                    padding: '10px 12px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#475569',
                    borderBottom: '1px solid #EFF1F7',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c}
                  {(c === '排查时间' || c === '完成时间') && <span style={{ color: '#94A3B8', fontSize: 10, marginLeft: 3 }}>⇅</span>}
                  {idx === rec.columns.length - 1 && <span style={{ color: '#E2E8F0' }}> </span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rec.rows.map((r, i) => (
              <tr key={r.id} style={{ background: i % 2 === 1 ? '#FAFAFA' : '#fff' }}>
                <td style={{ padding: '10px 12px', color: '#64748B' }}>{r.id}</td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {r.running ? (
                      <span
                        title="排查中"
                        style={{
                          width: 16,
                          height: 16,
                          border: '2px solid #DBEAFE',
                          borderTopColor: '#1677ff',
                          borderRadius: '50%',
                          display: 'inline-block',
                          animation: 'spin 1s linear infinite',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 5,
                          background: '#E11D48',
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        乐
                      </span>
                    )}
                    <span style={{ color: '#1677ff', cursor: 'pointer' }}>{r.name}</span>
                  </div>
                </td>
                <td style={{ padding: '10px 12px', color: '#334155' }}>
                  {r.running ? (
                    <span style={{ color: '#94A3B8' }}>—</span>
                  ) : (
                    <>
                      {r.result}{' '}
                      <span style={{ color: '#1677ff', fontWeight: 600 }}>关联方{r.resultCount}条</span>
                    </>
                  )}
                </td>
                <td style={{ padding: '10px 12px', color: '#334155' }}>{r.person}</td>
                <td style={{ padding: '10px 12px', color: '#334155', whiteSpace: 'nowrap' }}>{r.startTime}</td>
                <td style={{ padding: '10px 12px', color: r.endTime === '—' ? '#94A3B8' : '#334155', whiteSpace: 'nowrap' }}>{r.endTime}</td>
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                  {rec.actions.map((a, ai) => (
                    <span key={a}>
                      {ai > 0 && <span style={{ margin: '0 6px', color: '#E2E8F0' }}>|</span>}
                      <a style={{ color: '#1677ff', cursor: 'pointer' }}>{a}</a>
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function JdRelation() {
  const [data] = useSample<Data>('jdRelation.json', seed)
  const { goDetail } = usePageNav()
  const [activeTab, setActiveTab] = useState(data.activeTab)
  const [targets, setTargets] = useState<Target[]>(data.left.targets)
  const [inputs, setInputs] = useState(['', ''])
  const [loading, setLoading] = useState(false)
  const [resultOpen, setResultOpen] = useState(true)

  useEffect(() => {
    setTargets(data.left.targets)
  }, [data.left.targets])

  const startCheck = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2500)
  }

  const removeTarget = (id: string) => setTargets((t) => t.filter((x) => x.id !== id))
  const addTarget = () => {
    const name = inputs[0] || inputs[1]
    if (!name.trim()) return
    setTargets((t) => [...t, { id: 't' + Date.now(), name: name.trim(), type: 'company' }])
    setInputs(['', ''])
  }

  const isCentral = activeTab === 'central'

  return (
    <EpPage title={data.pageTitle} actions={<Sam value={data.source} />}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: 16 }}>
        {data.tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              position: 'relative',
              padding: '10px 18px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 15,
              color: activeTab === t.key ? '#0F172A' : '#64748B',
              fontWeight: activeTab === t.key ? 600 : 400,
            }}
          >
            {t.label}
            {t.badge && (
              <span
                style={{
                  marginLeft: 6,
                  padding: '1px 5px',
                  borderRadius: 4,
                  background: '#3B82F6',
                  color: '#fff',
                  fontSize: 10,
                }}
              >
                {t.badge}
              </span>
            )}
            {activeTab === t.key && (
              <span
                style={{
                  position: 'absolute',
                  bottom: -1,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: '#3B82F6',
                }}
              />
            )}
          </button>
        ))}
      </div>

      {isCentral ? (
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          {/* Left panel */}
          <div
            style={{
              width: 300,
              flexShrink: 0,
              borderRadius: 12,
              background: '#fff',
              border: '1px solid #E2E8F0',
              padding: '16px 14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>
                {data.left.targetTitle}({targets.length})
              </div>
              <div style={{ display: 'flex', gap: 10, fontSize: 13, color: '#64748B' }}>
                <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}>
                  {data.left.clear}
                </button>
                <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}>
                  {data.left.settings}
                </button>
                <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#3B82F6' }}>
                  {data.left.batchAdd}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {targets.map((t) => (
                <TargetChip key={t.id} name={t.name} type={t.type} onRemove={() => removeTarget(t.id)} />
              ))}
              {inputs.map((v, i) => (
                <input
                  key={i}
                  value={v}
                  onChange={(e) => {
                    const next = [...inputs]
                    next[i] = e.target.value
                    setInputs(next)
                  }}
                  placeholder={data.left.inputPlaceholder}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              ))}
            </div>

            <button
              onClick={addTarget}
              style={{
                marginTop: 12,
                border: 'none',
                background: 'transparent',
                color: '#3B82F6',
                fontSize: 14,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {data.left.addTarget}
            </button>

            <EpBtn
              onClick={startCheck}
              variant="primary"
              style={{
                width: '100%',
                marginTop: 16,
                height: 42,
                fontSize: 15,
                fontWeight: 600,
                background: '#F59E0B',
                borderColor: '#F59E0B',
              }}
            >
              {data.left.startCheck}
            </EpBtn>

            {/* Result section */}
            <div
              style={{
                marginTop: 18,
                borderTop: '1px solid #E2E8F0',
                paddingTop: 14,
              }}
            >
              <div
                onClick={() => setResultOpen((v) => !v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>{data.left.result.title}</span>
                <span style={{ color: '#94A3B8', fontSize: 13 }}>{resultOpen ? '▾' : '▸'}</span>
              </div>

              {resultOpen && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                    {data.left.result.filters.map((f) => (
                      <button
                        key={f.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 13,
                          color: '#64748B',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ color: '#3B82F6' }}>☰</span>
                        {f.label}
                      </button>
                    ))}
                    <span style={{ marginLeft: 'auto', fontSize: 13, color: '#64748B' }}>排序 ↕</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: '#F8FAFC',
                      marginBottom: 12,
                    }}
                  >
                    <span style={{ fontSize: 14, color: '#64748B' }}>{data.left.result.summaryLabel}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#EF4444' }}>
                      {data.left.result.summaryValue}
                    </span>
                    <span style={{ marginLeft: 'auto', color: '#94A3B8' }}>{data.left.result.summaryArrow}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {data.left.result.items.map((item, idx) => (
                      <div key={item.id} style={{ padding: 12, borderRadius: 8, background: '#F8FAFC' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <span style={{ fontSize: 13, color: '#64748B' }}>{idx + 1}</span>
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: '#FEF3C7',
                              color: '#B45309',
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            {item.levelLabel}
                          </span>
                          <span style={{ marginLeft: 'auto', fontSize: 13, color: '#3B82F6', fontWeight: 600 }}>
                            {item.paths}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6 }}>{item.content}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Main area */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                borderRadius: 12,
                background: '#fff',
                border: '1px solid #E2E8F0',
                padding: 16,
                minHeight: 560,
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ color: '#F59E0B', fontSize: 16 }}>⚠</span>
                  <div style={{ fontSize: 15, color: '#0F172A', lineHeight: 1.6 }}>
                    {data.main.summary.parts.map((p, i) => (
                      <span
                        key={i}
                        style={{
                          fontWeight: p.highlight ? 700 : 400,
                          color: p.highlight && p.color ? p.color : '#0F172A',
                        }}
                      >
                        {p.text}
                      </span>
                    ))}
                  </div>
                </div>
                <EpBtn variant="primary" size="sm" style={{ background: '#3B82F6', borderColor: '#3B82F6' }}>
                  {data.main.aiBtn}
                </EpBtn>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 12 }}>
                {data.main.legend.map((l) => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748B' }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: l.color,
                      }}
                    />
                    {l.label}
                  </div>
                ))}
              </div>

              <div style={{ position: 'relative' }}>
                <GraphView data={data.main.graph} />
                {loading && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255,255,255,0.85)',
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        border: '4px solid #E2E8F0',
                        borderTopColor: '#3B82F6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                    <div style={{ marginTop: 14, fontSize: 15, fontWeight: 600, color: '#0F172A' }}>
                      {data.main.loading.text}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 13, color: '#64748B' }}>{data.main.loading.spinText}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'group' ? (
        <GroupTab data={data.group} />
      ) : (
        <RelatedTab data={data.related} onSearch={() => goDetail('/console/ep/jd-relation-result')} />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </EpPage>
  )
}
