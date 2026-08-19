// 尽调中心 · 关系尽调 · 关联方识别结果页（jd-relation-result）
// 数据：本地样例 jdRelationResult.json（橘 Sam）
import { useState } from 'react'
import { EpPage, useSample, Sam } from '../../epCommon'

type TreeNode = { key: string; label: string; count: number; active?: boolean }
type TreeGroup = { key: string; label: string; count: number; children: TreeNode[] }
type DetailRow = { id: number; name: string; position: string; intro: string | null; long?: boolean; path: string }
type Data = {
  source: string
  pageTitle: string
  crumb: string
  targetLabel: string
  targetValue: string
  expandRule: string
  resultSummary: string
  count: number
  toolbar: { upload: string; searchPlaceholder: string; report: string; download: string }
  tree: TreeGroup[]
  detail: { columns: string[]; rows: DetailRow[]; expand: string; collapse: string }
  nextSection: { title: string; count: number; filter: string }
  empty: string
}

const seed: Data = {
  source: 'jdRelationResult',
  pageTitle: '关联方识别',
  crumb: '关联方识别 / 识别结果',
  targetLabel: '识别目标',
  targetValue: '乐视网信息技术（北京）股份有限公司',
  expandRule: '展开规则',
  resultSummary: '关系结果识别完成，共找到{count}个关联方',
  count: 2986,
  toolbar: {
    upload: '上传名单，排查是否命中关联方',
    searchPlaceholder: '在当前结果中查找企业',
    report: '生成报送文件',
    download: '下载报告',
  },
  tree: [
    {
      key: 'dgd',
      label: '董监高',
      count: 285,
      children: [
        { key: 'dgd-8', label: '董监高', count: 8, active: true },
        { key: 'dgd-invest', label: '董监高对外投资', count: 225 },
        { key: 'dgd-control', label: '董监高实控企业', count: 52 },
      ],
    },
    {
      key: 'holder',
      label: '股东',
      count: 3167,
      children: [
        { key: 'h-13', label: '股东', count: 13 },
        { key: 'h-invest', label: '直接股东对外投资', count: 2597 },
        { key: 'h-control', label: '直接股东实控企业', count: 526 },
        { key: 'h-dgd', label: '直接股东董监高', count: 31 },
      ],
    },
    {
      key: 'invest',
      label: '对外投资',
      count: 490,
      children: [{ key: 'i-490', label: '对外投资', count: 490 }],
    },
  ],
  detail: {
    columns: ['序号', '主要人员姓名', '职位', '简介', '关联路径'],
    rows: [
      { id: 1, name: '魏波', position: '监事、监事会主席', intro: null, path: '详情' },
      { id: 2, name: '张巍', position: '监事、职工代表监事', intro: null, path: '详情' },
      { id: 3, name: '李利婷', position: '董事', intro: null, path: '详情' },
      { id: 4, name: '高昊', position: '董事', intro: null, path: '详情' },
      {
        id: 5,
        name: '刘延峰',
        position: '法定代表人、财务负…',
        intro: '刘延峰，男，1987年6月出生。曾任职于河北家兴易购科技股份有限公司。现任乐视网第四届董事会董事长。',
        path: '详情',
      },
      {
        id: 6,
        name: '杨涛',
        position: '监事会主席',
        intro:
          '杨涛,男,1975年2月出生,中国国籍,无境外居留权,学士,毕业于首都经济贸易大学,获得审计学专业学士学位,中国注册会计师。2001年至2015年,任普华永道会计师事务所审计师、高级审计师、经理、高级经理;2015年至2016年,任北京大生知行科技有限公司财务总监;2016年至2017年,任宏力…',
        long: true,
        path: '详情',
      },
      { id: 7, name: '鲁浩', position: '董事', intro: null, path: '详情' },
      { id: 8, name: '崔留磊', position: '董事', intro: null, path: '详情' },
    ],
    expand: '展开',
    collapse: '收起',
  },
  nextSection: { title: '董监高对外投资', count: 225, filter: '持股比例' },
  empty: '该分类暂无明细数据',
}

