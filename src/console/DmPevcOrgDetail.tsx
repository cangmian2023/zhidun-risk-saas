import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePageNav } from './pageNav';
import { PageShell } from './PageShell';

/* ============ 数据 ============ */
const ORG_INFO = {
  name: '红杉中国',
  area: '北京',
  estDate: '2005-09-01',
  website: 'https://www.hongshan.com/',
  logo: 'SEQUOIA',
  desc: '红杉中国是专注于投资科技、医疗健康、消费三大领域的私募股权投资机构，始终积极参与和推动以科技为核心的创新经济发展，努力成为各行业最早和最重要的赋能型商业伙',
};

const TABS = ['创投机构指数', '投资偏好', '投资事件 2131', '机构成员', '基金数据', '退出事件'];

/* 创投机构指数 - 维度数据 */
const INDEX_DIMENSIONS = [
  { name: '专注度', full: 100, score: 68.04, level: '优秀', desc: '专注度包括投资阶段专注度和投资领域专注度，越是专注于某一阶段或领域，说明机构投资风格越稳定，且经验充实，有成熟的方法论。' },
  { name: '资金实力', full: 100, score: 86.94, level: '顶尖', desc: '资金实力主要考量机构的投资数量和投资规模，两者越大说明机构的基础实力越强，也能一定程度的反映资本市场对其的认可。' },
  { name: '投资水平', full: 100, score: 96.57, level: '顶尖', desc: '投资水平主要考量投资项目的退出比例和独角兽企业培育数量，两者都能反映机构的判断力，数值越高代表机构的投资水平越强。' },
  { name: '团队能力', full: 100, score: 98.33, level: '顶尖', desc: '团队能力主要考量在职人员中的人才储备情况，从教育背景、就业经历、当前岗位等甄别人才，只有团队实力越强大，机构才能不断成长。' },
];

/* 投资偏好 - 词云 */
const WORD_CLOUD = [
  { text: '医疗 企业服务', size: 22, bold: true },
  { text: '人工智能', size: 18 },
  { text: '新质生产力新能源', size: 16 },
  { text: '消费', size: 15 },
  { text: '人工智能行业应用', size: 14 },
  { text: '北大系', size: 14 },
  { text: '物流运输 教育 新基建', size: 13 },
  { text: '社交与工具', size: 13 },
  { text: '汽车出行', size: 13 },
  { text: 'AI应用层 集成电路 AI基础设施', size: 13 },
  { text: '生活服务 机器人 医疗技术', size: 13 },
  { text: '百度系', size: 12 },
  { text: '人工智能基础技术 金融', size: 12 },
  { text: '电商零售 出海 工具类', size: 12 },
  { text: '大模型', size: 12 },
  { text: '体育 社交 传统行业', size: 11 },
  { text: '先进制造', size: 11 },
  { text: '大数据', size: 11 },
  { text: '房地产', size: 10 },
  { text: '信创 区块链', size: 10 },
  { text: '物联网 清华系', size: 10 },
  { text: '新一代信息技术 文娱传媒 新兴数字产业 硬科技', size: 10 },
  { text: 'AIGC 生物医药', size: 9 },
  { text: '旅游', size: 9 },
  { text: '具身智能 产业互联网 医疗器械 阿里巴巴系 AI大模型', size: 9 },
];

/* 投资阶段柱状图数据 */
const STAGE_DATA = [
  { label: '种子期', value: 140, color: '#49cc67' },
  { label: '初创期', value: 200, color: '#4088ff' },
  { label: '成长期', value: 120, color: '#9254de' },
  { label: '成熟期', value: 40, color: '#ff7a45' },
];

