interface SectionHeadingProps {
  eyebrow?: string
  title: string
  desc?: string
  center?: boolean
}

export default function SectionHeading({ eyebrow, title, desc, center }: SectionHeadingProps) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">{eyebrow}</p>}
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">{title}</h2>
      {desc && <p className="mt-4 text-base leading-relaxed text-slate-500">{desc}</p>}
    </div>
  )
}
