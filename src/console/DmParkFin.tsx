import { useState } from 'react'
import { PageShell } from './PageShell'
import { Panel, DataTable, StatCard } from '../components/ui'
import { Sam } from './SourceTag'

type Tab = 'finance' | 'list'

const TABS: { key: Tab; label: string }[] = [
  { key: 'finance', label: '园区金融' },
  { key: 'list', label: '园区列表' },
]

const HOT_PARKS = [
  '深圳市高新技术产业园区',
  '中关村科技园区',
  '北京经济技术开发区',
  '广州高新技术产业开发区',
  '上海张江高新技术产业开发区',
]

const PARK_LIST = [
  { name: '中关村科技园区海淀园', company: '742,361', sub: '169', tech: '35,078', industry: '科技服务业、大文化、现代金融、IDC、影视、软件和信息技术服务、文创文旅、商务服务业、建筑业、超高清视听' },
  { name: '中国（北京）自由贸易试验区', company: '279,836', sub: '218', tech: '14,733', industry: '科技服务业、大文化、现代金融、文创文旅、批发和零售业、商务服务业、建筑业、超高清视听' },
  { name: '北京经济技术开发区', company: '264,016', sub: '192', tech: '13,963', industry: '科技服务业、大文化、文创文旅、批发和零售业、商务服务业、建筑业、超高清视听' },
  { name: '中国（北京）自由贸易试验区国际商务服务片区', company: '173,876', sub: '81', tech: '6,249', industry: '科技服务业、文创文旅、批发和零售业、商务服务业、建筑业、会展、超高清视听' },
  { name: '北京临空经济核心区', company: '102,736', sub: '77', tech: '3,406', industry: '科技服务业、文创文旅、批发和零售业、商务服务业、建筑业、会展、超高清视听' },
  { name: '未来科学城', company: '89,312', sub: '42', tech: '2,818', industry: '科技服务业、城市公共工程、批发和零售业、居民服务、商务服务业、建筑业、高端装备' },
  { name: '中关村科技园区电子城', company: '71,381', sub: '3,125', tech: '科技服务业、大文化、现代金融、短剧、影视、软件和信息技术服务、文创文旅、商务服务业、建筑业、超高清视听' },
  { name: '中关村科技园区亦庄园', company: '68,688', sub: '149', tech: '6,593', industry: '科技服务业、批发和零售业、医疗器械、商务服务业、专用设备制造、建筑业、高端装备、超高清视听' },
  { name: '中关村科技园区德胜园', company: '68,617', sub: '14', tech: '2,051', industry: '科技服务业、大文化、文创文旅、批发和零售业、商务服务业、建筑业、超高清视听' },
  { name: '中国（北京）自由贸易试验区科技创新片区', company: '55,063', sub: '38', tech: '3,758', industry: '科技服务业、大文化、现代金融、IDC、软件和信息技术服务、医疗器械、商务服务业、建筑业、高端装备、超高清视听' },
]

const PARK_NEWS = [
  { title: '各地密集施策 助力机器人产业精细化发展', tag: '国家级', type: '园区产业', time: '2026-08-17 09:23' },
  { title: '长春净月高新技术产业开发区人民法院悬赏公告', tag: '国家级', type: '园区产业', time: '2026-08-17 09:14' },
  { title: '不造机器人,却能让机器人"越用越聪明"', tag: '园区产业', type: '园区产业', time: '2026-08-17 07:55' },
  { title: '临沂北城新区发现古墓!', tag: '省级', type: '园区政策', time: '2026-08-16 20:17' },
  { title: '连续七年!南京江北新区这家企业蝉联行业十强', tag: '省级', type: '园区创新', time: '2026-08-16 17:59' },
  { title: '甘河工业园区:“问诊送诊” 为企业纾困解难', tag: '园区政策', type: '园区政策', time: '2026-08-16 10:57' },
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

export default function DmParkFin() {
  const [tab, setTab] = useState<Tab>('finance')
  return (
    <div style={{ padding: 24, maxWidth: 1360, margin: '0 auto' }}>
      <PageShell
        title="园区金融"
        crumb="数字营销 / 专题营销"
        subtitle="产业园区客群拓展：园区列表、开发区画像与商机线索"
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Toggle key={t.key} label={t.label} active={tab === t.key} onClick={() => setTab(t.key)} />
        ))}
      </div>

      {tab === 'finance' && (
        <>
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
            <input
              placeholder="搜索园区名称 或 搜重点产业、园区类型、企业名称"
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-300"
            />
            <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              搜索
            </button>
            <span className="text-xs text-slate-400">
              热门园区：{HOT_PARKS.slice(0, 3).join(' / ')} …
            </span>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="共收录园区" value="1,913" accent="brand" hint="家" />
            <StatCard label="园区内企业" value="3,150,115" accent="emerald" hint="家" />
            <StatCard label="国家级园区" value="17" accent="violet" hint="含高新技术产业开发区 9" />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Panel title="我关注的园区" desc={<Sam label="样例" value={0} />}>
              <p className="text-sm text-slate-400">暂无关注的园区，点击园区卡片上的「关注」可加入此处。</p>
            </Panel>
            <Panel title="存客所在园区" desc={<Sam label="样例" value={0} />}>
              <p className="text-sm text-slate-400">维护存客（0），查看全部分析以洞察存量客户园区分布。</p>
            </Panel>
          </div>

          <Panel title="园区动态" desc={<Sam label="样例动态" value={6} />}>
            <div className="divide-y divide-slate-100">
              {PARK_NEWS.map((n, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      n.tag === '国家级'
                        ? 'bg-rose-50 text-rose-600'
                        : n.tag === '省级'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {n.tag}
                  </span>
                  <span className="flex-1 truncate text-sm text-slate-700">{n.title}</span>
                  <span className="text-xs text-slate-400">{n.time}</span>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}

      {tab === 'list' && (
        <Panel
          title="北京市园区列表"
          desc={<Sam label="样例园区" value={1913} />}
          actions={<span className="text-xs text-slate-400">找到 1,913 家园区</span>}
        >
          <DataTable
            columns={[
              { key: 'name', label: '园区名称', width: '300px', fixed: 'left' },
              { key: 'company', label: '企业数', align: 'right' },
              { key: 'sub', label: '园中园', align: 'right' },
              { key: 'tech', label: '科创企业数', align: 'right' },
              { key: 'industry', label: '产业属性' },
            ]}
            rows={PARK_LIST}
            pager
            pageSizeOptions={[10, 20]}
            exportable
            exportName="园区列表"
          />
          <p className="mt-3 text-xs text-slate-400">
            点击园区可下钻「开发区详情 / 开发区画像分析 / 商机线索」—— 该重型数据页（单页可达 6MB）将在后续重型批处理中接入。
          </p>
        </Panel>
      )}
    </div>
  )
}