/* 投资战绩折线图数据 */
const LINE_YEARS = ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];
const LINE_DATASETS = [
  { label: '已投资公司被收购次数', data: [180, 190, 200, 230, 280, 380, 260, 120, 110, 240], color: '#f5222d' },
  { label: '投资次数', data: [170, 185, 195, 220, 270, 370, 250, 110, 100, 230], color: '#fa8c16' },
  { label: '投资公司数', data: [20, 30, 40, 45, 60, 70, 50, 25, 20, 40], color: '#ffd700' },
  { label: '已投资公司上市次数', data: [10, 15, 20, 22, 30, 35, 28, 12, 10, 22], color: '#36c662' },
  { label: '已投资公司获得新融资次数', data: [190, 200, 210, 240, 290, 390, 270, 130, 120, 250], color: '#1677ff' },
];

/* 投资事件 - 已公开 */
const PUBLIC_EVENTS = [
  { id: 1, company: '深圳市序影科技有限公司', round: '天使轮', date: '2026-08-21', amount: '1000万人民币', investors: '顺为资本，红杉中国' },
  { id: 2, company: '北京数美万物科技有限公司', round: 'A+轮', date: '2026-08-20', amount: '5000万美元', investors: '贝塔斯曼亚洲投资基金，华业天成，云晖资本，红杉中国，IDG资本，美团龙珠，清流资本，锦秋基金' },
  { id: 3, company: '上海觅蜂具身智能科技有限公司', round: '股权投资', date: '2026-08-17', amount: '1亿人民币', investors: '中国电信，张江集团，红杉中国，元启创新' },
  { id: 4, company: '重庆张雪机车工业有限公司', round: '股权投资', date: '2026-08-10', amount: '1.5亿人民币', investors: '红杉中国' },
  { id: 5, company: '昆山协鑫光电股份有限公司', round: 'D轮', date: '2026-08-03', amount: '1亿人民币', investors: '清控金信资本，红杉中国，翔安招商，苏州资管' },
];

/* 投资事件 - 未公开 */
const PRIVATE_EVENTS = [
  { id: 1, company: '深圳市视界之外科技有限公司', round: '股权投资', date: '2026-08-20', amount: '-', investors: '红杉中国' },
  { id: 2, company: '上海雍邑光电科技有限公司', round: '股权投资', date: '2026-08-19', amount: '-', investors: '上海科创基金，红杉中国，千乘资本' },
  { id: 3, company: '驰龙动力（深圳）有限公司', round: '股权投资', date: '2026-08-17', amount: '-', investors: '洪泰基金，深创投，红杉中国，顺为资本' },
  { id: 4, company: '武汉芯博光电有限公司', round: '股权投资', date: '2026-08-13', amount: '-', investors: '红杉中国，长飞基金，博创科技，国翼投资，长江产业集团' },
  { id: 5, company: '上海熠知电子科技有限公司', round: '股权投资', date: '2026-07-31', amount: '-', investors: '红杉中国，张江火炬创投' },
];

/* 机构成员 */
const MEMBERS = [
  { id: 1, name: '刘星', title: '合伙人', desc: '刘星，红杉资本中国合伙人。他专注于科技传媒和消费领域的投资，拥有十多年丰富的投资和银行经验。曾在美林集团担任亚洲投资银行部...' },
  { id: 2, name: '郑庆生', title: '合伙人', desc: '郑庆生，红杉资本合伙人，专注于TMT、媒体内容、电子商务和互联网医疗等领域的投资。 在加入红杉之前，郑庆生先生曾任挚信资本合伙...' },
  { id: 3, name: '周弘璟', title: '投资经理', desc: '周弘璟，红杉投资助理。' },
  { id: 4, name: '周逵', title: '合伙人', desc: '周逵，红杉中国合伙人，在2005年加入红杉之前，周逵先生任职于联想投资公司，负责投资中讯软件、深圳讯天、文思创新、开拓科技等...' },
  { id: 5, name: '李力', title: '投资经理', desc: '李力，红杉投资经理。' },
];

