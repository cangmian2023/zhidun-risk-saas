import { useState } from 'react'
import { PageShell } from './PageShell'
import { Panel, DataTable } from '../components/ui'
import { Sam } from './SourceTag'

const TABS = ['关注', '央企', '国企', '民营', '外资', '机构', '实际控制人']

const GROUPS: Record<string, { id: string; name: string; controller: string; assets: string; region: string }[]> = {
  央企: [
    { id: 'c1', name: '中国移动通信集团有限公司', controller: '国务院国资委', assets: '1.8万亿', region: '北京' },
    { id: 'c2', name: '国家电网有限公司', controller: '国务院国资委', assets: '4.2万亿', region: '北京' },
    { id: 'c3', name: '中国石油化工集团有限公司', controller: '国务院国资委', assets: '2.3万亿', region: '北京' },
    { id: 'c4', name: '中国化工集团有限公司', controller: '国务院国资委', assets: '1.1万亿', region: '北京' },
  ],
  国企: [
    { id: 'g1', name: '广州开发区交通投资集团有限公司', controller: '广州开发区管委会', assets: '860亿', region: '广东' },
    { id: 'g2', name: '成都高新投资集团有限公司', controller: '成都高新区管委会', assets: '1200亿', region: '四川' },
    { id: 'g3', name: '青岛西海岸新区融合控股集团有限公司', controller: '青岛西海岸新区', assets: '950亿', region: '山东' },
    { id: 'g4', name: '绍兴市上虞杭州湾经开区控股集团有限公司', controller: '上虞区国资委', assets: '620亿', region: '浙江' },
  ],
  民营: [
    { id: 'm1', name: '华为投资控股有限公司', controller: '任正非及工会', assets: '9000亿', region: '广东' },
    { id: 'm2', name: '腾讯控股有限公司', controller: '马化腾及一致行动人', assets: '1.5万亿', region: '广东' },
    { id: 'm3', name: '阿里巴巴集团', controller: '马云及一致行动人', assets: '1.3万亿', region: '浙江' },
    { id: 'm4', name: '京东集团', controller: '刘强东', assets: '5000亿', region: '北京' },
  ],
  外资: [
    { id: 'f1', name: '西门子（中国）有限公司', controller: 'Siemens AG', assets: '1200亿', region: '北京' },
    { id: 'f2', name: '大众汽车（中国）投资有限公司', controller: 'Volkswagen AG', assets: '2000亿', region: '北京' },
    { id: 'f3', name: '三星（中国）投资有限公司', controller: 'Samsung Electronics', assets: '1500亿', region: '北京' },
  ],
  机构: [
    { id: 'i1', name: '全国社会保障基金理事会', controller: '国务院', assets: '2.9万亿', region: '北京' },
    { id: 'i2', name: '中国投资有限责任公司', controller: '国务院', assets: '1.4万亿', region: '北京' },
    { id: 'i3', name: '国家开发投资集团有限公司', controller: '国务院国资委', assets: '7000亿', region: '北京' },
  ],
}

const CONTROLLERS = [
  { id: 'k1', group: '中国移动通信集团有限公司', person: '国务院国资委', type: '国有控股', ratio: '100%' },
  { id: 'k2', group: '华为投资控股有限公司', person: '任正非', type: '自然人', ratio: '0.75%' },
  { id: 'k3', group: '腾讯控股有限公司', person: '马化腾', type: '自然人', ratio: '8.39%' },
]

