import React from 'react'

/* ============================================================
 * font-awesome 4.7 风格图标（内联 SVG 复刻，viewBox 0 0 1024 1024）
 * ============================================================ */
const FA_PATHS: Record<string, string> = {
  star: 'M1024 397.05l-353.78-51.41-158.22-320.58-158.22 320.58-353.78 51.41 256 249.53-60.45 352.33 316.45-166.36 316.45 166.36-60.45-352.33z',
  'star-o': 'M959.62 400.44l-302.68-43.97-135.33-274.29-135.33 274.29-302.68 43.97 219.04 213.54-51.71 301.48 270.68-142.32 270.68 142.32-51.71-301.48 219.04-213.54zM512 748.47l-216.69 113.94 41.38-241.24-175.27-170.87 242.22-35.2 108.36-219.53 108.36 219.53 242.22 35.2-175.27 170.87 41.38 241.24z',
  'question-circle': 'M510.72 0c-282.77 0-512 229.23-512 512s229.23 512 512 512 512-229.23 512-512-229.23-512-512-512zM592.71 866.46c-14.78 14.78-32.87 22.17-54.29 22.17-19.32 0-36.48-7.39-51.5-22.17-15.1-14.78-22.65-32.55-22.65-53.33 0-20.78 7.55-38.55 22.65-53.33 15.02-14.78 32.18-22.17 51.5-22.17 21.42 0 39.51 7.39 54.29 22.17 14.94 14.78 22.41 32.55 22.41 53.33 0 20.78-7.47 38.55-22.41 53.33zM742.23 430.08c-13.94 13.78-31.07 23.39-51.37 28.82-14.14 3.95-30.76 11.2-49.88 21.78-19.12 10.42-31.53 21.29-37.23 32.62-5.7 11.2-10.46 28.34-14.3 51.41-2.21 13.5-4.1 25.11-5.7 34.82-1.6 9.71-7.51 14.56-17.73 14.56h-67.15c-8.64 0-14.73-3.08-18.26-9.24-3.53-6.16-5.54-13.46-6.05-21.91-.32-4.66-.8-12.53-1.44-23.63-.61-11.09-1.01-19.92-1.21-26.47-.16-6.53-2.89-14.55-8.18-24.06-5.3-9.51-12.53-17.95-21.7-25.31-9.16-7.34-24.12-17.66-44.87-30.95-30.12-19.4-53.82-36.06-71.11-50-17.27-13.92-33.49-33.29-48.62-58.09-15.16-24.81-22.73-53.34-22.73-85.61 0-47.07 17.71-86.95 53.11-119.63 35.4-32.67 81.75-49.01 139.04-49.01 36.71 0 67.76 5.23 93.18 15.68 25.41 10.44 47.72 25.05 66.91 43.82 19.2 18.79 33.84 39.1 43.94 60.94 10.09 21.82 15.14 43.18 15.14 64.09 0 14.86-7.73 29.67-23.2 44.43z',
  'info-circle': 'M512 0c-282.77 0-512 229.23-512 512s229.23 512 512 512 512-229.23 512-512-229.23-512-512-512zM576 896h-128v-448h128v448zM576 320h-128v-128h128v128z',
  'caret-down': 'M512 384l384 512h-768z',
  'th-large': 'M384 704h-320c-35.35 0-64 28.65-64 64v192c0 35.35 28.65 64 64 64h320c35.35 0 64-28.65 64-64v-192c0-35.35-28.65-64-64-64zM960 704h-320c-35.35 0-64 28.65-64 64v192c0 35.35 28.65 64 64 64h320c35.35 0 64-28.65 64-64v-192c0-35.35-28.65-64-64-64zM384 0h-320c-35.35 0-64 28.65-64 64v192c0 35.35 28.65 64 64 64h320c35.35 0 64-28.65 64-64v-192c0-35.35-28.65-64-64-64zM960 0h-320c-35.35 0-64 28.65-64 64v192c0 35.35 28.65 64 64 64h320c35.35 0 64-28.65 64-64v-192c0-35.35-28.65-64-64-64z',
  list: 'M128 736h128v128h-128v-128zM384 736h512v128h-512v-128zM128 480h128v128h-128v-128zM384 480h512v128h-512v-128zM128 224h128v128h-128v-128zM384 224h512v128h-512v-128z',
  download: 'M512 832l-256-256h160v-512h192v512h160l-256 256zM928 896h-832c-17.67 0-32 14.33-32 32s14.33 32 32 32h832c17.67 0 32-14.33 32-32s-14.33-32-32-32z',
}

