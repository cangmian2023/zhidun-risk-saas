import { PageShell } from './PageShell'
import { Panel, DataTable } from '../components/ui'
import { Sam } from './SourceTag'

const REPORT_TYPES = ['不限', '其他报告(期货资讯晨会)', '公司研究', '年报季报', '行业研究', '宏观策略', '招股说明书', '管理咨询', '政策法规', '综合其他']
const INDUSTRIES = ['工业制造', '能源矿产', '金融地产', '科技传媒', '大消费', '健康医疗', '公共服务', '农林牧渔', '交通物流']
const TAGS = ['新鲜出炉', '非券商', '英文', '深度研究', '热门']
const ORGS = ['SEC', '深交所', '上交所', '港交所', '国泰君安期货', '华泰证券', '天风证券', '华泰期货', '东吴证券', '中泰证券']

const REPORTS = [
  { id: 'r1', title: '2026年中国低空文旅观光行业研究报告', tag: '深度', org: '硕远咨询', date: '2026-08-16', pages: '32页', size: '1M' },
  { id: 'r2', title: '中报业绩创历史新高，下半年业务更多看点', tag: '公司', org: '金元证券', date: '2026-08-16', pages: '5页', size: '—' },
  { id: 'r3', title: '中石化炼化工程 2026半年度报告', tag: '新', org: '中石化炼化工程', date: '2026-08-15', pages: '139页', size: '16M' },
  { id: 'r4', title: 'Bangkok & Phuket Hotel Market H1 2026', tag: '英文', org: '莱坊', date: '2026-08-15', pages: '8页', size: '3M' },
  { id: 'r5', title: '2026年中国低空农业植保服务行业研究报告', tag: '深度', org: '硕远咨询', date: '2026-08-14', pages: '28页', size: '2M' },
  { id: 'r6', title: '策略周报：8月关注中报业绩验证', tag: '策略', org: '源达证券', date: '2026-08-14', pages: '16页', size: '1M' },
  { id: 'r7', title: '预期开始波动——2026年7月金融数据点评', tag: '宏观', org: '华创证券', date: '2026-08-13', pages: '14页', size: '1M' },
  { id: 'r8', title: '泓淋电力：2026年半年度报告', tag: '新', org: '泓淋电力', date: '2026-08-15', pages: '169页', size: '12M' },
  { id: 'r9', title: '世嘉科技：2026年半年度报告', tag: '新', org: '世嘉科技', date: '2026-08-15', pages: '172页', size: '13M' },
  { id: 'r10', title: '创新医疗：2026年半年度报告', tag: '新', org: '创新医疗', date: '2026-08-14', pages: '130页', size: '9M' },
]

function FilterBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-4">
      <div className="mb-2 text-xs font-medium text-slate-500">{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => (
          <button
            key={it}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
          >
            {it}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function DmIndustryReport() {
  return (
    <div style={{ padding: 24, maxWidth: 1360, margin: '0 auto' }}>
      <PageShell title="行业研报" crumb="数字营销 / 金融工具" subtitle="行业研究报告库：检索、订阅与解读" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <Panel title="筛选" className="h-fit">
          <FilterBlock title="报告类型" items={REPORT_TYPES} />
          <FilterBlock title="行业分类" items={INDUSTRIES} />
          <FilterBlock title="特色标签" items={TAGS} />
          <FilterBlock title="发布机构" items={ORGS} />
          <div className="mt-2 flex gap-2">
            <button className="flex-1 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white">查询</button>
            <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-500">重置</button>
          </div>
        </Panel>

        <Panel
          title="研报列表"
          desc={<Sam label="样例结果" value={`${REPORTS.length}`} />}
          actions={<span className="text-xs text-slate-400">找到 1,692,732 条结果</span>}
        >
          <DataTable
            columns={[
              { key: 'title', label: '报告标题', width: '380px', fixed: 'left' },
              {
                key: 'tag',
                label: '标签',
                render: (r) => <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-600">{r.tag as string}</span>,
              },
              { key: 'org', label: '发布机构' },
              { key: 'date', label: '发布日期', type: 'date' },
              { key: 'pages', label: '页数', align: 'right' },
              { key: 'size', label: '大小', align: 'right' },
            ]}
            rows={REPORTS}
            pager
            exportable
            exportName="行业研报"
          />
        </Panel>
      </div>
    </div>
  )
}
