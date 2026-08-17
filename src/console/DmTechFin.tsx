import { useState } from 'react'
import { PageShell } from './PageShell'
import { Panel, DataTable, StatCard } from '../components/ui'
import { Sam } from './SourceTag'

type Tab = 'workbench' | 'corp-lib'

const TABS: { key: Tab; label: string }[] = [
  { key: 'workbench', label: '科创金融工作台' },
  { key: 'corp-lib', label: '科创企业库' },
]

const HOT_LIBS = [
  { name: '专精特新', count: '230,832' },
  { name: '专精特新小巨人', count: '26,089' },
  { name: '科技小巨人', count: '19,493' },
  { name: '创新型中小企业', count: '1,287,693' },
  { name: '雏鹰企业', count: '27,585' },
  { name: '民营科技企业', count: '718,727' },
  { name: '企业技术中心', count: '60,003' },
  { name: '隐形冠军', count: '73,507' },
  { name: '独角兽企业', count: '3,534' },
  { name: '瞪羚企业', count: '31,656' },
  { name: '制造业单项冠军', count: '9,311' },
  { name: '创新型领军企业', count: '218' },
]

const VC_ROUNDS = [
  { stage: '种子轮', count: '853' },
  { stage: '天使轮', count: '10,933' },
  { stage: 'Pre-A轮', count: '3,071' },
  { stage: 'A轮', count: '7,931' },
  { stage: 'A+轮', count: '1,379' },
  { stage: 'Pre-B轮', count: '168' },
  { stage: 'B轮', count: '2,086' },
  { stage: 'B+轮', count: '453' },
  { stage: 'C轮', count: '588' },
  { stage: 'C+轮', count: '93' },
  { stage: 'D轮', count: '209' },
  { stage: 'E轮', count: '47' },
  { stage: 'F轮', count: '19' },
  { stage: '后期阶段', count: '11' },
  { stage: '战略投资', count: '4,351' },
  { stage: '股权投资', count: '39,506' },
  { stage: '并购', count: '12,191' },
  { stage: '股权转让', count: '2,579' },
]

const REGION_RANK = [
  { rank: '1', region: '广东', count: '452,903', ratio: '15.68%' },
  { rank: '2', region: '江苏', count: '335,693', ratio: '11.63%' },
  { rank: '3', region: '浙江', count: '290,457', ratio: '10.06%' },
  { rank: '4', region: '山东', count: '177,041', ratio: '6.13%' },
  { rank: '5', region: '北京', count: '160,330', ratio: '5.55%' },
  { rank: '6', region: '上海', count: '159,628', ratio: '5.53%' },
  { rank: '7', region: '河北', count: '134,497', ratio: '4.66%' },
  { rank: '8', region: '四川', count: '117,174', ratio: '4.06%' },
  { rank: '9', region: '湖北', count: '114,512', ratio: '3.97%' },
  { rank: '10', region: '安徽', count: '106,304', ratio: '3.68%' },
]

const CORP_LIB = [
  { name: '深圳云天励飞技术股份有限公司', tag: '专精特新小巨人 / 独角兽', region: '广东深圳', reg: '36,000万元', date: '2014-08-27' },
  { name: '苏州纳微科技股份有限公司', tag: '专精特新 / 高新企业', region: '江苏苏州', reg: '40,301万元', date: '2007-10-22' },
  { name: '上海联影医疗科技股份有限公司', tag: '独角兽 / 创新型中小企业', region: '上海', reg: '82,437万元', date: '2011-03-21' },
  { name: '杭州申昊科技股份有限公司', tag: '专精特新小巨人', region: '浙江杭州', reg: '14,693万元', date: '2002-09-05' },
  { name: '合肥科大讯飞信息科技股份有限公司', tag: '高新企业 / 科技小巨人', region: '安徽合肥', reg: '231,438万元', date: '1999-12-30' },
  { name: '成都先导药物开发股份有限公司', tag: '专精特新 / 科创板', region: '四川成都', reg: '40,068万元', date: '2002-07-26' },
  { name: '武汉华工激光工程有限责任公司', tag: '制造业单项冠军', region: '湖北武汉', reg: '20,000万元', date: '1997-03-11' },
  { name: '山东天岳先进科技股份有限公司', tag: '专精特新小巨人 / 独角兽', region: '山东济南', reg: '42,971万元', date: '2010-11-02' },
]

