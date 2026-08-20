import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Sam, Cfg } from './SourceTag';
import { computeCenterFit, Bounds } from './graphFit';
import chainData from './entChainGraph.json';
import EntEquityGraph from './EntEquityGraph';
import EntEquityStructure from './EntEquityStructure';
import EntControllerRelation from './EntControllerRelation';
import EntBeneficialOwner from './EntBeneficialOwner';
import EntCompanyRelation from './EntCompanyRelation';
import EntRelatedParty from './EntRelatedParty';
import EntTopBeneficiary from './EntTopBeneficiary';

/* 企业档案 · 企业图谱 · 企业链图（左侧图谱画布 + 右侧筛选面板）
 * 数据：entChainGraph.json（本地样例 JSON，使用域作者维护）
 * 交互：子 Tab 切换、画布拖拽平移/滚轮缩放、节点高亮/点击、筛选复选框实时过滤、展开/收起下级
 */

type ChainNode = {
  id: string; name: string; type: string; x: number; y: number;
  post?: string; ratio?: string; expand?: string; collapse?: string;
};
type Link = { from: string; to: string };
type Filter = { key: string; label: string; count: number; help?: boolean };

// 节点类型 → 底色 / 文字色（四、设计标准·色彩规范）
const TYPE_STYLE: Record<string, { bg: string; fg: string }> = {
  core: { bg: '#1677ff', fg: '#fff' },        // 深蓝 主体
  staff: { bg: '#f3e8ff', fg: '#4a4a6a' },    // 浅紫 人员
  invest: { bg: '#f3e8ff', fg: '#4a4a6a' },   // 浅紫 对外投资
  branch: { bg: '#f3e8ff', fg: '#4a4a6a' },   // 浅紫 分支机构
  court: { bg: '#ffe4e6', fg: '#6b3a4a' },    // 浅粉 法院公告
  history: { bg: '#dcfce7', fg: '#3d5a4a' },  // 浅绿 历史股东
  suspect: { bg: '#ffedd5', fg: '#7a4a1a' },  // 浅橙 疑似关系
  hold: { bg: '#ffedd5', fg: '#7a4a1a' },     // 浅橙 控股/合作企业
};

const SUB_TABS = [
  '企业链图', '股权穿透', '股权结构', '控制人关系',
  '受益所有人', '企业关系', '关联方认定', '十大受益人',
];

// 节点分类 → 对应筛选 key（未展示分类默认展开）
const TYPE_TO_FILTER: Record<string, string> = {
  staff: 'staff', invest: 'invest', branch: 'branch',
  court: 'court', history: 'history', suspect: 'suspect',
};

