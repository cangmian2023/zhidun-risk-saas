import { useState } from 'react'
import { PageShell } from './PageShell'
import { Panel, DataTable } from '../components/ui'
import { Sam } from './SourceTag'

const OUTLOOKS = ['全部', '正面', '稳定', '负面', '列入评级观察', '待决定']
const GRADES = ['AAA+', 'AAA', 'AAA-', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-', 'BB+', 'BB', 'BB-', 'B+', 'B', 'B-', 'CCC+', 'CCC', 'CCC-', 'CC+', 'CC', 'CC-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E+', 'E']
const PROVINCES = ['北京市', '上海市', '广东省', '江苏省', '浙江省', '山东省', '四川省', '湖北省', '湖南省', '河南省', '河北省', '福建省']

const RATINGS = [
  { id: 'rt1', name: '青岛西海岸新区融合控股集团有限公司', grade: 'AAA', date: '2026-08-14', agency: '联合国际' },
  { id: 'rt2', name: '荆州市产业投资发展集团有限公司', grade: 'AA+', date: '2026-08-13', agency: '中诚信' },
  { id: 'rt3', name: '广州开发区交通投资集团有限公司', grade: 'AAA', date: '2026-08-12', agency: '中证鹏元' },
  { id: 'rt4', name: '桐庐县交通发展集团有限公司', grade: 'AA', date: '2026-08-11', agency: '新世纪' },
  { id: 'rt5', name: '成都高新投资集团有限公司', grade: 'AAA', date: '2026-08-10', agency: '惠誉国际' },
  { id: 'rt6', name: '先正达集团股份有限公司', grade: 'Baa1', date: '2026-08-09', agency: '穆迪' },
  { id: 'rt7', name: '茂名港集团有限公司', grade: 'AA-', date: '2026-08-08', agency: '中证鹏元' },
  { id: 'rt8', name: '深圳市高新投创业投资有限公司', grade: 'AAA', date: '2026-08-07', agency: '中诚信' },
  { id: 'rt9', name: '中国化工集团有限公司', grade: 'Baa2', date: '2026-08-06', agency: '穆迪' },
  { id: 'rt10', name: '绍兴市上虞杭州湾经开区控股集团有限公司', grade: 'AA+', date: '2026-08-05', agency: '新世纪' },
]

const HISTORY: Record<string, { id: string; date: string; grade: string; agency: string; outlook: string }[]> = {
  rt1: [
    { id: 'h1', date: '2026-08-14', grade: 'AAA', agency: '联合国际', outlook: '稳定' },
    { id: 'h2', date: '2025-08-10', grade: 'AAA', agency: '联合国际', outlook: '稳定' },
    { id: 'h3', date: '2024-08-12', grade: 'AA+', agency: '联合资信', outlook: '正面' },
  ],
  rt3: [
    { id: 'h1', date: '2026-08-12', grade: 'AAA', agency: '中证鹏元', outlook: '稳定' },
    { id: 'h2', date: '2025-08-09', grade: 'AAA', agency: '中证鹏元', outlook: '稳定' },
    { id: 'h3', date: '2024-08-15', grade: 'AA+', agency: '鹏元资信', outlook: '稳定' },
  ],
  rt6: [
    { id: 'h1', date: '2026-08-09', grade: 'Baa1', agency: '穆迪', outlook: '稳定' },
    { id: 'h2', date: '2025-08-07', grade: 'Baa1', agency: '穆迪', outlook: '稳定' },
    { id: 'h3', date: '2024-08-06', grade: 'Baa2', agency: '穆迪', outlook: '负面' },
  ],
}

function gradeColor(g: string) {
  if (/^(AAA|AA|A|Baa)/.test(g)) return 'text-emerald-600'
  if (/^(BBB|BB|B|Caa|CC|C|D|E)/.test(g)) return 'text-rose-600'
  return 'text-amber-600'
}

export default function DmRating() {
  const [sel, setSel] = useState<string | null>(null)
  const selRow = RATINGS.find((r) => r.id === sel)
  const hist = sel ? HISTORY[sel] ?? [] : []

  return (
    <div style={{ padding: 24, maxWidth: 1360, margin: '0 auto' }}>
      <PageShell title="主体评级" crumb="数字营销 / 金融工具" subtitle="企业主体信用评级与评级迁移" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <Panel title="筛选" className="h-fit">
          <div className="mb-4">
            <div className="mb-2 text-xs font-medium text-slate-500">评级展望</div>
            <div className="flex flex-wrap gap-1.5">
              {OUTLOOKS.map((o) => (
                <button key={o} className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 transition hover:border-brand-300">{o}</button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <div className="mb-2 text-xs font-medium text-slate-500">评级</div>
            <div className="flex flex-wrap gap-1">
              {GRADES.map((g) => (
                <button key={g} className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] text-slate-600 transition hover:border-brand-300">{g}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-medium text-slate-500">省份地区</div>
            <div className="flex flex-wrap gap-1.5">
              {PROVINCES.map((p) => (
                <button key={p} className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 transition hover:border-brand-300">{p}</button>
              ))}
            </div>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel
            title="评级列表"
            desc={<Sam label="样例结果" value={`${RATINGS.length}`} />}
            actions={<span className="text-xs text-slate-400">找到 30,000 条结果</span>}
          >
            <DataTable
              columns={[
                { key: 'name', label: '企业名称', width: '340px', fixed: 'left' },
                { key: 'grade', label: '本次评级', render: (r) => <span className={`font-semibold ${gradeColor(r.grade as string)}`}>{r.grade as string}</span> },
                { key: 'date', label: '披露日期', type: 'date' },
                { key: 'agency', label: '评级公司' },
                {
                  key: 'report',
                  label: '评级报告',
                  render: () => <span className="cursor-pointer text-brand-600 hover:underline">查看</span>,
                },
                {
                  key: 'history',
                  label: '历史评级',
                  render: (r) => (
                    <button onClick={() => setSel(r.id as string)} className="cursor-pointer text-brand-600 hover:underline">
                      查看
                    </button>
                  ),
                },
              ]}
              rows={RATINGS}
              pager
              exportable
              exportName="主体评级"
            />
          </Panel>

          {selRow && (
            <Panel
              title={`历史评级 · ${selRow.name}`}
              desc={<Sam label="样例历史" value={`${hist.length}`} />}
              actions={<button onClick={() => setSel(null)} className="text-xs text-slate-400 hover:text-slate-600">收起</button>}
            >
              {hist.length ? (
                <DataTable
                  columns={[
                    { key: 'date', label: '评级日期', type: 'date', fixed: 'left' },
                    { key: 'grade', label: '评级', render: (r) => <span className={`font-semibold ${gradeColor(r.grade as string)}`}>{r.grade as string}</span> },
                    { key: 'agency', label: '评级机构' },
                    { key: 'outlook', label: '评级展望' },
                  ]}
                  rows={hist}
                />
              ) : (
                <div className="px-4 py-10 text-center text-sm text-slate-400">暂无历史评级数据</div>
              )}
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}
