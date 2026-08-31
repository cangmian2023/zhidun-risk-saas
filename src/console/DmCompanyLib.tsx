import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { usePageNav } from './pageNav'
import { PageShell } from './PageShell'

/* ===================== 图标库（28 个蓝线图标，viewBox 24x24） ===================== */
const ICON_PATHS: Record<string, ReactNode> = {
  fund: (
    <>
      <path d="M6 3l3 4 3-4" />
      <path d="M9 7v13M12 7v13M15 7v13" />
      <path d="M6 7h12v2H6z" />
    </>
  ),
  gov: (
    <>
      <path d="M3 21h18" />
      <path d="M5 21V9l7-4 7 4v12" />
      <path d="M8 21v-6h2v6M14 21v-6h2v6" />
      <path d="M11 13h2" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20h17" />
      <path d="M7 20v-8M11 20V6M15 20v-11M19 20V9" />
    </>
  ),
  rocket: (
    <>
      <path d="M14 4c4 0 6 3 6 6-1 4-3 7-7 8l-2 3-2-3c-4-1-6-4-7-8 0-3 2-6 6-6l2 2 2-2z" />
      <circle cx="12" cy="10" r="2" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="1" />
      <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
      <path d="M3 13h18" />
    </>
  ),
  store: (
    <>
      <path d="M4 8h16l-1-4H5L4 8z" />
      <path d="M4 8c0 1.5 1 2.5 2.5 2.5S9 9.5 9 8" />
      <path d="M9 8c0 1.5 1 2.5 2.5 2.5S14 9.5 14 8" />
      <path d="M14 8c0 1.5 1 2.5 2.5 2.5S19 9.5 19 8" />
      <path d="M5 11v10h14V11" />
      <path d="M10 21v-6h4v6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  crown: (
    <>
      <path d="M2 18h20" />
      <path d="M3 7l4 4 5-7 5 7 4-4-2 12H5L3 7z" />
    </>
  ),
  star: (
    <>
      <path d="M12 2l2.5 5.5 6 .5-4.5 4 1.5 6L12 15l-5.5 3 1.5-6L3.5 8l6-.5z" />
    </>
  ),
  flask: (
    <>
      <path d="M9 2h6" />
      <path d="M10 2v6L6 18a2 2 0 002 4h8a2 2 0 002-4L14 8V2" />
      <path d="M7 14h10" />
    </>
  ),
  eagle: (
    <>
      <path d="M3 14c2-1 4-3 6-5l3 2 3-2c2 2 4 4 6 5-2 1-3 2-5 2v3l-2-2-2 2-2-2-2 2v-3c-2 0-3-1-5-2z" />
    </>
  ),
  gazelle: (
    <>
      <path d="M9 3l-1 3M15 3l1 3" />
      <path d="M9 6c0-2 1-3 3-3s3 1 3 3" />
      <ellipse cx="12" cy="11" rx="4" ry="5" />
      <path d="M10 16v5M14 16v5" />
    </>
  ),
  niumin: (
    <>
      <path d="M5 6c2 0 3 1 3 3M19 6c-2 0-3 1-3 3" />
      <path d="M8 9a4 4 0 018 0v3a4 4 0 01-8 0V9z" />
      <circle cx="12" cy="11" r="0.5" fill="currentColor" />
      <path d="M10 16v5M14 16v5" />
    </>
  ),
  unicorn: (
    <>
      <path d="M12 2l-1 4" />
      <path d="M11 6c-3 0-5 2-5 5v2" />
      <path d="M12 6c3 0 5 2 5 5" />
      <path d="M6 13l1 6h2l1-3h4l1 3h2l1-6" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l3 3 5-6" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3 3-6 6-6s6 3 6 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M14 20c0-2 2-4 4-4s4 2 4 4" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 3h8v7a4 4 0 01-8 0V3z" />
      <path d="M6 4H4v2a3 3 0 003 3M18 4h2v2a3 3 0 01-3 3" />
      <path d="M10 14v3M14 14v3M8 21h8M10 17h4v4h-4z" />
    </>
  ),
  lightning: (
    <>
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 21c0-9 7-16 16-16-1 9-7 16-16 16z" />
      <path d="M5 21l9-9" />
    </>
  ),
  factory: (
    <>
      <path d="M3 21h18V11l-5 3V11l-5 3V7H3v14z" />
      <path d="M7 17h2M11 17h2M15 17h2" />
    </>
  ),
  building: (
    <>
      <path d="M3 21h18" />
      <path d="M5 21V8l7-4 7 4v13" />
      <path d="M9 21v-5h6v5" />
      <path d="M9 11h2M13 11h2M9 14h2M13 14h2" />
    </>
  ),
  money: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v12" />
      <path d="M9 9h4a2 2 0 010 4h-2a2 2 0 000 4h4" />
    </>
  ),
  car: (
    <>
      <path d="M3 13l2-5a2 2 0 012-2h10a2 2 0 012 2l2 5v5H3v-5z" />
      <path d="M3 13h18" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </>
  ),
  list: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
      <circle cx="2" cy="6" r="0.8" fill="currentColor" />
      <circle cx="2" cy="12" r="0.8" fill="currentColor" />
      <circle cx="2" cy="18" r="0.8" fill="currentColor" />
    </>
  ),
  doc: (
    <>
      <path d="M6 2h9l5 5v15H6V2z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h8M9 17h6" />
    </>
  ),
}

