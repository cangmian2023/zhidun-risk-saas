import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Sam, Cfg } from './SourceTag';
import { computeCenterFit, Bounds } from './graphFit';
import topData from './entTopBeneficiary.json';

/* 企业档案 · 企业图谱 · 十大受益人（全屏图谱画布 + 右侧悬浮竖向工具栏）
 * 数据：entTopBeneficiary.json（本地样例 JSON，使用域作者维护）
 * 结构：横向树形股权链路——底部中心主体 + 向上延伸受益人持股链路
 */

type Chain = {
  id: string; name: string; nodeType: string; nodeColor: string;
  label: { text: string; note: string; color: string };
  ratio: string; linkColor: string; avatar?: string;
  middle?: { name: string; type: string; color: string; branches: { ratio: string }[] };
};

export default function EntTopBeneficiary({ companyName }: { companyName?: string }) {
  const [timeWatermark, setTimeWatermark] = useState(true);
  const [loading, setLoading] = useState(true);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [detailNode, setDetailNode] = useState<Chain | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 0.8 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const company = companyName || topData.company;
  const chains = topData.chains as unknown as Chain[];
  const center = topData.center;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  // 底层中心节点位置（最下方）
  const centerPos = { x: 0, y: 520 };
  // 受益人链路节点：纵向分布在中心节点上方
  const gap = 150;
  const topY = -(chains.length - 1) * gap / 2;
  const chainX = 300;

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
  // 内容包围盒（横向树形股权链路：顶部受益人 → 底部核心主体）
  const contentBounds: Bounds = { minX: -120, minY: -660, maxX: 420, maxY: 560 };
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
    const blob = new Blob([JSON.stringify(topData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company}-十大受益人.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const nodeFill = (c: Chain) => c.nodeColor === 'red' ? '#f53f3f' : c.nodeColor === 'blue' ? '#1677ff' : '#fff';
  const nodeStroke = (c: Chain) => c.nodeColor === 'plain' ? '#1677ff' : 'none';
  const nodeTextColor = (c: Chain) => c.nodeColor === 'plain' ? '#1677ff' : '#fff';

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif', color: '#333', position: 'relative' }}>
      {/* ============ 全屏图谱画布 ============ */}
      <div
        ref={canvasRef}
        style={{ position: 'relative', width: '100%', height: 720, border: '1px solid #e8ebf0', borderRadius: 10, overflow: 'hidden', background: '#fbfcfe', touchAction: 'none', cursor: dragging ? 'grabbing' : 'grab' }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* 画布顶部：标题 + 下载 */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, zIndex: 6, display: 'flex', alignItems: 'center', padding: '10px 16px', background: '#fff', borderBottom: '1px solid #edf0f5' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>十大受益人</span>
          <button onClick={exportData} style={{ marginLeft: 'auto', padding: '5px 14px', border: '1px solid #d9d9d9', borderRadius: 6, background: '#fff', color: '#333', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            下载数据
          </button>
        </div>

        <svg ref={svgRef} width="100%" height="100%" style={{ display: 'block' }}>
          <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
            {/* 底部中心节点（比亚迪，蓝色矩形） */}
            <g transform={`translate(${centerPos.x},${centerPos.y})`}>
              {timeWatermark && <text x={110} y={-16} textAnchor="end" fontSize={10} fill="#b7c0cd">{topData.updatedAt}</text>}
              <rect x={-110} y={-32} width={220} height={64} rx={8} fill="#1677ff" />
              <text x={0} y={10} textAnchor="middle" fontSize={14} fill="#fff" fontWeight={600}>{company}</text>
            </g>

            {/* 受益人链路 */}
            {chains.map((c, i) => {
              const cy = topY + i * gap;
              const linkColor = c.linkColor === 'red' ? '#f53f3f' : '#8c8c8c';
              const active = hoverNode === c.id || activeNode === c.id;
              const labelY = cy - 34;
              const hasMiddle = !!c.middle;
              const midY = hasMiddle ? cy + 46 : null;
              return (
                <g key={c.id}>
                  {/* 主连接线：受益人 → 中心（或多层链路经中间企业） */}
                  {hasMiddle ? (
                    <>
                      <line x1={chainX - 28} y1={cy} x2={chainX - 28} y2={midY! + 34} stroke={linkColor} strokeWidth={active ? 2 : 1.4} />
                      <line x1={chainX - 28} y1={midY! + 50} x2={0} y2={centerPos.y - 32} stroke="#8c8c8c" strokeWidth={1.4} />
                      {/* 89.5% / 10.5% 分支标注 */}
                      <text x={chainX - 40} y={(cy + midY!) / 2 + 4} textAnchor="end" fontSize={11} fill="#666">89.5%</text>
                    </>
                  ) : (
                    <line x1={chainX - 28} y1={cy} x2={0} y2={centerPos.y - 32} stroke={linkColor} strokeWidth={active ? 2 : 1.4} />
                  )}

                  {/* 顶部矩形标签 */}
                  <g transform={`translate(${chainX - 110},${labelY})`}>
                    <rect x={0} y={0} width={220} height={34} rx={6} fill={c.label.color === 'red' ? '#f53f3f' : '#1677ff'} opacity={0.95} />
                    <text x={110} y={14} textAnchor="middle" fontSize={12} fill="#fff" fontWeight={600}>{c.label.text}</text>
                    {c.label.note && <text x={110} y={28} textAnchor="middle" fontSize={10} fill="#fff" opacity={0.9}>{c.label.note}</text>}
                  </g>

                  {/* 圆形受益人节点 */}
                  <g
                    transform={`translate(${chainX - 28},${cy})`}
                    onPointerEnter={() => setHoverNode(c.id)}
                    onPointerLeave={() => setHoverNode(null)}
                    onClick={() => { setActiveNode(c.id); setDetailNode(c); }}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle r={26} fill={nodeFill(c)} stroke={nodeStroke(c)} strokeWidth={2} stroke={active || hoverNode === c.id ? '#1677ff' : nodeStroke(c)} />
                    <text y={4} textAnchor="middle" fontSize={11} fill={nodeTextColor(c)}>{c.name.slice(0, 4)}</text>
                    {c.avatar && <circle cx={0} cy={34} r={9} fill="#fff" stroke="#ddd" />}
                  </g>

                  {/* 中间持股企业（如融捷投资） */}
                  {hasMiddle && c.middle && (
                    <g transform={`translate(${chainX - 28 - 70},${midY!})`} onClick={() => setActiveNode(c.id)} style={{ cursor: 'pointer' }}>
                      <rect x={0} y={-16} width={140} height={32} rx={6} fill="#1677ff" />
                      <text x={70} y={6} textAnchor="middle" fontSize={11} fill="#fff">{c.middle.name.slice(0, 8)}</text>
                    </g>
                  )}

                  {/* 持股比例标注（连线上方） */}
                  <text x={(chainX - 28 + 0) / 2 + 10} y={(cy + centerPos.y - 32) / 2 - 4} textAnchor="middle" fontSize={12} fill="#666" fontWeight={600} style={{ paintOrder: 'stroke', stroke: '#fbfcfe', strokeWidth: 3 }}>{c.ratio}</text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* 加载态 */}
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9aa3b2', fontSize: 14, gap: 10, background: 'rgba(251,252,254,.7)' }}>
            <div style={{ width: 30, height: 30, border: '3px solid #e8ebf0', borderTopColor: '#1677ff', borderRadius: '50%', animation: 'topSpin 0.8s linear infinite' }} />
            <div>十大受益人数据加载中…</div>
          </div>
        )}

        {/* 空状态 */}
        {!loading && chains.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9aa3b2', fontSize: 14, gap: 8 }}>
            <div style={{ fontSize: 40 }}>🕸️</div>
            <div>暂无受益人数据</div>
          </div>
        )}

        <style>{`@keyframes topSpin{to{transform:rotate(360deg)}}`}</style>
      </div>

      {/* ============ 右侧悬浮竖向工具栏 ============ */}
      <div style={{ position: 'absolute', right: 16, top: 90, zIndex: 10, width: 44, background: '#fff', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,.1)', border: '1px solid #e8ebf0', display: 'flex', flexDirection: 'column', padding: '6px 0' }}>
        <TbToolBtn tip="还原" onClick={reset}>⟳</TbToolBtn>
        <TbToolBtn tip="放大" onClick={() => zoom(1.2)}>⊕</TbToolBtn>
        <TbToolBtn tip="缩小" onClick={() => zoom(1 / 1.2)}>⊖</TbToolBtn>
        <TbToolBtn tip="保存" onClick={exportData}>💾</TbToolBtn>
        <div style={{ padding: '6px 10px', display: 'flex', justifyContent: 'center' }} title="时间水印开关">
          <span onClick={() => setTimeWatermark((v) => !v)} style={{ width: 24, height: 13, borderRadius: 7, background: timeWatermark ? '#1677ff' : '#ccc', position: 'relative', cursor: 'pointer', display: 'inline-block' }}>
            <span style={{ position: 'absolute', top: 1.5, left: timeWatermark ? 13 : 1.5, width: 10, height: 10, borderRadius: 5, background: '#fff', transition: 'left .2s' }} />
          </span>
        </div>
        <TbToolBtn tip="全屏" onClick={toggleFullscreen}>⛶</TbToolBtn>
      </div>

      {/* 节点详情弹窗 */}
      {detailNode && (
        <div style={{ position: 'absolute', right: 16, top: 300, zIndex: 13, width: 300, background: '#fff', borderRadius: 10, boxShadow: '0 8px 28px rgba(0,0,0,.16)', border: '1px solid #e8ebf0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f2f3f5', background: '#fafbfc' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>受益人详情</span>
            <button onClick={() => setDetailNode(null)} style={{ border: 'none', background: 'none', color: '#999', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 8 }}>{detailNode.name}</div>
            <div style={{ display: 'flex', fontSize: 13, padding: '3px 0' }}><span style={{ color: '#999', width: 76, flexShrink: 0 }}>主体类型</span><span style={{ color: '#333', flex: 1 }}>{detailNode.nodeType === 'person' ? '自然人' : '企业/机构'}</span></div>
            <div style={{ display: 'flex', fontSize: 13, padding: '3px 0' }}><span style={{ color: '#999', width: 76, flexShrink: 0 }}>持股比例</span><span style={{ color: '#333', flex: 1 }}>{detailNode.ratio}</span></div>
            <div style={{ display: 'flex', fontSize: 13, padding: '3px 0' }}><span style={{ color: '#999', width: 76, flexShrink: 0 }}>身份说明</span><span style={{ color: '#333', flex: 1 }}>{detailNode.label.note || '-'}</span></div>
            {detailNode.middle && <div style={{ display: 'flex', fontSize: 13, padding: '3px 0' }}><span style={{ color: '#999', width: 76, flexShrink: 0 }}>持股路径</span><span style={{ color: '#333', flex: 1 }}>{detailNode.name} → {detailNode.middle.name} → 比亚迪股份有限公司</span></div>}
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
      <div style={{ marginTop: 16 }}>
        <Sam label="十大受益人" /> <Cfg label="链路配置" />
      </div>
    </div>
  );
}

function TbToolBtn({ tip, children, onClick }: { tip: string; children: React.ReactNode; onClick?: () => void }) {
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
