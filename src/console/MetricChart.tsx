// 指标可视化预览 · 轻量 SVG / 表格（无第三方依赖）
// 数据来源：分组聚合结果（灰·实时计算）。仅展示组件，不持有数据。
import { fmt } from './ConfigTemplate';

export type MetricVizType = 'table' | 'bar' | 'line' | 'area' | 'pie' | 'hbar' | 'burndown' | 'radar';

// 调色板（饼图/雷达图等多色场景循环取用）
export const VIZ_PALETTE = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1'];

export function MetricViz({ data, type, unit, precision }: { data: { key: string; value: number }[]; type: MetricVizType; unit?: string; precision?: number }) {
  if (!data.length) {
    return <div style={{ padding: '18px 0', textAlign: 'center', fontSize: 12, color: '#94A3B8' }}>设置「分组维度」后，此处展示按维度的分布预览</div>;
  }
  switch (type) {
    case 'table': return <MetricTable data={data} unit={unit} precision={precision} />;
    case 'line': return <MetricLineChart data={data} unit={unit} precision={precision} />;
    case 'area': return <MetricAreaChart data={data} unit={unit} precision={precision} />;
    case 'pie': return <MetricPieChart data={data} unit={unit} precision={precision} />;
    case 'hbar': return <MetricHBarChart data={data} unit={unit} precision={precision} />;
    case 'burndown': return <MetricBurndownChart data={data} unit={unit} precision={precision} />;
    case 'radar': return <MetricRadarChart data={data} unit={unit} precision={precision} />;
    case 'bar':
    default: return <MetricBarChart data={data} unit={unit} precision={precision} />;
  }
}

const th: React.CSSProperties = { padding: '6px 10px', fontSize: 12, color: '#64748B', fontWeight: 600 };
const td: React.CSSProperties = { padding: '6px 10px', color: '#334155' };

