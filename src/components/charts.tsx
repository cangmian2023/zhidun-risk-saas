interface Series {
  name: string
  color: string
  data: number[]
}

/* ---------------- Line chart ---------------- */
export function LineChart({
  labels,
  series,
  height = 240,
  yMax,
  yMin = 0,
  unit = '',
}: {
  labels: string[]
  series: Series[]
  height?: number
  yMax?: number
  yMin?: number
  unit?: string
}) {
  const W = 640
  const H = height
  const padL = 46
  const padR = 16
  const padT = 16
  const padB = 30
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const max = yMax ?? Math.max(yMin, ...series.flatMap((s) => s.data))
  const min = Math.min(yMin, ...series.flatMap((s) => s.data))
  const x = (i: number) =>
    padL + (labels.length <= 1 ? plotW / 2 : (i / (labels.length - 1)) * plotW)
  const y = (v: number) => padT + plotH - ((v - min) / (max - min || 1)) * plotH
  const grid = 4

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
        {Array.from({ length: grid + 1 }).map((_, i) => {
          const gy = padT + (i / grid) * plotH
          const val = max - (i / grid) * (max - min)
          return (
            <g key={i}>
              <line x1={padL} y1={gy} x2={W - padR} y2={gy} stroke="#eef2f7" strokeWidth={1} />
              <text x={padL - 8} y={gy + 4} textAnchor="end" className="fill-slate-400" fontSize={11}>
                {Math.round(val)}
                {unit}
              </text>
            </g>
          )
        })}
        {labels.map((lb, i) => (
          <text key={lb} x={x(i)} y={H - 10} textAnchor="middle" className="fill-slate-400" fontSize={11}>
            {lb}
          </text>
        ))}
        {series.map((s) => (
          <polyline
            key={s.name}
            points={s.data.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
            fill="none"
            stroke={s.color}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        {series.map((s) =>
          s.data.map((v, i) => <circle key={`${s.name}-${i}`} cx={x(i)} cy={y(v)} r={3} fill={s.color} />),
        )}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4">
        {series.map((s) => (
          <span key={s.name} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---------------- Bar chart ---------------- */
export function BarChart({
  labels,
  series,
  height = 240,
  unit = '',
}: {
  labels: string[]
  series: Series[]
  height?: number
  unit?: string
}) {
  const W = 640
  const H = height
  const padL = 46
  const padR = 16
  const padT = 16
  const padB = 30
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const max = Math.max(1, ...series.flatMap((s) => s.data))
  const groupW = plotW / labels.length
  const barW = Math.min(34, (groupW * 0.7) / series.length)
  const y = (v: number) => padT + plotH - (v / max) * plotH
  const grid = 4

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
        {Array.from({ length: grid + 1 }).map((_, i) => {
          const gy = padT + (i / grid) * plotH
          const val = max - (i / grid) * max
          return (
            <g key={i}>
              <line x1={padL} y1={gy} x2={W - padR} y2={gy} stroke="#eef2f7" strokeWidth={1} />
              <text x={padL - 8} y={gy + 4} textAnchor="end" className="fill-slate-400" fontSize={11}>
                {Math.round(val)}
                {unit}
              </text>
            </g>
          )
        })}
        {labels.map((lb, gi) => {
          const gx = padL + gi * groupW + groupW / 2
          return (
            <g key={lb}>
              {series.map((s, si) => {
                const v = s.data[gi] ?? 0
                const bx = gx - (series.length * barW) / 2 + si * barW
                return (
                  <rect key={s.name} x={bx} y={y(v)} width={barW - 3} height={plotH - (y(v) - padT)} rx={3} fill={s.color} />
                )
              })}
              <text x={gx} y={H - 10} textAnchor="middle" className="fill-slate-400" fontSize={11}>
                {lb}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4">
        {series.map((s) => (
          <span key={s.name} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---------------- Donut chart ---------------- */
export function DonutChart({
  data,
  centerLabel,
  centerValue,
  height = 220,
}: {
  data: { label: string; value: number; color: string }[]
  centerLabel?: string
  centerValue?: string
  height?: number
}) {
  const size = height
  const stroke = 26
  const r = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2
  const total = data.reduce((a, d) => a + d.value, 0) || 1
  let acc = 0
  const segs = data.map((d) => {
    const frac = d.value / total
    const start = acc * 2 * Math.PI - Math.PI / 2
    acc += frac
    const end = acc * 2 * Math.PI - Math.PI / 2
    const x1 = cx + r * Math.cos(start)
    const y1 = cy + r * Math.sin(start)
    const x2 = cx + r * Math.cos(end)
    const y2 = cy + r * Math.sin(end)
    const large = frac > 0.5 ? 1 : 0
    return { d, path: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}` }
  })

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#eef2f7" strokeWidth={stroke} />
        {segs.map((s, i) => (
          <path key={i} d={s.path} fill="none" stroke={s.d.color} strokeWidth={stroke} strokeLinecap="butt" />
        ))}
        {centerValue && (
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-ink-900" fontSize={22} fontWeight={700}>
            {centerValue}
          </text>
        )}
        {centerLabel && (
          <text x={cx} y={cy + 16} textAnchor="middle" className="fill-slate-400" fontSize={12}>
            {centerLabel}
          </text>
        )}
      </svg>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
            <span className="text-slate-600">{d.label}</span>
            <span className="ml-auto font-medium tabular-nums text-ink-900">
              {d.value}
              <span className="ml-1 text-xs text-slate-400">({((d.value / total) * 100).toFixed(1)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
