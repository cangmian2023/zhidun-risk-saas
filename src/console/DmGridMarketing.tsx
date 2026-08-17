import { PageShell } from './PageShell'
import { Panel, StatCard, DataTable } from '../components/ui'
import { Sam } from './SourceTag'

const STATS = [
  { label: '新增企业', value: '2,239', accent: 'emerald' as const, hint: '近 30 天' },
  { label: '园区', value: '134', accent: 'brand' as const, hint: '责任片区内' },
  { label: '协会', value: '48', accent: 'violet' as const, hint: '行业协会' },
  { label: '新商机', value: '176,183', accent: 'cyan' as const, hint: '待跟进' },
  { label: '企业', value: '628,484', accent: 'amber' as const, hint: '片区总量' },
]

const REGIONS = [
  { id: 'g1', region: '天河片区', manager: '陈晓', enterprise: 48213, added: 312, biz: 12840, status: '正常' },
  { id: 'g2', region: '黄埔片区', manager: '李航', enterprise: 39650, added: 268, biz: 11032, status: '正常' },
  { id: 'g3', region: '越秀片区', manager: '王敏', enterprise: 31028, added: 201, biz: 9640, status: '正常' },
  { id: 'g4', region: '番禺片区', manager: '赵磊', enterprise: 27541, added: 178, biz: 8310, status: '预警' },
  { id: 'g5', region: '南沙片区', manager: '孙倩', enterprise: 24117, added: 156, biz: 7625, status: '正常' },
]

export default function DmGridMarketing() {
  return (
    <div style={{ padding: 24, maxWidth: 1360, margin: '0 auto' }}>
      <PageShell
        title="网格营销"
        crumb="数字营销 / 潜客挖掘"
        subtitle="网格化责任片区管理：片区客户分布、商机跟进与业绩看板"
      />

      <div className="mb-2 text-xs text-slate-400">
        当前位置：<span className="font-medium text-slate-600">广州粤信科技有限公司</span>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {STATS.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} accent={s.accent} hint={s.hint} />
        ))}
      </div>

      <div className="mt-6">
        <Panel
          title="网格责任片区"
          desc={<Sam label="样例片区" value={`${REGIONS.length}`} />}
          actions={<span className="text-xs text-slate-400">责任到人 · 商机到人</span>}
        >
          <DataTable
            columns={[
              { key: 'region', label: '责任片区', width: '160px', fixed: 'left' },
              { key: 'manager', label: '网格员' },
              { key: 'enterprise', label: '企业总量', type: 'num', align: 'right' },
              { key: 'added', label: '本月新增', type: 'num', align: 'right' },
              { key: 'biz', label: '在途商机', type: 'num', align: 'right' },
              {
                key: 'status',
                label: '片区状态',
                render: (r) =>
                  (r.status as string) === '预警' ? (
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-600">预警</span>
                  ) : (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">正常</span>
                  ),
              },
            ]}
            rows={REGIONS}
            pager
            pageSizeOptions={[5, 10]}
          />
        </Panel>
      </div>
    </div>
  )
}
