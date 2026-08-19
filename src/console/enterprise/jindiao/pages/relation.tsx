// 尽调中心 · 关系尽调（jd-relation）· 集中排查 Tab
// 数据：本地样例 jdRelation.json（橘 Sam）
import { useState, useEffect } from 'react'
import { EpPage, EpBtn, useSample, Sam } from '../../epCommon'

type Target = { id: string; name: string; type: 'company' | 'person' }
type Filter = { key: string; label: string }
type ResultItem = { id: string; level: number; levelLabel: string; content: string; paths: number }
type SummaryPart = { text: string; highlight?: boolean; color?: string }
type LegendItem = { label: string; color: string }
type GraphNode = { id: string; label: string; type: 'company' | 'person' | 'target'; x: number; y: number }
type GraphEdge = { from: string; to: string; label: string }
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

export default function JdRelation() {
  const [data] = useSample<Data>('jdRelation.json', seed)
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
      ) : (
        <div
          style={{
            padding: 80,
            textAlign: 'center',
            color: '#94A3B8',
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
          }}
        >
          {activeTab === 'group' ? '组与组排查内容敬请期待' : '关联方识别内容敬请期待'}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </EpPage>
  )
}
