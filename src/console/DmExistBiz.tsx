import React, { useState, useRef, useEffect } from 'react';
import { RightDrawer } from '../components/ui';
import { PageShell } from './PageShell';

/* ===================== 筛选项配置（每个都是多选下拉） ===================== */
const FILTER_CONFIG: { key: string; label: string; options: string[] }[] = [
  { key: 'owner', label: '部门人员', options: ['张三', '李四', '王五', '赵六', '孙七', '周八'] },
  { key: 'tag', label: '客商标签', options: ['高价值', '潜力客户', '流失预警', '已成交', '待跟进', '战略客户'] },
  { key: 'group', label: '客商分组', options: ['战略客户', '重要客户', '一般客户', '长尾客户', '新客'] },
  { key: 'scope', label: '客商数据范围', options: ['全行', '本部门', '仅自己', '下属机构'] },
  { key: 'remark', label: '有无备注', options: ['有', '无'] },
  { key: 'addTime', label: '添加时间', options: ['最近7天', '最近30天', '最近3个月', '本年', '更早'] },
  { key: 'contractStart', label: '合同开始时间', options: ['最近7天', '最近30天', '最近3个月', '本年', '更早'] },
  { key: 'contractEnd', label: '合同到期时间', options: ['最近7天', '最近30天', '最近3个月', '本年', '更早'] },
  { key: 'payDate', label: '付款日期', options: ['最近7天', '最近30天', '最近3个月', '本年', '更早'] },
];

/* ===================== 时间范围匹配（相对“今天”2026-08-20） ===================== */
const NOW = new Date(2026, 7, 20);
function daysAgo(d: Date) {
  return Math.floor((NOW.getTime() - d.getTime()) / 86400000);
}
function inRange(dateStr: string, label: string) {
  const d = new Date(dateStr);
  const da = daysAgo(d);
  switch (label) {
    case '最近7天': return da >= 0 && da <= 7;
    case '最近30天': return da >= 0 && da <= 30;
    case '最近3个月': return da >= 0 && da <= 90;
    case '本年': return d.getFullYear() === 2026;
    case '更早': return d.getFullYear() < 2026;
    default: return false;
  }
}

/* ===================== 表格表头 ===================== */
const tableColumns = ['企业名称', '产业环节', '所在园区', '最新商机', '最新风险', '操作'];

/* ===================== 表格数据（样例，含各筛选项字段） ===================== */
type BizRow = {
  id: string;
  name: string;
  industry: string;
  park: string;
  newBusiness: string;
  risk: string;
  owners: string[];
  tags: string[];
  group: string;
  scope: string;
  remark: '有' | '无';
  addTime: string;
  contractStart: string;
  contractEnd: string;
  payDate: string;
};

const tableData: BizRow[] = [
  { id: '1', name: '抖音有限公司', industry: '短视频(上游)、网络直播… (11)', park: '中关村科技园区海淀园', newBusiness: '2025-11-20发生新获融资', risk: '2026-08-17新增开庭公告',
    owners: ['张三'], tags: ['战略客户', '高价值'], group: '战略客户', scope: '全行', remark: '有', addTime: '2026-08-18', contractStart: '2025-01-10', contractEnd: '2026-12-31', payDate: '2026-08-15' },
  { id: '2', name: '抖音视界有限公司', industry: '宠物食品(下游)、宠物… (76)', park: '中关村科技园区石景山园', newBusiness: '2026-05-22发生新增中标', risk: '2026-08-19新增法院公告',
    owners: ['李四', '王五'], tags: ['潜力客户'], group: '重要客户', scope: '本部门', remark: '有', addTime: '2026-05-22', contractStart: '2024-06-01', contractEnd: '2027-05-31', payDate: '2026-08-19' },
  { id: '3', name: '北京字节跳动科技有限公司', industry: '互联网(上游)、广告营销… (42)', park: '中关村科技园区海淀园', newBusiness: '2026-03-10发生股权变更', risk: '2026-07-02新增裁判文书',
    owners: ['赵六'], tags: ['已成交', '高价值'], group: '战略客户', scope: '全行', remark: '无', addTime: '2026-03-15', contractStart: '2023-03-01', contractEnd: '2026-02-28', payDate: '2025-12-20' },
  { id: '4', name: '美团科技有限公司', industry: '生活服务(中游)、本地生活… (58)', park: '望京科技园', newBusiness: '2025-11-18发生新获融资', risk: '2026-06-11新增开庭公告',
    owners: ['孙七'], tags: ['待跟进'], group: '一般客户', scope: '仅自己', remark: '有', addTime: '2025-11-20', contractStart: '2022-11-01', contractEnd: '2026-10-31', payDate: '2025-11-10' },
  { id: '5', name: '小米科技有限责任公司', industry: '智能硬件(上游)、IoT… (33)', park: '小米科技园', newBusiness: '2026-08-01发生新增中标', risk: '2026-08-03新增法院公告',
    owners: ['周八', '张三'], tags: ['潜力客户', '战略客户'], group: '重要客户', scope: '下属机构', remark: '无', addTime: '2026-08-01', contractStart: '2025-08-01', contractEnd: '2026-09-30', payDate: '2026-08-05' },
  { id: '6', name: '比亚迪股份有限公司', industry: '新能源汽车(中游)、电池… (91)', park: '坪山新能源汽车产业园', newBusiness: '2026-07-22发生新获融资', risk: '2026-07-25新增裁判文书',
    owners: ['李四'], tags: ['高价值', '已成交'], group: '战略客户', scope: '全行', remark: '有', addTime: '2026-07-25', contractStart: '2024-01-15', contractEnd: '2027-01-14', payDate: '2026-07-30' },
  { id: '7', name: '京东集团股份有限公司', industry: '电商(中游)、物流… (120)', park: '亦庄经开区', newBusiness: '2026-06-08发生新增中标', risk: '2026-06-09新增开庭公告',
    owners: ['王五'], tags: ['流失预警'], group: '一般客户', scope: '本部门', remark: '有', addTime: '2026-06-10', contractStart: '2023-09-01', contractEnd: '2026-08-31', payDate: '2026-06-15' },
  { id: '8', name: '华为技术有限公司', industry: '通信设备(上游)、ICT… (205)', park: '华为坂田基地', newBusiness: '2026-02-15发生股权变更', risk: '2026-02-18新增法院公告',
    owners: ['赵六', '孙七'], tags: ['战略客户', '高价值'], group: '战略客户', scope: '全行', remark: '无', addTime: '2026-02-18', contractStart: '2021-02-01', contractEnd: '2026-12-31', payDate: '2026-02-20' },
  { id: '9', name: '宁德时代新能源科技股份有限公司', industry: '动力电池(中游)、储能… (67)', park: '宁德锂电新能源产业园', newBusiness: '2025-12-03发生新获融资', risk: '2025-12-08新增裁判文书',
    owners: ['周八'], tags: ['潜力客户'], group: '重要客户', scope: '仅自己', remark: '有', addTime: '2025-12-05', contractStart: '2024-12-01', contractEnd: '2027-11-30', payDate: '2025-12-10' },
];

