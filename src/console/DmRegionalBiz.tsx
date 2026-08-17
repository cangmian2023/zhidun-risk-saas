import { useState } from 'react'
import { PageShell } from './PageShell'
import { Panel, DataTable } from '../components/ui'
import { Sam } from './SourceTag'

type Row = Record<string, any>

const PROVINCES = [
  '北京市', '上海市', '天津市', '重庆市', '广东省',
  '江苏省', '浙江省', '山东省', '四川省', '新疆维吾尔自治区',
]

const WORKFLOW = [
  '开始',
  '获取当前时间',
  '启信慧眼：获取目标企业的商机事件信息',
  '智能联网：获取客户对公产品服务信息',
  '启信慧眼：获取目标企业标签画像',
  'LLM：AI 大模型深度分析目标企业的商机分析',
  '结束',
]

export default function DmRegionalBiz() {
  const [province, setProvince] = useState('北京市')
  const [topTab, setTopTab] = useState<'ai' | 'company' | 'relate'>('company')
  const [innerTab, setInnerTab] = useState<'analyze' | 'company'>('company')

  const companyColumns: any[] = [
    { key: 'code', label: '金融产品编码', width: 120, fixed: 'left' },
    { key: 'product', label: '业务产品', width: 180 },
    { key: 'desc', label: '商机描述' },
    { key: 'scene', label: '商机业务场景', width: 140 },
    { key: 'id', label: '商机ID', width: 90, align: 'right' as const },
  ]

  const companyRows: Row[] = [
    {
      code: 'CP01', product: '国内保理/反向保理',
      desc: '2026-08-17，企业与建设银行北京东方广场支行的 22 笔应收账款保理业务今日到期，涉及财产价值合计约 500 万元。可营销续作国内保理或反向保理',
      scene: '应收账款到期', id: 1,
    },
    {
      code: 'CP02', product: '再保理/资产证券化(ABS)',
      desc: '2026-11-14，企业与江苏银行北京分行的应收账款融资到期，融资额涉及财产价值 421,993 元。建议升级为资产证券化（ABS）或供应链反向保理',
      scene: '应收账款融资到期', id: 25,
    },
    {
      code: 'CP03', product: '订单融资/国内信用证',
      desc: '2026-08-15，企业中标中国石油化工股份有限公司中原油田分公司项目，金额未披露。凭中标合同申请订单融资；推荐开立国内信用证',
      scene: '新增中标', id: 28,
    },
    {
      code: 'CP03', product: '订单融资/国内信用证',
      desc: '中国电建水电九局凭中标合同申请订单融资，央企项目资质优，风险低。',
      scene: '新增中标', id: 29,
    },
    {
      code: 'CP03', product: '订单融资/国内信用证',
      desc: '2026-08-10，企业中标中国航发哈尔滨东安发动机有限公司工具采购项目，金额 175,000 万元。超大额订单，资金需求巨大，强烈推荐订单融资+国内信用证组合产品。',
      scene: '新增中标', id: 71,
    },
    {
      code: 'CP03', product: '订单融资/国内信用证',
      desc: '中铁二十四局项目，金额 1,534,071 万元。超大额基建类订单，非常适合订单融资与国内信用证。',
      scene: '新增中标', id: 72,
    },
  ]

  const aiColumns: any[] = [
    { key: 'target', label: '目标企业', width: 220, fixed: 'left' },
    { key: 'method', label: '触达方式', width: 120 },
    {
      key: 'status', label: '任务状态', width: 120, align: 'center' as const,
      render: (row: Row) => {
        const s = row.status as string
        if (s === '已执行')
          return <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">已执行</span>
        if (s === '执行中')
          return <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">执行中</span>
        return <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-600">待执行</span>
      },
    },
    { key: 'plan', label: '计划时间', width: 160 },
    {
      key: 'op', label: '操作', width: 100,
      render: (row: Row) => <button className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 transition hover:border-brand-300">查看</button>,
    },
  ]

  const aiRows: Row[] = [
    { target: '鑫方盛数智科技股份有限公司', method: 'AI外呼', status: '已执行', plan: '2026-08-17 09:30' },
    { target: '世泰仕塑料有限公司', method: '短信', status: '待执行', plan: '2026-08-17 14:00' },
    { target: '北京鑫方盛电子商务有限公司', method: 'AI外呼', status: '已执行', plan: '2026-08-16 10:15' },
    { target: '江苏鑫弘合新能源开发溧阳有限公司', method: '邮件', status: '执行中', plan: '2026-08-18 09:00' },
    { target: '南京金铭文化艺术品投资合伙企业（有限合伙）', method: '短信', status: '待执行', plan: '2026-08-18 11:30' },
    { target: '山金重工有限公司', method: 'AI外呼', status: '已执行', plan: '2026-08-15 15:45' },
  ]

  const relateColumns: any[] = [
    { key: 'name', label: '企业名称', width: 280, fixed: 'left' },
    { key: 'rel', label: '关联关系', width: 120 },
    { key: 'region', label: '地区', width: 160 },
    { key: 'industry', label: '行业', width: 160 },
    {
      key: 'op', label: '操作', width: 100,
      render: (row: Row) => <button className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 transition hover:border-brand-300">查看</button>,
    },
  ]

  const relateRows: Row[] = [
    { name: '江苏鑫弘合新能源开发溧阳有限公司', rel: '子公司', region: '江苏常州溧阳', industry: '研究和试验发展' },
    { name: '南京金铭文化艺术品投资合伙企业（有限合伙）', rel: '联营', region: '江苏南京鼓楼', industry: '商务服务业' },
    { name: '北京鑫方盛电子商务有限公司', rel: '投资企业', region: '北京大兴', industry: '批发和零售业' },
    { name: '北京鑫方盛国际贸易有限公司', rel: '子公司', region: '北京市', industry: '批发和零售业' },
    { name: '山金重工有限公司', rel: '供应链企业', region: '山东烟台莱州', industry: '制造业' },
    { name: '中铁十二局集团建筑安装工程有限公司', rel: '供应链企业', region: '山西太原万柏林', industry: '建筑业' },
  ]

  const topTabBtn = (key: 'ai' | 'company' | 'relate', label: string) => (
    <button
      onClick={() => setTopTab(key)}
      className={
        'rounded-md border px-3 py-1.5 text-sm transition ' +
        (topTab === key
          ? 'border-brand-300 bg-brand-50 text-ink-900'
          : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300')
      }
    >
      {label}
    </button>
  )

  return (
    <div style={{ padding: 24, maxWidth: 1360, margin: '0 auto' }}>
      <PageShell title="区域商机" crumb="数字营销 / 潜客挖掘" subtitle="按行政区划挖掘区域企业商机，含 AI 触达、公司商机与关联营销" />

      <div className="mb-5">
        <div className="mb-2 text-xs font-medium text-slate-500">选择地区</div>
        <div className="flex flex-wrap gap-2">
          {PROVINCES.map((p) => (
            <button
              key={p}
              onClick={() => setProvince(p)}
              className={
                'rounded-md border px-2.5 py-1 text-xs transition ' +
                (province === p
                  ? 'border-brand-300 bg-brand-50 text-ink-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300')
              }
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 flex gap-2 border-b border-slate-200 pb-3">
        {topTabBtn('ai', 'AI触达')}
        {topTabBtn('company', '公司商机(2580)')}
        {topTabBtn('relate', '关联营销')}
      </div>

      {topTab === 'company' && (
        <div>
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setInnerTab('analyze')}
              className={
                'rounded-md border px-3 py-1.5 text-sm transition ' +
                (innerTab === 'analyze'
                  ? 'border-brand-300 bg-brand-50 text-ink-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300')
              }
            >
              AI分析
            </button>
            <button
              onClick={() => setInnerTab('company')}
              className={
                'rounded-md border px-3 py-1.5 text-sm transition ' +
                (innerTab === 'company'
                  ? 'border-brand-300 bg-brand-50 text-ink-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300')
              }
            >
              公司商机
            </button>
          </div>

          {innerTab === 'analyze' ? (
            <Panel title="AI商机解析" desc={<Sam label="AI生成" value="809" />}>
              <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-medium text-ink-900">目标企业：鑫方盛数智科技股份有限公司</div>
                <div className="mt-1 text-xs text-slate-500">
                  民营企业 / 大型企业 / 工业品采购平台，启信分 673
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {['央企供应商', '上市公司供应商', '国有企业供应商', '政府供应商'].map((t) => (
                    <span key={t} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <div className="mb-2 text-xs font-medium text-slate-500">工作流</div>
                <div className="space-y-0">
                  {WORKFLOW.map((node, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-400" />
                        {i < WORKFLOW.length - 1 && <span className="my-1 w-px flex-1 bg-slate-200" style={{ minHeight: 16 }} />}
                      </div>
                      <div className={'pb-3 text-sm ' + (i === WORKFLOW.length - 1 ? 'text-ink-900' : 'text-slate-600')}>
                        {node}
                        {i === WORKFLOW.length - 1 && (
                          <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                            已完成思考 (15.0s)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 text-sm leading-relaxed text-slate-600">
                <p>
                  目标企业：鑫方盛数智科技股份有限公司（民营企业，大型企业，主营业务为工业品采购平台）。在近 90 天内，该企业共发生 <span className="font-medium text-ink-900">809</span> 条商机事件。主要事件类型为应收账款融资到期、应收账款转让（保理）到期及新增中标；事件高度集中在 2026 年 8 月-11 月，时效性极强。
                </p>
                <p>
                  大量保理业务即将到期，释放出巨大的续作融资和现金管理需求；同时密集的中标公告（如中标中国石化、中铁、中国电建等大型国企项目）预示着企业有旺盛的订单融资和履约保函需求。
                </p>
                <p>
                  营销价值：作为大型工业品采购平台，企业是典型的供应链核心企业，向上游采购产生应付账款，向下游销售产生应收账款。建议重点营销供应链金融（反向保理、国内保理、应收账款融资）、订单融资、资金管理产品。
                </p>
              </div>
            </Panel>
          ) : (
            <Panel title="重点跟进商机" desc={<Sam label="样例商机" value="20" />}>
              <DataTable
                columns={companyColumns}
                rows={companyRows}
                pager
                pageSizeOptions={[10, 20]}
                exportable
                exportName="重点跟进商机"
              />
            </Panel>
          )}
        </div>
      )}

      {topTab === 'ai' && (
        <Panel title="AI 触达任务" desc={<Sam label="样例任务" value="6" />}>
          <DataTable
            columns={aiColumns}
            rows={aiRows}
            pager
            pageSizeOptions={[10, 20]}
            exportable
            exportName="AI触达任务"
          />
        </Panel>
      )}

      {topTab === 'relate' && (
        <Panel title="关联企业" desc={<Sam label="样例关联" value="6" />}>
          <DataTable
            columns={relateColumns}
            rows={relateRows}
            pager
            pageSizeOptions={[10, 20]}
            exportable
            exportName="关联企业"
          />
        </Panel>
      )}
    </div>
  )
}
