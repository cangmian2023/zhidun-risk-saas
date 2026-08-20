import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Sam, Cfg } from './SourceTag';
import { computeCenterFit, Bounds } from './graphFit';
import rpData from './entRelatedParty.json';

/* 企业档案 · 企业图谱 · 关联方认定（全屏图谱画布 + 右侧悬浮竖向工具栏）
 * 数据：entRelatedParty.json（本地样例 JSON，使用域作者维护）
 * 结构：自上而下分层流程图——上层关联主体 → 中心核心主体 → 下层关联主体；规则 Tab 切换
 */

type GroupNode = { title: string; color: 'blue' | 'red'; list: string[]; more: number };
type Rule = { key: string; label: string; center: { name: string }; up: GroupNode[]; down: GroupNode[] };

const NODE_W = 190;
const NODE_H = 130;
const TITLE_BG: Record<string, string> = { blue: '#1677ff', red: '#f53f3f' };

export default function EntRelatedParty({ companyName }: { companyName?: string }) {
  const [ruleKey, setRuleKey] = useState('sse');
  const [timeWatermark, setTimeWatermark] = useState(true);
  const [loading, setLoading] = useState(true);
  const [hoverLink, setHoverLink] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 0.8 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const company = companyName || rpData.company;
  const rules = rpData.rules as unknown as Rule[];
  const rule = rules.find((r) => r.key === ruleKey) || rules[0];

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [ruleKey]);

  // 分层节点坐标
  const upPos = useMemo(() => {
    const gap = 210;
    const total = rule.up.length;
    const start = -(total - 1) * gap / 2;
    return rule.up.map((n, i) => ({ node: n, x: start + i * gap, y: -260 }));
  }, [rule]);

  const downPos = useMemo(() => {
    const gap = 210;
    const total = rule.down.length;
    const start = -(total - 1) * gap / 2;
    return rule.down.map((n, i) => ({ node: n, x: start + i * gap, y: 260 }));
  }, [rule]);

  const centerPos = { x: 0, y: 0 };

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
  // 内容包围盒（自上而下分层流程图）
  const contentBounds: Bounds = { minX: -660, minY: -340, maxX: 660, maxY: 340 };
  const fit = () => {
    const el = canvasRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTransform(computeCenterFit(contentBounds, r.width, r.height, 30));
  };
  const reset = fit;
  useLayoutEffect(() => { fit(); }, [ruleKey]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const toggleFullscreen = () => {
    const el = canvasRef.current;
    if (!document.fullscreenElement && el) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(rpData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company}-关联方认定.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderGroupNode = (pos: { node: GroupNode; x: number; y: number }, key: string) => {
    const n = pos.node;
    const h = Math.min(NODE_H + n.list.length * 20, 210);
    return (
      <g key={key} transform={`translate(${pos.x - NODE_W / 2},${pos.y - h / 2})`}>
        {/* 分组标题栏 */}
        <rect x={0} y={0} width={NODE_W} height={30} rx={6} fill={TITLE_BG[n.color]} />
        <text x={NODE_W / 2} y={20} textAnchor="middle" fontSize={12} fill="#fff" fontWeight={600}>{n.title}</text>
        {/* 列表区域 */}
        <rect x={0} y={30} width={NODE_W} height={h - 30} rx={6} fill="#fff" stroke={TITLE_BG[n.color]} strokeWidth={1} />
        {n.list.slice(0, 3).map((name, i) => (
          <text key={i} x={12} y={54 + i * 20} fontSize={11} fill="#666">{name}</text>
        ))}
        {n.list.length > 3 && <text x={12} y={54 + 3 * 20} fontSize={11} fill="#ccc">…</text>}
        {/* 查看全部链接 */}
        {n.more > 0 && (
          <text x={NODE_W / 2} y={h - 12} textAnchor="middle" fontSize={11} fill="#1677ff" style={{ cursor: 'pointer' }} onClick={(e) => e.stopPropagation()}>
            查看全部{n.more}家企业
          </text>
        )}
      </g>
    );
  };

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
        {/* 画布顶部：标题 + 下载 + 规则Tab */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, zIndex: 6, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: '#fff', borderBottom: '1px solid #edf0f5' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>关联方认定图</span>
          <button onClick={exportData} style={{ marginLeft: 'auto', padding: '5px 14px', border: '1px solid #d9d9d9', borderRadius: 6, background: '#fff', color: '#333', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            下载数据
          </button>
        </div>
        {/* 规则切换Tab（画布左上角，在标题下方） */}
        <div style={{ position: 'absolute', left: 16, top: 60, zIndex: 6, display: 'flex', border: '1px solid #d9dde8', borderRadius: 6, overflow: 'hidden' }}>
          {rules.map((r) => (
            <button
              key={r.key}
              onClick={() => { setRuleKey(r.key); setLoading(true); }}
              style={{
                padding: '5px 14px', border: 'none', fontSize: 13, cursor: 'pointer',
                background: ruleKey === r.key ? '#1677ff' : '#fff',
                color: ruleKey === r.key ? '#fff' : '#333',
                borderRight: r.key !== 'cas' ? '1px solid #d9dde8' : 'none',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        <svg ref={svgRef} width="100%" height="100%" style={{ display: 'block' }}>
          <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
            {/* 上层 → 中心连接线 */}
            {upPos.map((p) => {
              const key = `ul-${p.node.title}`;
              const active = hoverLink === key;
              return (
                <g key={key} onPointerEnter={() => setHoverLink(key)} onPointerLeave={() => setHoverLink(null)}>
                  <line x1={p.x} y1={p.y + NODE_H / 2} x2={centerPos.x} y2={centerPos.y - 60} stroke={active ? '#1677ff' : '#8c8c8c'} strokeWidth={active ? 1.8 : 1.2} markerEnd="url(#rpArrow)" />
                  <text x={(p.x + centerPos.x) / 2} y={(p.y + centerPos.y) / 2 - 6} textAnchor="middle" fontSize={10} fill="#666" style={{ paintOrder: 'stroke', stroke: '#fbfcfe', strokeWidth: 3 }}>控制</text>
                </g>
              );
            })}
            {/* 中心 → 下层连接线 */}
            {downPos.map((p) => {
              const key = `dl-${p.node.title}`;
              const active = hoverLink === key;
              return (
                <g key={key} onPointerEnter={() => setHoverLink(key)} onPointerLeave={() => setHoverLink(null)}>
                  <line x1={centerPos.x} y1={centerPos.y + 60} x2={p.x} y2={p.y - NODE_H / 2} stroke={active ? '#1677ff' : '#8c8c8c'} strokeWidth={active ? 1.8 : 1.2} markerEnd="url(#rpArrow)" />
                  <text x={(p.x + centerPos.x) / 2} y={(p.y + centerPos.y) / 2 + 6} textAnchor="middle" fontSize={10} fill="#666" style={{ paintOrder: 'stroke', stroke: '#fbfcfe', strokeWidth: 3 }}>控制</text>
                </g>
              );
            })}
            {/* 箭头 marker */}
            <defs>
              <marker id="rpArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L8,3 L0,6 Z" fill="#8c8c8c" />
              </marker>
            </defs>

            {/* 上层分组节点 */}
            {upPos.map((p, i) => renderGroupNode(p, `up-${i}`))}

            {/* 中心核心节点 */}
            <g transform={`translate(${centerPos.x - 110},${centerPos.y - 45})`}>
              {timeWatermark && <text x={220} y={110} textAnchor="end" fontSize={10} fill="#b7c0cd">{rpData.updatedAt}</text>}
              <rect x={0} y={0} width={220} height={90} rx={8} fill="#1677ff" />
              <text x={110} y={52} textAnchor="middle" fontSize={15} fill="#fff" fontWeight={600}>{company}</text>
            </g>

            {/* 下层分组节点 */}
            {downPos.map((p, i) => renderGroupNode(p, `down-${i}`))}
          </g>
        </svg>

        {/* 加载态 */}
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9aa3b2', fontSize: 14, gap: 10, background: 'rgba(251,252,254,.7)' }}>
            <div style={{ width: 30, height: 30, border: '3px solid #e8ebf0', borderTopColor: '#1677ff', borderRadius: '50%', animation: 'rpSpin 0.8s linear infinite' }} />
            <div>关联方认定数据加载中…</div>
          </div>
        )}

        {/* 空状态 */}
        {!loading && rule.up.length === 0 && rule.down.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9aa3b2', fontSize: 14, gap: 8 }}>
            <div style={{ fontSize: 40 }}>🕸️</div>
            <div>当前规则下暂无关联方认定数据</div>
          </div>
        )}

        <style>{`@keyframes rpSpin{to{transform:rotate(360deg)}}`}</style>
      </div>

      {/* ============ 右侧悬浮竖向工具栏 ============ */}
      <div style={{ position: 'absolute', right: 16, top: 90, zIndex: 10, width: 44, background: '#fff', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,.1)', border: '1px solid #e8ebf0', display: 'flex', flexDirection: 'column', padding: '6px 0' }}>
        <RpToolBtn tip="还原" onClick={reset}>⟳</RpToolBtn>
        <RpToolBtn tip="放大" onClick={() => zoom(1.2)}>⊕</RpToolBtn>
        <RpToolBtn tip="缩小" onClick={() => zoom(1 / 1.2)}>⊖</RpToolBtn>
        <RpToolBtn tip="保存" onClick={exportData}>💾</RpToolBtn>
        <div style={{ padding: '6px 10px', display: 'flex', justifyContent: 'center' }} title="时间水印开关">
          <span onClick={() => setTimeWatermark((v) => !v)} style={{ width: 24, height: 13, borderRadius: 7, background: timeWatermark ? '#1677ff' : '#ccc', position: 'relative', cursor: 'pointer', display: 'inline-block' }}>
            <span style={{ position: 'absolute', top: 1.5, left: timeWatermark ? 13 : 1.5, width: 10, height: 10, borderRadius: 5, background: '#fff', transition: 'left .2s' }} />
          </span>
        </div>
        <RpToolBtn tip="全屏" onClick={toggleFullscreen}>⛶</RpToolBtn>
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

      {/* 数据来源标签 */}
      <div style={{ marginTop: 16 }}>
        <Sam label="关联方认定" /> <Cfg label="规则配置" />
      </div>
    </div>
  );
}

function RpToolBtn({ tip, children, onClick }: { tip: string; children: React.ReactNode; onClick?: () => void }) {
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