/* ===================== 多选下拉组件 ===================== */
function MultiSelect({ label, options, selected, onChange }: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [kw, setKw] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setKw(''); } };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const toggle = (opt: string) => onChange(selected.includes(opt) ? selected.filter((v) => v !== opt) : [...selected, opt]);
  const filteredOpts = options.filter((o) => o.toLowerCase().includes(kw.trim().toLowerCase()));
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 4, fontSize: 16, color: selected.length ? '#2563eb' : '#374151',
          background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 2px',
        }}
      >
        <span>{label}</span>
        {selected.length > 0 && (
          <span style={{ background: '#eff6ff', color: '#2563eb', borderRadius: 10, fontSize: 12, padding: '0 6px', lineHeight: '18px' }}>{selected.length}</span>
        )}
        <span style={{ fontSize: 12 }}>∨</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: 4, minWidth: 200, zIndex: 50 }}>
          <div style={{ position: 'relative', padding: '2px 4px 6px' }}>
            <input
              value={kw}
              onChange={(e) => setKw(e.target.value)}
              placeholder="搜索选项"
              style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px 6px 28px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, outline: 'none' }}
            />
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-30%)', color: '#9ca3af', fontSize: 13 }}>🔍</span>
          </div>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {filteredOpts.map((opt) => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 14, borderRadius: 6 }} onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
                <span style={{ color: '#374151' }}>{opt}</span>
              </label>
            ))}
            {filteredOpts.length === 0 && <div style={{ padding: 10, color: '#999', fontSize: 13 }}>无匹配选项</div>}
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================================
   存客详情（设计稿：存客列表 - 存客详情.html）
   设计稿自定义主题色 → 字面量 hex：
   primary #165DFF / borderLine #e5e6eb / grayBg #f7f8fa
   tagBlue #E8F3FF · tagBlueText #165DFF / tagGreen #E6FFEA · tagGreenText #00B42A
   tagWarn #FFECE5 · tagWarnText #F53F3F / star #FFAA00
   ===================================================================== */
const CELL = 'px-2 py-2 text-xs border border-[#e5e6eb]';
const BTN_DEFAULT = 'border border-[#e5e6eb] rounded px-3 py-1 text-xs flex items-center gap-1';
const BTN_YELLOW = 'bg-[#2563EB] text-white rounded px-3 py-1 text-xs flex items-center gap-1';
const BADGE_GREEN = 'px-1.5 py-0.5 rounded text-xs bg-[#E6FFEA] text-[#00B42A]';
const BADGE_BLUE = 'px-1.5 py-0.5 rounded text-xs bg-[#E8F3FF] text-[#165DFF]';
const BADGE_WARN = 'px-1.5 py-0.5 rounded text-xs bg-[#FFECE5] text-[#F53F3F]';
const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' } as const;
type Align = keyof typeof ALIGN;

function DetailCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`border border-[#e5e6eb] rounded bg-white ${className}`}>{children}</div>;
}
function CardTitle({ title, count, extra }: { title: string; count?: string; extra?: React.ReactNode }) {
  return (
    <div className="p-3 flex justify-between items-center border-b border-[#e5e6eb]">
      <div className="font-medium">
        {title} {count && <span className="text-xs font-normal text-gray-500">找到 {count} 条结果</span>}
      </div>
      {extra}
    </div>
  );
}
function TWrap({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto"><table className="w-full border-collapse">{children}</table></div>;
}
function Th({ children, a = 'left', w }: { children?: React.ReactNode; a?: Align; w?: string }) {
  return <th className={`${CELL} ${ALIGN[a]}`} style={w ? { width: w } : undefined}>{children}</th>;
}
function Td({ children, a = 'left', className = '' }: { children?: React.ReactNode; a?: Align; className?: string }) {
  return <td className={`${CELL} ${ALIGN[a]} ${className}`}>{children}</td>;
}
/* Font Awesome fa-star 不可用 → 字符星级 */
function Stars({ n }: { n: number }) {
  return (
    <span>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < n ? 'text-[#FFAA00]' : 'text-[#DCDFE6]'}>★</span>
      ))}
    </span>
  );
}
/* Font Awesome fa-download → 内联 SVG */
function IconDownload() {
  return (
    <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor" aria-hidden="true">
      <path d="M8 1a.75.75 0 0 1 .75.75v6.19l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06l1.72 1.72V1.75A.75.75 0 0 1 8 1zM2.75 11a.75.75 0 0 1 .75.75v1.5h9v-1.5a.75.75 0 0 1 1.5 0v2.25a.75.75 0 0 1-.75.75H2.75a.75.75 0 0 1-.75-.75V11.75A.75.75 0 0 1 2.75 11z" />
    </svg>
  );
}
/* Font Awesome fa-th-large / fa-list → 内联 SVG */
function IconGrid() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
      <path d="M2 2h5v5H2V2zm7 0h5v5H9V2zM2 9h5v5H2V9zm7 0h5v5H9V9z" />
    </svg>
  );
}
function IconList() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
      <path d="M2 3h12v2H2V3zm0 4h12v2H2V7zm0 4h12v2H2v-2z" />
    </svg>
  );
}
function Chip({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return <span className={`${active ? BADGE_BLUE : BTN_DEFAULT} whitespace-nowrap`}>{children}</span>;
}
function Pager({ total, last }: { total: string; last?: number }) {
  return (
    <div className="flex justify-end items-center mt-2 gap-2 text-xs flex-wrap">
      <span className="text-gray-500">共 {total} 条 &nbsp; 5条/页</span>
      <button className={BTN_DEFAULT}>{'<'}</button>
      <button className={BTN_YELLOW}>1</button>
      <button className={BTN_DEFAULT}>2</button>
      <button className={BTN_DEFAULT}>3</button>
      <button className={BTN_DEFAULT}>4</button>
      {last !== undefined && (
        <>
          <span>…</span>
          <button className={BTN_DEFAULT}>{last}</button>
        </>
      )}
      <button className={BTN_DEFAULT}>{'>'}</button>
      <span>前往 <input defaultValue="1" className="w-8 border border-[#e5e6eb] rounded text-center h-6 mx-1" /> 页</span>
    </div>
  );
}
function SubBlock({ title, count, children, last = false }: { title: string; count: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`p-3 ${last ? '' : 'border-b border-[#e5e6eb]'}`}>
      <div className="text-xs font-medium mb-2">{title} {count}</div>
      {children}
    </div>
  );
}

