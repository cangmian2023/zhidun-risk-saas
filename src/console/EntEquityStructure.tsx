import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { computeCenterFit, Bounds } from './graphFit';
import structData from './entEquityStructure.json';

/* 企业档案 · 企业图谱 · 股权结构（全屏图谱画布 + 右侧悬浮竖向工具栏）
 * 数据：entEquityStructure.json（本地样例 JSON，使用域作者维护）
 * 结构：横向放射布局——左侧核心主体 + 右侧放射股东节点；顶部三级 Tab 切换数据维度
 */

type SNode = {
  id: string; name: string; type: string; ratio: string; amount: string;
  path?: boolean; tags?: string[]; expand?: boolean;
};

// 节点左侧竖线颜色（core 蓝，自然人/机构 红）
const BAR_COLOR: Record<string, string> = { core: '#1677ff', person: '#f53f3f', org: '#f53f3f' };

const DIM_KEYS = ['shareholder', 'invest', 'history'] as const;

export default function EntEquityStructure({ companyName }: { companyName?: string }) {
  const [activeDim, setActiveDim] = useState<'shareholder' | 'invest' | 'history'>('shareholder');
  const [timeWatermark, setTimeWatermark] = useState(true);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 0.8 });
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const company = companyName || structData.company;
  const core = structData.core;
  const dims = structData.dims;
  const activeNodes = (dims.find((d) => d.key === activeDim)?.nodes || []) as unknown as SNode[];

  // 模拟加载
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [activeDim]);

  // 核心主体位置（左侧）
  const coreX = 0;
  const coreY = 0;
  // 股东节点：纵向均布在右侧
  const nodeGap = 92;
  const nodeH = 96;
  const rightX = 520;
  const topY = -(activeNodes.length - 1) * nodeGap / 2;

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

  const zoom = (f: number) => setTransform((t) => ({ ...t, k: Math.min(2.5, Math.max(0.3, t.k * f)) }));
  // 内容包围盒（横向放射：核心左侧 + 股东右侧）
  const contentBounds: Bounds = { minX: -200, maxX: 540, minY: -500, maxY: 500 };
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
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(structData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company}-股权结构.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif', color: '#333', position: 'relative' }}>
      <style>{`@keyframes stSpin{to{transform:rotate(360deg)}}`}</style>
      {/* ============ 全屏图谱画布 ============ */}
      <div
        ref={canvasRef}
        style={{ position: 'relative', width: '100%', height: 760, border: '1px solid #e8ebf0', borderRadius: 10, overflow: 'hidden', background: '#fbfcfe', touchAction: 'none', cursor: dragging ? 'grabbing' : 'grab' }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* 画布顶部：标题 + 下载数据 + 三级Tab */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, zIndex: 6, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: '#fff', borderBottom: '1px solid #edf0f5' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>股权结构</span>
          <button onClick={exportData} style={{ padding: '5px 14px', border: '1px solid #d9d9d9', borderRadius: 6, background: '#fff', color: '#333', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            下载数据
          </button>
          {/* 三级切换Tab */}
          <div style={{ display: 'flex', border: '1px solid #d9dde8', borderRadius: 6, overflow: 'hidden', marginLeft: 'auto' }}>
            {dims.map((d) => (
              <button
                key={d.key}
                onClick={() => setActiveDim(d.key as typeof activeDim)}
                style={{
                  padding: '5px 14px', border: 'none', fontSize: 13, cursor: 'pointer',
                  background: activeDim === d.key ? '#1677ff' : '#fff',
                  color: activeDim === d.key ? '#fff' : '#666',
                  borderRight: d.key !== 'history' ? '1px solid #d9dde8' : 'none',
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <svg ref={svgRef} width="100%" height="100%" style={{ display: 'block' }}>
          <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
            {/* 连接线：核心 → 各股东 */}
            {activeNodes.map((n, i) => {
              const ny = topY + i * nodeGap;
              const active = hoverNode === n.id;
              return (
                <line key={`l-${n.id}`} x1={coreX} y1={coreY} x2={rightX - 340} y2={ny} stroke={active ? '#1677ff' : '#8c8c8c'} strokeWidth={1.4} />
              );
            })}

            {/* 核心主体节点 */}
            <g transform={`translate(${coreX - 0},${coreY})`} style={{ cursor: 'pointer' }}>
              <g transform="translate(-160,-80)">
                {timeWatermark && <text x={300} y={180} textAnchor="end" fontSize={10} fill="#b7c0cd">{structData.updatedAt}</text>}
                <rect x={0} y={0} width={320} height={160} rx={8} fill="#1677ff" stroke="#1677ff" />
                {/* 左侧竖线 */}
                <rect x={0} y={0} width={4} height={160} rx={2} fill="#0f5bd0" />
                <text x={18} y={34} fontSize={15} fill="#fff" fontWeight={600}>{company}</text>
                <text x={18} y={64} fontSize={12} fill="#dbeafe">疑似实控人：{core.suspectController}</text>
                <text x={18} y={88} fontSize={12} fill="#dbeafe">总持股比例：{core.totalRatio}</text>
                {/* 查看控制链 */}
                <text x={18} y={124} fontSize={12} fill="#fff" textDecoration="underline" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); }}>查看控制链</text>
              </g>
            </g>

            {/* 放射股东节点 */}
            {activeNodes.map((n, i) => {
              const ny = topY + i * nodeGap;
              const barColor = BAR_COLOR[n.type] || '#f53f3f';
              const w = 340;
              const h = nodeH;
              const isExpanded = !!expanded[n.id];
              return (
                <g
                  key={n.id}
                  transform={`translate(${rightX - w},${ny - h / 2})`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerEnter={() => setHoverNode(n.id)}
                  onPointerLeave={() => setHoverNode(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {timeWatermark && <text x={w - 4} y={h + 14} textAnchor="end" fontSize={10} fill="#b7c0cd">{structData.updatedAt}</text>}
                  <rect x={0} y={0} width={w} height={h} rx={6} fill="#fff" stroke={hoverNode === n.id ? '#1677ff' : '#e0e3ea'} strokeWidth={hoverNode === n.id ? 1.6 : 1} />
                  {/* 左侧标识竖线 */}
                  <rect x={0} y={6} width={4} height={h - 12} rx={2} fill={barColor} />
                  {/* 主体名称 + 标签 */}
                  <text x={16} y={24} fontSize={13} fill="#333">{n.name}</text>
                  {(n.tags || []).map((t) => (
                    <text key={t} x={16 + (n.name.length * 13 + 10)} y={24} fontSize={11} fill="#1677ff">【{t}】</text>
                  ))}
                  {/* 股比 */}
                  <text x={16} y={48} fontSize={11} fill="#666">股比：{n.ratio}</text>
                  {/* 认缴金额 */}
                  <text x={150} y={48} fontSize={11} fill="#666">认缴金额：{n.amount}</text>
                  {/* 全部路径 */}
                  {n.path && (
                    <text x={16} y={70} fontSize={12} fill="#1677ff" style={{ cursor: 'pointer' }} onClick={(e) => e.stopPropagation()}>全部路径 &gt;</text>
                  )}
                  {/* 折叠 + */}
                  {n.expand && (
                    <g
                      transform={`translate(${w - 16},${h / 2})`}
                      onClick={(e) => { e.stopPropagation(); setExpanded((p) => ({ ...p, [n.id]: !p[n.id] })); }}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle r={10} fill={isExpanded ? '#e8ebf0' : '#1677ff'} stroke={isExpanded ? '#1677ff' : 'none'} />
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
            <div style={{ width: 30, height: 30, border: '3px solid #e8ebf0', borderTopColor: '#1677ff', borderRadius: '50%', animation: 'stSpin 0.8s linear infinite' }} />
            <div>股权结构数据加载中…</div>
          </div>
        )}

        {/* 空状态 */}
        {!loading && activeNodes.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9aa3b2', fontSize: 14, gap: 8, pointerEvents: 'none' }}>
            <div style={{ fontSize: 40 }}>🕸️</div>
            <div>暂无股权结构数据</div>
          </div>
        )}

      </div>

      {/* ============ 右侧悬浮竖向工具栏 ============ */}
      <div style={{ position: 'absolute', right: 16, top: 80, zIndex: 10, width: 44, background: '#fff', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,.1)', border: '1px solid #e8ebf0', display: 'flex', flexDirection: 'column', padding: '6px 0' }}>
        <StToolBtn tip="还原" onClick={reset}>⟳</StToolBtn>
        <StToolBtn tip="放大" onClick={() => zoom(1.2)}>⊕</StToolBtn>
        <StToolBtn tip="缩小" onClick={() => zoom(1 / 1.2)}>⊖</StToolBtn>
        <StToolBtn tip="保存" onClick={exportData}>💾</StToolBtn>
        <div style={{ padding: '6px 10px', display: 'flex', justifyContent: 'center' }} title="时间水印开关">
          <span onClick={() => setTimeWatermark((v) => !v)} style={{ width: 24, height: 13, borderRadius: 7, background: timeWatermark ? '#1677ff' : '#ccc', position: 'relative', cursor: 'pointer', display: 'inline-block' }}>
            <span style={{ position: 'absolute', top: 1.5, left: timeWatermark ? 13 : 1.5, width: 10, height: 10, borderRadius: 5, background: '#fff', transition: 'left .2s' }} />
          </span>
        </div>
        <StToolBtn tip="全屏" onClick={toggleFullscreen}>⛶</StToolBtn>
      </div>

      {/* 右下角回到顶部 */}
      <div style={{ position: 'absolute', right: 16, bottom: 16, zIndex: 10 }}>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ padding: '7px 16px', border: '1px solid #d9dde8', borderRadius: 16, background: '#fff', color: '#555', fontSize: 12, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}
        >
          ↑ 回到顶部
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
      </div>
    </div>
  );
}

function StToolBtn({ tip, children, onClick }: { tip: string; children: React.ReactNode; onClick?: () => void }) {
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
