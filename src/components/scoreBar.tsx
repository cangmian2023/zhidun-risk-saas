// 带阈值刻度线的分数进度条（信用分 / 欺诈分共用）
const barFill: Record<'red' | 'amber' | 'green', string> = {
  red: 'bg-rose-400',
  amber: 'bg-amber-400',
  green: 'bg-emerald-400',
}
const markColor: Record<'red' | 'amber' | 'green', string> = {
  red: 'bg-rose-500',
  amber: 'bg-amber-500',
  green: 'bg-emerald-500',
}

export type ScoreMark = { at: number; label: string; color: 'red' | 'amber' | 'green' }

export function ScoreBar({
  value,
  floor,
  max,
  kind,
  marks,
  height = 8,
}: {
  value: number
  floor: number
  max: number
  kind: 'red' | 'amber' | 'green'
  marks: ScoreMark[]
  height?: number
}) {
  const span = Math.max(1, max - floor)
  const pct = (n: number) => Math.max(0, Math.min(100, ((n - floor) / span) * 100))
  return (
    <div className="mt-2">
      <div className="relative rounded-full bg-slate-100" style={{ height }}>
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${barFill[kind]}`}
          style={{ width: `${pct(value)}%` }}
        />
        {marks.map((m) => (
          <div
            key={m.at}
            className={`absolute top-[-2px] h-3 w-0.5 ${markColor[m.color]}`}
            style={{ left: `${pct(m.at)}%` }}
          />
        ))}
      </div>
      <div className="relative mt-1 h-3 text-[10px] text-slate-400">
        {marks.map((m) => (
          <span
            key={m.at}
            className="absolute -translate-x-1/2 whitespace-nowrap"
            style={{ left: `${pct(m.at)}%` }}
          >
            {m.at} {m.label}
          </span>
        ))}
      </div>
    </div>
  )
}
