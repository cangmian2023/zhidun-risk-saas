interface ScoreGaugeProps {
  value: number
  min: number
  max: number
  label: string
  /** color used for the value arc */
  color?: string
  /** describe what high/low means */
  hint?: string
}

export default function ScoreGauge({
  value,
  min,
  max,
  label,
  color = '#3366ff',
  hint,
}: ScoreGaugeProps) {
  const radius = 70
  const stroke = 14
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(1, Math.max(0, (value - min) / (max - min)))
  const dash = circumference * pct

  return (
    <div className="flex flex-col items-center">
      <div className="relative grid place-items-center">
        <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="#eef2ff"
            strokeWidth={stroke}
          />
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference - dash}`}
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(.16,1,.3,1)' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-bold tabular-nums text-ink-900">{value}</span>
          <span className="text-xs text-slate-400">
            {min} – {max}
          </span>
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold text-ink-900">{label}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}
