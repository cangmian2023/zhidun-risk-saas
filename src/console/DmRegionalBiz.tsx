import { useState } from 'react'
import { PageShell } from './PageShell'
import { Panel, DataTable, Button, Badge } from '../components/ui'
import { Sam } from './SourceTag'

type Row = Record<string, any>

type TopTab = 'main' | 'ai' | 'touch' | 'company' | 'relate' | 'content'

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

// 主表：区域商机列表（企业名称 / 发生日期 / 商机类型 / 商机价值 / 商机内容 / 操作）
const mainRows: Row[] = [
  {
    name: '北京中铁建工物资有限公司', date: '2026-08-17', type: '应收账款到期',
    value: '高', count: 1769,
    content: '企业与建设银行北京东方广场支行的 22 笔应收账款保理业务今日到期，涉及财产价值合计约 500 万元。',
  },
  {
    name: '中交一公局海威工程建设有限公司', date: '2026-08-16', type: '新增中标',
    value: '中', count: 211,
    content: '企业中标中国电建水电九局项目，凭中标合同可申请订单融资，央企项目资质优。',
  },
  {
    name: '北京天安未来科技有限公司', date: '2026-08-15', type: '新增中标',
    value: '中', count: 241,
    content: '企业中标中国航发哈尔滨东安发动机有限公司工具采购项目，金额 175,000 万元，推荐订单融资 + 国内信用证组合。',
  },
  {
    name: '五矿钢铁北京有限公司', date: '2026-08-14', type: '应收账款融资到期',
    value: '高', count: 315,
    content: '企业与江苏银行北京分行的应收账款融资到期，融资额 421,993 元，建议升级为资产证券化（ABS）。',
  },
  {
    name: '中信银行股份有限公司北京分行', date: '2026-08-13', type: '新增合作关系',
    value: '低', count: 88,
    content: '与多家央企核心企业新增供应链合作关系，存在反向保理与资金管理产品切入机会。',
  },
  {
    name: '鑫方盛数智科技股份有限公司', date: '2026-08-12', type: '密集中标',
    value: '高', count: 809,
    content: '近 90 天共发生 809 条商机事件，集中在应收账款融资到期与新增中标，营销价值极高。',
  },
]

// 公司商机（地图拓客）
const companyRows: Row[] = [
  { code: 'CP01', product: '国内保理/反向保理', desc: '2026-08-17，企业与建设银行北京东方广场支行的 22 笔应收账款保理业务今日到期，涉及财产价值合计约 500 万元。可营销续作国内保理或反向保理', scene: '应收账款到期', id: 1 },
  { code: 'CP02', product: '再保理/资产证券化(ABS)', desc: '2026-11-14，企业与江苏银行北京分行的应收账款融资到期，融资额涉及财产价值 421,993 元。建议升级为资产证券化（ABS）或供应链反向保理', scene: '应收账款融资到期', id: 25 },
  { code: 'CP03', product: '订单融资/国内信用证', desc: '2026-08-15，企业中标中国石油化工股份有限公司中原油田分公司项目，金额未披露。凭中标合同申请订单融资；推荐开立国内信用证', scene: '新增中标', id: 28 },
  { code: 'CP03', product: '订单融资/国内信用证', desc: '中国电建水电九局凭中标合同申请订单融资，央企项目资质优，风险低。', scene: '新增中标', id: 29 },
  { code: 'CP03', product: '订单融资/国内信用证', desc: '2026-08-10，企业中标中国航发哈尔滨东安发动机有限公司工具采购项目，金额 175,000 万元。超大额订单，资金需求巨大，强烈推荐订单融资+国内信用证组合产品。', scene: '新增中标', id: 71 },
]

// AI 触达任务
const touchRows: Row[] = [
  { target: '鑫方盛数智科技股份有限公司', method: 'AI外呼', status: '已执行', plan: '2026-08-17 09:30', contact: '010-8888-0001', ctype: '固话', source: '企业年报', empty: '否' },
  { target: '世泰仕塑料有限公司', method: '短信', status: '待执行', plan: '2026-08-17 14:00', contact: '138-0000-1234', ctype: '手机', source: '招投标', empty: '否' },
  { target: '北京鑫方盛电子商务有限公司', method: 'AI外呼', status: '已执行', plan: '2026-08-16 10:15', contact: '010-8888-0002', ctype: '固话', source: '工商', empty: '是' },
  { target: '江苏鑫弘合新能源开发溧阳有限公司', method: '邮件', status: '执行中', plan: '2026-08-18 09:00', contact: 'jx@xinhong.com', ctype: '邮箱', source: '官网', empty: '否' },
  { target: '南京金铭文化艺术品投资合伙企业（有限合伙）', method: '短信', status: '待执行', plan: '2026-08-18 11:30', contact: '139-0000-5678', ctype: '手机', source: '招投标', empty: '否' },
  { target: '山金重工有限公司', method: 'AI外呼', status: '已执行', plan: '2026-08-15 15:45', contact: '0535-345-6789', ctype: '固话', source: '工商', empty: '否' },
]

