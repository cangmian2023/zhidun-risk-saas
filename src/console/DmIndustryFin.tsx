import { useState } from 'react'
import { PageShell } from './PageShell'
import { Panel, DataTable, StatCard } from '../components/ui'
import { Sam } from './SourceTag'

type Tab = 'strategic' | 'chain' | 'region' | 'deposit'

const TABS: { key: Tab; label: string }[] = [
  { key: 'strategic', label: '战略新兴产业' },
  { key: 'chain', label: '产业链专题' },
  { key: 'region', label: '银行机构区域产业分析' },
  { key: 'deposit', label: '产业存客分布' },
]

const PROVINCES = [
  '北京市', '天津市', '河北省', '山西省', '内蒙古自治区', '辽宁省', '吉林省', '黑龙江省',
  '上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '河南省',
  '湖北省', '湖南省', '广东省', '广西壮族自治区', '海南省', '重庆市', '四川省', '贵州省',
  '云南省', '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区',
]

const INDUSTRIES = [
  { name: '新一代信息技术', chain: '卫星', onChain: '4,799', key: '286' },
  { name: '新一代信息技术', chain: '网络安全', onChain: '42,755', key: '1,096' },
  { name: '绿色能源与节能环保', chain: '氢能', onChain: '213', key: '28' },
  { name: '医药健康', chain: '生物医药', onChain: '27,285', key: '172' },
  { name: '智能网联汽车', chain: '智能网联汽车', onChain: '3,012', key: '278' },
  { name: '绿色能源与节能环保', chain: '风电', onChain: '1,133', key: '96' },
  { name: '集成电路', chain: '集成电路', onChain: '1,298', key: '119' },
  { name: '信息内容消费', chain: '游戏', onChain: '6,493', key: '380' },
  { name: '新一代信息技术', chain: '人工智能', onChain: '22,143', key: '1,012' },
  { name: '绿色能源与节能环保', chain: '储能', onChain: '20,595', key: '388' },
  { name: '绿色能源与节能环保', chain: '光伏', onChain: '4,142', key: '183' },
  { name: '新一代信息技术', chain: '信息技术应用创新', onChain: '16,069', key: '948' },
  { name: '区块链与先进计算', chain: '区块链', onChain: '2,309', key: '187' },
  { name: '智能制造与装备', chain: '高端装备', onChain: '34,443', key: '989' },
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

export default function DmIndustryFin() {
  const [tab, setTab] = useState<Tab>('strategic')
  const [region, setRegion] = useState('全国')
  const [view, setView] = useState<'card' | 'table'>('card')
  return (
    <div style={{ padding: 24, maxWidth: 1360, margin: '0 auto' }}>
      <PageShell
        title="产业金融"
        crumb="数字营销 / 专题营销"
        subtitle="聚焦重点产业的链式营销与客群洞察：战新产业、产业链专题、区域产业分析与存客分布"
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Toggle key={t.key} label={t.label} active={tab === t.key} onClick={() => setTab(t.key)} />
        ))}
      </div>

      {tab === 'strategic' && (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2">
            <span className="text-xs text-slate-500">选择地区</span>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
            >
              {PROVINCES.map((p) => <option key={p}>{p}</option>)}
            </select>
            <span className="ml-2 text-xs text-slate-400">产业类型：战略性新兴产业 / 重点（支柱）产业 / 未来产业</span>
            <span className="ml-auto text-xs text-slate-400">
              当前共 <b className="text-ink-900">14</b> 个产业 ·{' '}
              <b className="text-brand-600">186,689</b> 家上链企业 ·{' '}
              <b className="text-brand-600">6,162</b> 家重点企业
            </span>
          </div>

          <div className="mb-4 flex gap-2">
            <Toggle label="卡片" active={view === 'card'} onClick={() => setView('card')} />
            <Toggle label="表格" active={view === 'table'} onClick={() => setView('table')} />
            <Toggle label="地图" />
          </div>

          {view === 'card' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {INDUSTRIES.map((it, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-300">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-ink-900">{it.name}</span>
                    <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-medium text-cyan-700">
                      匹配：{it.chain}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-4">
                    <div>
                      <p className="text-xs text-slate-400">上链企业</p>
                      <p className="text-lg font-semibold text-brand-600">{it.onChain}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">重点企业</p>
                      <p className="text-lg font-semibold text-ink-900">{it.key}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Panel title="重点产业规划" desc={<Sam label="样例产业" value={14} />}>
              <DataTable
                columns={[
                  { key: 'name', label: '产业名称', width: '240px', fixed: 'left' },
                  { key: 'chain', label: '匹配产业链' },
                  { key: 'onChain', label: '上链企业', align: 'right' },
                  { key: 'key', label: '重点企业', align: 'right' },
                ]}
                rows={INDUSTRIES}
                pager
                pageSizeOptions={[10, 20]}
                exportable
                exportName="重点产业规划"
              />
            </Panel>
          )}
        </>
      )}

      {tab === 'chain' && (
        <Panel title="产业链专题" desc={<Sam label="样例产业链" value={14} />}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRIES.map((it, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
                <span className="text-base font-semibold text-ink-900">{it.chain}</span>
                <p className="mt-1 text-xs text-slate-400">所属产业：{it.name}</p>
                <p className="mt-2 text-sm text-slate-600">
                  上链企业 <b className="text-brand-600">{it.onChain}</b> · 重点企业{' '}
                  <b className="text-ink-900">{it.key}</b>
                </p>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {tab === 'region' && (
        <Panel title="银行机构区域产业分析" desc={<Sam label="样例指标" value={186689} />}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="上链企业" value="186,689" accent="brand" hint="全国战新产业" />
            <StatCard label="重点企业" value="6,162" accent="emerald" hint="重点（支柱）产业" />
            <StatCard label="覆盖产业" value="14" accent="violet" hint="当前可分析产业数" />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            选择地区（北京 / 上海 / 广东 / 江苏 …）与产业类型，分析区域内产业链上链企业与重点企业分布，辅助银行机构区域产业布局。
          </p>
        </Panel>
      )}

      {tab === 'deposit' && (
        <Panel title="产业存客分布" desc={<Sam label="样例存客" value={6162} />}>
          <p className="text-sm text-slate-500">
            按产业维度展示存量客户的分布与渗透情况，识别重点产业中的交叉销售与向上销售机会。
          </p>
          <DataTable
            columns={[
              { key: 'name', label: '产业名称', width: '240px', fixed: 'left' },
              { key: 'chain', label: '匹配产业链' },
              { key: 'onChain', label: '上链企业', align: 'right' },
              { key: 'key', label: '重点企业', align: 'right' },
            ]}
            rows={INDUSTRIES}
            pager
            pageSizeOptions={[10, 20]}
          />
        </Panel>
      )}
    </div>
  )
}
