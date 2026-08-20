import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Sam, Cfg } from './SourceTag';
import { computeCenterFit, Bounds } from './graphFit';
import crData from './entCompanyRelation.json';

/* 企业档案 · 企业图谱 · 企业关系（左右分栏：左侧力导向网络图 + 右侧筛选配置面板）
 * 数据：entCompanyRelation.json（本地样例 JSON，使用域作者维护）
 */

type RelNode = { id: string; name: string; type: string; x: number; y: number; groups?: string[]; rel?: string };
type RelLink = { from: string; to: string; label: string };
type FilterGroup = { title: string; type: 'radio' | 'checkbox'; options: { key: string; label: string; default: boolean }[] };

const NODE_COLOR: Record<string, string> = { core: '#f5a623', company: '#2fa8e0', person: '#f53f3f' };

export default function EntCompanyRelation({ companyName }: { companyName?: string }) {
  const [timeWatermark, setTimeWatermark] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [detailNode, setDetailNode] = useState<RelNode | null>(null);
  const [hoverLink, setHoverLink] = useState<number | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [dragging, setDragging] = useState(false);
  // 筛选状态
  const [level, setLevel] = useState('level2');
  const [checked, setChecked] = useState<Record<string, boolean>>({ legal: true, dg: true, dgAnnounce: true, dgHistory: true, shareholder: true, branch: true, history: true });
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const company = companyName || crData.company;
  const allNodes = crData.nodes as unknown as RelNode[];
  const allLinks = crData.links as unknown as RelLink[];
  const filterGroups = crData.filterGroups as unknown as FilterGroup[];

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  // 按筛选过滤节点（core 始终显示）
  const visibleNodes = useMemo(() => {
    return allNodes.filter((n) => {
      if (n.type === 'core') return true;
      if (level === 'level1') return true; // 一层 = 仅展示直接关联
      const groups = n.groups || [];
      // 二层：展示勾选的关系分组节点
      return groups.some((g) => checked[g] === true);
    });
  }, [allNodes, level, checked]);

  const visibleIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);
  const visibleLinks = useMemo(
    () => allLinks.filter((l) => visibleIds.has(l.from) && visibleIds.has(l.to)),
    [allLinks, visibleIds]
  );
  const nodeById = useMemo(() => { const m: Record<string, RelNode> = {}; allNodes.forEach((n) => { m[n.id] = n; }); return m; }, [allNodes]);

  const onWheel = (e: React.WheelEvent) => {
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    setTransform((t) => ({ ...t, k: Math.min(2.5, Math.max(0.3, t.k * factor)) }));
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

  // 内容包围盒（力导向网络图）
  const contentBounds: Bounds = { minX: -280, minY: -240, maxX: 280, maxY: 300 };
  const fit = () => {
    const el = canvasRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTransform(computeCenterFit(contentBounds, r.width, r.height, 30));
  };
  const reset = fit;
  useLayoutEffect(() => { fit(); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const exportData = () => {
    const blob = new Blob([JSON.stringify(crData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company}-企业关系.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPng = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company}-企业关系.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const svgRef = useRef<SVGSVGElement | null>(null);
  const RADIUS = 44;

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif', color: '#333' }}>
      {/* ============ 区块1：顶部全局操作栏 ============ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1d2129', margin: 0 }}>企业关系图</h3>
        <button onClick={exportData} style={{ padding: '5px 14px', border: '1px solid #d9d9d9', borderRadius: 6, background: '#fff', color: '#333', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          下载数据
        </button>
      </div>

      {/* ============ 二、左右分栏 ============ */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
        {/* 左侧：力导向网络图画布 */}
        <div style={{ flex: 1, minWidth: 0, border: '1px solid #e8ebf0', borderRadius: 10, overflow: 'hidden', background: '#fbfcfe', display: 'flex', flexDirection: 'column' }}>
          {/* 画布顶部横向工具栏 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: '#eaf2ff', borderBottom: '1px solid #e8ebf0', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1677ff' }}>{company}</span>
            <button onClick={reset} title="关闭 / 重置画布" style={{ width: 26, height: 26, border: '1px solid #cfe0ff', borderRadius: 5, background: '#fff', color: '#555', fontSize: 15, cursor: 'pointer', lineHeight: 1 }}>×</button>
            <button onClick={reset} title="刷新图谱数据" style={{ width: 26, height: 26, border: '1px solid #cfe0ff', borderRadius: 5, background: '#fff', color: '#555', fontSize: 15, cursor: 'pointer', lineHeight: 1 }}>⟳</button>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#555', cursor: 'pointer' }}>
              <span>时间水印</span>
              <span
                onClick={(e) => { e.preventDefault(); setTimeWatermark((v) => !v); }}
                style={{ width: 34, height: 18, borderRadius: 10, background: timeWatermark ? '#1677ff' : '#ccc', position: 'relative', cursor: 'pointer', display: 'inline-block' }}
              >
                <span style={{ position: 'absolute', top: 2, left: timeWatermark ? 18 : 2, width: 14, height: 14, borderRadius: 7, background: '#fff', transition: 'left .2s' }} />
              </span>
            </label>
            <button onClick={exportPng} title="导出图谱" style={{ marginLeft: 'auto', width: 26, height: 26, border: '1px solid #cfe0ff', borderRadius: 5, background: '#fff', color: '#555', fontSize: 14, cursor: 'pointer', lineHeight: 1 }}>⤓</button>
          </div>

          {/* 画布 */}
          <div
            ref={canvasRef}
            style={{ position: 'relative', flex: 1, minHeight: 620, overflow: 'hidden', touchAction: 'none', cursor: dragging ? 'grabbing' : 'grab' }}
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <svg ref={svgRef} width="100%" height="100%" style={{ display: 'block' }}>
              <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
                {/* 连接线：带关系名称 */}
                {visibleLinks.map((l, i) => {
                  const a = nodeById[l.from]; const b = nodeById[l.to];
                  if (!a || !b) return null;
                  const active = hoverLink === i || activeNode === a.id || activeNode === b.id;
                  const mx = (a.x + b.x) / 2;
                  const my = (a.y + b.y) / 2;
                  return (
                    <g key={`l-${i}`} onPointerEnter={() => setHoverLink(i)} onPointerLeave={() => setHoverLink(null)}>
                      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={active ? '#1677ff' : '#8c8c8c'} strokeWidth={active ? 1.8 : 1.2} />
                      <text x={mx} y={my - 6} textAnchor="middle" fontSize={11} fill={active ? '#1677ff' : '#666'} style={{ paintOrder: 'stroke', stroke: '#fbfcfe', strokeWidth: 3 }}>{l.label}</text>
                    </g>
                  );
                })}
                {/* 节点 */}
                {visibleNodes.map((n) => {
                  const hovered = hoverNode === n.id;
                  const active = activeNode === n.id;
                  const color = NODE_COLOR[n.type] || '#2fa8e0';
                  return (
                    <g
                      key={n.id}
                      transform={`translate(${n.x},${n.y})`}
                      onPointerDown={(e) => e.stopPropagation()}
                      onPointerEnter={() => setHoverNode(n.id)}
                      onPointerLeave={() => setHoverNode(null)}
                      onClick={() => { setActiveNode(n.id); setDetailNode(n); }}
                      style={{ cursor: 'pointer' }}
                    >
                      {timeWatermark && <text x={0} y={RADIUS + 16} textAnchor="middle" fontSize={9} fill="#b7c0cd">{crData.updatedAt}</text>}
                      <circle r={RADIUS} fill={color} stroke={active || hovered ? '#1677ff' : 'none'} strokeWidth={2.5} />
                      <text x={0} y={4} textAnchor="middle" fontSize={12} fill="#fff" fontWeight={n.type === 'core' ? 600 : 400}>{n.name}</text>
                      {/* 自然人头像占位 */}
                      {n.type === 'person' && <circle cx={0} cy={RADIUS + 16} r={10} fill="#fff" stroke="#ddd" />}
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* 加载态 */}
            {loading && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9aa3b2', fontSize: 14, gap: 10, background: 'rgba(251,252,254,.7)' }}>
                <div style={{ width: 30, height: 30, border: '3px solid #e8ebf0', borderTopColor: '#1677ff', borderRadius: '50%', animation: 'crRelSpin 0.8s linear infinite' }} />
                <div>企业关系图谱加载中…</div>
              </div>
            )}
            {/* 空状态 */}
            {!loading && !error && visibleNodes.length <= 1 && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9aa3b2', fontSize: 14, gap: 8 }}>
                <div style={{ fontSize: 40 }}>🕸️</div>
                <div>当前筛选条件下暂无关联企业关系</div>
              </div>
            )}
            <style>{`@keyframes crRelSpin{to{transform:rotate(360deg)}}`}</style>
          </div>
        </div>

        {/* 右侧：筛选配置面板 */}
        <div style={{ width: 240, flexShrink: 0, border: '1px solid #e8ebf0', borderRadius: 10, background: '#fff', padding: '16px 16px' }}>
          {filterGroups.map((g) => (
            <div key={g.title} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#333', marginBottom: 10 }}>{g.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {g.options.map((opt) => {
                  if (g.type === 'radio') {
                    return (
                      <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#333', cursor: 'pointer' }}>
                        <input type="radio" name={g.title} checked={level === opt.key} onChange={() => setLevel(opt.key)} style={{ accentColor: '#1677ff' }} />
                        {opt.label}
                      </label>
                    );
                  }
                  return (
                    <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#333', cursor: 'pointer' }}>
                      <input type="checkbox" checked={checked[opt.key] === true} onChange={() => setChecked((p) => ({ ...p, [opt.key]: !p[opt.key] }))} style={{ accentColor: '#1677ff' }} />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          <div style={{ fontSize: 12, color: '#999', borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>修改筛选条件后图谱自动重载</div>
        </div>
      </div>

      {/* 节点详情弹窗 */}
      {detailNode && (
        <div style={{ position: 'absolute', right: 16, top: 200, zIndex: 13, width: 300, background: '#fff', borderRadius: 10, boxShadow: '0 8px 28px rgba(0,0,0,.16)', border: '1px solid #e8ebf0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f2f3f5', background: '#fafbfc' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>节点详情</span>
            <button onClick={() => setDetailNode(null)} style={{ border: 'none', background: 'none', color: '#999', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 8 }}>{detailNode.name}</div>
            <div style={{ display: 'flex', fontSize: 13, padding: '3px 0' }}><span style={{ color: '#999', width: 72, flexShrink: 0 }}>节点类型</span><span style={{ color: '#333', flex: 1 }}>{detailNode.type === 'core' ? '目标核心企业' : detailNode.type === 'person' ? '自然人人员' : '关联企业主体'}</span></div>
            <div style={{ display: 'flex', fontSize: 13, padding: '3px 0' }}><span style={{ color: '#999', width: 72, flexShrink: 0 }}>关系</span><span style={{ color: '#333', flex: 1 }}>{detailNode.rel || '-'}</span></div>
          </div>
        </div>
      )}

      {/* 右下角回到顶部 */}
      <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 10 }}>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ padding: '7px 16px', border: '1px solid #d9dde8', borderRadius: 16, background: '#fff', color: '#555', fontSize: 12, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}
        >
          ↑ 回到顶部
        </button>
      </div>

      {/* 数据来源标签 */}
      <div style={{ marginTop: 16 }}>
        <Sam label="企业关系" /> <Cfg label="筛选配置" />
      </div>
    </div>
  );
}