/* ───────── 表格 ───────── */
function MetricTable({ data, unit, precision }: { data: { key: string; value: number }[]; unit?: string; precision?: number }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead>
        <tr style={{ background: '#F8FAFC', textAlign: 'left' }}>
          <th style={th}>维度</th>
          <th style={{ ...th, textAlign: 'right' }}>数值</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d) => (
          <tr key={d.key} style={{ borderTop: '1px solid #EEF2F7' }}>
            <td style={td}>{d.key}</td>
            <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmt(d.value, precision, unit)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ───────── 柱状图（纵向） ───────── */
function MetricBarChart({ data, unit, precision }: { data: { key: string; value: number }[]; unit?: string; precision?: number }) {
  const W = 680, H = 240, padL = 48, padR = 14, padT = 14, padB = 40;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const vals = data.map((d) => d.value);
  const max = Math.max(...vals, 0), min = Math.min(...vals, 0);
  const span = max - min || 1;
  const yZero = padT + (1 - (0 - min) / span) * plotH;
  const bw = Math.min(56, (plotW / data.length) * 0.6);
  const trunc = (s: string) => (s.length > 6 ? s.slice(0, 5) + '…' : s);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#E2E8F0" />
      <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#E2E8F0" />
      {min < 0 && <line x1={padL} y1={yZero} x2={padL + plotW} y2={yZero} stroke="#CBD5E1" strokeDasharray="3 3" />}
      <text x={padL - 6} y={padT + 4} fontSize={10} fill="#94A3B8" textAnchor="end">{fmt(max, precision, unit)}</text>
      <text x={padL - 6} y={yZero + 3} fontSize={10} fill="#94A3B8" textAnchor="end">0</text>
      {data.map((d, i) => {
        const x = padL + (i + 0.5) * (plotW / data.length) - bw / 2;
        const y = d.value >= 0 ? yZero - (d.value / span) * (yZero - padT) : yZero;
        const h = Math.abs((d.value / span) * (yZero - padT));
        return (
          <g key={d.key}>
            <rect x={x} y={y} width={bw} height={Math.max(h, 1)} rx={3} fill={d.value < 0 ? '#E11D48' : '#2563EB'} />
            <text x={x + bw / 2} y={padT + plotH + 16} fontSize={10} fill="#64748B" textAnchor="middle">{trunc(d.key)}</text>
            <text x={x + bw / 2} y={d.value >= 0 ? y - 4 : y + h + 12} fontSize={10} fill="#334155" textAnchor="middle">{fmt(d.value, precision, unit)}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ───────── 横向条形图 ───────── */
function MetricHBarChart({ data, unit, precision }: { data: { key: string; value: number }[]; unit?: string; precision?: number }) {
  const max = Math.max(...data.map((d) => Math.abs(d.value)), 1);
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {data.map((d) => {
        const pct = (Math.abs(d.value) / max) * 100;
        return (
          <div key={d.key} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 96px', gap: 8, alignItems: 'center', fontSize: 12 }}>
            <span style={{ color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.key}>{d.key}</span>
            <div style={{ background: '#F1F5F9', borderRadius: 4, height: 14, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: d.value < 0 ? '#E11D48' : '#2563EB', borderRadius: 4 }} />
            </div>
            <span style={{ textAlign: 'right', color: '#334155', fontVariantNumeric: 'tabular-nums' }}>{fmt(d.value, precision, unit)}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ───────── 折线图 ───────── */
function MetricLineChart({ data, unit, precision }: { data: { key: string; value: number }[]; unit?: string; precision?: number }) {
  const W = 680, H = 210, padL = 56, padR = 14, padT = 16, padB = 34;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const vals = data.map((d) => d.value);
  const max = Math.max(...vals, 0), min = Math.min(...vals, 0);
  const span = max - min || 1;
  const n = data.length;
  const x = (i: number) => (n === 1 ? padL + plotW / 2 : padL + (i / (n - 1)) * plotW);
  const y = (v: number) => padT + (1 - (v - min) / span) * plotH;
  const pts = data.map((d, i) => `${x(i)},${y(d.value)}`).join(' ');
  const trunc = (s: string) => (s.length > 8 ? s.slice(0, 7) + '…' : s);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#E2E8F0" />
      <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#E2E8F0" />
      {min < 0 && <line x1={padL} y1={y(0)} x2={padL + plotW} y2={y(0)} stroke="#CBD5E1" strokeDasharray="3 3" />}
      <polyline points={pts} fill="none" stroke="#2563EB" strokeWidth={2} />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.value)} r={3} fill="#2563EB" />
          <text x={x(i)} y={padT + plotH + 16} fontSize={10} fill="#64748B" textAnchor="middle">{trunc(d.key)}</text>
        </g>
      ))}
      <text x={padL - 6} y={padT + 4} fontSize={10} fill="#94A3B8" textAnchor="end">{fmt(max, precision, unit)}</text>
      <text x={padL - 6} y={padT + plotH} fontSize={10} fill="#94A3B8" textAnchor="end">{fmt(min, precision, unit)}</text>
    </svg>
  );
}

/* ───────── 面积图（折线 + 渐变填充） ───────── */
function MetricAreaChart({ data, unit, precision }: { data: { key: string; value: number }[]; unit?: string; precision?: number }) {
  const W = 680, H = 210, padL = 56, padR = 14, padT = 16, padB = 34;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const vals = data.map((d) => d.value);
  const max = Math.max(...vals, 0), min = Math.min(...vals, 0);
  const span = max - min || 1;
  const n = data.length;
  const x = (i: number) => (n === 1 ? padL + plotW / 2 : padL + (i / (n - 1)) * plotW);
  const y = (v: number) => padT + (1 - (v - min) / span) * plotH;
  const line = data.map((d, i) => `${x(i)},${y(d.value)}`).join(' ');
  const area = `${padL},${padT + plotH} ${line} ${padL + plotW},${padT + plotH}`;
  const trunc = (s: string) => (s.length > 8 ? s.slice(0, 7) + '…' : s);
  const gid = 'areaGrad_' + data.map((d) => d.key).join('_').slice(0, 12);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#2563EB" stopOpacity={0.04} />
        </linearGradient>
      </defs>
      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#E2E8F0" />
      <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#E2E8F0" />
      {min < 0 && <line x1={padL} y1={y(0)} x2={padL + plotW} y2={y(0)} stroke="#CBD5E1" strokeDasharray="3 3" />}
      <polygon points={area} fill={`url(#${gid})`} stroke="none" />
      <polyline points={line} fill="none" stroke="#2563EB" strokeWidth={2} />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.value)} r={3} fill="#2563EB" />
          <text x={x(i)} y={padT + plotH + 16} fontSize={10} fill="#64748B" textAnchor="middle">{trunc(d.key)}</text>
        </g>
      ))}
      <text x={padL - 6} y={padT + 4} fontSize={10} fill="#94A3B8" textAnchor="end">{fmt(max, precision, unit)}</text>
      <text x={padL - 6} y={padT + plotH} fontSize={10} fill="#94A3B8" textAnchor="end">{fmt(min, precision, unit)}</text>
    </svg>
  );
}