/* 基金数据 - 私募基金管理人 */
const FUND_MANAGERS = [
  { id: 1, name: '海宁瑞璟企业管理咨询合伙企业（有限合伙）', legal: '海宁瑞晟信息咨询有限公司', capital: '1000万元', estDate: '2025-05-19' },
  { id: 2, name: '海宁瑞晟信息咨询有限公司', legal: '周逵', capital: '1000万元', estDate: '2025-05-08' },
  { id: 3, name: '北京红杉桓瑞管理咨询有限公司', legal: '周逵', capital: '1万元', estDate: '2023-11-13' },
  { id: 4, name: '北京安杉共锦管理咨询有限责任公司', legal: '周逵', capital: '1000万元', estDate: '2023-08-02' },
  { id: 5, name: '红创科兴（宁波）科技有限公司', legal: '公元', capital: '500万元', estDate: '2022-12-01' },
];

/* 基金数据 - 管理基金 */
const MANAGED_FUNDS = [
  { id: 1, name: '杭州红杉坤泰企业管理咨询合伙企业（有限合伙）', legal: '深圳市红杉桓宇投资咨询有限公司', capital: '2000万元', estDate: '2026-08-10' },
  { id: 2, name: '杭州红杉坤曜企业管理咨询合伙企业（有限合伙）', legal: '深圳市红杉桓宇投资咨询有限公司', capital: '2000万元', estDate: '2026-08-10' },
  { id: 3, name: '杭州红杉坤曜企业管理咨询合伙企业（有限合伙）', legal: '深圳市红杉桓宇投资咨询有限公司', capital: '2000万元', estDate: '2026-08-10' },
  { id: 4, name: '杭州红杉坤泰企业管理咨询合伙企业（有限合伙）', legal: '深圳市红杉桓宇投资咨询有限公司', capital: '2000万元', estDate: '2026-08-10' },
  { id: 5, name: '北京朗恒管理咨询中心（有限合伙）', legal: '厦门红杉坤腾投资合伙企业（有限合伙）（委派）', capital: '1万元', estDate: '2026-07-27' },
];

/* 退出事件 */
const EXIT_EVENTS = [
  { id: 1, company: 'MAIA ACTIVE', method: '被收购', date: '2023-10-13', holdDays: 1936, totalInvest: '800万人民币' },
  { id: 2, company: '十月稻田', method: 'IPO', date: '2023-10-12', holdDays: 909, totalInvest: '2.9亿人民币' },
  { id: 3, company: '范式智能', method: 'IPO', date: '2023-09-28', holdDays: 2904, totalInvest: '3.91111101亿人民币' },
  { id: 4, company: '途虎养车网', method: 'IPO', date: '2023-09-26', holdDays: 1837, totalInvest: '1.4610909亿美元' },
  { id: 5, company: '右划科技、右划', method: '被收购', date: '2023-08-25', holdDays: 1721, totalInvest: '1000万美元' },
];

/* ============ 样式 ============ */
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 14 };
const thStyle: React.CSSProperties = { border: '1px solid #e5e7eb', padding: '8px 12px', textAlign: 'left', background: '#f9fafb', fontWeight: 600, color: '#333' };
const tdStyle: React.CSSProperties = { border: '1px solid #e5e7eb', padding: '8px 12px', textAlign: 'left', color: '#333' };

/* ============ 图表组件 ============ */
function RadarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const cx = 130, cy = 130, r = 100;
  const n = labels.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, val: number) => {
    const rr = (val / 100) * r;
    return [cx + rr * Math.cos(angle(i)), cy + rr * Math.sin(angle(i))];
  };
  const polygon = data.map((v, i) => point(i, v).join(',')).join(' ');
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg width={260} height={260} viewBox="0 0 260 260">
      {rings.map((ring, ri) => (
        <polygon
          key={ri}
          points={labels.map((_, i) => {
            const rr = ring * r;
            return `${cx + rr * Math.cos(angle(i))},${cy + rr * Math.sin(angle(i))}`;
          }).join(' ')}
          fill="none" stroke="#e5e7eb" strokeWidth={1}
        />
      ))}
      {labels.map((_, i) => {
        const [x, y] = point(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e5e7eb" strokeWidth={1} />;
      })}
      <polygon points={polygon} fill="rgba(22,119,255,0.2)" stroke="#1677ff" strokeWidth={2} />
      {data.map((v, i) => {
        const [x, y] = point(i, v);
        return <circle key={i} cx={x} cy={y} r={4} fill="#1677ff" />;
      })}
      {labels.map((l, i) => {
        const [x, y] = point(i, 118);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#666">
            {l}
          </text>
        );
      })}
    </svg>
  );
}