export default function JdRelationResult({ params }: { params: URLSearchParams }) {
  const [data] = useSample<Data>('jdRelationResult.json', seed)
  const [activeKey, setActiveKey] = useState('dgd-8')
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => Object.fromEntries(data.tree.map((g) => [g.key, true])))
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [kw, setKw] = useState('')

  const dg = data.detail
  const ns = data.nextSection
  const activeNode = data.tree
    .flatMap((g) => g.children)
    .find((n) => n.key === activeKey)

  const toggleGroup = (key: string) => {
    const next = { ...openGroups }
    next[key] = !next[key]
    setOpenGroups(next)
  }
  const toggleExpanded = (id: number) => {
    const next = new Set(expanded)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpanded(next)
  }

  return (
    <EpPage
      title={data.pageTitle}
      crumb={data.crumb}
      actions={<Sam value={data.source} />}
    >
      {/* 识别目标栏 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: '#64748B', flexShrink: 0 }}>{data.targetLabel}</span>
        <input
          value={data.targetValue}
          readOnly
          style={{
            width: 360,
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #D9D9D9',
            fontSize: 13,
            color: '#1F2329',
            background: '#fff',
            outline: 'none',
          }}
        />
        <button
          style={{
            margin: '0 auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 18px',
            borderRadius: 6,
            border: '1px solid #D9D9D9',
            background: '#fff',
            color: '#333',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {data.expandRule} ▾
        </button>
      </div>

      {/* 结果操作栏 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: '#1F2329' }}>
          {data.resultSummary.replace('{count}', String(data.count))}
        </span>
        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #1677ff',
            background: '#fff',
            color: '#1677ff',
            fontSize: 12.5,
            cursor: 'pointer',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {data.toolbar.upload}
        </button>
        <div style={{ position: 'relative' }}>
          <input
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder={data.toolbar.searchPlaceholder}
            style={{
              width: 220,
              padding: '6px 10px 6px 28px',
              borderRadius: 6,
              border: '1px solid #D9D9D9',
              fontSize: 12.5,
              outline: 'none',
              color: '#1F2329',
            }}
          />
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#BFBFBF"
            strokeWidth="2.4"
            strokeLinecap="round"
            style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }}
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.5" y2="16.5" />
          </svg>
        </div>
        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #D9D9D9',
            background: '#fff',
            color: '#333',
            fontSize: 12.5,
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          {data.toolbar.report}
          <span
            style={{
              position: 'absolute',
              top: -7,
              right: -8,
              padding: '0 4px',
              borderRadius: 4,
              background: '#EF4444',
              color: '#fff',
              fontSize: 9,
              lineHeight: '14px',
            }}
          >
            NEW
          </span>
        </button>
        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 16px',
            borderRadius: 6,
            border: 'none',
            background: '#ffc53d',
            color: '#1F2937',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {data.toolbar.download}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* 左侧分类树 */}
        <div
          style={{
            width: 280,
            flexShrink: 0,
            background: '#fff',
            borderRadius: 10,
            border: '1px solid #E8E8E8',
            padding: '12px 8px',
            maxHeight: 620,
            overflowY: 'auto',
          }}
        >
          {data.tree.map((g) => (
            <div key={g.key}>
              <div
                onClick={() => toggleGroup(g.key)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', cursor: 'pointer', fontSize: 13.5, color: '#1677ff', fontWeight: 600 }}
              >
                <span style={{ fontSize: 11, color: '#94A3B8', width: 12 }}>{openGroups[g.key] ? '▾' : '▸'}</span>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#1677ff',
                    display: 'inline-block',
                  }}
                />
                {g.label}
                <span style={{ color: '#94A3B8', fontWeight: 400, marginLeft: 'auto' }}>{g.count}</span>
              </div>
              {openGroups[g.key] && (
                <div style={{ marginLeft: 16 }}>
                  {g.children.map((c) => {
                    const active = activeKey === c.key
                    return (
                      <div
                        key={c.key}
                        onClick={() => setActiveKey(c.key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '7px 10px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: 13,
                          color: active ? '#1677ff' : '#333',
                          fontWeight: active ? 600 : 400,
                          background: active ? '#e8f3ff' : 'transparent',
                        }}
                      >
                        {c.label}
                        <span style={{ color: '#94A3B8', marginLeft: 'auto' }}>{c.count}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 右侧详情区 */}
        <div style={{ flex: 1, minWidth: 0, background: '#fff', borderRadius: 10, border: '1px solid #E8E8E8', padding: '16px 18px' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 12 }}>
            {activeNode ? `${activeNode.label} ${activeNode.count}` : ''}
          </div>

          {activeKey === 'dgd-8' ? (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#FAFAFA' }}>
                    {dg.columns.map((c, i) => (
                      <th
                        key={c}
                        style={{
                          padding: '9px 12px',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#475569',
                          borderBottom: '1px solid #EFF1F7',
                          width: i === 0 ? 60 : i === 3 ? 320 : undefined,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dg.rows.map((r, idx) => (
                    <tr key={r.id} style={{ background: idx % 2 === 1 ? '#FAFAFA' : '#fff' }}>
                      <td style={{ padding: '9px 12px', color: '#64748B' }}>{r.id}</td>
                      <td style={{ padding: '9px 12px', color: '#1677ff', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        {r.name}
                      </td>
                      <td style={{ padding: '9px 12px', color: '#334155', whiteSpace: 'nowrap' }}>{r.position}</td>
                      <td style={{ padding: '9px 12px', color: '#334155', lineHeight: 1.6 }}>
                        {r.intro ? (
                          <>
                            <span
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: expanded.has(r.id) ? undefined : 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {r.intro}
                            </span>
                            {r.long && (
                              <a
                                onClick={() => toggleExpanded(r.id)}
                                style={{ color: '#1677ff', cursor: 'pointer', fontSize: 12, marginLeft: 4 }}
                              >
                                {expanded.has(r.id) ? `【${dg.collapse} ▴】` : `【${dg.expand} ▾】`}
                              </a>
                            )}
                          </>
                        ) : (
                          <span style={{ color: '#BFBFBF' }}>–</span>
                        )}
                      </td>
                      <td style={{ padding: '9px 12px' }}>
                        <a style={{ color: '#1677ff', cursor: 'pointer', whiteSpace: 'nowrap' }}>{r.path}</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 表格下方分区 */}
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 20, paddingTop: 14, borderTop: '1px solid #F0F0F0' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
                  {ns.title} <span style={{ color: '#94A3B8', fontWeight: 400 }}>{ns.count}</span>
                </span>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>{ns.filter}</span>
                  <select
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: '1px solid #D9D9D9',
                      fontSize: 12,
                      color: '#333',
                      outline: 'none',
                      background: '#fff',
                    }}
                  >
                    <option>不限</option>
                    <option>≥ 50%</option>
                    <option>≥ 20%</option>
                    <option>≥ 5%</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: 60, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>{data.empty}</div>
          )}
        </div>
      </div>
    </EpPage>
  )
}
