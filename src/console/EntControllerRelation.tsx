import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { computeCenterFit, Bounds } from './graphFit';
import ctrlData from './entControllerRelation.json';

/* 企业档案 · 企业图谱 · 控制人关系（全屏图谱画布，无左右分栏、无右侧工具栏）
 * 数据：entControllerRelation.json（本地样例 JSON，使用域作者维护）
 * 结构：横向两点连线布局——左侧目标企业（橙色）+ 右侧实际控制人（玫红色）
 */

type CtrlNode = { name: string; type: string; ratio?: string; detail?: string };
type View = { key: string; label: string; target: CtrlNode; controller: CtrlNode; links: { from: string; to: string; ratio: string }[] };

const NODE_COLOR: Record<string, string> = { company: '#f5a623', person: '#f53f3f' };

export default function EntControllerRelation({ companyName }: { companyName?: string }) {
  const [viewKey, setViewKey] = useState('suspect');
  const [timeWatermark, setTimeWatermark] = useState(true);
  const [help, setHelp] = useState(false);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [detailNode, setDetailNode] = useState<CtrlNode | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const company = companyName || ctrlData.company;
  const views = ctrlData.views as unknown as View[];
  const view = views.find((v) => v.key === viewKey) || views[0];

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

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

  // 内容包围盒（横向两点连线布局）
  const contentBounds: Bounds = { minX: -360, minY: -120, maxX: 360, maxY: 120 };
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
    const blob = new Blob([JSON.stringify(ctrlData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company}-控制人关系.json`;
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
    a.download = `${company}-控制人关系.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const RADIUS = 90;
  // 节点位置：左目标企业、右实际控制人
  const targetPos = { x: -260, y: 0 };
  const ctrlPos = { x: 260, y: 0 };

  const showDetail = (n: CtrlNode, key: string) => { setActiveNode(key); setDetailNode(n); };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif', color: '#333', position: 'relative' }}>
      <style>{`@keyframes crSpin{to{transform:rotate(360deg)}}`}</style>
      {/* ============ 全屏图谱画布 ============ */}
      <div
        ref={canvasRef}
        style={{ position: 'relative', width: '100%', height: 620, border: '1px solid #e8ebf0', borderRadius: 10, overflow: 'hidden', background: '#fbfcfe', touchAction: 'none', cursor: dragging ? 'grabbing' : 'grab' }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* 顶部操作栏 */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, zIndex: 6, background: '#fff', borderBottom: '1px solid #edf0f5', padding: '10px 16px' }}>
          {/* 标题 + 帮助 + 切换按钮组 + 下载 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#333', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              实际控制人
              <span
                style={{ color: '#999', cursor: 'help', position: 'relative' }}
                onClick={() => setHelp(!help)}
              >
                ⓘ
                {help && (
                  <span style={{ position: 'absolute', left: 0, top: 18, width: 220, background: '#fff', border: '1px solid #e8ebf0', borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,.12)', padding: 8, fontSize: 12, color: '#555', zIndex: 20, lineHeight: 1.5 }}>
                    实际控制人：通过直接或间接持有公司股权、表决权等方式，对公司形成实际控制关系的自然人或机构。
                  </span>
                )}
              </span>
            </span>
            {/* 切换按钮组 */}
            <div style={{ display: 'flex', border: '1px solid #d9dde8', borderRadius: 6, overflow: 'hidden' }}>
              {views.map((v) => (
                <button
                  key={v.key}
                  onClick={() => setViewKey(v.key)}
                  style={{
                    padding: '5px 14px', border: 'none', fontSize: 13, cursor: 'pointer',
                    background: viewKey === v.key ? '#eaf2ff' : '#fff',
                    color: viewKey === v.key ? '#1677ff' : '#333',
                    borderRight: v.key !== 'relation' ? '1px solid #d9dde8' : 'none',
                    fontWeight: viewKey === v.key ? 600 : 400,
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <button onClick={exportData} style={{ marginLeft: 'auto', padding: '5px 14px', border: '1px solid #d9d9d9', borderRadius: 6, background: '#fff', color: '#333', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              下载数据
            </button>
          </div>
          {/* 工具栏（标题下方横向）：主体名 + 关闭/刷新 + 时间水印 + 导出 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, padding: '8px 12px', background: '#eaf2ff', borderRadius: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1677ff' }}>{company}</span>
            <button onClick={reset} title="清空 / 重置画布" style={{ width: 26, height: 26, border: '1px solid #cfe0ff', borderRadius: 5, background: '#fff', color: '#555', fontSize: 15, cursor: 'pointer', lineHeight: 1 }}>×</button>
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
        </div>

        <svg ref={svgRef} width="100%" height="100%" style={{ display: 'block' }}>
          <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
            {/* 连接线：实际控制人 → 目标企业，带箭头 + 持股比例 */}
            {view.links.map((l, i) => {
              const active = activeNode === 'target' || activeNode === 'controller';
              const mx = (targetPos.x + ctrlPos.x) / 2;
              return (
                <g key={`l-${i}`}>
                  <line x1={ctrlPos.x} y1={ctrlPos.y} x2={targetPos.x} y2={targetPos.y} stroke={active ? '#1677ff' : '#8c8c8c'} strokeWidth={1.6} />
                  {/* 箭头指向目标企业（左侧） */}
                  <polygon points={`${targetPos.x},${targetPos.y} ${targetPos.x + 12},${targetPos.y - 8} ${targetPos.x + 12},${targetPos.y + 8}`} fill={active ? '#1677ff' : '#8c8c8c'} />
                  {timeWatermark && <text x={mx} y={ctrlPos.y - 16} textAnchor="middle" fontSize={10} fill="#b7c0cd">{ctrlData.updatedAt}</text>}
                  <text x={mx} y={ctrlPos.y + 6} textAnchor="middle" fontSize={16} fill="#666" fontWeight={600}>{l.ratio}</text>
                </g>
              );
            })}

            {/* 目标企业节点（左，橙色） */}
            <g
              transform={`translate(${targetPos.x},${targetPos.y})`}
              onPointerDown={(e) => e.stopPropagation()}
              onPointerEnter={() => setHoverNode('target')}
              onPointerLeave={() => setHoverNode(null)}
              onClick={() => showDetail(view.target, 'target')}
              style={{ cursor: 'pointer' }}
            >
              <circle r={RADIUS} fill={NODE_COLOR.company} stroke={activeNode === 'target' || hoverNode === 'target' ? '#1677ff' : 'none'} strokeWidth={2.5} />
              <text x={0} y={-4} textAnchor="middle" fontSize={15} fill="#fff" fontWeight={600}>{view.target.name}</text>
              <text x={0} y={18} textAnchor="middle" fontSize={11} fill="#fff" opacity={0.9}>目标企业</text>
            </g>

            {/* 实际控制人节点（右，玫红色） */}
            <g
              transform={`translate(${ctrlPos.x},${ctrlPos.y})`}
              onPointerDown={(e) => e.stopPropagation()}
              onPointerEnter={() => setHoverNode('controller')}
              onPointerLeave={() => setHoverNode(null)}
              onClick={() => showDetail(view.controller, 'controller')}
              style={{ cursor: 'pointer' }}
            >
              <circle r={RADIUS} fill={NODE_COLOR.person} stroke={activeNode === 'controller' || hoverNode === 'controller' ? '#1677ff' : 'none'} strokeWidth={2.5} />
              <text x={0} y={-4} textAnchor="middle" fontSize={15} fill="#fff" fontWeight={600}>{view.controller.name}</text>
              <text x={0} y={18} textAnchor="middle" fontSize={11} fill="#fff" opacity={0.9}>实际控制人</text>
            </g>
          </g>
        </svg>

        {/* 加载态 */}
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9aa3b2', fontSize: 14, gap: 10, background: 'rgba(251,252,254,.7)' }}>
            <div style={{ width: 30, height: 30, border: '3px solid #e8ebf0', borderTopColor: '#1677ff', borderRadius: '50%', animation: 'crSpin 0.8s linear infinite' }} />
            <div>控制人关系数据加载中…</div>
          </div>
        )}

        {/* 空状态 */}
        {!loading && !view && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9aa3b2', fontSize: 14, gap: 8 }}>
            <div style={{ fontSize: 40 }}>🕸️</div>
            <div>暂无控制人关系数据</div>
          </div>
        )}

      </div>

      {/* 节点详情弹窗 */}
      {detailNode && (
        <div style={{ position: 'absolute', right: 16, top: 320, zIndex: 13, width: 320, background: '#fff', borderRadius: 10, boxShadow: '0 8px 28px rgba(0,0,0,.16)', border: '1px solid #e8ebf0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f2f3f5', background: '#fafbfc' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>节点详情</span>
            <button onClick={() => setDetailNode(null)} style={{ border: 'none', background: 'none', color: '#999', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#333', marginBottom: 10 }}>{detailNode.name}</div>
            <div style={{ display: 'flex', fontSize: 13, padding: '3px 0' }}><span style={{ color: '#999', width: 76, flexShrink: 0 }}>节点类型</span><span style={{ color: '#333', flex: 1 }}>{detailNode.type === 'company' ? '目标企业主体' : '实际控制自然人'}</span></div>
            <div style={{ display: 'flex', fontSize: 13, padding: '3px 0' }}><span style={{ color: '#999', width: 76, flexShrink: 0 }}>持股比例</span><span style={{ color: '#333', flex: 1 }}>{detailNode.ratio || '-'}</span></div>
            <div style={{ display: 'flex', fontSize: 13, padding: '3px 0' }}><span style={{ color: '#999', width: 76, flexShrink: 0 }}>数据时间</span><span style={{ color: '#333', flex: 1 }}>{ctrlData.updatedAt}</span></div>
            <div style={{ marginTop: 10, padding: 10, background: '#fafbfc', borderRadius: 6, fontSize: 12, color: '#666', lineHeight: 1.7 }}>{detailNode.detail || '暂无详情说明。'}</div>
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

      <div style={{ marginTop: 12 }}>
      </div>
    </div>
  );
}
