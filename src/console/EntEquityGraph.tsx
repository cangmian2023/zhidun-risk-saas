import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Sam, Cfg } from './SourceTag';
import { computeCenterFit, Bounds } from './graphFit';
import equityData from './entEquityPenetrate.json';

/* 企业档案 · 企业图谱 · 股权穿透（全屏图谱画布 + 右侧悬浮竖向工具栏）
 * 数据：entEquityPenetrate.json（本地样例 JSON，使用域作者维护）
 * 结构：三层纵向——上游持股方 / 核心主体 / 下游被投企业；带方向箭头连接线 + 持股比例
 */

type EquityNode = {
  id: string; name: string; type: string; ratio?: string; financing?: string; post?: string; detail?: string;
};
type Layer = {
  type: string; label: string; nodes: EquityNode[];
};

// 节点类型 → 标题栏底色 / 边框 / 标题文字色
const TYPE_STYLE: Record<string, { titleBg: string; border: string; core?: boolean; titleFg?: string; tag?: string }> = {
  beneficiary: { titleBg: '#f53f3f', border: '#f53f3f', titleFg: '#fff', tag: '受益所有人' }, // 受益所有人：红标题+红边框
  person: { titleBg: '#fff', border: '#f53f3f' },                                        // 普通持股自然人：无底色+红边框
  org: { titleBg: '#fff', border: '#1677ff' },                                          // 持股企业：无底色+蓝边框
  core: { titleBg: '#1677ff', border: '#1677ff', titleFg: '#fff', core: true },          // 核心主体：全蓝填充
  invest: { titleBg: '#fff', border: '#1677ff' },                                        // 下游被投企业：无底色+蓝边框
};

const LAYER_Y: Record<string, number> = { up: 150, mid: 470, down: 790 };
const LAYER_TITLE: Record<string, string> = { up: '上游持股方', mid: '核心主体', down: '下游被投企业' };

const NODE_H = 56;

