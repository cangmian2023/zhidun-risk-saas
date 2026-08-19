import React, { useMemo, useState } from 'react';
import { PageShell } from './PageShell';
import { Badge, Button, Panel, StatCard } from '../components/ui';

/* 招投标 · 原生重写版（demo）
 * 与快照注入版（Shadow DOM）不同：本版为纯 React + Tailwind 组件，样式归 SaaS 设计体系管理，
 * 不加载 record/qixin 任何文件、不注入外部 HTML/CSS。数据为硬编码样例（仅用于验证样式/交互手感）。
 * 保留原结构：4 个主 tab（我的标讯 / 全部标讯 / 中标企业库 / 产品词库）+ 搜索 + 筛选 + 卡片列表。
 */

const TABS = [
  { key: 'my', label: '我的标讯' },
  { key: 'all', label: '全部标讯' },
  { key: 'company', label: '中标企业库' },
  { key: 'product', label: '产品词库' },
] as const;
type TabKey = (typeof TABS)[number]['key'];

/* ---------------- 样例数据 ---------------- */
type Tender = {
  id: string; title: string; type: '招标公告' | '中标公告' | '拟建公告';
  region: string; industry: string; hasContact: boolean; time: string;
  projectNo: string; contact: string; tenderer: string; winner: string;
  agent: string; candidate: string; bidder: string; mentioned: string; product: string; body: string;
};
const TENDERS: Tender[] = [
  { id: 't1', title: '科研处运输保险服务（天津站）采购项目', type: '招标公告', region: '北京市朝阳区', industry: '服务采购', hasContact: true, time: '2026-08-18 15小时前获取', projectNo: 'F26355', contact: '1个', tenderer: '中央美术学院', winner: '国创互联(北京)国际物流有限公司', agent: '-', candidate: '-', bidder: '-', mentioned: '-', product: '科研处运输保险服务', body: '科研处运输保险服务(天津站)采购项目成交公告。公告日期：2026年08月17日。采购单位：中央美术学院科研处运输保险服务(天津站)采购项目，项目编号 F26355，成交供应商为国创互联(北京)国际物流有限公司。' },
  { id: 't2', title: '某高校实验室设备采购项目', type: '中标公告', region: '北京市海淀区', industry: '信息通信', hasContact: true, time: '2026-08-18 3小时前获取', projectNo: 'H8821', contact: '2个', tenderer: '清华大学', winner: '北京同方计算机有限公司', agent: '中招国际招标有限公司', candidate: '联想(北京)有限公司', bidder: '3家', mentioned: '1家', product: '高性能计算服务器', body: '清华大学实验室设备采购项目于2026年08月16日完成评标，北京同方计算机有限公司为成交供应商，中标金额 486.00 万元。' },
  { id: 't3', title: '城市道路照明改造提升工程', type: '招标公告', region: '上海市浦东新区', industry: '市政公用', hasContact: true, time: '2026-08-17 昨天获取', projectNo: 'PD-2026-0912', contact: '1个', tenderer: '上海市浦东新区市政工程管理局', winner: '-', agent: '上海上咨建设工程咨询有限公司', candidate: '-', bidder: '-', mentioned: '-', product: 'LED 路灯及控制系统', body: '浦东新区城市道路照明改造提升工程招标，涉及 12 条主干道 LED 路灯更换及智能控制系统建设，预算金额 2,350 万元。' },
  { id: 't4', title: '医院门诊楼智能化系统采购', type: '中标公告', region: '广州市天河区', industry: '弱电安防', hasContact: true, time: '2026-08-17 昨天获取', projectNo: 'TH-2026-0331', contact: '3个', tenderer: '中山大学附属第一医院', winner: '华为技术有限公司', agent: '国义招标股份有限公司', candidate: '新华三技术有限公司', bidder: '5家', mentioned: '2家', product: '安防监控及门禁系统', body: '中山大学附属第一医院门诊楼智能化系统采购项目成交，华为技术有限公司中标，中标金额 1,278.60 万元。' },
  { id: 't5', title: '乡村振兴饮水安全巩固提升工程', type: '招标公告', region: '四川省凉山州', industry: '水利水电', hasContact: false, time: '2026-08-16 2天前获取', projectNo: 'LS-2026-0455', contact: '0个', tenderer: '凉山州水务局', winner: '-', agent: '-', candidate: '-', bidder: '-', mentioned: '-', product: '供水管网及蓄水池', body: '凉山州乡村振兴饮水安全巩固提升工程，覆盖 18 个行政村供水管网及蓄水池建设，预算金额 4,120 万元。' },
  { id: 't6', title: '新能源汽车充电桩建设一期项目', type: '中标公告', region: '江苏省苏州市', industry: '能源化工', hasContact: true, time: '2026-08-16 2天前获取', projectNo: 'SZ-2026-0718', contact: '2个', tenderer: '苏州交通投资集团', winner: '特来电新能源股份有限公司', agent: '江苏海外集团国际工程咨询有限公司', candidate: '星星充电', bidder: '4家', mentioned: '1家', product: '直流充电桩及运营平台', body: '苏州市新能源汽车充电桩建设一期项目成交，特来电新能源股份有限公司中标，建设 320 个直流快充桩及运营平台。' },
];

