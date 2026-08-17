import { useState } from 'react'
import { PageShell } from './PageShell'
import { Panel, DataTable } from '../components/ui'
import { Sam } from './SourceTag'

const LEVEL1 = [
  '基础设施绿色升级', '生态环境产业', '节能环保产业', '绿色服务', '清洁能源产业', '清洁生产产业',
]

const BACKGROUND = ['外商投资', '中外合资', '外商独资', '港澳台投资', '民营企业', '国有企业', '央企', '事业单位']
const SCALE = ['小微企业', '中型企业', '大型企业', '规模以上企业', '规模以上服务业企业', '规模以上工业企业']
const TAGS = [
  '专精特新', '专精特新小巨人', '高新企业', '独角兽企业', '绿色企业', '瞪羚企业', '牛羚企业',
  '制造业单项冠军', '创新型中小企业', '科技企业孵化器', '隐形冠军', '雏鹰企业',
]
const LISTING = ['A股上市', '新三板', '上交所', '深交所', '科创板', '创业版', '中概股']

const RESULTS = [
  { name: '南方电网数字电网研究院股份有限公司', link: '新能源与清洁能源装备、能源系统高效运行', biz: '2026-08-14 中标【南网科研院2026年情报资源与经营支撑类公开招标采购项目】，金额：--万元', region: '广州市', reg: '317,965.02万元', date: '2017-03-31' },
  { name: '广电计量检测集团股份有限公司', link: '环境基础设施', biz: '2026-08-14 中标上饶市立医院项目（技术测试和分析服务），金额：2.38万元', region: '广州市', reg: '63,727.99万元', date: '2002-05-24' },
  { name: '钱江水利开发股份有限公司', link: '生产过程节水和废水处理处置及资源化综合利用、清洁能源设施建设和运营、环境基础设施', biz: '2026-08-05 新增对外投资，获投企业温州珊溪水库基础设施管理有限公司，持股 9.28%', region: '杭州市', reg: '56,082.49万元', date: '1998-12-30' },
  { name: '国电南瑞科技股份有限公司', link: '新能源汽车和绿色船舶制造、节能改造、新能源与清洁能源装备、能源系统高效运行、绿色交通', biz: '2026-08-16 中标【江西分公司新能源公司风电场功率预测系统接入地调服务】，金额：--万元', region: '南京市', reg: '803,208.83万元', date: '2001-02-28' },
  { name: '广西粤桂广业控股股份有限公司', link: '其他绿色工厂', biz: '2026-07-06 发布增发扩股公告，向特定对象发行股票获中国证监会同意注册批复', region: '贵港市', reg: '80,208.22万元', date: '1994-10-05' },
  { name: '深南电路股份有限公司', link: '其他绿色工厂', biz: '2026-08-12 中标【天津七所精密机电技术有限公司 PCB 制板外协询价】，金额：--万元', region: '深圳市', reg: '68,116.66万元', date: '1984-07-03' },
  { name: '武汉三镇实业控股股份有限公司', link: '污染治理、环境基础设施', biz: '2026-07-31 新增供应商中审众环会计师事务所，合作项目年报审计，金额 168 万元', region: '武汉市', reg: '99,339.76万元', date: '1998-04-17' },
  { name: '惠科股份有限公司', link: '-', biz: '2026-08-01 发布委托理财公告（使用暂时闲置募集资金进行现金管理）', region: '深圳市', reg: '656,805.13万元', date: '2001-12-03' },
  { name: '株洲时代新材料科技股份有限公司', link: '新能源与清洁能源装备', biz: '2026-08-15 中标【山东风电7.x海外样机叶片直接采购】，金额：--万元', region: '株洲市', reg: '93,075.35万元', date: '1994-05-24' },
  { name: '成都长城开发科技股份有限公司', link: '新能源与清洁能源装备', biz: '2026-08-13 中标【新能源装备配套组件采购项目】，金额：--万元', region: '成都市', reg: '41,200.00万元', date: '2008-03-18' },
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

function FilterGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-slate-500">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((t) => <Toggle key={t} label={t} />)}
      </div>
    </div>
  )
}

export default function DmGreenFin() {
  const [lv1, setLv1] = useState('不限')
  return (
    <div style={{ padding: 24, maxWidth: 1360, margin: '0 auto' }}>
      <PageShell
        title="绿色金融"
        crumb="数字营销 / 专题营销"
        subtitle="绿色金融客群：绿色企业认定与碳账户营销，覆盖清洁能源、节能环保、生态环境等产业"
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <Panel title="筛选条件" desc={<Sam label="样例企业" value={30000} />}>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium text-slate-500">一级行业</p>
              <div className="flex flex-wrap gap-1.5">
                {['不限', ...LEVEL1].map((t) => (
                  <Toggle key={t} label={t} active={lv1 === t} onClick={() => setLv1(t)} />
                ))}
              </div>
            </div>
            <FilterGroup title="企业背景" items={BACKGROUND} />
            <FilterGroup title="企业规模" items={SCALE} />
            <FilterGroup title="资质标签" items={TAGS} />
            <FilterGroup title="上市信息" items={LISTING} />
          </div>
        </Panel>

        <Panel
          title="绿色企业"
          actions={
            <div className="flex flex-wrap gap-2">
              <button className="rounded-md bg-brand-600 px-3 py-1 text-xs font-medium text-white hover:bg-brand-700">
                营销
              </button>
              <button className="rounded-md border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-brand-300">
                加入前3万条
              </button>
              <button className="rounded-md border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-brand-300">
                导出前30000条
              </button>
            </div>
          }
        >
          <div className="mb-3 text-sm text-slate-500">
            找到 <b className="text-ink-900">30,000</b> 条结果
          </div>
          <DataTable
            columns={[
              { key: 'name', label: '企业名称', width: '280px', fixed: 'left' },
              { key: 'link', label: '绿色产业环节', width: '280px' },
              { key: 'biz', label: '最新营销商机' },
              { key: 'region', label: '地区', width: '90px' },
              { key: 'reg', label: '注册资本', align: 'right', width: '130px' },
              { key: 'date', label: '成立日期', align: 'center', width: '110px' },
            ]}
            rows={RESULTS}
            pager
            pageSizeOptions={[10, 20]}
            exportable
            exportName="绿色企业"
          />
        </Panel>
      </div>
    </div>
  )
}