/* ───────── 饼状图 ───────── */
function arcPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
  return `M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} Z`;
}
function MetricPieChart({ data, unit, precision }: { data: { key: string; value: number }[]; unit?: string; precision?: number }) {
  const total = data.reduce((s, d) => s + Math.abs(d.value), 0) || 1;
  const cx = 130, cy = 120, r = 96;
  let ang = -Math.PI / 2;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, alignItems: 'center' }}>
      <svg viewBox={`0 0 260 240`} style={{ width: 260, height: 240 }}>
        {data.length === 1 ? (
          <circle cx={cx} cy={cy} r={r} fill={VIZ_PALETTE[0]} />
        ) : (
          data.map((d, i) => {
            const sweep = (Math.abs(d.value) / total) * Math.PI * 2;
            const a0 = ang, a1 = ang + sweep; ang = a1;
            if (sweep >= Math.PI * 2 - 0.0001) return <circle key={i} cx={cx} cy={cy} r={r} fill={VIZ_PALETTE[i % VIZ_PALETTE.length]} />;
            return <path key={i} d={arcPath(cx, cy, r, a0, a1)} fill={VIZ_PALETTE[i % VIZ_PALETTE.length]} stroke="#fff" strokeWidth={1} />;
          })
        )}
      </svg>
      <div style={{ display: 'grid', gap: 6 }}>
        {data.map((d, i) => (
          <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: VIZ_PALETTE[i % VIZ_PALETTE.length], flex: '0 0 auto' }} />
            <span style={{ color: '#475569', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.key}>{d.key}</span>
            <span style={{ color: '#334155', fontVariantNumeric: 'tabular-nums' }}>{fmt(d.value, precision, unit)}</span>
            <span style={{ color: '#94A3B8', width: 48, textAlign: 'right' }}>{((Math.abs(d.value) / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── 燃尽图（阶梯实际线 + 理想线） ───────── */
function MetricBurndownChart({ data, unit, precision }: { data: { key: string; value: number }[]; unit?: string; precision?: number }) {
  const W = 680, H = 210, padL = 56, padR = 14, padT = 16, padB = 34;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  // 按 value 降序模拟「剩余量随时间递减」
  const series = [...data].sort((a, b) => b.value - a.value);
  const vals = series.map((d) => d.value);
  const max = Math.max(...vals, 0), min = Math.min(...vals, 0);
  const span = max - min || 1;
  const n = series.length;
  const x = (i: number) => (n === 1 ? padL + plotW / 2 : padL + (i / (n - 1)) * plotW);
  const y = (v: number) => padT + (1 - (v - min) / span) * plotH;
  // 阶梯路径（step-after）
  let step = '';
  series.forEach((d, i) => {
    const px = x(i), py = y(d.value);
    if (i === 0) step += `M${px},${py}`;
    else {
      const prevX = x(i - 1);
      step += ` L${prevX},${py} L${px},${py}`;
    }
  });
  // 理想线：从首值线性降到 0（落到最后一个 x）
  const ideal = `M${x(0)},${y(series[0].value)} L${x(n - 1)},${y(0)}`;
  const trunc = (s: string) => (s.length > 8 ? s.slice(0, 7) + '…' : s);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#E2E8F0" />
      <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#E2E8F0" />
      <path d={ideal} stroke="#CBD5E1" strokeWidth={1.5} strokeDasharray="5 4" fill="none" />
      <path d={step} stroke="#E11D48" strokeWidth={2} fill="none" />
      {series.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.value)} r={3} fill="#E11D48" />
          <text x={x(i)} y={padT + plotH + 16} fontSize={10} fill="#64748B" textAnchor="middle">{trunc(d.key)}</text>
        </g>
      ))}
      <text x={padL - 6} y={padT + 4} fontSize={10} fill="#94A3B8" textAnchor="end">{fmt(max, precision, unit)}</text>
      <text x={padL - 6} y={padT + plotH} fontSize={10} fill="#94A3B8" textAnchor="end">0</text>
    </svg>
  );
}