/* ---------- 存客详情 · 样例数据（设计稿 1:1） ---------- */
const OPP_ROWS = [
  { type: '新获科创类资质...', stars: 1, content: '2026-07-17，抖音有限公司新获科创类资质认定，认定类型为【独角兽企业】，认定级别: --', biz: '授信', op: '公司商机2' },
  { type: '新获融资', stars: 5, content: '2025-11-20发生了一笔股权融资,轮次为股权转让;金额: 500000000,币种: 美元;投资方: 今日资本', biz: '存款 授信', op: '公司商机2' },
];
const REL_CHIPS = ['董监高法3', '个人股东0', '法人股东1', '投资企业16', '供应链企业589', '担保企业0', '共同知识产权2'];
const REL_PERSONS = [
  { name: '银平', duty: '法定代表人、董事、经理', ratio: '-', count: '8', latest: '"银平" 任职 "法定代表人、经理" 的企业 "北京抖音信息服务有限公司"，于2026-06-15发生购买技术' },
  { name: '李雪', duty: '财务负责人', ratio: '-', count: '23', latest: '"李雪" 任职 "财务负责人" 的企业 "北京抖音信息服务有限公司"，于2026-06-15发生购买技术' },
  { name: '夏绪宏', duty: '监事', ratio: '-', count: '104', latest: '"夏绪宏" 任职 "监事" 的企业 "北京抖音信息服务有限公司"，于2026-06-15发生购买技术' },
];
const REL_LEGAL = [
  { name: '厦门星辰启点科技有限公司', ratio: '98.814%', date: '2022-12-30', capital: '100万元人民币', area: '福建厦门市思明区', latest: '-' },
];
const REL_INVEST = [
  { name: '小荷智慧（上海）科技有限公司', ratio: '100.00%', date: '2025-08-14', capital: '10万元人民币', area: '上海市浦东新区', latest: '2026-06-04发生新增投资收购并购' },
  { name: '上海格物致品网络科技有限公司', ratio: '100.00%', date: '2021-03-31', capital: '1000万元人民币', area: '上海市杨浦区', latest: '2026-08-17发生新增中标' },
  { name: '小荷健康科技（北京）有限公司', ratio: '100.00%', date: '2020-09-23', capital: '100万元人民币', area: '北京市海淀区', latest: '-' },
  { name: '北京春日方舟科技有限公司', ratio: '100.00%', date: '2020-03-26', capital: '100万元人民币', area: '北京市海淀区', latest: '-' },
  { name: '天津基石科技有限公司', ratio: '100.00%', date: '2018-11-20', capital: '1000万元人民币', area: '天津市滨海新区', latest: '-' },
];
const REL_SUPPLY = [
  { name: '中国农业银行股份有限公司', type: '采购方', date: '1986-12-18', capital: '34998303.3873万元人民币', area: '北京市东城区', latest: '2026-08-21发生债券发行披露' },
  { name: '智者同行品牌管理顾问（北京）股份有限公司', type: '采购方', date: '2011-08-08', capital: '3610万元人民币', area: '北京市朝阳区', latest: '2026-07-11发生新增中标' },
  { name: '海南华磊建筑设计咨询有限公司', type: '供应商', date: '1995-06-19', capital: '1000万元人民币', area: '海南海口市美兰区', latest: '2026-06-09发生新增中标' },
  { name: '福建广电网络集团股份有限公司', type: '采购方', date: '2011-12-28', capital: '39100万元人民币', area: '福建福州市鼓楼区', latest: '2026-08-18发生新增供应商/项目' },
  { name: '厦门创匠信息科技股份有限公司', type: '采购方', date: '2016-02-19', capital: '1646.3412万元人民币', area: '福建厦门市集美区', latest: '2026-04-24发生投资项目（公告）' },
];
const REL_IP = [
  { name: '字节跳动（香港）有限公司', type: '共同专利权人', date: '-', capital: '-', area: '-', latest: '-' },
  { name: '抖音视界有限公司', type: '共同申请人', date: '2012-07-25', capital: '30000万美元', area: '北京市石景山区', latest: '2026-05-22发生新增中标' },
];
const GROUP_CHIPS = ['企业筛选', '集团筛选', '经营状态', '所在行业', '总部地区', '成员地区', '注册资本', '成立时间'];
const GROUP_MEMBERS = [
  { name: '北京飞书科技有限公司', capital: '307,000万元人民币', date: '2016-06-12', level: '4级', industry: '科技推广和应用服务业', area: '北京海淀', ratio: '49.41%', income: '-' },
  { name: '北京光惟之外科技有限公司', capital: '220,000万元人民币', date: '2018-06-28', level: '3级', industry: '科技推广和应用服务业', area: '北京海淀', ratio: '49.41%', income: '-' },
  { name: '北京今日头条科技有限公司', capital: '151,000万元人民币', date: '2016-03-16', level: '4级', industry: '科技推广和应用服务业', area: '北京海淀', ratio: '49.41%', income: '-' },
  { name: '北京火山引擎科技有限公司', capital: '100,000万元人民币', date: '2020-05-11', level: '4级', industry: '科技推广和应用服务业', area: '北京海淀', ratio: '49.41%', income: '-' },
  { name: '深圳面包星辰科技有限公司', capital: '85,100万元人民币', date: '2006-08-25', level: '5级', industry: '商务服务业', area: '广东深圳南山', ratio: '49.41%', income: '84.03亿' },
];
const GROUP_OPPS = [
  { name: '北京火山引擎科技有限公司', date: '2026-08-19', type: '新增中标', stars: 5, content: '2026-08-19中标了【AI智能研发助手项目采购（AI…', biz: '存款 授信', op: '公司商机 106' },
  { name: '北京飞书科技有限公司', date: '2026-08-19', type: '新增中标', stars: 5, content: '2026-08-19中标了【2026年南网数字运营软件科技…', biz: '存款 授信', op: '公司商机 60' },
  { name: '北京飞书科技有限公司', date: '2026-08-17', type: '新增中标', stars: 5, content: '2026-08-17中标了【青岛银行智能协同办公软件用…', biz: '存款 授信', op: '公司商机 60' },
  { name: '上海格物致品网络科技有限公司', date: '2026-08-17', type: '新增中标', stars: 5, content: '2026-08-17中标了【抖音电商AI广告爆改大赛项目…', biz: '存款 授信', op: '公司商机 6' },
  { name: '北京火山引擎科技有限公司', date: '2026-08-17', type: '新增中标', stars: 5, content: '2026-08-17中标了【2026年奥迪市场部—经销商直…', biz: '存款 授信', op: '公司商机 106' },
];
const SIM_QUALIFY = [
  { date: '2026-07-17', type: '独角兽企业', detail: '长城战略咨询重磅发布《GEI中国独角兽企业研究报告2026》！（含完整榜单）' },
  { date: '2025-07-18', type: '独角兽企业', detail: '中国独角兽企业372家，总估值超1.2万亿美元——长城战略咨询发布《GEI中国独角兽企业研究报告2025》' },
  { date: '2024-06-17', type: '独角兽企业', detail: '2023年度中国独角兽企业榜单' },
  { date: '2023-07-07', type: '独角兽企业', detail: '2022年度中国独角兽企业' },
];
const SIM_RANK = [
  { date: '2025-11-25', unit: '广东中策知识产权研究院', detail: '2025年度中国企业专利创新百强榜' },
];
const NEARBY = [
  { name: '北京抖音信息服务有限公司', legal: '银平', date: '2012-03-09', industry: '互联网和相关服务', capital: '20000 万人民币', status: '存续（在营、开业、在册）', score: '681', scale: '大型企业、规模以上企业、规模以上服务业企业', tag: '高新企业、科技型企业', type: '其他有限责任' },
  { name: '抖音有限公司', legal: '银平', date: '2016-05-04', industry: '科技推广和应用服务业', capital: '10000 万人民币', status: '存续（在营、开业、在册）', score: '650', scale: '大型企业', tag: '科技型企业', type: '其他有限责任' },
  { name: '今日头条有限公司', legal: '郝霞', date: '2016-08-24', industry: '科技推广和应用服务业', capital: '10000 万人民币', status: '存续（在营、开业、在册）', score: '658', scale: '大型企业、规模以上企业、规模以上服务业企业', tag: '-', type: '有限责任公司(资)' },
  { name: '北京闪星科技有限公司', legal: '胡帅', date: '2014-12-09', industry: '科技推广和应用服务业', capital: '1000 万人民币', status: '存续（在营、开业、在册）', score: '627', scale: '小微企业', tag: '-', type: '有限责任公司(资)' },
  { name: '北京今日头条科技有限公司', legal: '黄煜', date: '2016-03-16', industry: '科技推广和应用服务业', capital: '151000 万人民币', status: '存续（在营、开业、在册）', score: '639', scale: '中型企业、规模以上企业、规模以上服务业企业', tag: '-', type: '有限责任公司(资)' },
];
const RISK_CHIPS = ['风险筛选', '部门人员', '选择标签', '企业分组', '风险等级', '风险维度', '阅读状态', '拜访记录'];
const RISK_ROWS = [
  { date: '2026-08-17', type: '开庭公告', content: '身份: 其他 相关企业/人: 案由: 产品责任纠纷 开庭日期: 2026-08-17 是否历史: 否', warn: '非劳务纠纷' },
  { date: '2026-08-17', type: '开庭公告', content: '身份: 被告 相关企业/人: 案由: 买卖合同纠纷 开庭日期: 2026-08-21 是否历史: 否', warn: '非劳务纠纷' },
  { date: '2026-08-17', type: '开庭公告', content: '身份: 被告 相关企业/人: 案由: 买卖合同纠纷 开庭日期: 2026-09-09 是否历史: 否', warn: '非劳务纠纷' },
  { date: '2026-08-17', type: '开庭公告', content: '身份: 被告 相关企业/人: 案由: 产品责任纠纷 开庭日期: 2026-09-15 是否历史: 否', warn: '非劳务纠纷' },
  { date: '2026-08-17', type: '开庭公告', content: '身份: 被告 相关企业/人: 案由: 产品责任纠纷 开庭日期: 2026-09-20 是否历史: 否', warn: '非劳务纠纷' },
  { date: '2026-08-17', type: '开庭公告', content: '身份: 被告 相关企业/人: 案由: 产品责任纠纷 开庭日期: 2026-09-21 是否历史: 否', warn: '非劳务纠纷' },
  { date: '2026-08-17', type: '开庭公告', content: '身份: 被告 相关企业/人: 案由: 买卖合同纠纷 开庭日期: 2026-09-08 是否历史: 否', warn: '非劳务纠纷' },
  { date: '2026-08-13', type: '开庭公告', content: '身份: 其他 相关企业/人: 案由: 其他案由 开庭日期: 2026-08-13 是否历史: 否', warn: '非劳务纠纷' },
  { date: '2026-08-11', type: '法院公告', content: '当事人: 涿州众投钱庄商贸馆 公告类型: 起诉状副本、上诉状副本 发布日期: 2026-08-11 是...', warn: '' },
  { date: '2026-07-28', type: '法院公告', content: '当事人: 石狮市郑侠服装商行 公告类型: 起诉状副本及开庭传票 发布日期: 2026-07-28 是否...', warn: '' },
];