type Company = { id: string; name: string; region: string; industry: string; bg: string; scale: string; certs: string[]; insured: string };
const COMPANIES: Company[] = [
  { id: 'c1', name: '国创互联(北京)国际物流有限公司', region: '北京市', industry: '交通运输、仓储和邮政业', bg: '民营企业', scale: '大型企业', certs: ['高新企业'], insured: '320人' },
  { id: 'c2', name: '北京同方计算机有限公司', region: '北京市', industry: '制造业', bg: '国有企业', scale: '大型企业', certs: ['专精特新小巨人', '高新企业'], insured: '1,200人' },
  { id: 'c3', name: '华为技术有限公司', region: '广东省深圳市', industry: '信息传输、软件和信息技术服务业', bg: '民营企业', scale: '大型企业', certs: ['高新企业', '隐形冠军', '国家级企业技术中心'], insured: '19.6万人' },
  { id: 'c4', name: '特来电新能源股份有限公司', region: '山东省青岛市', industry: '电力、热力、燃气及水生产和供应业', bg: '民营企业', scale: '大型企业', certs: ['高新企业', '专精特新企业'], insured: '4,500人' },
  { id: 'c5', name: '中山大学附属第一医院', region: '广东省广州市', industry: '卫生和社会工作', bg: '事业单位', scale: '大型', certs: ['国家级技术创新示范'], insured: '8,000人' },
  { id: 'c6', name: '苏州交通投资集团有限责任公司', region: '江苏省苏州市', industry: '建筑业', bg: '国有企业', scale: '大型企业', certs: ['省级企业技术中心'], insured: '2,600人' },
];

type Product = { id: string; name: string; tender: number; win: number; buyer: number; supplier: number; agent: number; mentioned: number; planned?: number };
const PRODUCTS: Product[] = [
  { id: 'p1', name: '造型吸顶灯', tender: 19, win: 4, buyer: 14, supplier: 15, agent: 8, mentioned: 18 },
  { id: 'p2', name: '食堂食材采购服务项目', tender: 128, win: 144, buyer: 103, supplier: 151, agent: 82, mentioned: 75 },
  { id: 'p3', name: '钢结构安装', tender: 999, win: 828, planned: 96, buyer: 428, supplier: 587, agent: 97, mentioned: 694 },
  { id: 'p4', name: '消防车辆', tender: 999, win: 999, planned: 67, buyer: 999, supplier: 999, agent: 999, mentioned: 999 },
  { id: 'p5', name: '特警装备', tender: 999, win: 999, buyer: 682, supplier: 999, agent: 366, mentioned: 529 },
  { id: 'p6', name: '环形吊带', tender: 345, win: 83, buyer: 173, supplier: 174, agent: 14, mentioned: 95 },
  { id: 'p7', name: '生态环境监控服务', tender: 1, win: 4, buyer: 12, supplier: 9, agent: 3, mentioned: 21 },
  { id: 'p8', name: '进气电磁阀', tender: 47, win: 63, buyer: 64, supplier: 77, agent: 6, mentioned: 35 },
  { id: 'p9', name: '钨锡助熔剂', tender: 66, win: 10, buyer: 31, supplier: 2, agent: 4, mentioned: 24 },
  { id: 'p10', name: '洗手间', tender: 470, win: 243, planned: 83, buyer: 999, supplier: 803, agent: 429, mentioned: 537 },
];