/* ───────── 雷达图（每个维度 = 一个轴） ───────── */
function MetricRadarChart({ data, unit, precision }: { data: { key: string; value: number }[]; unit?: string; precision?: number }) {
  const N = data.length;
  if (N < 3) {
    return <div style={{ padding: '18px 0', textAlign: 'center', fontSize: 12, color: '#B45309', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8 }}>雷达图需至少 3 个维度（当前 {N} 个），请设置「分组维度」后预览</div>;
  }
  const cx = 340, cy = 120, R = 86;
  const max = Math.max(...data.map((d) => Math.abs(d.value)), 1);
  const ang = (i: number) => -Math.PI / 2 + (i / N) * Math.PI * 2;
  const levels = 4;
  const gridPoly = (lv: number) => {
    const rr = (R * lv) / levels;
    return data.map((_, i) => `${cx + rr * Math.cos(ang(i))},${cy + rr * Math.sin(ang(i))}`).join(' ');
  };
  const dataPoly = data.map((d, i) => `${cx + (Math.abs(d.value) / max) * R * Math.cos(ang(i))},${cy + (Math.abs(d.value) / max) * R * Math.sin(ang(i))}`).join(' ');
  const trunc = (s: string) => (s.length > 5 ? s.slice(0, 4) + '…' : s);
  return (
    <svg viewBox={`0 0 680 240`} style={{ width: '100%', height: 'auto' }}>
      {Array.from({ length: levels }, (_, l) => (
        <polygon key={l} points={gridPoly(l + 1)} fill="none" stroke="#E2E8F0" strokeWidth={1} />
      ))}
      {data.map((_, i) => {
        const x = cx + R * Math.cos(ang(i)), y = cy + R * Math.sin(ang(i));
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#E2E8F0" />;
      })}
      <polygon points={dataPoly} fill="rgba(37,99,235,0.18)" stroke="#2563EB" strokeWidth={2} />
      {data.map((d, i) => {
        const x = cx + (Math.abs(d.value) / max) * R * Math.cos(ang(i)), y = cy + (Math.abs(d.value) / max) * R * Math.sin(ang(i));
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={3} fill="#2563EB" />
            <text x={cx + (R + 14) * Math.cos(ang(i))} y={cy + (R + 14) * Math.sin(ang(i)) + 3} fontSize={10} fill="#64748B" textAnchor="middle">{trunc(d.key)}</text>
            <text x={cx + (R + 14) * Math.cos(ang(i))} y={cy + (R + 14) * Math.sin(ang(i)) + 15} fontSize={9} fill="#94A3B8" textAnchor="middle">{fmt(d.value, precision, unit)}</text>
          </g>
        );
      })}
    </svg>
  );
}