function Toggle({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border px-2.5 py-1 text-xs transition ${
        active
          ? 'border-brand-300 bg-brand-50 text-brand-700'
          : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300'
      }`}
    >
      {label}
    </button>
  )
}

export default function DmTechFin() {
  const [tab, setTab] = useState<Tab>('workbench')
  return (
    <div style={{ padding: 24, maxWidth: 1360, margin: '0 auto' }}>
      <PageShell
        title="科创金融"
        crumb="数字营销 / 专题营销"
        subtitle="科创企业专属金融服务：科创企业认定画像、PE/VC 投融资与科创能力评估"
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Toggle key={t.key} label={t.label} active={tab === t.key} onClick={() => setTab(t.key)} />
        ))}
      </div>

      {tab === 'workbench' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel
            title="科创企业认定"
            desc={<Sam label="样例画像" value={1287693} />}
            actions={
              <span className="cursor-pointer text-xs text-brand-600 hover:underline">去企业库查看更多 ›</span>
            }
          >
            <div className="flex flex-wrap gap-2">
              {HOT_LIBS.map((h) => (
                <div
                  key={h.name}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2"
                >
                  <span className="text-sm text-slate-700">{h.name}</span>
                  <span className="text-sm font-semibold text-brand-600">{h.count}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title="PE / VC"
            desc={<Sam label="样例事件" value={39506} />}
            actions={
              <span className="cursor-pointer text-xs text-brand-600 hover:underline">去投资机构查看更多 ›</span>
            }
          >
            <DataTable
              columns={[
                { key: 'stage', label: '融资轮次', width: '140px' },
                { key: 'count', label: '事件数', align: 'right' },
              ]}
              rows={VC_ROUNDS}
              pager
              pageSizeOptions={[10, 20]}
            />
          </Panel>

          <Panel title="科创企业地图" desc={<Sam label="样例分布" value={2887596} />} className="lg:col-span-2">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-sm text-slate-500">科创企业总数量</span>
              <span className="text-2xl font-semibold text-ink-900">2,887,596</span>
              <span className="text-sm text-slate-500">家</span>
              <span className="ml-auto cursor-pointer text-xs text-brand-600 hover:underline">查看全部科创企业 ›</span>
            </div>
            <DataTable
              columns={[
                { key: 'rank', label: '排名', width: '70px' },
                { key: 'region', label: '地区', width: '160px', fixed: 'left' },
                { key: 'count', label: '科创企业数', align: 'right' },
                { key: 'ratio', label: '占比', align: 'right' },
              ]}
              rows={REGION_RANK}
            />
          </Panel>

          <Panel title="科创能力评估" className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard label="高评级区间" value="76.0~100分" accent="emerald" hint="科创能力评分 AAA/AA/A" />
              <StatCard label="AAA 级占比" value="3%" accent="brand" hint="等级 AAA、AA、A" />
              <StatCard label="评估维度" value="发明专利" accent="violet" hint="基于企业发明专利数计算" />
            </div>
            <p className="mt-3 text-xs text-slate-400">
              科创能力评级体系介绍：基于启信大数据，融合发明专利、研发投入、生命周期等维度，输出企业科创能力等级。
            </p>
          </Panel>
        </div>
      )}

      {tab === 'corp-lib' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          <Panel title="筛选条件" desc={<Sam label="样例企业" value={1287693} />}>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-medium text-slate-500">省份地区</p>
                <div className="flex flex-wrap gap-1.5">
                  {['北京市', '上海市', '广东省', '江苏省', '浙江省', '山东省', '四川省', '湖北省'].map((p) => (
                    <Toggle key={p} label={p} />
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-slate-500">资质标签</p>
                <div className="flex flex-wrap gap-1.5">
                  {['专精特新', '专精特新小巨人', '高新企业', '独角兽企业', '瞪羚企业', '科技型中小企业', '制造业单项冠军'].map(
                    (t) => <Toggle key={t} label={t} />,
                  )}
                </div>
              </div>
            </div>
          </Panel>
          <Panel title="科创企业库" actions={<span className="text-xs text-slate-400">找到 1,287,693 条结果</span>}>
            <DataTable
              columns={[
                { key: 'name', label: '企业名称', width: '320px', fixed: 'left' },
                { key: 'tag', label: '科创资质' },
                { key: 'region', label: '地区' },
                { key: 'reg', label: '注册资本', align: 'right' },
                { key: 'date', label: '成立日期', align: 'center' },
              ]}
              rows={CORP_LIB}
              pager
              pageSizeOptions={[10, 20]}
              exportable
              exportName="科创企业库"
            />
          </Panel>
        </div>
      )}
    </div>
  )
}