// 关联营销
const relateRows: Row[] = [
  { name: '江苏鑫弘合新能源开发溧阳有限公司', rel: '子公司', region: '江苏常州溧阳', industry: '研究和试验发展' },
  { name: '南京金铭文化艺术品投资合伙企业（有限合伙）', rel: '联营', region: '江苏南京鼓楼', industry: '商务服务业' },
  { name: '北京鑫方盛电子商务有限公司', rel: '投资企业', region: '北京大兴', industry: '批发和零售业' },
  { name: '北京鑫方盛国际贸易有限公司', rel: '子公司', region: '北京市', industry: '批发和零售业' },
  { name: '山金重工有限公司', rel: '供应链企业', region: '山东烟台莱州', industry: '制造业' },
  { name: '中铁十二局集团建筑安装工程有限公司', rel: '供应链企业', region: '山西太原万柏林', industry: '建筑业' },
]

function OpButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 transition hover:border-brand-300"
    >
      {label}
    </button>
  )
}

const valueBadge = (v: string) => {
  if (v === '高') return <Badge kind="red">高</Badge>
  if (v === '中') return <Badge kind="orange">中</Badge>
  return <Badge kind="gray">低</Badge>
}

export default function DmRegionalBiz() {
  const [province, setProvince] = useState('北京市')
  const [topTab, setTopTab] = useState<TopTab>('main')
  const [sel, setSel] = useState<Row | null>(null)

  const go = (tab: TopTab, row: Row) => {
    setSel(row)
    setTopTab(tab)
  }

  const mainColumns: any[] = [
    { key: 'name', label: '企业名称', width: 260, fixed: 'left' },
    { key: 'date', label: '发生日期', width: 120 },
    { key: 'type', label: '商机类型', width: 140 },
    { key: 'value', label: '商机价值', width: 90, render: (r: Row) => valueBadge(r.value) },
    { key: 'content', label: '商机内容' },
    {
      key: 'op', label: '操作', width: 320,
      render: (row: Row) => (
        <div className="flex flex-wrap gap-1.5">
          <OpButton label="AI分析" onClick={() => go('ai', row)} />
          <OpButton label="AI触达" onClick={() => go('touch', row)} />
          <OpButton label={'公司商机' + (row.count ? row.count : '')} onClick={() => go('company', row)} />
          <OpButton label="关联营销" onClick={() => go('relate', row)} />
          <OpButton label="商机内容" onClick={() => go('content', row)} />
        </div>
      ),
    },
  ]

  const companyColumns: any[] = [
    { key: 'code', label: '金融产品编码', width: 120, fixed: 'left' },
    { key: 'product', label: '业务产品', width: 180 },
    { key: 'desc', label: '商机描述' },
    { key: 'scene', label: '商机业务场景', width: 140 },
    { key: 'id', label: '商机ID', width: 90, align: 'right' as const },
  ]

  const touchColumns: any[] = [
    { key: 'target', label: '目标企业', width: 220, fixed: 'left' },
    { key: 'method', label: '触达方式', width: 100 },
    {
      key: 'status', label: '任务状态', width: 100, align: 'center' as const,
      render: (row: Row) => {
        const s = row.status as string
        if (s === '已执行') return <Badge kind="green">已执行</Badge>
        if (s === '执行中') return <Badge kind="amber">执行中</Badge>
        return <Badge kind="gray">待执行</Badge>
      },
    },
    { key: 'plan', label: '计划时间', width: 150 },
    { key: 'contact', label: '联系方式', width: 150 },
    { key: 'ctype', label: '类型', width: 80 },
    { key: 'source', label: '来源', width: 100 },
    { key: 'empty', label: '空号筛选', width: 90 },
  ]

  const relateColumns: any[] = [
    { key: 'name', label: '企业名称', width: 280, fixed: 'left' },
    { key: 'rel', label: '关联关系', width: 120 },
    { key: 'region', label: '地区', width: 160 },
    { key: 'industry', label: '行业', width: 160 },
  ]

  const tabBtn = (key: TopTab, label: string) => (
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
      <PageShell
        title="区域商机"
        crumb="数字营销 / 潜客挖掘"
        subtitle="按行政区划挖掘区域企业商机，含 AI 触达、公司商机与关联营销"
      />

      {/* 工具条 */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="primary">商机订阅</Button>
        <Button variant="secondary">添加客户</Button>
        <Button variant="ghost">单个添加</Button>
        <Button variant="ghost">批量添加</Button>
      </div>

      {/* AI 商机解读横幅 */}
      <Panel className="mb-5" title="AI 商机解读" desc={<Sam label="AI生成" value="近 1 天" />}>
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <div className="text-xs text-slate-500">数据范围：近 1 天区域商机</div>
            <div className="mt-1 text-3xl font-bold text-ink-900">2,026</div>
            <div className="text-xs text-slate-400">商机事件总数</div>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="secondary">商机综述</Button>
            <Button variant="primary">生成完整 AI 分析报告</Button>
          </div>
        </div>
      </Panel>

      {/* 地区选择 */}
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

      {/* 子页面切换 */}
      <div className="mb-5 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {tabBtn('main', '区域商机')}
        {tabBtn('ai', 'AI分析')}
        {tabBtn('touch', 'AI触达')}
        {tabBtn('company', '公司商机')}
        {tabBtn('relate', '关联营销')}
        {tabBtn('content', '商机内容')}
      </div>

      {topTab === 'main' && (
        <Panel title="区域商机列表" desc={<Sam label="样例商机" value={String(mainRows.length)} />}>
          <DataTable
            columns={mainColumns}
            rows={mainRows}
            pager
            pageSizeOptions={[10, 20]}
            exportable
            exportName="区域商机列表"
          />
        </Panel>
      )}

      {topTab === 'ai' && (
        <Panel
          title={sel ? 'AI商机解析 · ' + sel.name : 'AI商机解析'}
          desc={<Sam label="AI生成" value={sel?.count ? String(sel.count) : '809'} />}
          extra={
            <Button variant="ghost" onClick={() => setTopTab('main')}>
              返回列表
            </Button>
          }
        >
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-medium text-ink-900">
              目标企业：{sel ? sel.name : '鑫方盛数智科技股份有限公司'}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {sel
                ? '基于所选商机行「' + sel.type + '」解析'
                : '民营企业 / 大型企业 / 工业品采购平台，启信分 673'}
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
                    {i < WORKFLOW.length - 1 && (
                      <span className="my-1 w-px flex-1 bg-slate-200" style={{ minHeight: 16 }} />
                    )}
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
              目标企业：{sel ? sel.name : '鑫方盛数智科技股份有限公司'}（民营企业，大型企业，主营业务为工业品采购平台）。在近 90 天内，该企业共发生{' '}
              <span className="font-medium text-ink-900">{sel?.count ? sel.count : 809}</span>{' '}
              条商机事件。主要事件类型为应收账款融资到期、应收账款转让（保理）到期及新增中标；事件高度集中在 2026 年 8 月-11 月，时效性极强。
            </p>
            <p>
              大量保理业务即将到期，释放出巨大的续作融资和现金管理需求；同时密集的中标公告（如中标中国石化、中铁、中国电建等大型国企项目）预示着企业有旺盛的订单融资和履约保函需求。
            </p>
            <p>
              营销价值：作为大型工业品采购平台，企业是典型的供应链核心企业，向上游采购产生应付账款，向下游销售产生应收账款。建议重点营销供应链金融（反向保理、国内保理、应收账款融资）、订单融资、资金管理产品。
            </p>
          </div>
        </Panel>
      )}

      {topTab === 'touch' && (
        <Panel
          title="AI 触达任务"
          desc={<Sam label="样例任务" value="6" />}
          extra={
            <Button variant="ghost" onClick={() => setTopTab('main')}>
              返回列表
            </Button>
          }
        >
          <DataTable
            columns={touchColumns}
            rows={touchRows}
            pager
            pageSizeOptions={[10, 20]}
            exportable
            exportName="AI触达任务"
          />
        </Panel>
      )}

      {topTab === 'company' && (
        <Panel
          title={sel ? '公司商机 · ' + sel.name : '公司商机（地图拓客）'}
          desc={<Sam label="样例商机" value={String(companyRows.length)} />}
          extra={
            <Button variant="ghost" onClick={() => setTopTab('main')}>
              返回列表
            </Button>
          }
        >
          <DataTable
            columns={companyColumns}
            rows={companyRows}
            pager
            pageSizeOptions={[10, 20]}
            exportable
            exportName="公司商机"
          />
        </Panel>
      )}

      {topTab === 'relate' && (
        <Panel
          title={sel ? '关联营销 · ' + sel.name : '关联营销'}
          desc={<Sam label="样例关联" value="6" />}
          extra={
            <Button variant="ghost" onClick={() => setTopTab('main')}>
              返回列表
            </Button>
          }
        >
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

      {topTab === 'content' && (
        <Panel
          title={sel ? '商机内容 · ' + sel.name : '商机内容'}
          desc={<Sam label="样例商机" value={sel ? sel.date : ''} />}
          extra={
            <Button variant="ghost" onClick={() => setTopTab('main')}>
              返回列表
            </Button>
          }
        >
          <div className="space-y-3 text-sm leading-relaxed text-slate-600">
            {sel ? (
              <>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-medium text-ink-900">企业名称：{sel.name}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    发生日期：{sel.date} ｜ 商机类型：{sel.type} ｜ 商机价值：
                    {valueBadge(sel.value)}
                  </div>
                </div>
                <p>{sel.content}</p>
                <p>
                  营销建议：结合目标企业的商机类型「{sel.type}」，建议优先匹配供应链金融与订单融资产品，
                  并联动 AI 触达任务进行自动化外呼 / 短信触达，提升转化效率。
                </p>
              </>
            ) : (
              <p>请从「区域商机」列表操作列点击「商机内容」查看对应企业的商机详情。</p>
            )}
          </div>
        </Panel>
      )}
    </div>
  )
}