export default function EntChainGraph({
  companyName,
  activeSub: activeSubProp,
  onSubChange,
}: {
  companyName?: string;
  activeSub?: string;
  onSubChange?: (s: string) => void;
}) {
  const [internalSub, setInternalSub] = useState('企业链图');
  const activeSub = activeSubProp ?? internalSub;
  const setActiveSub = (s: string) => { setInternalSub(s); onSubChange?.(s); };
  const [viewMode, setViewMode] = useState<'chain' | 'tree'>('chain');
  const [timeWatermark, setTimeWatermark] = useState(true);
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(chainData.filters.map((f) => [f.key, true]))
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  // 画布变换（初始居中核心节点：x 平移 500 使 core 大致居中，y 平移 280）
  const [transform, setTransform] = useState({ x: 500, y: 280, k: 0.9 });
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [help, setHelp] = useState(false);
  const [order, setOrder] = useState<Record<string, 'asc' | 'desc'>>({});

  const nodes = chainData.nodes as unknown as ChainNode[];
  const links = chainData.links as unknown as Link[];
  const filters = chainData.filters as unknown as Filter[];
  const company = companyName || chainData.company;

  // 根据筛选 + 展开状态决定可见节点集合
  // 层级：core → 分支节点（高管/对外投资…）→ 分支成员（吕向阳/子公司…）
  // 默认展示 core + 分支 + 分支直接成员两级；分支成员受分类筛选控制。
  const visibleSet = useMemo(() => {
    const set = new Set<string>(['core']);
    const filterByKey = (key: string) => TYPE_TO_FILTER[key] ? checked[TYPE_TO_FILTER[key]] : true;

    const traverse = (id: string) => {
      const children = links.filter((l) => l.from === id).map((l) => l.to);
      children.forEach((cid) => {
        const cn = nodes.find((x) => x.id === cid);
        if (!cn) return;
        if (!filterByKey(cn.type)) return;
        set.add(cid);
        // 分支成员有下级时（如 疑似关系 的二级），需展开状态才继续下钻
        const hasChildren = links.some((l) => l.from === cid);
        if (hasChildren && expanded[cid]) traverse(cid);
      });
    };
    traverse('core');
    return set;
  }, [checked, expanded, links, nodes]);

  const visibleNodes = useMemo(() => {
    let list = nodes.filter((n) => visibleSet.has(n.id));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((n) => n.name.toLowerCase().includes(q));
    }
    return list;
  }, [nodes, visibleSet, search]);

  const visibleLinks = useMemo(
    () => links.filter((l) => visibleSet.has(l.from) && visibleSet.has(l.to)),
    [links, visibleSet]
  );

  const nodeById = useMemo(() => {
    const m: Record<string, ChainNode> = {};
    nodes.forEach((n) => { m[n.id] = n; });
    return m;
  }, [nodes]);

  // ---- 画布交互 ----
  const onWheel = (e: React.WheelEvent) => {
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    setTransform((t) => ({ ...t, k: Math.min(3, Math.max(0.3, t.k * factor)) }));
  };
  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: transform.x, origY: transform.y };
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setTransform((t) => ({ ...t, x: dragRef.current!.origX + dx, y: dragRef.current!.origY + dy }));
  };
  const onPointerUp = () => { dragRef.current = null; setDragging(false); };

  // 内容包围盒（企业链图：左右分支 + 上下节点）
  const contentBounds: Bounds = { minX: -270, minY: -240, maxX: 270, maxY: 1030 };
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const fit = () => {
    const el = canvasRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTransform(computeCenterFit(contentBounds, r.width, r.height, 30));
  };
  const resetCanvas = fit;
  const refreshGraph = fit;
  useLayoutEffect(() => { fit(); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  };

  const toggleFilter = (key: string) =>
    setChecked((p) => ({ ...p, [key]: !p[key] }));

  const toggleOrder = (key: string) =>
    setOrder((p) => ({ ...p, [key]: p[key] === 'asc' ? 'desc' : 'asc' }));

  const exportGraph = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company}-企业链图.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportData = () => {
    const payload = { company, updatedAt: chainData.updatedAt, nodes: visibleNodes, links: visibleLinks };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company}-企业链图.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const svgRef = useRef<SVGSVGElement | null>(null);

  // 排序（仅影响筛选列表展示）
  const sortedFilters = useMemo(() => {
    return [...filters].sort((a, b) => {
      const o = order[a.key];
      if (!o) return 0;
      return o === 'asc' ? a.count - b.count : b.count - a.count;
    });
  }, [filters, order]);

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif', color: '#333' }}>
      {/* ============ 一、二级子Tab导航（统一样式：圆角标签，选中蓝底白字，自动换行） ============ */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '4px 2px 12px', marginBottom: 16, borderBottom: '1px solid #edf0f5' }}>
        {SUB_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveSub(t)}
            style={{
              padding: '5px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
              border: activeSub === t ? '1px solid #1677ff' : '1px solid #e0e3ea',
              background: activeSub === t ? '#1677ff' : '#fff',
              color: activeSub === t ? '#fff' : '#666',
              fontWeight: activeSub === t ? 600 : 400,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ============ 二、内容区 ============ */}
      {activeSub === '受益所有人' ? (
        <EntBeneficialOwner companyName={companyName} />
      ) : activeSub === '企业关系' ? (
        <EntCompanyRelation companyName={companyName} />
      ) : activeSub === '关联方认定' ? (
        <EntRelatedParty companyName={companyName} />
      ) : activeSub === '十大受益人' ? (
        <EntTopBeneficiary companyName={companyName} />
      ) : activeSub === '股权穿透' ? (
        <EntEquityGraph companyName={companyName} />
      ) : activeSub === '股权结构' ? (
        <EntEquityStructure companyName={companyName} />
      ) : activeSub === '控制人关系' ? (
        <EntControllerRelation companyName={companyName} />
      ) : activeSub !== '企业链图' ? (
        /* 其余 4 个主题：同一左右布局骨架下的主题占位 */
        <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
          <div style={{ flex: 1, minWidth: 0, border: '1px solid #e8ebf0', borderRadius: 10, background: '#fbfcfe', display: 'flex', flexDirection: 'column', minHeight: 560, alignItems: 'center', justifyContent: 'center', color: '#9aa3b2', fontSize: 14 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🕸️</div>
            <div>「{activeSub}」图谱建设中，敬请期待</div>
          </div>
          <div style={{ width: 280, flexShrink: 0, border: '1px solid #e8ebf0', borderRadius: 10, background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#b0b6bf', fontSize: 13, minHeight: 560 }}>
            筛选配置面板
          </div>
        </div>
      ) : (
      <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
        {/* ====== 左侧：图谱画布 ====== */}
        <div style={{ flex: 1, minWidth: 0, border: '1px solid #e8ebf0', borderRadius: 10, overflow: 'hidden', background: '#fbfcfe', display: 'flex', flexDirection: 'column' }}>
          {/* 工具栏（居中横向） */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '10px 16px', borderBottom: '1px solid #edf0f5', background: '#fff', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>{company}</span>
            <ToolBtn tip="清空 / 重置画布" onClick={resetCanvas}>×</ToolBtn>
            <ToolBtn tip="刷新图谱数据" onClick={refreshGraph}>⟳</ToolBtn>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#555', cursor: 'pointer' }}>
              <span style={{ borderBottom: '1px dashed #aaa', cursor: 'help' }} title="开启/关闭图谱节点时间水印展示">时间水印</span>
              <span
                onClick={(e) => { e.preventDefault(); setTimeWatermark((v) => !v); }}
                style={{ width: 34, height: 18, borderRadius: 10, background: timeWatermark ? '#1677ff' : '#ccc', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}
              >
                <span style={{ position: 'absolute', top: 2, left: timeWatermark ? 18 : 2, width: 14, height: 14, borderRadius: 7, background: '#fff', transition: 'left .2s' }} />
              </span>
            </label>
            <ToolBtn tip="导出图谱" onClick={exportGraph}>⤓</ToolBtn>
          </div>

          {/* 画布 */}
          <div
            ref={canvasRef}
            style={{ position: 'relative', flex: 1, minHeight: 560, overflow: 'hidden', cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none' }}
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <svg ref={svgRef} width="100%" height="100%" style={{ display: 'block' }}>
              <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
                {/* 连接线：灰色实线 */}
                {visibleLinks.map((l) => {
                  const a = nodeById[l.from]; const b = nodeById[l.to];
                  if (!a || !b) return null;
                  const active = activeNode === a.id || activeNode === b.id;
                  return (
                    <line
                      key={`${l.from}-${l.to}`}
                      x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      stroke={active ? '#1677ff' : '#c9cdd4'}
                      strokeWidth={active ? 1.6 : 1}
                    />
                  );
                })}
                {/* 节点卡片 */}
                {visibleNodes.map((n) => {
                  const st = TYPE_STYLE[n.type] || TYPE_STYLE.suspect;
                  const hasChildren = links.some((l) => l.from === n.id);
                  const isExpanded = !!expanded[n.id];
                  const hovered = hoverNode === n.id;
                  const active = activeNode === n.id;
                  const nodeW = n.id === 'core' ? Math.max(160, company.length * 14 + 40) : 150;
                  const nodeH = 34;
                  return (
                    <g
                      key={n.id}
                      transform={`translate(${n.x - nodeW / 2},${n.y - nodeH / 2})`}
                      onPointerDown={(e) => e.stopPropagation()}
                      onPointerEnter={() => setHoverNode(n.id)}
                      onPointerLeave={() => setHoverNode(null)}
                      onClick={() => setActiveNode(active ? null : n.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* 时间水印 */}
                      {timeWatermark && (
                        <text x={nodeW - 4} y={nodeH + 14} textAnchor="end" fontSize={10} fill="#b7c0cd">
                          {chainData.updatedAt}
                        </text>
                      )}
                      <rect
                        x={0} y={0} width={nodeW} height={nodeH} rx={6}
                        fill={st.bg}
                        stroke={active ? '#1677ff' : (hovered ? '#1677ff' : 'transparent')}
                        strokeWidth={1.5}
                      />
                      <text
                        x={10} y={nodeH / 2 + 4}
                        fontSize={13}
                        fill={st.fg}
                        fontWeight={n.id === 'core' ? 600 : 400}
                      >
                        {n.id === 'core' ? company : n.name}
                        {n.post ? ` ${n.post}` : ''}
                      </text>
                      {/* 占比 */}
                      {n.ratio && (
                        <text x={nodeW - 8} y={nodeH / 2 + 4} textAnchor="end" fontSize={11} fill="#8a7a5a">
                          {n.ratio}
                        </text>
                      )}
                      {/* 折叠/展开标识 */}
                      {/* 展开/折叠控件：+搜索(N) / 搜索(N)+ / 收起− */}
                      {hasChildren && (
                        <g transform={`translate(${nodeW - 8},${nodeH + 10})`} onClick={(e) => toggleExpand(n.id, e)} style={{ cursor: 'pointer' }}>
                          <rect x={-44} y={-11} width={52} height={22} rx={11} fill="#fff" stroke={isExpanded ? '#999' : '#1677ff'} />
                          {n.expand && !isExpanded && <text x={-24} y={4} textAnchor="middle" fontSize={11} fill="#1677ff">+搜索({n.expand})</text>}
                          {n.collapse && !isExpanded && <text x={-24} y={4} textAnchor="middle" fontSize={11} fill="#1677ff">搜索({n.collapse})+</text>}
                          {isExpanded && <text x={-24} y={4} textAnchor="middle" fontSize={11} fill="#999">收起−</text>}
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
            {/* 空状态 */}
            {visibleNodes.length === 0 && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9aa3b2', fontSize: 14, gap: 8, pointerEvents: 'none' }}>
                <div style={{ fontSize: 40 }}>🕸️</div>
                <div>暂无匹配的企业链图节点，请调整右侧筛选条件</div>
              </div>
            )}
            {/* 缩放提示 */}
            <div style={{ position: 'absolute', left: 12, bottom: 12, fontSize: 12, color: '#9aa3b2', pointerEvents: 'none' }}>
              滚轮缩放 · 拖拽平移 · 点击节点查看详情
            </div>
          </div>

          {/* 底部备注 */}
        </div>

        {/* ====== 右侧：筛选配置面板 ====== */}
        <div style={{ width: 280, flexShrink: 0, border: '1px solid #e8ebf0', borderRadius: 10, background: '#fff', display: 'flex', flexDirection: 'column' }}>
          {/* 视图切换 + 下载 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderBottom: '1px solid #edf0f5' }}>
            <div style={{ display: 'flex', border: '1px solid #d9dde8', borderRadius: 6, overflow: 'hidden', flex: 1 }}>
              {(['tree', 'chain'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  style={{
                    flex: 1, padding: '6px 0', border: 'none', fontSize: 13, cursor: 'pointer',
                    background: viewMode === m ? '#eaf2ff' : '#fff',
                    color: viewMode === m ? '#1677ff' : '#666',
                    borderRight: m === 'tree' ? '1px solid #d9dde8' : 'none',
                  }}
                >
                  {m === 'tree' ? '树状图' : '链图'}
                </button>
              ))}
            </div>
            <button
              onClick={exportData}
              style={{ padding: '6px 12px', border: '1px solid #d9d9d9', borderRadius: 6, background: '#fff', color: '#333', fontSize: 13, cursor: 'pointer' }}
              title="导出结构化数据"
            >
              下载数据
            </button>
          </div>

          {/* 搜索 */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #edf0f5' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d9dde8', borderRadius: 6, padding: '0 8px', background: '#fafbfc' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索关联的企业或人名"
                style={{ border: 'none', outline: 'none', padding: '7px 6px', fontSize: 13, width: '100%', background: 'transparent' }}
              />
            </div>
          </div>

          {/* 筛选列表 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
            {sortedFilters.map((f) => {
              const on = checked[f.key];
              return (
                <div
                  key={f.key}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13, color: on ? '#333' : '#b0b6bf' }}
                  onClick={() => toggleFilter(f.key)}
                >
                  <span style={{ width: 16, height: 16, borderRadius: 4, border: on ? '1px solid #1677ff' : '1px solid #d9dde8', background: on ? '#1677ff' : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, flexShrink: 0 }}>
                    {on && '✓'}
                  </span>
                  <span style={{ flex: 1 }}>{f.label}</span>
                  <span style={{ color: '#888', minWidth: 24, textAlign: 'right' }}>{f.count > 999 ? '999+' : f.count}</span>
                  {f.help && (
                    <span
                      style={{ color: '#999', cursor: 'help', fontSize: 13, position: 'relative' }}
                      onClick={(e) => { e.stopPropagation(); setHelp(!help); }}
                    >
                      ⓘ
                      {help && (
                        <span style={{ position: 'absolute', right: 0, top: 18, width: 190, background: '#fff', border: '1px solid #e8ebf0', borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,.12)', padding: 8, fontSize: 12, color: '#555', zIndex: 20, lineHeight: 1.5 }}>
                          疑似关系：通过相同专利、相同法人、相同地址等特征，结合大数据分析识别出的可能关联关系。
                        </span>
                      )}
                    </span>
                  )}
                  <button
                    title={order[f.key] === 'asc' ? '当前升序，点击降序' : '当前默认，点击升序'}
                    onClick={(e) => { e.stopPropagation(); toggleOrder(f.key); }}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', flexDirection: 'column', gap: 1 }}
                  >
                    <svg width="8" height="5" viewBox="0 0 8 5" fill={order[f.key] === 'asc' ? '#1677ff' : '#bbb'}><path d="M0 5L4 0L8 5Z" /></svg>
                    <svg width="8" height="5" viewBox="0 0 8 5" fill={order[f.key] === 'desc' ? '#1677ff' : '#bbb'}><path d="M0 0L4 5L8 0Z" /></svg>
                  </button>
                </div>
              );
            })}
          </div>
          {/* 回到顶部 */}
          <div style={{ padding: '10px 14px', borderTop: '1px solid #edf0f5', textAlign: 'center' }}>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{ padding: '6px 20px', border: '1px solid #d9dde8', borderRadius: 16, background: '#fff', color: '#555', fontSize: 12, cursor: 'pointer' }}
            >
              ↑ 回到顶部
            </button>
          </div>
        </div>
      </div>
      )}

      {/* 数据来源标签 */}
      <div style={{ marginTop: 12 }}>
        <Sam label="企业链图" /> <Cfg label="筛选配置" />
      </div>
    </div>
  );
}

function ToolBtn({ tip, children, onClick }: { tip: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      title={tip}
      style={{ width: 30, height: 30, border: '1px solid #e0e3ea', borderRadius: 6, background: '#fff', color: '#555', fontSize: 16, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
    >
      {children}
    </button>
  );
}
