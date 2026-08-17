import { useState } from 'react'
import { PageShell } from './PageShell'
import { Panel, DataTable } from '../components/ui'
import { Sam } from './SourceTag'

type Row = Record<string, unknown>

const toggleCls =
  'rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 transition hover:border-brand-300'

const OptGroup = ({
  label,
  options,
}: {
  label: string
  options: string[]
}) => {
  const [active, setActive] = useState<string[]>([])
  const toggle = (o: string) =>
    setActive((prev) =>
      prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]
    )
  return (
    <div>
      <div className="mb-2 text-xs font-medium text-ink-900">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            className={toggleCls}
            style={
              active.includes(o)
                ? { borderColor: '#6366f1', color: '#4338ca' }
                : undefined
            }
            onClick={() => toggle(o)}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function DmMapProspect() {
  const columns = [
    { key: 'name', label: '企业名称', fixed: 'left' as const },
    {
      key: 'near',
      label: '最近中心距离',
      align: 'right' as const,
      render: (row: Row) => (row.near as string),
    },
    {
      key: 'far',
      label: '最远中心距离',
      align: 'right' as const,
      render: (row: Row) => (row.far as string),
    },
    {
      key: 'mk',
      label: '营销',
      align: 'center' as const,
      render: (row: Row) => (row.mk as string),
    },
    {
      key: 'fav',
      label: '关注',
      align: 'center' as const,
      render: (row: Row) => (row.fav as string),
    },
  ]

  const rows: Row[] = [
    {
      name: '上海合合信息科技股份有限公司',
      near: '0.3km',
      far: '1.2km',
      mk: '可营销',
      fav: '已关注',
    },
    {
      name: '上海协度电子科技有限公司',
      near: '0.8km',
      far: '2.1km',
      mk: '可营销',
      fav: '未关注',
    },
    {
      name: '泰克科技(中国)有限公司',
      near: '1.5km',
      far: '3.4km',
      mk: '可营销',
      fav: '未关注',
    },
    {
      name: '晨星半导体股份有限公司',
      near: '2.2km',
      far: '4.0km',
      mk: '待补充',
      fav: '已关注',
    },
    {
      name: '上海瀚讯信息技术股份有限公司',
      near: '2.6km',
      far: '4.3km',
      mk: '可营销',
      fav: '未关注',
    },
    {
      name: '上海智臻智能网络科技股份有限公司',
      near: '3.1km',
      far: '4.7km',
      mk: '可营销',
      fav: '未关注',
    },
    {
      name: '上海微创软件股份有限公司',
      near: '3.8km',
      far: '4.9km',
      mk: '待补充',
      fav: '未关注',
    },
  ]

  return (
    <div style={{ padding: 24, maxWidth: 1360, margin: '0 auto' }}>
      <PageShell
        title="地图拓客"
        crumb="数字营销 / 潜客挖掘"
        subtitle="基于地图的地理化拓客：圈选区域、周边企业批量获取与画像"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* 左栏：筛选条件 */}
        <Panel title="筛选条件" desc={<span className="text-xs text-slate-500">圈选中心与多维过滤条件</span>}>
          <div className="flex flex-col gap-5">
            <OptGroup
              label="成立时间"
              options={[
                '过去30天',
                '成立1年内',
                '成立1-5年',
                '成立5-10年',
                '成立10-15年',
                '成立15年以上',
              ]}
            />
            <OptGroup
              label="所在行业"
              options={[
                '农、林、牧、渔业',
                '采矿业',
                '制造业',
                '电力、热力、燃气及水生产和供应业',
                '建筑业',
                '批发和零售业',
                '交通运输、仓储和邮政业',
                '住宿和餐饮业',
                '信息传输、软件和信息技术服务业',
                '金融业',
                '房地产业',
                '租赁和商务服务业',
                '科学研究和技术服务业',
                '水利、环境和公共设施管理业',
                '居民服务、修理和其他服务业',
                '教育',
                '卫生和社会工作',
                '文化、体育和娱乐业',
                '公共管理、社会保障和社会组织',
                '国际组织',
              ]}
            />
            <OptGroup
              label="注册资本"
              options={[
                '0万 - 100万',
                '100万 - 200万',
                '200万 - 500万',
                '500万 - 1000万',
                '1000万以上',
              ]}
            />
            <OptGroup
              label="经营状态"
              options={[
                '存续',
                '注销',
                '吊销',
                '撤销',
                '迁出',
                '设立中',
                '清算中',
                '停业',
                '其他',
              ]}
            />
            <OptGroup
              label="启信分"
              options={[
                '200 - 400分',
                '401 - 500分',
                '501 - 600分',
                '601 - 700分',
                '700分以上',
              ]}
            />
            <OptGroup
              label="企业规模"
              options={[
                '小微企业',
                '中型企业',
                '大型企业',
                '规模以上企业',
                '规模以上服务业企业',
                '规模以上工业企业',
              ]}
            />
            <OptGroup
              label="资质标签"
              options={[
                '牛羚企业',
                '雏鹰企业',
                '隐形冠军',
                '高新企业',
                '科技型中小企业',
                '专精特新企业',
                '科技小巨人企业',
                '创新型中小企业',
                '专精特新小巨人',
                '科技型企业',
              ]}
            />
            <OptGroup
              label="企业类型"
              options={[
                '国有企业',
                '有限责任公司',
                '股份有限公司',
                '私营企业',
                '港、澳、台商投资企业',
                '外商投资企业',
                '个体工商户',
              ]}
            />
            <OptGroup
              label="上市信息"
              options={[
                'A股上市',
                '新三板',
                '上交所',
                '深交所',
                '科创板',
                '创业版',
                '中概股',
              ]}
            />
            <OptGroup
              label="参保人数"
              options={[
                '少于50人',
                '50-99人',
                '100-499人',
                '500-999人',
                '1000-4999人',
                '5000-9999人',
                '多于10000人',
              ]}
            />
            <OptGroup
              label="手机号码"
              options={['有手机号码', '无手机号码']}
            />
            <OptGroup
              label="座机号码"
              options={['有座机号码', '无座机号码']}
            />
            <OptGroup
              label="空号过滤"
              options={['正常号码', '不可用或无号码']}
            />
            <OptGroup
              label="进出口信息"
              options={['有进出口信息', '无进出口信息']}
            />
            <OptGroup
              label="距离范围"
              options={[
                '范围：1km',
                '范围：2km',
                '范围：3km',
                '范围：4km',
                '范围：5km',
              ]}
            />

            <div className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">已选</span>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                  上海
                </span>
              </div>
              <div className="mt-1.5 text-sm text-ink-900">
                找到 <span className="font-semibold">16,883</span> 条相关结果
              </div>
              <div className="mt-2 text-xs text-slate-500">
                圈选中心：<span className="text-ink-900">上海</span>
                （上海合合信息科技股份有限公司）
              </div>
            </div>
          </div>
        </Panel>

        {/* 右栏：地图 + 企业表 */}
        <div className="flex flex-col gap-6">
          {/* 装饰地图 */}
          <div
            className="relative h-80 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden"
            style={{
              backgroundImage:
                'linear-gradient(#e2e8f0 1px,transparent 1px),linear-gradient(90deg,#e2e8f0 1px,transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          >
            {/* 中心 pin */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-brand-500 px-3 py-1 text-xs font-medium text-white shadow-md">
                  上海（中心）
                </div>
                <div className="mt-1 h-3 w-3 -translate-x-0.5 rotate-45 bg-brand-500" />
              </div>
            </div>
            {/* 卫星点 */}
            <div className="absolute left-[38%] top-[30%]">
              <div className="flex flex-col items-center">
                <div className="rounded-full border border-brand-300 bg-white px-2 py-0.5 text-xs text-ink-900 shadow-sm">
                  合合信息
                </div>
              </div>
            </div>
            <div className="absolute left-[64%] top-[44%]">
              <div className="flex flex-col items-center">
                <div className="rounded-full border border-brand-300 bg-white px-2 py-0.5 text-xs text-ink-900 shadow-sm">
                  协度电子
                </div>
              </div>
            </div>
            <div className="absolute left-[52%] top-[66%]">
              <div className="flex flex-col items-center">
                <div className="rounded-full border border-brand-300 bg-white px-2 py-0.5 text-xs text-ink-900 shadow-sm">
                  泰克科技
                </div>
              </div>
            </div>
            <div className="absolute bottom-2 right-2 rounded bg-white/80 px-2 py-1 text-[11px] text-slate-500">
              地图为示意图，真实环境为地理底图（高德/百度）
            </div>
          </div>

          {/* 图上企业 */}
          <Panel
            title="图上企业"
            desc={
              <span className="flex flex-wrap items-center gap-2">
                <Sam label="图上企业" value="16883" />
                <span className="text-xs text-slate-500">
                  圈选中心：上海 · 共 16,883 家企业
                </span>
              </span>
            }
          >
            <DataTable
              columns={columns}
              rows={rows}
              pager
              pageSizeOptions={[10, 20]}
              exportable
              exportName="图上企业"
            />
          </Panel>
        </div>
      </div>
    </div>
  )
}