// 集团下钻：成员企业（样例，取自「集团户 - 详情」快照：主体企业 南京沃德凯斯投资资产管理集团，全部企业 57,349）
const MEMBERS = [
  { id: 'mb1', name: '江苏鑫弘合新能源开发溧阳有限公司', level: '2级', industry: '研究和试验发展', region: '江苏常州溧阳', ratio: '60.00%', reg: '10,000万元人民币', found: '2018-08-21' },
  { id: 'mb2', name: '南京金铭文化艺术品投资合伙企业（有限合伙）', level: '—', industry: '商务服务业', region: '江苏南京鼓楼', ratio: '11.40%', reg: '422.2223万元人民币', found: '2016-10-14' },
  { id: 'mb3', name: '南京千钰文化艺术品投资合伙企业（有限合伙）', level: '—', industry: '商务服务业', region: '江苏南京鼓楼', ratio: '11.14%', reg: '400万元人民币', found: '2016-09-06' },
  { id: 'mb4', name: '南京华梦文化艺术品投资合伙企业（有限合伙）', level: '—', industry: '商务服务业', region: '江苏南京鼓楼', ratio: '—', reg: '333.3334万元人民币', found: '2016-07-25' },
  { id: 'mb5', name: '南京帝古文化艺术品投资合伙企业（有限合伙）', level: '—', industry: '商务服务业', region: '江苏南京鼓楼', ratio: '—', reg: '311.1111万元人民币', found: '2016-08-18' },
  { id: 'mb6', name: '上海弘顺益文化工作室', level: '1级', industry: '资本市场服务', region: '上海松江', ratio: '100.00%', reg: '50万元人民币', found: '2018-10-22' },
  { id: 'mb7', name: '南京永玺文化艺术品投资合伙企业（有限合伙）', level: '—', industry: '商务服务业', region: '江苏南京鼓楼', ratio: '—', reg: '245万元人民币', found: '2016-07-27' },
  { id: 'mb8', name: '南京金铭四一六七号文化艺术品投资合伙企业（有限合伙）', level: '—', industry: '商务服务业', region: '江苏南京鼓楼', ratio: '6.00%', reg: '211.1111万元人民币', found: '2016-10-09' },
]

export default function DmGroupAccount() {
  const [tab, setTab] = useState(TABS[1])
  const [selGroup, setSelGroup] = useState<string | null>(null)
  const data = GROUPS[tab]
  return (
    <div style={{ padding: 24, maxWidth: 1360, margin: '0 auto' }}>
      <PageShell title="集团户" crumb="数字营销 / 潜客挖掘" subtitle="集团客户管理：国企/央企/民营/外资/机构集团及实际控制人视图" />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              tab === t ? 'bg-brand-600 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === '关注' ? (
        <Panel title="我关注的集团">
          <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10z" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-600">暂未关注集团</p>
            <p className="mt-1 text-xs text-slate-400">去关注集团，了解更多集团信息</p>
          </div>
        </Panel>
      ) : tab === '实际控制人' ? (
        <Panel title="实际控制人" desc={<Sam label="样例" value={`${CONTROLLERS.length}`} />}>
          <DataTable
            columns={[
              { key: 'group', label: '集团名称', width: '300px', fixed: 'left' },
              { key: 'person', label: '实际控制人' },
              { key: 'type', label: '控制类型' },
              { key: 'ratio', label: '控制比例', align: 'right' },
            ]}
            rows={CONTROLLERS}
            pager
          />
        </Panel>
      ) : (
        <Panel title={`${tab}集团`} desc={<Sam label="样例集团" value={`${data?.length ?? 0}`} />} actions={<span className="text-xs text-slate-400">点击集团可查看详情</span>}>
          <DataTable
            columns={[
              { key: 'name', label: '集团名称', width: '300px', fixed: 'left' },
              { key: 'controller', label: '实际控制人' },
              { key: 'assets', label: '资产规模', align: 'right' },
              { key: 'region', label: '注册地' },
              {
                key: 'op',
                label: '操作',
                render: (r) => (
                  <button
                    onClick={() => setSelGroup(r.name as string)}
                    className="cursor-pointer text-brand-600 hover:underline"
                  >
                    查看
                  </button>
                ),
              },
            ]}
            rows={data ?? []}
            pager
          />
        </Panel>
      )}

      {selGroup && (
        <Panel
          title={`集团详情 · ${selGroup}`}
          desc={<Sam label="成员企业" value={`${MEMBERS.length}`} />}
          actions={<button onClick={() => setSelGroup(null)} className="text-xs text-slate-400 hover:text-slate-600">收起</button>}
        >
          <div className="mb-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">主体企业：{selGroup}</span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">全部企业（57,349）</span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">核心企业（0）</span>
          </div>
          <DataTable
            columns={[
              { key: 'name', label: '公司名称', width: '320px', fixed: 'left' },
              { key: 'level', label: '成员级别(实控人)' },
              { key: 'industry', label: '行业' },
              { key: 'region', label: '地区' },
              { key: 'ratio', label: '实控人控股比例', align: 'right' },
              { key: 'reg', label: '注册资本', align: 'right' },
              { key: 'found', label: '成立时间', type: 'date' },
            ]}
            rows={MEMBERS}
            pager
            pageSizeOptions={[10, 20]}
          />
        </Panel>
      )}
    </div>
  )
}
