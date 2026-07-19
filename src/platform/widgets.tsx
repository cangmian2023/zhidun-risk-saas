import type { ReactNode } from 'react'
import { Badge } from '../components/ui'

export function Panel({
  title, subtitle, right, children, className = '',
}: {
  title?: string
  subtitle?: string
  right?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white ${className}`}>
      {(title || right) && (
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-semibold text-ink-900">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
          </div>
          {right}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}

export function KV({ label, value, span }: { label: string; value: ReactNode; span?: boolean }) {
  return (
    <div className={span ? 'sm:col-span-2' : ''}>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-ink-900">{value}</p>
    </div>
  )
}

export function Grid({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 | 4 }) {
  const map = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4' }
  return <div className={`grid grid-cols-1 gap-x-6 gap-y-4 ${map[cols]}`}>{children}</div>
}

export function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl bg-ink-900 p-4 text-[12.5px] leading-relaxed text-slate-100">
      <code>{code}</code>
    </pre>
  )
}

export function Timeline({
  items,
}: {
  items: { time: string; title: string; desc?: string; tone?: string }[]
}) {
  return (
    <ol className="relative space-y-5 border-l border-slate-200 pl-5">
      {items.map((it, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[1.42rem] top-1 h-3 w-3 rounded-full border-2 border-white bg-brand-500" />
          <p className="text-xs text-slate-400">{it.time}</p>
          <p className="text-sm font-medium text-ink-900">{it.title}</p>
          {it.desc && <p className="mt-0.5 text-sm text-slate-500">{it.desc}</p>}
        </li>
      ))}
    </ol>
  )
}

export function Toggle({ label, desc, on }: { label: string; desc?: string; on?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink-900">{label}</p>
        {desc && <p className="mt-0.5 text-xs text-slate-400">{desc}</p>}
      </div>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-brand-600' : 'bg-slate-300'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${on ? 'left-[1.4rem]' : 'left-0.5'}`} />
      </span>
    </div>
  )
}

export function Steps({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
      {items.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
            {i + 1}
          </span>
          <span className="text-sm text-ink-900">{s}</span>
          {i < items.length - 1 && <span className="mx-1 text-slate-300">→</span>}
        </div>
      ))}
    </div>
  )
}

export function Tabs<T extends string>({
  tabs, active, onChange,
}: {
  tabs: { key: T; label: string }[]
  active: T
  onChange: (k: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`rounded-md px-3 py-1.5 text-sm transition ${
            active === t.key ? 'bg-white font-medium text-brand-700 shadow-sm' : 'text-slate-600 hover:text-brand-700'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function Tag({ children, kind = 'gray' }: { children: ReactNode; kind?: string }) {
  return <Badge kind={kind as never}>{children}</Badge>
}

export function EmptyHint({ text }: { text: string }) {
  return <p className="text-sm text-slate-400">{text}</p>
}
