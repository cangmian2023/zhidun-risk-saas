import type { ReactNode } from 'react'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  desc: string
  tags?: string[]
  accent?: 'brand' | 'cyan' | 'violet' | 'amber'
}

const accents: Record<string, string> = {
  brand: 'bg-brand-50 text-brand-600',
  cyan: 'bg-cyan-50 text-cyan-600',
  violet: 'bg-violet-50 text-violet-600',
  amber: 'bg-amber-50 text-amber-600',
}

export default function FeatureCard({
  icon,
  title,
  desc,
  tags,
  accent = 'brand',
}: FeatureCardProps) {
  return (
    <div className="card group">
      <div
        className={`grid h-12 w-12 place-items-center rounded-xl ${accents[accent]} transition group-hover:scale-105`}
      >
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
      {tags && tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