/** font-awesome 4.7 风格图标组件（1em 继承字号） */
export function FaIcon({ name, style, className }: { name: string; style?: React.CSSProperties; className?: string }) {
  const d = FA_PATHS[name] || FA_PATHS['question-circle']
  return (
    <svg
      className={className}
      style={{
        width: '1em',
        height: '1em',
        display: 'inline-block',
        verticalAlign: '-0.125em',
        fill: 'currentColor',
        ...style,
      }}
      viewBox="0 0 1024 1024"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}

/* ============================================================
 * 公共样式：HTML 快照中使用的 Tailwind 工具类 + 通用组件类
 * ============================================================ */
export const MODAL_CSS = `
/* ---- 布局 ---- */
.flex{display:flex}.grid{display:grid}.flex-col{flex-direction:column}.flex-1{flex:1}
.justify-between{justify-content:space-between}.justify-center{justify-content:center}.justify-end{justify-content:flex-end}
.items-center{align-items:center}.items-start{align-items:flex-start}.flex-wrap{flex-wrap:wrap}
.gap-1{gap:4px}.gap-2{gap:8px}.gap-3{gap:12px}.gap-4{gap:16px}.gap-5{gap:20px}.gap-6{gap:24px}.gap-10{gap:40px}
.ml-auto{margin-left:auto}
/* ---- 间距 ---- */
.p-2{padding:8px}.p-3{padding:12px}.p-4{padding:16px}.p-5{padding:20px}.p-6{padding:24px}
.px-1{padding:0 4px}.px-2{padding:0 8px}.px-3{padding:0 12px}.px-4{padding:0 16px}.px-6{padding:0 24px}
.py-1{padding:4px 0}.py-2{padding:8px 0}.py-3{padding:12px 0}
.m-4{margin:16px}.m-6{margin:24px}.mb-1{margin-bottom:4px}.mb-2{margin-bottom:8px}.mb-3{margin-bottom:12px}.mb-4{margin-bottom:16px}.mb-6{margin-bottom:24px}
.mt-1{margin-top:4px}.mt-2{margin-top:8px}.mt-4{margin-top:16px}.mt-6{margin-top:24px}.mr-1{margin-right:4px}.mx-1{margin:0 4px}
/* ---- 边框 ---- */
.border{border:1px solid #e5e7eb}.border-b{border-bottom:1px solid #e5e7eb}.border-t{border-top:1px solid #e5e7eb}.border-r{border-right:1px solid #e5e7eb}.border-l{border-left:1px solid #e5e7eb}
.border-gray-200{border-color:#e5e7eb}.border-gray-300{border-color:#d1d5db}
.rounded{border-radius:4px}.rounded-full{border-radius:9999px}
.shadow-sm{box-shadow:0 1px 2px rgba(0,0,0,.05)}
/* ---- 背景 ---- */
.bg-white{background-color:#fff}.bg-gray-50{background-color:#f9fafb}.bg-gray-100{background-color:#f3f4f6}.bg-gray-800{background-color:#1f2937}
.bg-blue-500{background-color:#3b82f6}.bg-yellow-400{background-color:#facc15}
.bg-green-300{background-color:#86efac}.bg-green-400{background-color:#4ade80}
.bg-yellow-200{background-color:#fef08a}.bg-yellow-300{background-color:#fde047}
.bg-orange-200{background-color:#fed7aa}.bg-orange-300{background-color:#fdba74}.bg-orange-400{background-color:#fb923c}
.bg-red-300{background-color:#fca5a5}.bg-red-400{background-color:#f87171}.bg-red-500{background-color:#ef4444}.bg-red-600{background-color:#dc2626}.bg-red-700{background-color:#b91c1c}
/* ---- 文字 ---- */
.text-white{color:#fff}.text-gray-400{color:#9ca3af}.text-gray-500{color:#6b7280}.text-gray-600{color:#4b5563}.text-gray-800{color:#1f2937}
.text-red-500{color:#ef4444}.text-green-600{color:#16a34a}.text-blue-500{color:#3b82f6}.text-blue-600{color:#2563eb}
.text-xs{font-size:12px;line-height:16px}.text-sm{font-size:14px;line-height:20px}.text-base{font-size:16px;line-height:24px}.text-lg{font-size:18px;line-height:28px}.text-xl{font-size:20px;line-height:28px}.text-2xl{font-size:24px;line-height:32px}
.font-medium{font-weight:500}.font-semibold{font-weight:600}.font-bold{font-weight:700}
.text-left{text-align:left}.text-center{text-align:center}.text-right{text-align:right}.align-top{vertical-align:top}
.leading-relaxed{line-height:1.625}.whitespace-nowrap{white-space:nowrap}
/* ---- 尺寸 ---- */
.w-full{width:100%}.w-8{width:32px}.w-12{width:48px}.w-14{width:56px}.w-20{width:80px}.w-40{width:160px}
.h-4{height:16px}.h-6{height:24px}.h-8{height:32px}.h-12{height:48px}.h-14{height:56px}
.w-\\[8\\%\\]{width:8%}.w-\\[100px\\]{width:100px}.w-\\[120px\\]{width:120px}.w-\\[180px\\]{width:180px}.w-\\[240px\\]{width:240px}.w-\\[420px\\]{width:420px}
.h-\\[240px\\]{height:240px}.h-\\[420px\\]{height:420px}.ml-\\[65\\%\\]{margin-left:65%}
/* ---- 表格 ---- */
.border-collapse{border-collapse:collapse}
/* ---- 其他 ---- */
.relative{position:relative}.absolute{position:absolute}.overflow-hidden{overflow:hidden}.overflow-x-auto{overflow-x:auto}
.cursor-pointer{cursor:pointer}.border-none{border:none}.outline-none{outline:none}
.font-sans{font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif}
`

/* ============================================================
 * 弹窗外壳：遮罩 + 标题栏 + 关闭 + 滚动内容区
 * ============================================================ */
export function ModalShell({
  title,
  onClose,
  children,
  width = 960,
  height = 720,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
  width?: number
  height?: number
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(15,23,42,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: `min(${width}px, 94vw)`,
          height: `min(${height}px, 88vh)`,
          background: '#fff',
          borderRadius: 14,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            borderBottom: '1px solid #E5E7EB',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: 22,
              lineHeight: 1,
              cursor: 'pointer',
              color: '#94A3B8',
            }}
            aria-label="关闭"
          >
            ×
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', background: '#fff' }}>{children}</div>
      </div>
    </div>
  )
}