export default function EntEquityGraph({ companyName }: { companyName?: string }) {
  const [timeWatermark, setTimeWatermark] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [detailNode, setDetailNode] = useState<EquityNode | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 0.85 });
  const [dragging, setDragging] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({ beneficiary: true, person: true, org: true, invest: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(companyName || equityData.company);
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const layers = equityData.layers as unknown as Layer[];
  // 公司名可编辑（编辑模式下修改）
  const company = editName || companyName || equityData.company;

  const upNodes = layers.find((l) => l.type === 'up')?.nodes || [];
  const midNodes = layers.find((l) => l.type === 'mid')?.nodes || [];
  const downNodes = layers.find((l) => l.type === 'down')?.nodes || [];

  // 节点 → 层级
  const layerOf = useMemo(() => {
    const m: Record<string, string> = {};
    layers.forEach((l) => l.nodes.forEach((n) => { m[n.id] = l.type; }));
    return m;
  }, [layers]);

  // 节点 x 坐标：横向均布
  const upPos = useMemo(() => { const w = 900; const gap = w / (upNodes.length || 1); return upNodes.map((n, i) => ({ ...n, x: gap * i - w / 2 + gap / 2, y: LAYER_Y.up })); }, [upNodes]);
  const downPos = useMemo(() => { const w = 1100; const gap = w / (downNodes.length || 1); return downNodes.map((n, i) => ({ ...n, x: gap * i - w / 2 + gap / 2, y: LAYER_Y.down })); }, [downNodes]);
  const midPos = useMemo(() => midNodes.map((n) => ({ ...n, x: 0, y: LAYER_Y.mid })), [midNodes]);

  // 应用筛选（core 始终显示）
  const allNodes = useMemo(() => {
    return [...upPos, ...midPos, ...downPos].filter((n) => n.type === 'core' || checked[n.type] !== false);
  }, [upPos, midPos, downPos, checked]);
  const nodeById = useMemo(() => { const m: Record<string, any> = {}; allNodes.forEach((n) => { m[n.id] = n; }); return m; }, [allNodes]);

  const nodeWidth = (n: EquityNode) => Math.max(120, n.name.length * 13 + 40);

  const onWheel = (e: React.WheelEvent) => {
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    setTransform((t) => ({ ...t, k: Math.min(3, Math.max(0.3, t.k * factor)) }));
  };
  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: transform.x, oy: transform.y };
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setTransform((t) => ({ ...t, x: dragRef.current!.ox + e.clientX - dragRef.current!.sx, y: dragRef.current!.oy + e.clientY - dragRef.current!.sy }));
  };
  const onPointerUp = () => { dragRef.current = null; setDragging(false); };

  const zoom = (f: number) => setTransform((t) => ({ ...t, k: Math.min(3, Math.max(0.3, t.k * f)) }));
  // 内容包围盒（股权穿透：上游~下游纵向三层）
  const contentBounds: Bounds = { minX: -560, minY: 140, maxX: 560, maxY: 800 };
  const fit = () => {
    const el = canvasRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTransform(computeCenterFit(contentBounds, r.width, r.height, 30));
  };
  const reset = fit;
  useLayoutEffect(() => { fit(); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const toggleFullscreen = () => {
    const el = canvasRef.current;
    if (!document.fullscreenElement && el) el.requestFullscreen?.();
    else document.exitFullscreen?.();
    setIsFullscreen(!!document.fullscreenElement);
  };

  const exportPng = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company}-股权穿透.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(equityData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company}-股权穿透.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const svgRef = useRef<SVGSVGElement | null>(null);

  // 模拟加载：本地样例数据加载延迟后渲染
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // 核心节点 id
  const coreId = midPos[0]?.id;

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif', color: '#333', position: 'relative' }}>
      <style>{`@keyframes entSpin{to{transform:rotate(360deg)}}`}</style>
      {/* ============ 全屏图谱画布 ============ */}
      <div
        ref={canvasRef}
        style={{ position: 'relative', width: '100%', height: 760, border: '1px solid #e8ebf0', borderRadius: 10, overflow: 'hidden', background: '#fbfcfe', touchAction: 'none', cursor: dragging ? 'grabbing' : 'grab' }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* 画布标题：左上角固定 */}
        <div style={{ position: 'absolute', left: 16, top: 14, zIndex: 5, fontSize: 16, fontWeight: 600, color: '#333', background: 'rgba(255,255,255,.92)', padding: '4px 12px', borderRadius: 6, border: '1px solid #e8ebf0', pointerEvents: 'none' }}>
          股权穿透
        </div>
        {/* 层级标题 */}
        <div style={{ position: 'absolute', left: 16, top: 60, zIndex: 5, display: 'flex', flexDirection: 'column', gap: 0, pointerEvents: 'none' }}>
          {(['up', 'mid', 'down'] as const).map((t) => (
            <div key={t} style={{ position: 'absolute', left: 0, top: (LAYER_Y[t] - 120) * transform.k + transform.y, fontSize: 12, color: '#999', whiteSpace: 'nowrap' }}>{LAYER_TITLE[t]}</div>
          ))}
        </div>

        <svg ref={svgRef} width="100%" height="100%" style={{ display: 'block' }}>
          <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
            {/* 连接线：上游→核心 / 核心→下游，带方向箭头 + 持股比例 */}
            {allNodes.map((n) => {
              const lyr = layerOf[n.id];
              if (!lyr || lyr === 'mid') return null;
              const core = nodeById[coreId];
              if (!core) return null;
              const from = lyr === 'up' ? n : core;
              const to = lyr === 'up' ? core : n;
              const ratio = n.ratio;
              const mx = (from.x + to.x) / 2;
              const my = (from.y + to.y) / 2;
              const active = activeNode === n.id || activeNode === coreId;
              return (
                <g key={`link-${n.id}`}>
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={active ? '#1677ff' : '#8c8c8c'} strokeWidth={1.4} />
                  {/* 箭头 */}
                  <polygon
                    points={`${to.x},${to.y - (from.y > to.y ? 18 : -18)} ${to.x - 5},${to.y - (from.y > to.y ? 30 : -30)} ${to.x + 5},${to.y - (from.y > to.y ? 30 : -30)}`}
                    fill={active ? '#1677ff' : '#8c8c8c'}
                  />
                  {/* 比例文本 */}
                  {ratio && (
                    <text x={mx} y={my} textAnchor="middle" fontSize={12} fill="#666" style={{ paintOrder: 'stroke', stroke: '#fbfcfe', strokeWidth: 3 }}>
                      {ratio}
                    </text>
                  )}
                </g>
              );
            })}

            {/* 节点卡片 */}
            {allNodes.map((n) => {
              const st = TYPE_STYLE[n.type] || TYPE_STYLE.org;
              const w = nodeWidth(n);
              const hovered = hoverNode === n.id;
              const active = activeNode === n.id;
              const isExpanded = !!expanded[n.id];
              const isCore = n.type === 'core';
              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x - w / 2},${n.y - NODE_H / 2})`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerEnter={() => setHoverNode(n.id)}
                  onPointerLeave={() => setHoverNode(null)}
                  onClick={() => { setActiveNode(n.id); setDetailNode(n); }}
                  style={{ cursor: 'pointer' }}
                >
                  {/* 时间水印 */}
                  {timeWatermark && (
                    <text x={w - 4} y={NODE_H + 14} textAnchor="end" fontSize={10} fill="#b7c0cd">{equityData.updatedAt}</text>
                  )}
                  {/* 卡片主体 */}
                  <rect x={0} y={0} width={w} height={NODE_H} rx={6} fill={isCore ? st.titleBg : '#fff'} stroke={active ? '#1677ff' : st.border} strokeWidth={hovered || active ? 1.8 : 1} />
                  {/* 受益所有人红色标题栏 */}
                  {n.type === 'beneficiary' && (
                    <rect x={0} y={0} width={w} height={22} rx={6} fill="#f53f3f" />
                  )}
                  {n.type === 'beneficiary' && (
                    <rect x={0} y={11} width={w} height={1} fill="#f53f3f" />
                  )}
                  {/* 标签【受益所有人】 */}
                  {n.type === 'beneficiary' && (
                    <text x={w / 2} y={15} textAnchor="middle" fontSize={11} fill="#fff" fontWeight={600}>受益所有人</text>
                  )}
                  {/* 主体名称 */}
                  <text
                    x={w / 2}
                    y={n.type === 'beneficiary' ? NODE_H / 2 + 12 : NODE_H / 2 + 4}
                    textAnchor="middle"
                    fontSize={13}
                    fill={isCore ? '#fff' : '#333'}
                    fontWeight={isCore ? 600 : 400}
                  >
                    {isCore ? company : n.name}
                  </text>
                  {/* 持股比例（右侧） */}
                  {n.ratio && !isCore && (
                    <text x={w - 6} y={NODE_H / 2 + 4} textAnchor="end" fontSize={11} fill="#666">{n.ratio}</text>
                  )}
                  {/* 下游融资轮次辅助文本 */}
                  {n.financing && (
                    <text x={w / 2} y={NODE_H + 12} textAnchor="middle" fontSize={10} fill="#999">融资轮次：{n.financing}</text>
                  )}
                  {/* + 展开按钮 */}
                  {!isCore && (
                    <g
                      transform={`translate(${w - 12},${NODE_H / 2})`}
                      onClick={(e) => { e.stopPropagation(); setExpanded((p) => ({ ...p, [n.id]: !p[n.id] })); }}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle r={9} fill={isExpanded ? '#e8ebf0' : '#1677ff'} stroke={isExpanded ? '#1677ff' : 'none'} strokeWidth={1} />
                      <text y={4} textAnchor="middle" fontSize={12} fill={isExpanded ? '#1677ff' : '#fff'}>+</text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* 加载态 */}
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9aa3b2', fontSize: 14, gap: 10, background: 'rgba(251,252,254,.7)' }}>
            <div style={{ width: 30, height: 30, border: '3px solid #e8ebf0', borderTopColor: '#1677ff', borderRadius: '50%', animation: 'entSpin 0.8s linear infinite' }} />
            <div>股权穿透数据加载中…</div>
          </div>
        )}

        {/* 报错态 */}
        {!loading && error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#f53f3f', fontSize: 14, gap: 8 }}>
            <div style={{ fontSize: 40 }}>⚠️</div>
            <div>数据加载失败：{error}</div>
            <button onClick={() => { setError(null); setLoading(true); setTimeout(() => setLoading(false), 600); }} style={{ padding: '6px 18px', border: '1px solid #d9dde8', borderRadius: 6, background: '#fff', color: '#555', fontSize: 13, cursor: 'pointer' }}>重新加载</button>
          </div>
        )}

        {/* 空状态 */}
        {!loading && !error && allNodes.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9aa3b2', fontSize: 14, gap: 8, pointerEvents: 'none' }}>
            <div style={{ fontSize: 40 }}>🕸️</div>
            <div>暂无股权穿透数据</div>
          </div>
        )}

      </div>

      {/* ============ 右侧悬浮竖向工具栏 ============ */}
      <div style={{ position: 'absolute', right: 16, top: 80, zIndex: 10, width: 44, background: '#fff', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,.1)', border: '1px solid #e8ebf0', display: 'flex', flexDirection: 'column', padding: '6px 0' }}>
        <ToolIconBtn tip="筛选" onClick={() => setShowFilter(!showFilter)}>{'⚲'}</ToolIconBtn>
        <ToolIconBtn tip="编辑" onClick={() => { setEditMode(!editMode); setEditName(company); }}>✎</ToolIconBtn>
        <ToolIconBtn tip="还原" onClick={reset}>⟳</ToolIconBtn>
        <ToolIconBtn tip="放大" onClick={() => zoom(1.2)}>⊕</ToolIconBtn>
        <ToolIconBtn tip="缩小" onClick={() => zoom(1 / 1.2)}>⊖</ToolIconBtn>
        <ToolIconBtn tip="保存" onClick={exportData}>💾</ToolIconBtn>
        {/* 时间开关 */}
        <div style={{ padding: '6px 10px', display: 'flex', justifyContent: 'center' }} title="时间水印开关">
          <span onClick={() => setTimeWatermark((v) => !v)} style={{ width: 24, height: 13, borderRadius: 7, background: timeWatermark ? '#1677ff' : '#ccc', position: 'relative', cursor: 'pointer', display: 'inline-block' }}>
            <span style={{ position: 'absolute', top: 1.5, left: timeWatermark ? 13 : 1.5, width: 10, height: 10, borderRadius: 5, background: '#fff', transition: 'left .2s' }} />
          </span>
        </div>
        <ToolIconBtn tip="全屏" onClick={toggleFullscreen}>⛶</ToolIconBtn>
        <ToolIconBtn tip="报告" onClick={exportPng}>📄</ToolIconBtn>
      </div>

      {/* 编辑面板：编辑核心主体名称 */}
      {editMode && (
        <div style={{ position: 'absolute', right: 68, top: 80, zIndex: 12, width: 260, background: '#fff', borderRadius: 10, boxShadow: '0 6px 20px rgba(0,0,0,.14)', border: '1px solid #e8ebf0', padding: '14px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 10 }}>编辑核心主体</div>
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '7px 10px', border: '1px solid #d9dde8', borderRadius: 6, fontSize: 13, marginBottom: 10 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setEditMode(false); }} style={{ flex: 1, padding: '6px 0', border: '1px solid #d9dde8', borderRadius: 6, background: '#fff', color: '#555', fontSize: 13, cursor: 'pointer' }}>取消</button>
            <button onClick={() => { setEditMode(false); }} style={{ flex: 1, padding: '6px 0', border: '1px solid #1677ff', borderRadius: 6, background: '#1677ff', color: '#fff', fontSize: 13, cursor: 'pointer' }}>应用</button>
          </div>
        </div>
      )}

      {/* 右下角回到顶部 */}
      <div style={{ position: 'absolute', right: 16, bottom: 16, zIndex: 10 }}>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ padding: '7px 16px', border: '1px solid #d9dde8', borderRadius: 16, background: '#fff', color: '#555', fontSize: 12, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}
        >
          ↑ 回到顶部
        </button>
      </div>

      {/* 数据来源标签 */}
      <div style={{ marginTop: 12 }}>
        <Sam label="股权穿透" /> <Cfg label="筛选配置" />
      </div>

      {/* 筛选面板弹出层 */}
      {showFilter && (
        <div style={{ position: 'absolute', right: 68, top: 80, zIndex: 12, width: 220, background: '#fff', borderRadius: 10, boxShadow: '0 6px 20px rgba(0,0,0,.14)', border: '1px solid #e8ebf0', padding: '12px 14px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 10 }}>节点筛选</div>
          {(['beneficiary', 'person', 'org', 'invest'] as const).map((t) => (
            <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 13, color: '#555', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checked[t]}
                onChange={() => setChecked((p) => ({ ...p, [t]: !p[t] }))}
                style={{ accentColor: '#1677ff' }}
              />
              {TYPE_FILTER_LABEL[t]}
            </label>
          ))}
        </div>
      )}

      {/* 节点详情弹窗 */}
      {detailNode && (
        <div style={{ position: 'absolute', right: 16, top: 320, zIndex: 13, width: 320, background: '#fff', borderRadius: 10, boxShadow: '0 8px 28px rgba(0,0,0,.16)', border: '1px solid #e8ebf0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f2f3f5', background: '#fafbfc' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>节点详情</span>
            <button onClick={() => setDetailNode(null)} style={{ border: 'none', background: 'none', color: '#999', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>{detailNode.name}</span>
              {detailNode.type === 'beneficiary' && <span style={{ padding: '2px 8px', borderRadius: 4, background: '#f53f3f', color: '#fff', fontSize: 11 }}>受益所有人</span>}
            </div>
            <DetailRow k="节点类型" v={TYPE_FILTER_LABEL[detailNode.type] || detailNode.type} />
            <DetailRow k="职务/角色" v={detailNode.post || '-'} />
            <DetailRow k="持股比例" v={detailNode.ratio || '-'} />
            {detailNode.financing && <DetailRow k="融资轮次" v={detailNode.financing} />}
            <DetailRow k="层级" v={layerOf[detailNode.id] === 'up' ? '上游持股方' : layerOf[detailNode.id] === 'mid' ? '核心主体' : '下游被投企业'} />
            <DetailRow k="数据更新时间" v={equityData.updatedAt} />
            <div style={{ marginTop: 10, padding: 10, background: '#fafbfc', borderRadius: 6, fontSize: 12, color: '#666', lineHeight: 1.7 }}>{detailNode.detail || '暂无详情说明。'}</div>
          </div>
        </div>
      )}
    </div>
  );
}

const TYPE_FILTER_LABEL: Record<string, string> = {
  beneficiary: '受益所有人',
  person: '普通持股自然人',
  org: '持股企业/机构',
  invest: '下游被投企业',
};

function DetailRow({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', fontSize: 13, padding: '3px 0' }}>
      <span style={{ color: '#999', width: 76, flexShrink: 0 }}>{k}</span>
      <span style={{ color: '#333', flex: 1 }}>{v}</span>
    </div>
  );
}

function ToolIconBtn({ tip, children, onClick }: { tip: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      title={tip}
      style={{ width: 44, height: 40, border: 'none', background: 'none', color: '#555', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {children}
    </button>
  );
}