/* ---------- 存客详情主体 ---------- */
function CunkeDetail({ row }: { row: BizRow }) {
  const [tab, setTab] = useState<'biz' | 'risk'>('biz');

  return (
    <div className="text-sm text-[#1d2129]">
      {/* 头部企业信息 */}
      <div className="flex justify-between items-start mb-4 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 shrink-0 bg-[#165DFF] text-white flex items-center justify-center rounded">{row.name.slice(0, 1)}</div>
          <div>
            <span className="font-medium text-base">{row.name}</span>
            <span className={`${BADGE_GREEN} ml-1`}>存续（在营、开业、在册）</span>
            <div className="text-xs text-gray-500 mt-1">法人：银平 他有 4 家企业 &gt; &nbsp;注册资本：10000万元人民币 &nbsp;成立时间：2016-05-04</div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button className={BTN_DEFAULT}>查看工商详情</button>
          <button className={BTN_YELLOW}>下载商机/风险信息</button>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="flex border-b border-[#e5e6eb] mb-4">
        <div
          className={`px-4 py-2 text-sm cursor-pointer border-b-2 ${tab === 'biz' ? 'border-[#165DFF] text-[#165DFF] font-medium' : 'border-transparent'}`}
          onClick={() => setTab('biz')}
        >
          存客商机
        </div>
        <div
          className={`px-4 py-2 text-sm cursor-pointer border-b-2 ${tab === 'risk' ? 'border-[#165DFF] text-[#165DFF] font-medium' : 'border-transparent'}`}
          onClick={() => setTab('risk')}
        >
          风险动态
        </div>
      </div>

      {/* ============ Tab1 存客商机 ============ */}
      {tab === 'biz' && (
        <div>
          {/* 顶部营销统计卡片 */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            {[
              { label: '商机营销', value: '2', note: '' },
              { label: '关联营销', value: '611', note: '' },
              { label: '集团营销', value: '249', note: '' },
              { label: '相似营销', value: '11', note: '同类企业' },
              { label: '位置营销', value: '20353', note: '附近企业' },
            ].map((c) => (
              <DetailCard key={c.label} className="p-3">
                <div className="flex justify-between">
                  <div className="text-xs text-gray-500">{c.label}</div>
                  {c.note && <div className="text-xs text-gray-400">{c.note}</div>}
                </div>
                <div className="text-xl font-bold text-[#165DFF] mt-1">
                  {c.value} <span className="text-xs font-normal text-gray-500">条</span>
                </div>
              </DetailCard>
            ))}
          </div>

          {/* 商机营销 */}
          <DetailCard className="mb-4">
            <CardTitle title="商机营销" count="2" extra={<span className="text-[#165DFF] text-xs cursor-pointer">全部存客商机 &gt;</span>} />
            <TWrap>
              <thead>
                <tr className="bg-[#f7f8fa]">
                  <Th>商机类型</Th>
                  <Th>商机价值</Th>
                  <Th>商机内容</Th>
                  <Th a="center">操作 <span className="text-gray-400">AI</span></Th>
                </tr>
              </thead>
              <tbody>
                {OPP_ROWS.map((o, i) => (
                  <tr key={i}>
                    <Td>{o.type}</Td>
                    <Td><Stars n={o.stars} /></Td>
                    <Td>{o.content} <span className="text-[#165DFF]">{o.biz}</span></Td>
                    <Td a="center">
                      <span className="text-[#165DFF] cursor-pointer">{o.op}</span> &nbsp; <span className="text-[#165DFF] cursor-pointer">AI 触达</span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TWrap>
          </DetailCard>

          {/* 关联营销 */}
          <DetailCard className="mb-4">
            <div className="p-3 font-medium border-b border-[#e5e6eb]">关联营销 <span className="text-xs font-normal text-gray-500">找到 611 条结果</span></div>
            <div className="px-3 py-2 flex gap-2 border-b border-[#e5e6eb] overflow-x-auto">
              <Chip active>全部611</Chip>
              {REL_CHIPS.map((c) => <Chip key={c}>{c}</Chip>)}
            </div>

            <SubBlock title="董监高法" count="3">
              <TWrap>
                <thead>
                  <tr className="bg-[#f7f8fa]">
                    <Th>姓名</Th>
                    <Th>当前任职</Th>
                    <Th a="center">持股比例</Th>
                    <Th a="center">关联企业</Th>
                    <Th>关联企业最新商机</Th>
                  </tr>
                </thead>
                <tbody>
                  {REL_PERSONS.map((p) => (
                    <tr key={p.name}>
                      <Td>{p.name}</Td>
                      <Td>{p.duty}</Td>
                      <Td a="center">{p.ratio}</Td>
                      <Td a="center">{p.count}</Td>
                      <Td><span className="text-[#165DFF] cursor-pointer">{p.latest}</span></Td>
                    </tr>
                  ))}
                </tbody>
              </TWrap>
            </SubBlock>

            <SubBlock title="法人股东" count="1">
              <TWrap>
                <thead>
                  <tr className="bg-[#f7f8fa]">
                    <Th>股东名称</Th>
                    <Th a="center">持股比例</Th>
                    <Th a="center">成立日期</Th>
                    <Th a="center">注册资本</Th>
                    <Th a="center">所在区域</Th>
                    <Th>最新商机</Th>
                  </tr>
                </thead>
                <tbody>
                  {REL_LEGAL.map((s) => (
                    <tr key={s.name}>
                      <Td>{s.name}</Td>
                      <Td a="center">{s.ratio}</Td>
                      <Td a="center">{s.date}</Td>
                      <Td a="center">{s.capital}</Td>
                      <Td a="center">{s.area}</Td>
                      <Td>{s.latest}</Td>
                    </tr>
                  ))}
                </tbody>
              </TWrap>
            </SubBlock>

            <SubBlock title="投资企业" count="16">
              <TWrap>
                <thead>
                  <tr className="bg-[#f7f8fa]">
                    <Th>企业名称</Th>
                    <Th a="center">投资比例</Th>
                    <Th a="center">成立日期</Th>
                    <Th a="center">注册资本</Th>
                    <Th a="center">所在区域</Th>
                    <Th>最新商机</Th>
                  </tr>
                </thead>
                <tbody>
                  {REL_INVEST.map((v) => (
                    <tr key={v.name}>
                      <Td>{v.name}</Td>
                      <Td a="center">{v.ratio}</Td>
                      <Td a="center">{v.date}</Td>
                      <Td a="center">{v.capital}</Td>
                      <Td a="center">{v.area}</Td>
                      <Td>{v.latest === '-' ? '-' : <span className="text-[#165DFF] cursor-pointer">{v.latest}</span>}</Td>
                    </tr>
                  ))}
                </tbody>
              </TWrap>
              <Pager total="16" />
            </SubBlock>

            <SubBlock title="供应链企业" count="589">
              <TWrap>
                <thead>
                  <tr className="bg-[#f7f8fa]">
                    <Th>企业名称</Th>
                    <Th a="center">类型</Th>
                    <Th a="center">成立日期</Th>
                    <Th a="center">注册资本</Th>
                    <Th a="center">所在区域</Th>
                    <Th>最新商机</Th>
                  </tr>
                </thead>
                <tbody>
                  {REL_SUPPLY.map((v) => (
                    <tr key={v.name}>
                      <Td>{v.name}</Td>
                      <Td a="center">{v.type}</Td>
                      <Td a="center">{v.date}</Td>
                      <Td a="center">{v.capital}</Td>
                      <Td a="center">{v.area}</Td>
                      <Td><span className="text-[#165DFF] cursor-pointer">{v.latest}</span></Td>
                    </tr>
                  ))}
                </tbody>
              </TWrap>
              <Pager total="589" last={118} />
            </SubBlock>

            <SubBlock title="共同知识产权" count="2" last>
              <TWrap>
                <thead>
                  <tr className="bg-[#f7f8fa]">
                    <Th>企业名称</Th>
                    <Th a="center">类型</Th>
                    <Th a="center">成立日期</Th>
                    <Th a="center">注册资本</Th>
                    <Th a="center">所在区域</Th>
                    <Th>最新商机</Th>
                  </tr>
                </thead>
                <tbody>
                  {REL_IP.map((v) => (
                    <tr key={v.name}>
                      <Td>{v.name}</Td>
                      <Td a="center">{v.type}</Td>
                      <Td a="center">{v.date}</Td>
                      <Td a="center">{v.capital}</Td>
                      <Td a="center">{v.area}</Td>
                      <Td>{v.latest === '-' ? '-' : <span className="text-[#165DFF] cursor-pointer">{v.latest}</span>}</Td>
                    </tr>
                  ))}
                </tbody>
              </TWrap>
            </SubBlock>
          </DetailCard>

          {/* 集团营销 */}
          <DetailCard className="mb-4">
            <div className="p-3 font-medium border-b border-[#e5e6eb]">集团营销 <span className="text-xs font-normal text-gray-500">找到 249 条结果</span></div>
            <div className="px-3 py-2 border-b border-[#e5e6eb] flex justify-between items-center gap-2">
              <div className="text-xs">所在集团: 抖音集团 &nbsp; 集团成员数: 330 &nbsp; 集团主体企业: 抖音有限公司</div>
              <span className="text-[#165DFF] text-xs cursor-pointer whitespace-nowrap">北京全部民营集团 &gt;</span>
            </div>
            <div className="px-3 py-2 flex gap-2 border-b border-[#e5e6eb] overflow-x-auto">
              {GROUP_CHIPS.map((c) => <Chip key={c}>{c}</Chip>)}
              <Chip active>集团内级别</Chip>
              <Chip>控股等级</Chip>
            </div>
            <div className="px-3 py-2 text-xs text-gray-500 border-b border-[#e5e6eb]">已选 <span className="text-[#165DFF] float-right cursor-pointer">清空</span></div>

            <div className="p-3 border-b border-[#e5e6eb]">
              <TWrap>
                <thead>
                  <tr className="bg-[#f7f8fa]">
                    <Th a="center" w="32px"><input type="checkbox" /></Th>
                    <Th>公司名称</Th>
                    <Th a="center">经营状态</Th>
                    <Th a="center">注册资本</Th>
                    <Th a="center">成立时间</Th>
                    <Th a="center">成员级别(实控人)</Th>
                    <Th>行业</Th>
                    <Th a="center">地区</Th>
                    <Th a="center">实控人控股比例</Th>
                    <Th a="center">营业收入</Th>
                  </tr>
                </thead>
                <tbody>
                  {GROUP_MEMBERS.map((m) => (
                    <tr key={m.name}>
                      <Td a="center"><input type="checkbox" /></Td>
                      <Td>{m.name}</Td>
                      <Td a="center"><span className={BADGE_GREEN}>存续</span></Td>
                      <Td a="center">{m.capital}</Td>
                      <Td a="center">{m.date}</Td>
                      <Td a="center">{m.level}</Td>
                      <Td>{m.industry}</Td>
                      <Td a="center">{m.area}</Td>
                      <Td a="center">{m.ratio}</Td>
                      <Td a="center">{m.income}</Td>
                    </tr>
                  ))}
                </tbody>
              </TWrap>
              <Pager total="330" last={66} />
            </div>

            {/* 集团营销商机列表 */}
            <div className="p-3">
              <TWrap>
                <thead>
                  <tr className="bg-[#f7f8fa]">
                    <Th a="center" w="32px"><input type="checkbox" /></Th>
                    <Th>企业名称</Th>
                    <Th a="center">发生日期</Th>
                    <Th a="center">商机类型</Th>
                    <Th a="center">商机价值</Th>
                    <Th>商机内容</Th>
                    <Th a="center">操作</Th>
                  </tr>
                </thead>
                <tbody>
                  {GROUP_OPPS.map((o, i) => (
                    <tr key={i}>
                      <Td a="center"><input type="checkbox" /></Td>
                      <Td className="text-[#165DFF]">{o.name}</Td>
                      <Td a="center">{o.date}</Td>
                      <Td a="center"><span className={BADGE_WARN}>{o.type}</span></Td>
                      <Td a="center"><Stars n={o.stars} /></Td>
                      <Td>{o.content} <span className="text-[#165DFF]">{o.biz}</span></Td>
                      <Td a="center"><span className="text-[#165DFF] cursor-pointer">{o.op}</span></Td>
                    </tr>
                  ))}
                </tbody>
              </TWrap>
              <Pager total="249" last={50} />
            </div>
          </DetailCard>

          {/* 相似营销 */}
          <DetailCard className="mb-4">
            <div className="p-3 font-medium border-b border-[#e5e6eb]">相似营销 <span className="text-xs font-normal text-gray-500">找到 11 条结果</span></div>
            <SubBlock title="资质认定" count="4">
              <TWrap>
                <thead>
                  <tr className="bg-[#f7f8fa]">
                    <Th>认证时间</Th>
                    <Th>资质类型</Th>
                    <Th>资质详情</Th>
                    <Th a="center">操作</Th>
                  </tr>
                </thead>
                <tbody>
                  {SIM_QUALIFY.map((q, i) => (
                    <tr key={i}>
                      <Td>{q.date}</Td>
                      <Td>{q.type}</Td>
                      <Td>{q.detail}</Td>
                      <Td a="center"><span className="text-[#165DFF] cursor-pointer">查看详情</span></Td>
                    </tr>
                  ))}
                </tbody>
              </TWrap>
            </SubBlock>
            <SubBlock title="上榜榜单" count="7" last>
              <TWrap>
                <thead>
                  <tr className="bg-[#f7f8fa]">
                    <Th>公布日期</Th>
                    <Th>认定单位</Th>
                    <Th>榜单详情</Th>
                    <Th a="center">操作</Th>
                  </tr>
                </thead>
                <tbody>
                  {SIM_RANK.map((q, i) => (
                    <tr key={i}>
                      <Td>{q.date}</Td>
                      <Td>{q.unit}</Td>
                      <Td>{q.detail}</Td>
                      <Td a="center"><span className="text-[#165DFF] cursor-pointer">查看详情</span></Td>
                    </tr>
                  ))}
                </tbody>
              </TWrap>
            </SubBlock>
          </DetailCard>

          {/* 位置营销 */}
          <DetailCard>
            <div className="p-3 font-medium border-b border-[#e5e6eb]">位置营销 <span className="text-xs font-normal text-gray-500">找到 20353 条结果</span></div>
            <div className="px-3 py-2 flex justify-between items-center border-b border-[#e5e6eb] gap-2">
              <div className="text-xs">所在位置: 北京市海淀区北三环西路甲23号院1号楼3层327 &nbsp; 周边范围：1km</div>
              <span className="text-[#165DFF] text-xs cursor-pointer whitespace-nowrap">查看完整周边企业 &gt;</span>
            </div>
            <div className="px-3 py-2 flex justify-between items-center border-b border-[#e5e6eb] gap-2">
              <div><span className="font-medium text-xs">找到 20353 条相关结果</span> <span className="text-[#165DFF] text-xs cursor-pointer">最近中心距离</span></div>
              <div className="flex gap-2 shrink-0">
                <button className={BTN_DEFAULT}>+ 关注</button>
                <button className={BTN_DEFAULT}><IconDownload /> 导出</button>
              </div>
            </div>
            <div className="p-3">
              <TWrap>
                <thead>
                  <tr className="bg-[#f7f8fa]">
                    <Th a="center" w="32px"><input type="checkbox" /></Th>
                    <Th>企业名称</Th>
                    <Th>法定代表人</Th>
                    <Th a="center">成立时间</Th>
                    <Th>所在行业</Th>
                    <Th a="center">注册资本</Th>
                    <Th a="center">经营状态</Th>
                    <Th a="center">企业健康度</Th>
                    <Th a="center">企业规模</Th>
                    <Th a="center">资质标签</Th>
                    <Th a="center">企业类型</Th>
                  </tr>
                </thead>
                <tbody>
                  {NEARBY.map((n, i) => (
                    <tr key={i}>
                      <Td a="center"><input type="checkbox" /></Td>
                      <Td>{n.name}</Td>
                      <Td>{n.legal}</Td>
                      <Td a="center">{n.date}</Td>
                      <Td>{n.industry}</Td>
                      <Td a="center">{n.capital}</Td>
                      <Td a="center">{n.status}</Td>
                      <Td a="center">{n.score}</Td>
                      <Td a="center">{n.scale}</Td>
                      <Td a="center">{n.tag}</Td>
                      <Td a="center">{n.type}</Td>
                    </tr>
                  ))}
                </tbody>
              </TWrap>
              <Pager total="20353" last={4071} />
            </div>
          </DetailCard>
        </div>
      )}

      {/* ============ Tab2 风险动态 ============ */}
      {tab === 'risk' && (
        <DetailCard>
          <div className="px-3 py-2 flex gap-3 border-b border-[#e5e6eb] overflow-x-auto items-center">
            {RISK_CHIPS.map((c) => <Chip key={c}>{c}</Chip>)}
            <button className={`${BTN_DEFAULT} ml-auto whitespace-nowrap`}>设置风险等级</button>
          </div>
          <div className="px-3 py-2 flex justify-between items-center border-b border-[#e5e6eb] text-xs gap-2">
            <div>当前共计 <span className="font-medium">95</span> 条动态 &nbsp; 警告 0 &nbsp; <span className={BADGE_BLUE}>关注 95</span> &nbsp; 提示 0 &nbsp; 不启用 0</div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="flex items-center gap-1">视图: <IconGrid /> <IconList /></span>
              <input defaultValue={row.name} className="border border-[#e5e6eb] rounded px-2 py-1 w-40 text-xs" />
            </div>
          </div>
          <div className="p-3">
            <TWrap>
              <thead>
                <tr className="bg-[#f7f8fa]">
                  <Th>发生时间</Th>
                  <Th a="center">风险等级</Th>
                  <Th>企业名称</Th>
                  <Th a="center">标签</Th>
                  <Th a="center">风险类型</Th>
                  <Th>内容概览</Th>
                  <Th a="center">客户归属</Th>
                  <Th a="center">操作</Th>
                </tr>
              </thead>
              <tbody>
                {RISK_ROWS.map((r, i) => (
                  <tr key={i}>
                    <Td>{r.date}</Td>
                    <Td a="center"><span className={BADGE_BLUE}>关注</span></Td>
                    <Td>{row.name}</Td>
                    <Td a="center">-</Td>
                    <Td a="center">{r.type}</Td>
                    <Td>{r.content} {r.warn && <span className={BADGE_WARN}>{r.warn}</span>}</Td>
                    <Td a="center">广州粤信科技有限公司 191560</Td>
                    <Td a="center"><span className="text-[#165DFF] cursor-pointer">跟踪记录</span></Td>
                  </tr>
                ))}
              </tbody>
            </TWrap>
          </div>
        </DetailCard>
      )}
    </div>
  );
}

/* ===================== 主页面 ===================== */
export default function CustomerList() {
  /* 存客详情抽屉（Hooks 置顶，任何 return 之前） */
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<BizRow | null>(null);

  const [checkedList, setCheckedList] = useState<string[]>([]);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [keyword, setKeyword] = useState('');

  const openDetail = (row: BizRow) => { setSelectedRow(row); setDetailOpen(true); };

  const handleCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setCheckedList(filtered.map((item) => item.id));
    else setCheckedList([]);
  };
  const handleRowCheck = (id: string, checked: boolean) => {
    if (checked) setCheckedList([...checkedList, id]);
    else setCheckedList(checkedList.filter((v) => v !== id));
  };

  const setFilter = (key: string, v: string[]) => setFilters((f) => ({ ...f, [key]: v }));

  const matchRow = (row: BizRow) => {
    for (const cfg of FILTER_CONFIG) {
      const sel = filters[cfg.key];
      if (!sel || sel.length === 0) continue;
      let ok = false;
      if (cfg.key === 'owner') ok = row.owners.some((o) => sel.includes(o));
      else if (cfg.key === 'tag') ok = row.tags.some((t) => sel.includes(t));
      else if (cfg.key === 'group') ok = sel.includes(row.group);
      else if (cfg.key === 'scope') ok = sel.includes(row.scope);
      else if (cfg.key === 'remark') ok = sel.includes(row.remark);
      else if (cfg.key === 'addTime') ok = sel.some((s) => inRange(row.addTime, s));
      else if (cfg.key === 'contractStart') ok = sel.some((s) => inRange(row.contractStart, s));
      else if (cfg.key === 'contractEnd') ok = sel.some((s) => inRange(row.contractEnd, s));
      else if (cfg.key === 'payDate') ok = sel.some((s) => inRange(row.payDate, s));
      if (!ok) return false;
    }
    if (keyword && !row.name.includes(keyword.trim())) return false;
    return true;
  };

  const filtered = tableData.filter(matchRow);
  const hasFilter = Object.values(filters).some((v) => v.length > 0) || keyword.trim() !== '';

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <PageShell title="存客商机" crumb="数字营销 / 潜客挖掘 / 存客商机" legend={false} />
      {/* 顶部客商筛选栏 */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f2f5' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <span style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>客商筛选</span>
          {FILTER_CONFIG.map((cfg) => (
            <MultiSelect
              key={cfg.key}
              label={cfg.label}
              options={cfg.options}
              selected={filters[cfg.key] ?? []}
              onChange={(v) => setFilter(cfg.key, v)}
            />
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {hasFilter && (
              <button
                onClick={() => { setFilters({}); setKeyword(''); }}
                style={{ padding: '8px 14px', borderRadius: '20px', border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontSize: 14, cursor: 'pointer' }}
              >
                重置筛选
              </button>
            )}
            <button
              style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #dbeafe', backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '14px', cursor: 'pointer' }}
            >
              高级筛选
            </button>
          </div>
        </div>
      </div>

      {/* 操作工具栏 */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #f0f2f5', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '16px', color: '#4b5563' }}>找到 <span style={{ color: '#16a34a', fontWeight: 600 }}>{filtered.length}</span> 条结果</span>
        <div style={{ flex: 1 }}></div>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="输入企业关键字"
          style={{
            padding: '8px 12px 8px 32px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px',
            background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' fill=\'%239ca3af\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z\'/%3E%3C/svg%3E") no-repeat left 10px center',
          }}
        />
        <button style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' }}>设置标签</button>
        <button style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' }}>变更负责人</button>
        <button style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' }}>变更分组</button>
        <button style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' }}>删除</button>
        <button style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' }}>导出</button>
        <button style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' }}>展示字段 (5/26)</button>
      </div>

      {/* 表格区域 */}
      <div style={{ padding: '0 20px' }}>
        <div className="overflow-x-auto"><table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{ padding: '12px 8px', textAlign: 'left', border: '1px solid #e5e7eb', width: '40px' }}>
                <input type="checkbox" onChange={handleCheckAll} checked={checkedList.length === filtered.length && filtered.length > 0} />
              </th>
              {tableColumns.map((col) => (
                <th key={col} style={{ padding: '12px 8px', textAlign: 'left', border: '1px solid #e5e7eb', fontSize: '16px', color: '#1f2937' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb' }}>
                  <input type="checkbox" checked={checkedList.includes(row.id)} onChange={(e) => handleRowCheck(row.id, e.target.checked)} />
                </td>
                <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>
                  <span
                    onClick={() => openDetail(row)}
                    style={{ color: '#165DFF', cursor: 'pointer' }}
                    title="查看存客详情"
                  >
                    {row.name}
                  </span>
                </td>
                <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.industry}</td>
                <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.park}</td>
                <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.newBusiness}</td>
                <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.risk}</td>
                <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>
                  <span onClick={() => openDetail(row)} style={{ marginRight: '12px', color: '#165DFF', cursor: 'pointer' }}>详情</span>
                  <span style={{ cursor: 'pointer' }}>🗑</span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={tableColumns.length + 1} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: 14, border: '1px solid #e5e7eb' }}>
                  没有符合筛选条件的客商，试试减少筛选条件
                </td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>

      {/* ===================== 存客详情（右侧抽屉，内部滚动） ===================== */}
      <RightDrawer open={detailOpen} onClose={() => setDetailOpen(false)} title="存客详情" width={720}>
        {selectedRow && <CunkeDetail row={selectedRow} />}
      </RightDrawer>
    </div>
  );
}