/* ============================================================
 * 雷达图（Chart.js radar 的 SVG 复刻）
 * ============================================================ */
export function RadarSVG({
  labels,
  data,
  size = 220,
  color = '#3b82f6',
  fill = 'rgba(59,130,246,0.3)',
  max = 100,
  gridColor = '#b4c5ff',
  labelFontSize = 12,
}: {
  labels: string[]
  data: number[]
  size?: number
  color?: string
  fill?: string
  max?: number
  gridColor?: string
  labelFontSize?: number
}) {
  const n = data.length
  const cx = size / 2
  const cy = size / 2
  const R = size / 2 - 28
  const angle = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n
  const pt = (i: number, r: number): [number, number] => [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))]
  const ring = (ratio: number) =>
    Array.from({ length: n }, (_, i) => pt(i, R * ratio).join(',')).join(' ')
  const dataPts = data.map((v, i) => pt(i, R * (v / max)).join(',')).join(' ')
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      {[0.25, 0.5, 0.75, 1].map((r, i) => (
        <polygon key={i} points={ring(r)} fill="none" stroke={gridColor} strokeOpacity={i === 3 ? 0.8 : 0.5} strokeWidth={1} />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const [x, y] = pt(i, R)
        const rad = angle(i)
        const anchor = Math.abs(rad) < 0.3 ? 'middle' : rad > 0 ? 'start' : 'end'
        const lx = cx + (R + 16) * Math.cos(rad)
        const ly = cy + (R + 16) * Math.sin(rad)
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke={gridColor} strokeOpacity={0.5} strokeWidth={1} />
            <text x={lx} y={ly + 4} textAnchor={anchor} fontSize={labelFontSize} fill="#4b5563">
              {labels[i]}
            </text>
          </g>
        )
      })}
      <polygon points={dataPts} fill={fill} stroke={color} strokeWidth={2} />
      {data.map((v, i) => {
        const [x, y] = pt(i, R * (v / max))
        return <circle key={i} cx={x} cy={y} r={3} fill={color} />
      })}
    </svg>
  )
}

/* ============================================================
 * 折线趋势图（Chart.js line 的 SVG 复刻，maintainAspectRatio=false 拉伸填充）
 * ============================================================ */
export function TrendLineSVG({
  labels,
  data,
  height = 240,
  color = '#3b82f6',
  yTicks = [0, 162, 200, 250, 300, 350, 400, 450],
  yMin = 0,
  yMax = 450,
}: {
  labels: string[]
  data: number[]
  height?: number
  color?: string
  yTicks?: number[]
  yMin?: number
  yMax?: number
}) {
  const W = 700
  const padL = 36
  const padR = 12
  const padT = 12
  const padB = 24
  const iw = W - padL - padR
  const ih = height - padT - padB
  const x = (i: number) => padL + (data.length === 1 ? iw / 2 : (iw * i) / (data.length - 1))
  const y = (v: number) => padT + ih - ((v - yMin) / (yMax - yMin)) * ih
  const pts = data.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  const area = `${padL},${padT + ih} ${pts} ${x(data.length - 1)},${padT + ih}`
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={padL} y1={y(t)} x2={W - padR} y2={y(t)} stroke="#e5e7eb" strokeWidth={1} />
          <text x={padL - 6} y={y(t) + 4} textAnchor="end" fontSize={11} fill="#6b7280">
            {t}
          </text>
        </g>
      ))}
      <polygon points={area} fill="rgba(59,130,246,0.2)" stroke="none" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} />
      {data.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={3} fill={color} />
      ))}
      {labels.map((l, i) => (
        <text key={i} x={x(i)} y={height - 6} textAnchor="middle" fontSize={11} fill="#6b7280">
          {l}
        </text>
      ))}
    </svg>
  )
}
