import type { ReactNode } from 'react'

export type IconName =
  | 'dashboard' | 'search' | 'audit' | 'shield' | 'report' | 'verify'
  | 'monitor' | 'bell' | 'users' | 'settings' | 'database' | 'chart'
  | 'model' | 'list' | 'share' | 'sliders' | 'plug' | 'check'
  // 新增：用于保证左侧菜单图标唯一性
  | 'menu' | 'lock' | 'alert' | 'gauge' | 'cube' | 'flag' | 'inbox'
  | 'filter' | 'work_flow' | 'tag' | 'link' | 'pie' | 'bars'
  | 'analytics' | 'id' | 'clock' | 'stack' | 'zoom' | 'layers'
  | 'cloud' | 'eye' | 'grid' | 'code' | 'wrench' | 'braces'
  | 'pulse' | 'trend'

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

  /* ===== 新增图标（菜单唯一性） ===== */
  menu: (<><path d="M4 7h16M4 12h16M4 17h16" /></>),
  lock: (<><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>),
  alert: (<><path d="M12 4l8 14H4z" strokeLinejoin="round" /><path d="M12 10v4M12 17h.01" /></>),
  gauge: (<><path d="M4 18a8 8 0 1 1 16 0" /><path d="M12 18l4.5-5" /></>),
  cube: (<><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" strokeLinejoin="round" /><path d="M4 7.5l8 4.5 8-4.5M12 12v9" /></>),
  flag: (<><path d="M6 21V4M6 4h11l-2 4 2 4H6" strokeLinejoin="round" /></>),
  inbox: (<><path d="M3 13l3 6h12l3-6M3 13l2.5-7h13L21 13M3 13h5l1.5 2h5L17 13h4" strokeLinejoin="round" /></>),
  filter: (<><path d="M4 5h16l-6 7v6l-4 2v-8z" strokeLinejoin="round" /></>),
  work_flow: (<><rect x="3" y="4" width="6" height="5" rx="1.2" /><rect x="15" y="15" width="6" height="5" rx="1.2" /><path d="M6 9v2a3 3 0 0 0 3 3h6" /></>),
  tag: (<><path d="M4 12l8-8h7v7l-8 8z" strokeLinejoin="round" /><circle cx="15.5" cy="8.5" r="1.3" /></>),
  link: (<><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66L11 7" /><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66L13 17" /></>),
  pie: (<><circle cx="12" cy="12" r="9" /><path d="M12 12V3M12 12l7.8 4.5" /></>),
  bars: (<><path d="M4 7h11M4 12h15M4 17h8" /></>),
  analytics: (<><path d="M4 19l5-6 4 3 7-8" /><path d="M4 21h16" /></>),
  id: (<><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="9" cy="12" r="2" /><path d="M14 10h4M14 14h3" /></>),
  clock: (<><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></>),
  stack: (<><path d="M12 4l8 4-8 4-8-4z" strokeLinejoin="round" /><path d="M4 12l8 4 8-4M4 16l8 4 8-4" /></>),
  zoom: (<><circle cx="11" cy="11" r="6" /><path d="M20 20l-3.5-3.5M11 8v6M8 11h6" /></>),
  layers: (<><path d="M12 2l9 5-9 5-9-5z" strokeLinejoin="round" /><path d="M3 12l9 5 9-5" /></>),
  cloud: (<><path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.5A3.5 3.5 0 0 1 17 18z" strokeLinejoin="round" /></>),
  eye: (<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>),
  grid: (<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>),
  code: (<><path d="M9 8l-4 4 4 4M15 8l4 4-4 4" /></>),
  wrench: (<><path d="M14 7a3.5 3.5 0 0 1-4.6 4.6L5 16.5 7.5 19l4.9-4.4A3.5 3.5 0 0 1 17 10l-3-3z" strokeLinejoin="round" /></>),
  braces: (<><path d="M9 4c-2 0-3 1.5-3 4s1 3 3 4c-2 1-3 2-3 4s1 4 3 4M15 4c2 0 3 1.5 3 4s-1 3-3 4c2 1 3 2 3 4s-1 4-3 4" /></>),
  pulse: (<><path d="M3 12h4l2 5 3-11 2 6h7" /></>),
  trend: (<><path d="M4 20V4M4 20h16" /><path d="M7 15l4-4 3 3 5-6" /></>),
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
