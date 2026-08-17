import { useState } from 'react'
import { PageShell } from './PageShell'
import { Panel, DataTable } from '../components/ui'
import { Sam } from './SourceTag'

const TABS = [
  '乡村振兴营销场景',
  '农业经营主体',
  '乡村振兴产业',
  '乡村振兴项目',
  '农业科技振兴',
  '乡村振兴主题客群',
  '乡村振兴农业产业集群',
]

const SCENARIOS = [
  { name: '农业经营主体', desc: '十数种农村经营主体名录' },
  { name: '乡村振兴产业', desc: '乡村振兴产业企业名录' },
  { name: '乡村振兴项目', desc: '三农相关项目商机数据' },
  { name: '农业科技振兴', desc: '农业领域有科研能力的企业' },
  { name: '乡村振兴主题客群', desc: '权威主题认证企业名录' },
  { name: '乡村振兴农业产业集群', desc: '三农产品集群分布大数据' },
]

const POLICIES = [
  { id: 'p1', title: '乡村建设行动实施方案', date: '2022-05-23' },
  { id: 'p2', title: '中共中央国务院关于做好2022年全面推进乡村振兴重点工作的意见', date: '2022-02-22' },
  { id: 'p3', title: '“十四五”全国种植业发展规划', date: '2021-12-29' },
  { id: 'p4', title: '“十四五”全国农业绿色发展规划', date: '2021-09-09' },
  { id: 'p5', title: '关于金融支持巩固拓展脱贫攻坚成果全面推进乡村振兴的意见', date: '2021-07-01' },
  { id: 'p6', title: '人民银行等7部门启动金融科技赋能乡村振兴示范工程', date: '2021-04-29' },
  { id: 'p7', title: '中华人民共和国乡村振兴促进法', date: '2021-04-16' },
  { id: 'p8', title: '乡村振兴战略规划实施报告（2020年）', date: '2020-06-15' },
]

const NEWS = [
  '青浦这个乡村振兴样本藏着什么“长红”密码?',
  '智慧农业2026年半年度董事会圆满召开',
  '【盛京银行及三农信融】低息诱导强制搭售高额担保费，提前结清后仍拒绝退还剩余担保费',
  '小摩警示明年或现全球粮食危机，神农种业等多股涨停',
  '泰兴农商银行零售业务稳步增长',
  '国网吕梁供电汾阳公司：电力护航采摘园贴心服务赋能乡村振兴',
  '浙江台风暴雨洪水对长兴农家乐和中国童装之都织里的影响',
]

const SAMPLE = [
  { id: 's1', name: '北大荒农垦集团有限公司', region: '黑龙江', tag: '农业经营主体', scale: '大型' },
  { id: 's2', name: '新希望六和股份有限公司', region: '四川', tag: '乡村振兴产业', scale: '大型' },
  { id: 's3', name: '袁隆平农业高科技股份有限公司', region: '湖南', tag: '农业科技振兴', scale: '中型' },
  { id: 's4', name: '牧原食品股份有限公司', region: '河南', tag: '乡村振兴产业', scale: '大型' },
  { id: 's5', name: '江苏农垦农业发展股份有限公司', region: '江苏', tag: '农业经营主体', scale: '中型' },
]

export default function DmRuralRevive() {
  const [tab, setTab] = useState(TABS[0])
  return (
    <div style={{ padding: 24, maxWidth: 1360, margin: '0 auto' }}>
      <PageShell title="乡村振兴" crumb="数字营销 / 专题营销" subtitle="乡村振兴客群：涉农企业、新型农业经营主体与惠农金融" />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              tab === t ? 'bg-emerald-600 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === '乡村振兴营销场景' ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SCENARIOS.map((s) => (
              <div key={s.name} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
                <h4 className="text-base font-semibold text-slate-900">{s.name}</h4>
                <p className="mt-1.5 text-sm text-slate-500">{s.desc}</p>
                <button className="mt-3 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100">
                  进入客群 →
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Panel
              title="政策文件"
              desc={<Sam label="样例政策" value={`${POLICIES.length}`} />}
              actions={<span className="text-xs text-slate-400">权威发布 · 持续更新</span>}
            >
              <ul className="space-y-2.5">
                {POLICIES.map((p) => (
                  <li key={p.id} className="flex items-start justify-between gap-3 border-b border-slate-50 pb-2.5 last:border-0">
                    <span className="text-sm text-slate-700">{p.title}</span>
                    <span className="shrink-0 text-xs tabular-nums text-slate-400">{p.date}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel
              title="新闻舆情"
              desc={<Sam label="样例新闻" value={`${NEWS.length}`} />}
              actions={<span className="text-xs text-slate-400">乡村振兴相关动态</span>}
            >
              <ul className="space-y-2.5">
                {NEWS.map((n, i) => (
                  <li key={i} className="flex items-start gap-2 border-b border-slate-50 pb-2.5 last:border-0">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    <span className="text-sm text-slate-700">{n}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </>
      ) : (
        <Panel
          title={tab}
          desc={<Sam label="样例名录" value={`${SAMPLE.length}`} />}
          actions={<span className="text-xs text-slate-400">点击企业可查看档案</span>}
        >
          <DataTable
            columns={[
              { key: 'name', label: '企业名称', width: '280px', fixed: 'left' },
              { key: 'region', label: '所属地区' },
              { key: 'tag', label: '客群标签' },
              { key: 'scale', label: '规模' },
            ]}
            rows={SAMPLE}
            pager
          />
        </Panel>
      )}
    </div>
  )
}