function BarChart({ data }: { data: typeof STAGE_DATA }) {
  const max = Math.max(...data.map(d => d.value));
  const chartH = 180, barW = 50, gap = 30;
  const totalW = data.length * barW + (data.length - 1) * gap;
  const startX = (460 - totalW) / 2;

  return (
    <svg width={460} height={220} viewBox="0 0 460 220">
      <line x1={20} y1={chartH} x2={440} y2={chartH} stroke="#e5e7eb" strokeWidth={1} />
      {data.map((d, i) => {
        const h = (d.value / max) * (chartH - 20);
        const x = startX + i * (barW + gap);
        const y = chartH - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} fill={d.color} rx={2} />
            <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize={11} fill="#666">{d.value}</text>
            <text x={x + barW / 2} y={chartH + 18} textAnchor="middle" fontSize={12} fill="#666">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ years, datasets }: { years: string[]; datasets: typeof LINE_DATASETS }) {
  const w = 460, h = 200, padL = 40, padR = 10, padT = 10, padB = 30;
  const chartW = w - padL - padR, chartH = h - padT - padB;
  const allVals = datasets.flatMap(d => d.data);
  const max = Math.max(...allVals);
  const xStep = chartW / (years.length - 1);

  const toPath = (data: number[]) =>
    data.map((v, i) => {
      const x = padL + i * xStep;
      const y = padT + chartH - (v / max) * chartH;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
        const y = padT + chartH - r * chartH;
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#f0f0f0" strokeWidth={1} />
            <text x={padL - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#999">{Math.round(max * r)}</text>
          </g>
        );
      })}
      {years.map((yr, i) => {
        const x = padL + i * xStep;
        return <text key={i} x={x} y={h - 8} textAnchor="middle" fontSize={10} fill="#999">{yr}</text>;
      })}
      {datasets.map((ds, i) => (
        <path key={i} d={toPath(ds.data)} fill="none" stroke={ds.color} strokeWidth={1.5} />
      ))}
    </svg>
  );
}

/* ============ 分页组件 ============ */
function Pagination({ total, pageSize = 5, totalPages }: { total: number; pageSize?: number; totalPages: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', marginTop: 10, fontSize: 13 }}>
      <span style={{ color: '#666' }}>共 {total} 条</span>
      <span style={{ color: '#666' }}>{pageSize}条/页</span>
      <button style={{ padding: '4px 8px', border: '1px solid #d9d9d9', background: '#fff', borderRadius: 2, cursor: 'pointer' }}>&lt;</button>
      <button style={{ padding: '4px 8px', border: '1px solid #1677ff', background: '#1677ff', color: '#fff', borderRadius: 2, cursor: 'pointer' }}>1</button>
      <button style={{ padding: '4px 8px', border: '1px solid #d9d9d9', background: '#fff', borderRadius: 2, cursor: 'pointer' }}>2</button>
      <button style={{ padding: '4px 8px', border: '1px solid #d9d9d9', background: '#fff', borderRadius: 2, cursor: 'pointer' }}>3</button>
      <button style={{ padding: '4px 8px', border: '1px solid #d9d9d9', background: '#fff', borderRadius: 2, cursor: 'pointer' }}>4</button>
      <span style={{ color: '#666' }}>...</span>
      <button style={{ padding: '4px 8px', border: '1px solid #d9d9d9', background: '#fff', borderRadius: 2, cursor: 'pointer' }}>{totalPages}</button>
      <button style={{ padding: '4px 8px', border: '1px solid #d9d9d9', background: '#fff', borderRadius: 2, cursor: 'pointer' }}>&gt;</button>
      <span style={{ color: '#666' }}>前往 <input type="text" style={{ width: 32, border: '1px solid #d9d9d9', padding: '2px 4px', textAlign: 'center' }} /> 页</span>
    </div>
  );
}