const STATS = [
  { label: '北京市企业大额中标', sub: '过去30天本地企业中有大于100万中标的标讯', value: '6,593', unit: '条' },
  { label: '北京市政府事业单位招标', sub: '过去30天当地政府和事业单位新增的招标信息', value: '5,945', unit: '条' },
  { label: '北京市国企央企招标', sub: '过去30天国企和央企新增的招标信息', value: '9,999+', unit: '条' },
  { label: '北京市企业中标政府项目', sub: '过去30天最近中标政府项目的企业', value: '5,581', unit: '条' },
];

const TYPE_OPTS = ['不限', '招标公告', '中标公告', '拟建公告'] as const;
const REGION_OPTS = ['北京市', '上海市', '广东省', '江苏省', '浙江省', '四川省'];
const TIME_OPTS = ['不限', '今天', '近7天', '近30天', '近3个月', '近半年', '近1年'];
const SORT_OPTS = ['默认排序', '按收录时间新到旧', '按收录时间旧到新', '中标金额从高到低', '中标金额从低到高', '预算金额从高到低', '预算金额从低到高'];

const fmt = (n: number) => (n >= 999 ? '999+' : String(n));

/* ---------------- 子组件 ---------------- */
function TenderCard({ t, subbed, onSub }: { t: Tender; subbed: boolean; onSub: () => void }) {
  const meta: [string, string][] = [
    ['项目编号', t.projectNo], ['联系人', t.contact], ['招标单位', t.tenderer], ['中标单位', t.winner],
    ['代理单位', t.agent], ['中标候选人', t.candidate], ['投标单位', t.bidder], ['被提及单位', t.mentioned], ['采购产品', t.product],
  ];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[15px] font-semibold leading-snug text-slate-900">{t.title}</h3>
        <div className="flex shrink-0 items-center gap-1">
          <Button size="sm" variant={subbed ? 'primary' : 'secondary'} onClick={onSub}>{subbed ? '已订阅' : '订阅'}</Button>
          <Button size="sm" variant="ghost">更多</Button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge kind="blue">{t.type} | {t.type === '招标公告' ? '招标' : '中标'}</Badge>
        <Badge kind="gray">{t.region}</Badge>
        <Badge kind="gray">{t.industry}</Badge>
        {t.hasContact && <Badge kind="green">有联系方式</Badge>}
      </div>
      <div className="mt-1 text-xs text-slate-400">发布时间：{t.time}</div>
      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
        {meta.map(([k, v]) => (
          <div key={k} className="flex gap-1 text-[13px] leading-5">
            <span className="shrink-0 text-slate-400">{k}：</span>
            <span className="text-slate-700">{v}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-slate-500">标讯正文：{t.body}</p>
      <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-2 text-xs">
        <button className="text-brand-600 hover:underline">营销</button>
        <span className="text-slate-300">·</span>
        <button className="text-brand-600 hover:underline">监控</button>
        <span className="text-slate-300">·</span>
        <button className="text-brand-600 hover:underline">导出</button>
        <span className="text-slate-300">·</span>
        <button className="text-brand-600 hover:underline">订阅关联企业</button>
      </div>
    </div>
  );
}

function CompanyCard({ c }: { c: Company }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-slate-900">{c.name}</h3>
          <div className="mt-1 text-xs text-slate-400">{c.region} · {c.industry}</div>
        </div>
        <Button size="sm" variant="secondary">查看档案</Button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge kind="violet">{c.bg}</Badge>
        <Badge kind="gray">{c.scale}</Badge>
        <Badge kind="amber">参保 {c.insured}</Badge>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {c.certs.map((x) => <Badge key={x} kind="cyan">{x}</Badge>)}
      </div>
    </div>
  );
}

function ProductCard({ p, subbed, onSub }: { p: Product; subbed: boolean; onSub: () => void }) {
  const stats: [string, number][] = [['招标公告', p.tender], ['中标公告', p.win], ['拟建公告', p.planned ?? 0], ['采购商', p.buyer], ['供应商', p.supplier], ['代理商', p.agent], ['被提及', p.mentioned]];
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[15px] font-semibold text-slate-900">{p.name}</h3>
        <Button size="sm" variant={subbed ? 'primary' : 'secondary'} onClick={onSub}>{subbed ? '已订阅' : '订阅'}</Button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px]">
        {stats.map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <span className="text-slate-400">{k}</span>
            <span className="font-medium tabular-nums text-slate-700">{fmt(v)} {k.includes('公告') || k === '被提及' ? '条' : '家'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${active ? 'bg-brand-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
    >
      {children}
    </button>
  );
}

/* ---------------- 主组件 ---------------- */
export default function DmTender() {
  const [tab, setTab] = useState<TabKey>('all');
  const [q, setQ] = useState('');
  const [exact, setExact] = useState(false);
  const [type, setType] = useState<string>('不限');
  const [region, setRegion] = useState<string>('北京市');
  const [time, setTime] = useState<string>('近30天');
  const [sort, setSort] = useState(SORT_OPTS[0]);
  const [subbed, setSubbed] = useState<Record<string, boolean>>({});

  const toggleSub = (id: string) => setSubbed((s) => ({ ...s, [id]: !s[id] }));
  const subtitle = `招投标信息检索与商机挖掘 · ${TABS.find((t) => t.key === tab)?.label ?? ''}`;

  const filteredTenders = useMemo(() => {
    const kw = q.trim();
    return TENDERS.filter((t) => {
      if (type !== '不限' && t.type !== type) return false;
      if (region !== '不限' && !t.region.includes(region)) return false;
      if (kw && !t.title.includes(kw) && !t.tenderer.includes(kw) && !t.product.includes(kw)) return false;
      return true;
    });
  }, [q, type, region]);

  const filteredCompanies = useMemo(() => {
    const kw = q.trim();
    return COMPANIES.filter((c) => !kw || c.name.includes(kw) || c.industry.includes(kw));
  }, [q]);

  const filteredProducts = useMemo(() => {
    const kw = q.trim();
    return PRODUCTS.filter((p) => !kw || p.name.includes(kw));
  }, [q]);

  return (
    <>
      <PageShell title="招投标" crumb="数字营销 / 潜客挖掘" subtitle={subtitle} legend={false} />
      <div className="mx-auto max-w-7xl px-6 py-5">
        {/* Tab 条 */}
        <div className="mb-4 flex items-center gap-1 border-b border-slate-200">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setQ(''); }}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                tab === t.key ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
          <div className="ml-auto">
            <Button size="sm" variant="primary">+ 添加订阅</Button>
          </div>
        </div>

        {tab === 'my' && <MyTab />}

        {tab === 'all' && (
          <div className="space-y-4">
            {/* 搜索区 */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-brand-400">
                  <option>全部</option><option>标题·正文</option><option>仅标题</option><option>仅正文</option>
                  <option>招标单位</option><option>代理单位</option><option>中标单位</option><option>项目编号</option>
                </select>
                <input
                  value={q} onChange={(e) => setQ(e.target.value)}
                  placeholder="搜索标讯标题、招标单位、采购产品…"
                  className="min-w-[260px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                />
                <Button size="sm" variant="primary">搜索</Button>
                <button
                  onClick={() => setExact((v) => !v)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${exact ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500'}`}
                >
                  <span className={`h-3.5 w-3.5 rounded-full border ${exact ? 'border-brand-600 bg-brand-600' : 'border-slate-300'}`} />
                  精准搜索
                </button>
              </div>
            </div>

            {/* 统计卡 */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {STATS.map((s) => (
                <StatCard key={s.label} label={s.label} value={s.value} unit={s.unit} hint={s.sub} accent="brand" />
              ))}
            </div>

            {/* 筛选区 */}
            <Panel title="筛选条件" className="!p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400">标讯类型</span>
                {TYPE_OPTS.map((o) => <FilterChip key={o} active={type === o} onClick={() => setType(o)}>{o}</FilterChip>)}
                <span className="ml-2 text-xs text-slate-400">省份地区</span>
                {REGION_OPTS.map((o) => <FilterChip key={o} active={region === o} onClick={() => setRegion(o)}>{o}</FilterChip>)}
                <span className="ml-2 text-xs text-slate-400">发布时间</span>
                {TIME_OPTS.map((o) => <FilterChip key={o} active={time === o} onClick={() => setTime(o)}>{o}</FilterChip>)}
                <button className="ml-auto rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:bg-slate-50">其他筛选 ▾</button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2 text-xs">
                <span className="text-slate-400">已选条件：</span>
                <Badge kind="blue">省份地区：{region}</Badge>
                <Badge kind="blue">发布时间：{time}</Badge>
                <button className="text-slate-400 hover:text-slate-600">清空</button>
              </div>
            </Panel>

            {/* 结果头 + 批量操作 */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm text-slate-500">找到 <b className="text-slate-900">{filteredTenders.length}</b> 条标讯（样例）</div>
              <div className="flex items-center gap-2">
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 outline-none focus:border-brand-400">
                  {SORT_OPTS.map((o) => <option key={o}>{o}</option>)}
                </select>
                <Button size="sm" variant="secondary">监控</Button>
                <Button size="sm" variant="secondary">营销</Button>
                <Button size="sm" variant="secondary">加入所选</Button>
                <Button size="sm" variant="secondary">导出</Button>
              </div>
            </div>

            {/* 卡片列表 */}
            <div className="space-y-3">
              {filteredTenders.map((t) => (
                <TenderCard key={t.id} t={t} subbed={!!subbed[t.id]} onSub={() => toggleSub(t.id)} />
              ))}
              {filteredTenders.length === 0 && <Empty text="没有匹配的标讯样例" />}
            </div>
          </div>
        )}

        {tab === 'company' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="输入中标人名称…" className="min-w-[240px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" />
                <Button size="sm" variant="primary">搜索</Button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>共 <b className="text-slate-900">{filteredCompanies.length}</b> 家中标企业（样例）</span>
              <select className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 outline-none"><option>匹配度排序</option><option>中标次数从高到低</option></select>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {filteredCompanies.map((c) => <CompanyCard key={c.id} c={c} />)}
              {filteredCompanies.length === 0 && <Empty text="没有匹配的中标企业" />}
            </div>
          </div>
        )}

        {tab === 'product' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">找到 <b className="text-slate-900">10万+</b> 个产品（样例）</div>
              <select className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 outline-none"><option>按产品词匹配度排序</option><option>按公告更新日期排序</option></select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((p) => <ProductCard key={p.id} p={p} subbed={!!subbed[p.id]} onSub={() => toggleSub(p.id)} />)}
              {filteredProducts.length === 0 && <Empty text="没有匹配的产品词" />}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function MyTab() {
  const [sub, setSub] = useState<'rule' | 'ent'>('rule');
  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-slate-200">
        <button onClick={() => setSub('rule')} className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${sub === 'rule' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500'}`}>根据规则订阅标讯</button>
        <button onClick={() => setSub('ent')} className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${sub === 'ent' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500'}`}>根据企业订阅标讯</button>
      </div>
      <Empty text="你还没有创建订阅规则，点击右上角「添加订阅」开始" />
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center text-sm text-slate-400">
      {text}
    </div>
  );
}
