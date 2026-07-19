import type { ReactNode } from 'react'

export type IconName =
  | 'dashboard' | 'search' | 'audit' | 'shield' | 'report' | 'verify'
  | 'monitor' | 'bell' | 'users' | 'settings' | 'database' | 'chart'
  | 'model' | 'list' | 'share' | 'sliders' | 'plug' | 'check'

const paths: Record<IconName, ReactNode> = {
  dashboard: (<><path d="M4 4h7v7H4zM13 4h7v7h-7zM13 13h7v7h-7zM4 13h7v7H4z" strokeLinejoin="round" /></>),
  search: (<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>),
  audit: (<><path d="M9 5h6M9 5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" /><path d="M9 13l2 2 4-4" /></>),
  shield: (<><path d="M12 3l8 3v6c0 4-3.5 6.5-8 8-4.5-1.5-8-4-8-8V6z" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" /></>),
  report: (<><path d="M7 3h7l5 5v13H7z" strokeLinejoin="round" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>),
  verify: (<><circle cx="12" cy="9" r="5" /><path d="M9 13l2 2 4-4M8 21h8" /></>),
  monitor: (<><path d="M3 12h4l3 8 4-16 3 8h4" /></>),
  bell: (<><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" strokeLinejoin="round" /><path d="M10 19a2 2 0 0 0 4 0" /></>),
  users: (<><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><circle cx="17" cy="9" r="2.5" /><path d="M15.5 19.5A5 5 0 0 1 21 14" /></>),
  settings: (<><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></>),
  database: (<><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" /></>),
  chart: (<><path d="M4 20V10M10 20V4M16 20v-8M3 20h18" /></>),
  model: (<><rect x="7" y="7" width="10" height="10" rx="2" /><path d="M10 3v2M14 3v2M10 19v2M14 19v2M3 10h2M3 14h2M19 10h2M19 14h2" /></>),
  list: (<><circle cx="4" cy="6" r="1.5" /><circle cx="4" cy="12" r="1.5" /><circle cx="4" cy="18" r="1.5" /><path d="M9 6h11M9 12h11M9 18h11" /></>),
  share: (<><circle cx="6" cy="12" r="2.5" /><circle cx="17" cy="6" r="2.5" /><circle cx="17" cy="18" r="2.5" /><path d="M8.2 10.8l6.6-3.6M8.2 13.2l6.6 3.6" /></>),
  sliders: (<><path d="M4 8h10M18 8h2M4 16h2M10 16h10" /><circle cx="14" cy="8" r="2" /><circle cx="8" cy="16" r="2" /></>),
  plug: (<><path d="M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0zM12 16v5" strokeLinejoin="round" /></>),
  check: (<><path d="M5 13l4 4L19 7" /></>),
}

export function MenuIcon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
