import { useState } from 'react'
import { PageShell } from './PageShell'
import { Panel, DataTable } from '../components/ui'
import { Sam } from './SourceTag'

const TOGGLE_CLS =
  'rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 transition hover:border-brand-300'

function Toggle({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`${TOGGLE_CLS}${active ? ' border-brand-300 text-brand-600' : ''}`}
    >
      {label}
    </button>
  )
}

function RelationBadge({ kind }: { kind: '供应商' | '客户' }) {
  const isSup = kind === '供应商'
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        isSup ? 'bg-cyan-50 text-cyan-700' : 'bg-violet-50 text-violet-700'
      }`}
    >
      {kind}
    </span>
  )
}

const QIXIN_SCORE = ['200 - 400分', '401 - 500分', '501 - 600分', '601 - 700分', '700分以上']
const RELATIONS = ['供应商', '客户']
const PROVINCES = [
  '北京市',
  '上海市',
  '广东省',
  '江苏省',
  '浙江省',
  '山东省',
  '四川省',
  '湖北省',
  '天津市',
  '河北省',
  '河南省',
  '新疆维吾尔自治区',
]
const ENT_TYPES = [
  '国有企业',
  '集体企业',
  '有限责任公司',
  '股份有限公司',
  '私营企业',
  '港、澳、台商投资企业',
  '外商投资企业',
  '个体工商户',
]

interface Row {
  relation: '供应商' | '客户'
  company: string
  region: string
  pubDate: string
  source: string
  action: string
}

const ROWS: Row[] = [
  {
    relation: '供应商',
    company: '深圳市德晟达电子科技有限公司',
    region: '广东省深圳市南山区',
    pubDate: '2014-12-31',
    source: '招股意向书',
    action: '企业尽调',
  },
  {
    relation: '供应商',
    company: '北京山天大蓄知识产权科技服务集团股份有限公司',
    region: '北京市顺义区',
    pubDate: '2021-12-31',
    source: '供应商公告',
    action: '查看',
  },
  {
    relation: '客户',
    company: '上海协度电子科技有限公司',
    region: '上海市浦东新区',
    pubDate: '2016-06-30',
    source: '—',
    action: '查看',
  },
  {
    relation: '供应商',
    company: '广州无线电集团有限公司',
    region: '广东省广州市天河区',
    pubDate: '2017-04-20',
    source: '招投标',
    action: '查看',
  },
  {
    relation: '客户',
    company: '路必康(香港)电子技术有限公司',
    region: '香港特别行政区',
    pubDate: '2023-12-31',
    source: '年度报告',
    action: '查看',
  },
  {
    relation: '供应商',
    company: '晨星半导体股份有限公司',
    region: '—',
    pubDate: '2013-12-31',
    source: '—',
    action: '查看',
  },
  {
    relation: '客户',
    company: '泰克科技(中国)有限公司',
    region: '—',
    pubDate: '2018-11-14',
    source: '—',
    action: '查看',
  },
  {
    relation: '供应商',
    company: '深圳市华星光电半导体显示技术有限公司',
    region: '广东省深圳市光明区',
    pubDate: '—',
    source: '—',
    action: '查看',
  },
  {
    relation: '客户',
    company: '泰晶科技股份有限公司',
    region: '湖北省随州市曾都区',
    pubDate: '—',
    source: '—',
    action: '查看',
  },
  {
    relation: '客户',
    company: '强民发展有限公司',
    region: '—',
    pubDate: '2015-12-31',
    source: '—',
    action: '查看',
  },
]

const COLUMNS = [
  {
    key: 'relation',
    label: '供应商/客户',
    width: 110,
    render: (row: Row) => <RelationBadge kind={row.relation} />,
  },
  { key: 'company', label: '查询/上传企业', width: 280 },
  { key: 'region', label: '地区', width: 200 },
  { key: 'pubDate', label: '公开时间', width: 130, type: 'date' as const },
  { key: 'source', label: '数据来源', width: 130 },
  {
    key: 'action',
    label: '操作',
    width: 90,
    align: 'center' as const,
    render: (row: Row) => (
      <span className="cursor-pointer text-brand-600 hover:underline">{row.action}</span>
    ),
  },
]

export default function DmSupplyChain() {
  const [query, setQuery] = useState('')

  return (
    <div style={{ padding: 24, maxWidth: 1360, margin: '0 auto' }}>
      <PageShell
        title="供应链"
        crumb="数字营销 / 潜客挖掘"
        subtitle="产业链上下游企业挖掘与供应链金融商机识别"
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* 左栏：查询栏 + 基础信息 */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="查询企业名称/统一社会信用代码"
              className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm text-ink-900 outline-none transition focus:border-brand-300"
            />
            <button type="button" className={TOGGLE_CLS}>
              批量查询
            </button>
          </div>

          <Panel title="基础信息">
            <div className="space-y-4">
              <div>
                <div className="mb-2 text-xs font-medium text-slate-600">启信分</div>
                <div className="flex flex-wrap gap-2">
                  {QIXIN_SCORE.map((s) => (
                    <Toggle key={s} label={s} />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-medium text-slate-600">企业关系</div>
                <div className="flex flex-wrap gap-2">
                  {RELATIONS.map((r) => (
                    <Toggle key={r} label={r} />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-medium text-slate-600">成立时间</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">至</span>
                  <input
                    type="date"
                    className="rounded-md border border-slate-200 px-2 py-1 text-xs text-ink-900 outline-none transition focus:border-brand-300"
                  />
                  <button type="button" className={TOGGLE_CLS}>
                    确定
                  </button>
                  <button type="button" className={TOGGLE_CLS}>
                    取消
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-medium text-slate-600">省份地区</div>
                <div className="flex flex-wrap gap-2">
                  {PROVINCES.map((p) => (
                    <Toggle key={p} label={p} />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-medium text-slate-600">企业类型</div>
                <div className="flex flex-wrap gap-2">
                  {ENT_TYPES.map((t) => (
                    <Toggle key={t} label={t} />
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* 右栏：结果 */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-ink-900">
              找到 <span className="font-semibold">43</span> 条结果
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={TOGGLE_CLS}>
                加入所选
              </button>
              <button type="button" className={TOGGLE_CLS}>
                加入前3万条
              </button>
              <button type="button" className={TOGGLE_CLS}>
                导出
              </button>
              <button type="button" className={TOGGLE_CLS}>
                导出全部
              </button>
              <button type="button" className={TOGGLE_CLS}>
                推送数据
              </button>
            </div>
          </div>

          <Panel
            title="供应商/客户关系"
            desc={<Sam label="样例关系" value="43" />}
          >
            <DataTable
              columns={COLUMNS}
              rows={ROWS}
              pager
              pageSizeOptions={[10, 20]}
              exportable
              exportName="供应链"
            />
          </Panel>
        </div>
      </div>
    </div>
  )
}