function Icon({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[#1f47f5]"
      aria-hidden
    >
      {ICON_PATHS[name] ?? ICON_PATHS.fund}
    </svg>
  )
}

/* ===================== 主题与卡片数据 ===================== */
type Card = { id: string; title: string; desc: string; icon: string; tag?: string }
type Section = { id: string; label: string; cards: Card[] }

const SECTIONS: Section[] = [
  {
    id: 'recommend',
    label: '重点推荐',
    cards: [
      { id: 'industry-fund', title: '产业引导基金', desc: '政府产业引导基金与被投...', icon: 'fund', tag: '推荐' },
      { id: 'gov-funded', title: '政府资助企业', desc: '政府产业政府资助企业名单', icon: 'gov', tag: '推荐' },
      { id: 'above-scale', title: '规模以上企业', desc: '全国的规模以上企业库', icon: 'chart', tag: '推荐' },
      { id: 'tech-score', title: '科创评分模型', desc: '科创实力大数据榜单', icon: 'chart', tag: '推荐' },
      { id: 'emerging', title: '新兴产业', desc: '国家战略性新兴产业名录', icon: 'rocket', tag: '推荐' },
      { id: 'agent-accounting', title: '代理注册/记账公司', desc: '从事企业注册代理与财税...', icon: 'briefcase', tag: '推荐' },
      { id: 'chain', title: '连锁企业', desc: '连锁品牌主体企业名录', icon: 'store', tag: '推荐' },
    ],
  },
  {
    id: 'tech-cert',
    label: '科技认定',
    cards: [
      { id: 'srdi', title: '专精特新', desc: '全国专精特新中小企业', icon: 'shield' },
      { id: 'srdi-little-giant', title: '专精特新小巨人', desc: '专精特新企业中的排头兵', icon: 'crown' },
      { id: 'tech-little-giant', title: '科技小巨人', desc: '全国科技小巨人企业', icon: 'star' },
      { id: 'tech-sme', title: '科技型中小企业', desc: '全国科技型中小企业', icon: 'flask' },
      { id: 'eagle', title: '雏鹰企业', desc: '成立十年的创新型企业', icon: 'eagle' },
      { id: 'high-tech', title: '高新企业', desc: '在国家重点领域有核心知...', icon: 'check' },
      { id: 'private-tech', title: '民营科技企业', desc: '科技人员为主体的科...', icon: 'people' },
      { id: 'tech-center', title: '企业技术中心', desc: '在行业内具有规模和竞争优势', icon: 'gear' },
      { id: 'hidden-champion', title: '隐形冠军', desc: '未被外界关注的冠军企业', icon: 'eye' },
      { id: 'mfg-champion', title: '制造业单项冠军', desc: '产品市占率全球前列', icon: 'trophy' },
      { id: 'mfg-champion-cultivate', title: '制造业单项冠军培育', desc: '制造业单项冠军培育', icon: 'trophy' },
      { id: 'tech-innovation', title: '技术创新示范企业', desc: '技术创新', icon: 'lightning' },
      { id: 'unicorn', title: '独角兽企业', desc: '政府认证的独角兽企业', icon: 'unicorn' },
      { id: 'gazelle', title: '瞪羚企业', desc: '进入高速成长期的中小企业', icon: 'gazelle' },
      { id: 'niumin', title: '牛羚企业', desc: '像牛羚一样有强大的生命力', icon: 'niumin' },
    ],
  },
  {
    id: 'green-credit',
    label: '绿色信贷',
    cards: [
      { id: 'green-factory', title: '绿色工厂', desc: '绿色工厂公示名单', icon: 'factory' },
      { id: 'green-product', title: '绿色产品设计', desc: '绿色产品设计名单', icon: 'leaf' },
      { id: 'high-energy', title: '高耗能产业', desc: '高耗能产业企业名录', icon: 'leaf' },
      { id: 'green-project', title: '绿色项目', desc: '绿色环保类项目商机', icon: 'leaf' },
    ],
  },
  {
    id: 'major-project',
    label: '重大项目',
    cards: [
      { id: 'eia', title: '环评项目', desc: '进入环境影响评价的项目', icon: 'factory' },
      { id: 'filing', title: '备案核准投资项目', desc: '入选项目备案审批', icon: 'doc' },
    ],
  },
  {
    id: 'school-hospital',
    label: '学校医院',
    cards: [
      { id: 'hospital', title: '公私立医院', desc: '全国各级公立私立医院', icon: 'building' },
      { id: 'school', title: '公私立学校', desc: '全国各级公立私立学校', icon: 'building' },
    ],
  },
  {
    id: 'quality-supplier',
    label: '优质供应商',
    cards: [
      { id: 'gov-supplier', title: '政府采购商', desc: '承接政府采购机构项目的企业', icon: 'building' },
      { id: 'soe-supplier', title: '国企供应商', desc: '承接过国企项目的企业', icon: 'building' },
      { id: 'listed-supplier', title: '上市公司供应商', desc: '承接过上市公司项目的企业', icon: 'building' },
      { id: 'fin-supplier', title: '金融机构供应商', desc: '承接过金融机构项目的企业', icon: 'building' },
    ],
  },
  {
    id: 'financial',
    label: '金融机构',
    cards: [
      { id: 'private-fund', title: '私募基金管理人', desc: '暂无说明', icon: 'money' },
      { id: 'broker-sub', title: '券商子公司', desc: '暂无说明', icon: 'money' },
      { id: 'finance-co', title: '财务公司', desc: '暂无说明', icon: 'money' },
      { id: 'futures', title: '期货公司', desc: '暂无说明', icon: 'money' },
      { id: 'consumer-fin', title: '消费金融公司', desc: '暂无说明', icon: 'money' },
      { id: 'auto-fin', title: '汽车金融公司', desc: '暂无说明', icon: 'car' },
      { id: 'asset-mgmt', title: '金融资管公司', desc: '暂无说明', icon: 'money' },
      { id: 'bank-wealth', title: '银行理财公司', desc: '暂无说明', icon: 'money' },
    ],
  },
  {
    id: 'other',
    label: '其他',
    cards: [
      { id: 'sme', title: '小微企业', desc: '小微企业介绍', icon: 'store' },
      { id: 'industry-board', title: '行业板块', desc: '行业板块介绍', icon: 'grid' },
      { id: 'ranking', title: '企业榜单', desc: '企业入选的权威TOP榜单', icon: 'list' },
      { id: 'association', title: '协会名单', desc: '全国地区的协会名单', icon: 'people' },
    ],
  },
]

/* ===================== 卡片 ===================== */
function LibCard({ card, onClick }: { card: Card; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer rounded border border-slate-200 bg-white p-4 transition hover:border-[#1f47f5] hover:shadow-sm"
    >
      {card.tag && (
        <span className="absolute right-2 top-2 rounded bg-rose-500 px-1.5 py-0.5 text-[10px] font-medium leading-none text-white">
          {card.tag}
        </span>
      )}
      <div className="flex flex-col gap-2">
        <div>
          <Icon name={card.icon} size={36} />
        </div>
        <div className="text-sm font-semibold text-slate-800">{card.title}</div>
        <div className="truncate text-xs text-slate-400" title={card.desc}>{card.desc}</div>
      </div>
    </div>
  )
}

/* ===================== 主页 ===================== */
export default function DmCompanyLib() {
  const { goDetail } = usePageNav()
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const sectionIds = useMemo(() => SECTIONS.map((s) => s.id), [])

  // scrollspy：监听各 section 是否进入视口，更新 activeId
  useEffect(() => {
    const els = sectionIds
      .map((id) => sectionRefs.current[id])
      .filter((el): el is HTMLDivElement => Boolean(el))
    if (els.length === 0) return

    const obs = new IntersectionObserver(
      (entries) => {
        // 选当前可见区域中 top 最靠上的一个
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          const id = (visible[0].target as HTMLElement).dataset.sectionId
          if (id) setActiveId(id)
        }
      },
      { rootMargin: '-120px 0px -60% 0px', threshold: 0 },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [sectionIds])

  const handleTabClick = (id: string) => {
    setActiveId(id)
    const el = sectionRefs.current[id]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleCardClick = (card: Card) => {
    goDetail('/console/dm/company-lib-list', { cat: card.id, name: card.title })
  }

  // 吸顶：主题 tab 吸到 PageShell 标题下
  const headerRef = useRef<HTMLDivElement>(null)
  const [headH, setHeadH] = useState(64)
  useEffect(() => {
    const measure = () => { if (headerRef.current) setHeadH(headerRef.current.offsetHeight) }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  return (
    <div className="min-h-full bg-[#f7f8fa]">
      <div ref={headerRef}>
        <PageShell title="企业库" crumb="数字营销 / 企业库" legend={false} />
      </div>

      {/* 主题 tab 栏（吸顶到标题下） */}
      <div className="sticky z-10 border-b border-slate-200 bg-white" style={{ top: 56 + headH }}>
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="flex flex-wrap gap-x-6">
            {SECTIONS.map((s) => {
              const active = activeId === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => handleTabClick(s.id)}
                  className={`relative cursor-pointer py-3 text-sm transition ${
                    active ? 'font-medium text-[#1f47f5]' : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {s.label}
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                      active ? 'bg-[#1f47f5]' : 'bg-transparent'
                    }`}
                  />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] p-4">
        {SECTIONS.map((s) => (
          <div
            key={s.id}
            id={`section-${s.id}`}
            data-section-id={s.id}
            ref={(el) => {
              sectionRefs.current[s.id] = el
            }}
            className="mb-6 scroll-mt-20"
          >
            <h3 className="mb-3 text-base font-medium text-slate-700">{s.label}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {s.cards.map((c) => (
                <LibCard key={c.id} card={c} onClick={() => handleCardClick(c)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