/* ============ 主组件 ============ */
export default function DmPevcOrgDetail() {
  const [params] = useSearchParams();
  const orgName = params.get('name') || ORG_INFO.name;
  const { back } = usePageNav();
  const [activeTab, setActiveTab] = useState(TABS[0]);

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#fff', overflow: 'auto', fontFamily: '"Microsoft Yahei", PingFang SC, sans-serif', fontSize: 14, color: '#333', paddingTop: 80, paddingLeft: 16, paddingRight: 16 }}>
      <PageShell title={orgName} crumb="数字营销 / 金融工具 / PE/VC / 投资机构详情" legend={false} onBack={() => back('/console/dm/pevc')} />

      {/* 头部基础信息 */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{orgName}</h1>
          <span style={{ color: '#666' }}>所属地：{ORG_INFO.area}</span>
          <span style={{ color: '#666' }}>成立时间：{ORG_INFO.estDate}</span>
          <a href={ORG_INFO.website} target="_blank" rel="noreferrer" style={{ color: '#1677ff', textDecoration: 'none' }}>官网：{ORG_INFO.website}</a>
        </div>
        <div style={{ marginTop: 8, color: '#555', lineHeight: 1.6 }}>
          <span style={{ fontWeight: 600 }}>{ORG_INFO.logo}</span>
          <span style={{ marginLeft: 8 }}>{ORG_INFO.desc}</span>
          <span style={{ color: '#1677ff', cursor: 'pointer', marginLeft: 4 }}>更多 &gt;</span>
        </div>
      </div>

      {/* Tab导航 */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', paddingLeft: 16 }}>
        {TABS.map(tab => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 16px',
              fontSize: 14,
              cursor: 'pointer',
              color: activeTab === tab ? '#1677ff' : '#666',
              borderBottom: activeTab === tab ? '2px solid #1677ff' : '2px solid transparent',
              fontWeight: activeTab === tab ? 500 : 400,
              marginBottom: -1,
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* ===== 创投机构指数 ===== */}
      {activeTab === TABS[0] && (
        <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 12px 0' }}>创投机构指数</h2>
          <p style={{ color: '#666', margin: '0 0 16px 0', lineHeight: 1.7 }}>
            模型采集了创投机构历史所有投资信息，从专注度、资金能力、投资水平、团队能力共计4个维度对机构的综合实力进行量化评估。<br />
            指数总分100分，分值越大代表机构综合实力越强，跟投的成功率越高。
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start' }}>
            {/* 雷达图 */}
            <div style={{ width: 260, height: 260, border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
              <RadarChart data={INDEX_DIMENSIONS.map(d => d.score)} labels={INDEX_DIMENSIONS.map(d => d.name)} />
            </div>
            {/* 综合得分 */}
            <div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>创投综合实力95.81分</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#ea580c', marginTop: 4 }}>A级 顶尖</div>
              <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>跑赢100.00%创投机构 <span style={{ cursor: 'help' }}>ⓘ</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <span style={{ fontSize: 13 }}>实力低</span>
                <div style={{ width: 160, height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: '#22c55e' }}></div>
                </div>
                <span style={{ fontSize: 13 }}>实力高</span>
              </div>
            </div>
            {/* 维度得分表格 */}
            <div style={{ flex: 1, minWidth: 450 }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>创投指数维度</th>
                    <th style={thStyle}>满分</th>
                    <th style={thStyle}>得分</th>
                    <th style={thStyle}>得分情况</th>
                  </tr>
                </thead>
                <tbody>
                  {INDEX_DIMENSIONS.map((d, i) => (
                    <tr key={i}>
                      <td style={tdStyle}>
                        <div>{d.name}</div>
                        <div style={{ fontSize: 12, color: '#999', marginTop: 4, lineHeight: 1.5 }}>{d.desc}</div>
                      </td>
                      <td style={tdStyle}>{d.full}</td>
                      <td style={tdStyle}>{d.score}</td>
                      <td style={tdStyle}>{d.level}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== 投资偏好 ===== */}
      {activeTab === TABS[1] && (
        <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 12px 0' }}>投资偏好</h2>
          {/* 投资领域词云 */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontWeight: 500, margin: '0 0 8px 0' }}>投资领域</h3>
            <div style={{ lineHeight: 2, textAlign: 'center' }}>
              {WORD_CLOUD.map((w, i) => (
                <span key={i} style={{ fontSize: w.size, fontWeight: w.bold ? 700 : 400, margin: '0 4px', color: '#333' }}>{w.text}</span>
              ))}
            </div>
          </div>
          {/* 投资阶段 + 投资战绩 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
            <div style={{ width: '48%', minWidth: 400 }}>
              <h3 style={{ fontWeight: 500, margin: '0 0 8px 0' }}>投资阶段</h3>
              <BarChart data={STAGE_DATA} />
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 4, fontSize: 12 }}>
                {STAGE_DATA.map((s, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 12, height: 12, background: s.color, display: 'inline-block' }}></span>{s.label}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ width: '48%', minWidth: 400 }}>
              <h3 style={{ fontWeight: 500, margin: '0 0 8px 0' }}>投资战绩</h3>
              <LineChart years={LINE_YEARS} datasets={LINE_DATASETS} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 4, fontSize: 12 }}>
                {LINE_DATASETS.map((ds, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: ds.color, fontWeight: 700 }}>━</span>{ds.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 投资事件 ===== */}
      {activeTab === TABS[2] && (
        <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 12px 0' }}>投资事件</h2>
          {/* 筛选栏 */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            {['融资轮次', '融资日期', '融资金额', '币种', '融资状态'].map((s, i) => (
              <select key={i} style={{ border: '1px solid #d9d9d9', padding: '4px 8px', borderRadius: 4, fontSize: 14 }}>
                <option>{s}</option>
              </select>
            ))}
            <button style={{ color: '#1677ff', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>⬇ 导出数据</button>
          </div>
          {/* 已公开事件 */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontWeight: 500, margin: '0 0 8px 0' }}>已公开事件 1655</h3>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>序号</th>
                  <th style={thStyle}>被投资企业</th>
                  <th style={thStyle}>融资轮次</th>
                  <th style={thStyle}>融资日期</th>
                  <th style={thStyle}>融资金额</th>
                  <th style={thStyle}>投资方</th>
                </tr>
              </thead>
              <tbody>
                {PUBLIC_EVENTS.map(e => (
                  <tr key={e.id}>
                    <td style={tdStyle}>{e.id}</td>
                    <td style={tdStyle}>{e.company}</td>
                    <td style={tdStyle}>{e.round}</td>
                    <td style={tdStyle}>{e.date}</td>
                    <td style={tdStyle}>{e.amount}</td>
                    <td style={tdStyle}>{e.investors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination total={1655} totalPages={331} />
          </div>
          {/* 未公开事件 */}
          <div>
            <h3 style={{ fontWeight: 500, margin: '0 0 8px 0' }}>未公开事件 476</h3>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>序号</th>
                  <th style={thStyle}>被投资企业</th>
                  <th style={thStyle}>融资轮次</th>
                  <th style={thStyle}>融资日期</th>
                  <th style={thStyle}>融资金额</th>
                  <th style={thStyle}>投资方</th>
                </tr>
              </thead>
              <tbody>
                {PRIVATE_EVENTS.map(e => (
                  <tr key={e.id}>
                    <td style={tdStyle}>{e.id}</td>
                    <td style={tdStyle}>{e.company}</td>
                    <td style={tdStyle}>{e.round}</td>
                    <td style={tdStyle}>{e.date}</td>
                    <td style={tdStyle}>{e.amount}</td>
                    <td style={tdStyle}>{e.investors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination total={476} totalPages={96} />
          </div>
        </div>
      )}

      {/* ===== 机构成员 ===== */}
      {activeTab === TABS[3] && (
        <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 12px 0' }}>机构成员 131</h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>序号</th>
                <th style={thStyle}>姓名</th>
                <th style={thStyle}>职务</th>
                <th style={thStyle}>简介</th>
              </tr>
            </thead>
            <tbody>
              {MEMBERS.map(m => (
                <tr key={m.id}>
                  <td style={tdStyle}>{m.id}</td>
                  <td style={tdStyle}>{m.name}</td>
                  <td style={tdStyle}>{m.title}</td>
                  <td style={tdStyle}>{m.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination total={131} totalPages={27} />
        </div>
      )}

      {/* ===== 基金数据 ===== */}
      {activeTab === TABS[4] && (
        <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 12px 0' }}>基金数据 1537</h2>
          {/* 私募基金管理人 */}
          <h3 style={{ fontWeight: 500, margin: '0 0 8px 0' }}>私募基金管理人 66</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>序号</th>
                <th style={thStyle}>企业名称</th>
                <th style={thStyle}>法定代表人</th>
                <th style={thStyle}>注册资本</th>
                <th style={thStyle}>成立时间</th>
              </tr>
            </thead>
            <tbody>
              {FUND_MANAGERS.map(f => (
                <tr key={f.id}>
                  <td style={tdStyle}>{f.id}</td>
                  <td style={tdStyle}>{f.name}</td>
                  <td style={tdStyle}>{f.legal}</td>
                  <td style={tdStyle}>{f.capital}</td>
                  <td style={tdStyle}>{f.estDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination total={66} totalPages={14} />

          {/* 管理基金 */}
          <h3 style={{ fontWeight: 500, margin: '24px 0 8px 0' }}>管理基金 1471</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>序号</th>
                <th style={thStyle}>企业名称</th>
                <th style={thStyle}>法定代表人</th>
                <th style={thStyle}>注册资本</th>
                <th style={thStyle}>成立时间</th>
              </tr>
            </thead>
            <tbody>
              {MANAGED_FUNDS.map(f => (
                <tr key={f.id}>
                  <td style={tdStyle}>{f.id}</td>
                  <td style={tdStyle}>{f.name}</td>
                  <td style={tdStyle}>{f.legal}</td>
                  <td style={tdStyle}>{f.capital}</td>
                  <td style={tdStyle}>{f.estDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination total={1471} totalPages={295} />
        </div>
      )}

      {/* ===== 退出事件 ===== */}
      {activeTab === TABS[5] && (
        <div style={{ padding: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 12px 0' }}>退出事件 185</h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>序号</th>
                <th style={thStyle}>融资企业（已退出）</th>
                <th style={thStyle}>退出方式</th>
                <th style={thStyle}>退出日期</th>
                <th style={thStyle}>持有天数</th>
                <th style={thStyle}>投资总额</th>
              </tr>
            </thead>
            <tbody>
              {EXIT_EVENTS.map(e => (
                <tr key={e.id}>
                  <td style={tdStyle}>{e.id}</td>
                  <td style={tdStyle}>{e.company}</td>
                  <td style={tdStyle}>{e.method}</td>
                  <td style={tdStyle}>{e.date}</td>
                  <td style={tdStyle}>{e.holdDays}</td>
                  <td style={tdStyle}>{e.totalInvest}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination total={185} totalPages={37} />
        </div>
      )}
    </div>
  );
}
