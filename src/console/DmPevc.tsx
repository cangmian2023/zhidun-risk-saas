import React, { useState } from 'react';
import { usePageNav } from './pageNav';

// ====================== 基础Tab配置 ======================
const tabList = [
  '投融资事件',
  '投资机构',
  '投资机构基金列表',
];

// ====================== Tab1：投融资事件 数据 ======================
const financeEventFilterList = [
  '行业领域',
  '最新轮次',
  '融资时间',
  '投资机构所在地',
];
const financeTableColumns = [
  '序号',
  '品牌名称',
  '融资时间',
  '融资轮次',
  '融资金额',
  '行业领域',
  '被投企业所在地',
  '投资方',
];
const financeTableData = [
  {
    index: 1,
    brandName: '绿控传动\n新能源商用车驱动系统解决方案提供商',
    financeDate: '2026-08-20',
    round: 'IPO',
    amount: '58090万元',
    industry: '',
    addr: '江苏省苏州市吴江区',
    investor: '和高资本 B级 深圳',
  },
  {
    index: 2,
    brandName: 'Habit@栖息地\n智能住宅品牌',
    financeDate: '2026-08-20',
    round: 'A轮',
    amount: '70000万元',
    industry: '',
    addr: '北京市顺义区',
    investor: '常高新集团 A级 常州、理想汽车 B级 北京、石头世纪 B级 北京',
  },
  {
    index: 3,
    brandName: '钛动科技\nAI出海营销解决方案提供商',
    financeDate: '2026-08-20',
    round: '股权投资',
    amount: '未披露',
    industry: '',
    addr: '广东省广州市天河区',
    investor: '福建纵横网络有限公司 B级 福州、钟鼎资本 A级 上海',
  },
  {
    index: 4,
    brandName: '延锋汽饰\n汽车内饰件及座舱系统制造商',
    financeDate: '2026-08-20',
    round: '被收购',
    amount: '11200万元',
    industry: '',
    addr: '辽宁省沈阳市大东区',
    investor: '-',
  },
  {
    index: 5,
    brandName: '怀业信息\n视频云交换与专网通信解决方案提供商',
    financeDate: '2026-08-20',
    round: '股权投资',
    amount: '1000万元',
    industry: '-',
    addr: '江苏省常州市新北区',
    investor: '弘辉控股 B级 常州、招才投资 C级 上海、江苏高投 B级 江苏',
  },
  {
    index: 6,
    brandName: 'Flip\n原生AI员工体验平台',
    financeDate: '2026-08-20',
    round: 'B+轮',
    amount: '未披露',
    industry: '-',
    addr: '-',
    investor: '8VC C级 美国、Alumni Ventures Group美国、Citi Impact Fund其他…展开 &darr;',
  },
  {
    index: 7,
    brandName: '翼龙航空\n战术无人机综合解决方案供应商',
    financeDate: '2026-08-20',
    round: '天使轮',
    amount: '1000万元',
    industry: '-',
    addr: '广东省东莞市',
    investor: '-',
  },
  {
    index: 8,
    brandName: '仁迈生物\n全血/末梢血精准检测平台研发',
    financeDate: '2026-08-20',
    round: 'C轮',
    amount: '未披露',
    industry: '',
    addr: '江苏省南京市栖霞区',
    investor: '远毅资本 A级 北京',
  },
];

// ====================== Tab2：投资机构 数据 ======================
const investOrgFilterList = [
  '投资机构所在地',
  '主投领域',
  '投资',
  '综合实力'
];
const investOrgData = [
  {
    logo: "SEQUOIA",
    name: "红杉中国",
    tag: "顶尖：A级 指数95.80分",
    createDate: "2005-09-01",
    area: "北京",
    investCount: "2219起",
    mainField: "房地产、区块链、芯片、体育、智能硬件、产业互联网、AI大模型、新能源、AI基础设施、新兴数字产业、生活服务、先进制造、出海、社交、电商零售、生物医药、物联网、消费、AI应用层、人工智能、人工智能基础技术、工具类、文娱传媒、大模型、旅游、新一代信息技术、医疗器械、清华系、金融、医疗技术、新基建、AIGC、传统行业、汽车出行、人工智能行业应用、新质生产力、大数据、医疗、具身智能、机器人、百度系、物流运输、集成电路、北大系、企业服务、社交与工具、信创、教育、硬科技、阿里巴巴系"
  },
  {
    logo: "Y",
    name: "Y Combinator",
    tag: "优秀：B级 指数67.75分",
    createDate: "2005-03-01",
    area: "美国",
    investCount: "2170起",
    mainField: "AI工具、房地产、区块链、体育、智能硬件、产业互联网、医疗信息化、新能源、AI基础设施、新兴数字产业、支付、生活服务、先进制造、解决方案提供商、社交、电商零售、人力资源、消费、人工智能、人工智能基础技术、工具类、文娱传媒、API、旅游、新一代信息技术、金融、金融科技、新基建、AIGC、农业、传统行业、汽车出行、垂直SaaS、智能医疗、人工智能行业应用、新质生产力、电子商务、大数据、医疗、企业管理软件、开发者服务、机器人、物流运输、企业通用服务、企业服务、机器学习、社交与工具、信创、教育、硬科技"
  },
  {
    logo: "深创投Logo",
    name: "深创投",
    tag: "顶尖：A级 指数95.56分",
    createDate: "1999-01-01",
    area: "深圳",
    investCount: "2158起",
    mainField: "传统制造、芯片、IoT、智能硬件、产业互联网、新能源、AI基础设施、新兴数字产业、生活服务、先进制造、物流运输、出海、电商零售、生物医药、物联网、消费、人工智能、人工智能基础技术、文娱传媒、公用事业、旅游、新一代信息技术、医疗器械、清华系、金融、原材料、化学工业、新基建、光学光电、农业、传统行业、汽车出行、传感器、新质生产力、新材料、石油矿采、通信业务、大数据、医疗、机器人、工业信息化、卡脖子技术、医疗技术、集成电路、企业服务、垂直行业信息化、信创、教育、硬科技、高端装备制造"
  },
  {
    logo: "南京市创新投资集团Logo",
    name: "南京市创新投资集团",
    tag: "顶尖：A级 指数84.44分",
    createDate: "2018-05-29",
    area: "南京",
    investCount: "2085起",
    mainField: "房地产、广告营销、传统制造、软件开发、芯片、体育、IoT、智能硬件、产业互联网、新能源、企业IT服务、生活服务、先进制造、社交、电商零售、生物医药、物联网、消费、人工智能、信息技术、文娱传媒、公用事业、广告设计、旅游、新一代信息技术、医疗器械、金融、原材料、电子商务、新基建、农业、传统行业、公共事业、新兴数字产业、汽车出行、新质生产力、建筑业、通信业务、大数据、医疗、环保行业、机器人、集成电路、企业通用服务、建筑工程、企业服务、信创、教育、硬科技、高端装备制造"
  }
]

// ====================== Tab3：投资机构基金列表 数据 ======================
const fundFilterTopList = [
  '投资机构所在地',
  '主投领域',
  '投资',
  '综合实力'
];
const fundFilterOtherList = [
  '基金企业所在地',
  '被投企业所在地'
];
// 非私募基金表格
const nonPrivateFundColumns = [
  '序号',
  '基金名称（企业主体）',
  '所属投资机构名称',
  '基金所在地',
  '机构下基金和项目',
  '基金投资企业',
  '成立日期',
  'amac备案日期',
  '操作'
]
const nonPrivateFundData = [
  { index:1, fundName:"赣 赣州西域洵美创业投资合伙企业（有限...", orgName:"西域投资 B级 广东", fundAddr:"江西赣州章贡区", orgFundProject:"1家企业", investEnt:"1", createDate:"2019-08-27", amacDate:"-", operate:"基金投" },
  { index:2, fundName:"赣 赣州西域洵美创业投资合伙企业（有限...", orgName:"西域投资 B级 广东", fundAddr:"江西赣州章贡区", orgFundProject:"1家企业", investEnt:"1", createDate:"2019-08-27", amacDate:"-", operate:"基金投" },
  { index:3, fundName:"赣 赣州西域洵美创业投资合伙企业（有限...", orgName:"西域投资 B级 广东", fundAddr:"江西赣州章贡区", orgFundProject:"1家企业", investEnt:"1", createDate:"2019-08-27", amacDate:"-", operate:"基金投" },
  { index:4, fundName:"深 深圳市碧桂融鑫投资管理有限公司", orgName:"碧桂园融鑫 B级 深圳", fundAddr:"广东深圳南山区", orgFundProject:"3个基金 10家企业", investEnt:"89", createDate:"2014-04-21", amacDate:"-", operate:"基金投" },
  { index:5, fundName:"深 深圳市碧桂融鑫投资管理有限公司", orgName:"碧桂园融鑫 B级 深圳", fundAddr:"广东深圳南山区", orgFundProject:"3个基金 10家企业", investEnt:"89", createDate:"2014-04-21", amacDate:"-", operate:"基金投" },
  { index:6, fundName:"深 深圳市碧桂融鑫投资管理有限公司", orgName:"碧桂园融鑫 B级 深圳", fundAddr:"广东深圳南山区", orgFundProject:"3个基金 10家企业", investEnt:"88", createDate:"2014-04-21", amacDate:"-", operate:"基金投" },
  { index:7, fundName:"天 天津天宝创业投资有限公司", orgName:"天宝基金天津", fundAddr:"天津东丽区", orgFundProject:"3个基金 12家企业", investEnt:"14", createDate:"2004-08-09", amacDate:"-", operate:"基金投" },
  { index:8, fundName:"天 天津天宝创业投资有限公司", orgName:"天津纺织集团 C级 天津", fundAddr:"天津东丽区", orgFundProject:"3个基金 12家企业", investEnt:"14", createDate:"2004-08-09", amacDate:"-", operate:"基金投" },
  { index:9, fundName:"天 天津天宝创业投资有限公司", orgName:"天津纺织集团 C级 天津", fundAddr:"天津东丽区", orgFundProject:"3个基金 12家企业", investEnt:"14", createDate:"2004-08-09", amacDate:"-", operate:"基金投" },
  { index:10, fundName:"📜 上海丰实股权投资管理有限公司", orgName:"丰实资本 A级 上海", fundAddr:"上海浦东新区", orgFundProject:"23个基金 7家企业", investEnt:"72", createDate:"2013-06-20", amacDate:"-", operate:"基金投" },
]
// 私募基金表格
const privateFundColumns = [
  '序号',
  '基金名称（企业主体）',
  '基金编号',
  '所属投资机构名称',
  '基金投资企业',
  'amac备案日期',
  '基金管理人',
  '管理类型',
  '运作状态'
]
const privateFundData = [
  { index:1, fundName:"泉 泉州澹朴创业投资合伙企业...", fundCode:"SACJ20", orgName:"澹复投资 B级 北京", investEnt:"4", amacDate:"2023-11-03", manager:"北 北京澹复投资管理中心（...", manageType:"创业投资基金", runStatus:"正在运作" },
  { index:2, fundName:"泉 泉州澹朴创业投资合伙企业...", fundCode:"SACJ20", orgName:"澹复投资 B级 北京", investEnt:"4", amacDate:"2023-11-03", manager:"北 北京澹复投资管理中心（...", manageType:"创业投资基金", runStatus:"正在运作" },
  { index:3, fundName:"泉 泉州澹朴创业投资合伙企业...", fundCode:"SACJ20", orgName:"澹复投资 B级 北京", investEnt:"4", amacDate:"2023-11-03", manager:"北 北京澹复投资管理中心（...", manageType:"创业投资基金", runStatus:"正在运作" },
  { index:4, fundName:"青 青岛信石十六号投资合伙...", fundCode:"SZU078", orgName:"汇智点石 B级 北京", investEnt:"1", amacDate:"2023-04-20", manager:"北 北京汇智点石投资管理有...", manageType:"股权投资基金", runStatus:"正在运作" },
  { index:5, fundName:"青 青岛信石十六号投资合伙...", fundCode:"SZU078", orgName:"汇智点石 B级 北京", investEnt:"1", amacDate:"2023-04-20", manager:"北 北京汇智点石投资管理有...", manageType:"股权投资基金", runStatus:"正在运作" },
  { index:6, fundName:"青 青岛信石十六号投资合伙...", fundCode:"SZU078", orgName:"汇智点石 B级 北京", investEnt:"1", amacDate:"2023-04-20", manager:"北 北京汇智点石投资管理有...", manageType:"股权投资基金", runStatus:"正在运作" },
  { index:7, fundName:"赣 赣州西域德纯创业投资合...", fundCode:"SQK248", orgName:"西域投资 B级 广东", investEnt:"2", amacDate:"2021-05-19", manager:"广 广州西域股权投资管理中...", manageType:"股权投资基金", runStatus:"正在运作" },
  { index:8, fundName:"深 深圳天鹏一号创业投资合...", fundCode:"SQK241", orgName:"嘉腾股权 C级 广州", investEnt:"1", amacDate:"2021-05-07", manager:"广 广州嘉腾股权投资有限公司", manageType:"创业投资基金", runStatus:"正在运作" },
  { index:9, fundName:"赣 赣州西域德纯创业投资合...", fundCode:"SQK248", orgName:"西域投资 B级 广东", investEnt:"2", amacDate:"2021-05-19", manager:"广 广州西域股权投资管理中...", manageType:"股权投资基金", runStatus:"正在运作" },
]

export default function FinanceInvestTable() {
  const [activeTab, setActiveTab] = useState(tabList[0]);
  const [checkedRows, setCheckedRows] = useState<number[]>([]);
  const { goDetail } = usePageNav();

  // 筛选状态：key 为筛选项名称
  const [financeFilters, setFinanceFilters] = useState<Record<string, string>>({});
  const [orgFilters, setOrgFilters] = useState<Record<string, string>>({});

  // 从投资方串中提取所在地（如「和高资本 B级 深圳」→「深圳」）
  const extractInvestorArea = (s: string): string => {
    const m = s.match(/(?:A级|B级|C级|其他)\s*([^\s、]+)/);
    return m ? m[1] : '';
  };

  // 投融资事件 筛选后数据
  const financeFiltered = financeTableData.filter(row => {
    for (const [label, val] of Object.entries(financeFilters)) {
      if (!val) continue;
      if (label === '行业领域' && row.industry !== val) return false;
      if (label === '最新轮次' && row.round !== val) return false;
      if (label === '融资时间' && row.financeDate !== val) return false;
      if (label === '投资机构所在地' && !extractInvestorArea(row.investor).includes(val)) return false;
    }
    return true;
  });

  // 投资机构 筛选后数据
  const orgFiltered = investOrgData.filter(org => {
    for (const [label, val] of Object.entries(orgFilters)) {
      if (!val) continue;
      if (label === '投资机构所在地' && org.area !== val) return false;
      if (label === '主投领域' && !org.mainField.includes(val)) return false;
      if (label === '投资' && !org.investCount.includes(val)) return false;
      if (label === '综合实力' && !org.tag.includes(val)) return false;
    }
    return true;
  });

  // 各筛选下拉选项
  const financeFilterOptions: Record<string, string[]> = {
    '行业领域': [...new Set(financeTableData.map(r => r.industry).filter(Boolean))],
    '最新轮次': [...new Set(financeTableData.map(r => r.round))],
    '融资时间': [...new Set(financeTableData.map(r => r.financeDate))],
    '投资机构所在地': [...new Set(financeTableData.map(r => extractInvestorArea(r.investor)).filter(Boolean))],
  };
  const orgFilterOptions: Record<string, string[]> = {
    '投资机构所在地': [...new Set(investOrgData.map(o => o.area))],
    '综合实力': [...new Set(investOrgData.map(o => o.tag.split('：')[0]))],
  };
  const orgFilterIsSelect = (label: string) => ['投资机构所在地', '综合实力'].includes(label);

  // 全选
  const handleCheckAll = (e: React.ChangeEvent<HTMLInputElement>, dataList: {index:number}[]) => {
    if (e.target.checked) {
      setCheckedRows(dataList.map(item => item.index));
    } else {
      setCheckedRows([]);
    }
  };
  // 单行勾选
  const handleRowCheck = (idx: number, checked: boolean) => {
    if (checked) {
      setCheckedRows([...checkedRows, idx]);
    } else {
      setCheckedRows(checkedRows.filter(v => v !== idx));
    }
  };

  // ====================== Tab 渲染函数 ======================
  // Tab1 投融资事件
  const renderFinanceEventTab = () => {
    return (
      <>
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex' }}>
            <input
              placeholder="请输入机构/基金名称/基金管理人"
              style={{
                width: '450px',
                padding: '12px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px 0 0 6px',
                fontSize: '14px',
                backgroundColor: '#f7f8fc',
              }}
            />
            <button
              style={{
                padding: '12px 24px',
                backgroundColor: '#f5b82e',
                border: 'none',
                borderRadius: '0 6px 6px 0',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Q 查询
            </button>
          </div>
        </div>
        <div style={{ padding: '0 20px 16px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ fontSize: '16px', fontWeight: 500, color: '#1f2937' }}>投融资筛选</span>
          {financeEventFilterList.map(item => (
            <select
              key={item}
              value={financeFilters[item] || ''}
              onChange={(e) => setFinanceFilters({ ...financeFilters, [item]: e.target.value })}
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px', color: '#374151', backgroundColor: '#fff' }}
            >
              <option value="">{item}</option>
              {(financeFilterOptions[item] || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ))}
        </div>
        <div style={{ padding: '0 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '17px', fontWeight: 500, color: '#1f2937' }}>融资事件</span>
          <button style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' }}>
            🗂 营销 &darr;
          </button>
        </div>
        <div style={{ padding: '0 20px' }}>
          <div className="overflow-x-auto"><table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '12px 8px', textAlign: 'left', border: '1px solid #e5e7eb', width: '40px' }}>
                  <input type="checkbox" onChange={(e)=>handleCheckAll(e, financeFiltered)} checked={checkedRows.length === financeFiltered.length && financeFiltered.length > 0} />
                </th>
                {financeTableColumns.map(col => (
                  <th key={col} style={{ padding: '12px 8px', textAlign: 'left', border: '1px solid #e5e7eb', fontSize: '15px', color: '#1f2937' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {financeFiltered.map(row => (
                <tr key={row.index}>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb' }}>
                    <input
                      type="checkbox"
                      checked={checkedRows.includes(row.index)}
                      onChange={(e) => handleRowCheck(row.index, e.target.checked)}
                    />
                  </td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.index}</td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px', whiteSpace: 'pre-line', color: '#2563eb', cursor: 'pointer' }} onClick={() => goDetail('/console/dm/ent-archive-basic', { name: row.brandName.split('\n')[0] })}>{row.brandName}</td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.financeDate}</td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.round}</td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.amount}</td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.industry}</td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.addr}</td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.investor}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      </>
    )
  }

  // Tab2 投资机构
  const renderInvestOrgTab = () => {
    return (
      <>
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex' }}>
            <input
              placeholder="请输入投资机构名称"
              style={{
                width: '450px',
                padding: '12px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px 0 0 6px',
                fontSize: '14px',
                backgroundColor: '#f7f8fc',
              }}
            />
            <button
              style={{
                padding: '12px 24px',
                backgroundColor: '#f5b82e',
                border: 'none',
                borderRadius: '0 6px 6px 0',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Q 查询
            </button>
          </div>
        </div>
        <div style={{ padding: '0 20px 16px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ fontSize: '16px', fontWeight: 500, color: '#1f2937' }}>投资机构筛选</span>
          {investOrgFilterList.map(item => (
            orgFilterIsSelect(item) ? (
              <select
                key={item}
                value={orgFilters[item] || ''}
                onChange={(e) => setOrgFilters({ ...orgFilters, [item]: e.target.value })}
                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px', color: '#374151', backgroundColor: '#fff' }}
              >
                <option value="">{item}</option>
                {(orgFilterOptions[item] || []).map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                key={item}
                placeholder={item}
                value={orgFilters[item] || ''}
                onChange={(e) => setOrgFilters({ ...orgFilters, [item]: e.target.value })}
                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px', color: '#374151', width: '140px' }}
              />
            )
          ))}
        </div>
        <div style={{ padding: '0 20px 12px', display: 'flex', alignItems: 'center' }}>
          <input type="checkbox" style={{marginRight: '8px'}}/>
          <span style={{ fontSize: '15px', color: '#4b5563' }}>找到30000条相关结果</span>
        </div>
        <div style={{ padding: '0 20px' }}>
          {orgFiltered.map((org, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '12px', padding: '16px 0', borderBottom: '1px solid #eee' }}>
              <input type="checkbox" style={{marginTop: '4px'}}/>
              <div style={{width: '60px', height: '60px', flexShrink: 0}}>
                <div style={{width:'100%',height:'100%'}}>{org.logo}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px'}}>
                  <span style={{fontSize: '18px', fontWeight: 600, color: '#2563eb', cursor: 'pointer'}} onClick={() => goDetail('/console/dm/pevc-org-detail', { name: org.name })}>{org.name}</span>
                  <span style={{padding:'2px 6px',background:'#eefdf2',color:'#16a34a',borderRadius:'4px',fontSize:'13px'}}>{org.tag}</span>
                </div>
                <div style={{fontSize:'15px',color:'#333',marginBottom:'6px'}}>
                  成立日期：{org.createDate}
                  <span style={{margin:'0 16px'}}>地区：{org.area}</span>
                  <span>投资事件：{org.investCount}</span>
                </div>
                <div style={{fontSize:'14px',color:'#444',lineHeight:'1.6'}}>
                  主投领域：{org.mainField}
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }

  // Tab3 投资机构基金列表
  const renderFundListTab = () => {
    return (
      <>
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex' }}>
            <input
              placeholder="请输入机构/基金名称"
              style={{
                width: '450px',
                padding: '12px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px 0 0 6px',
                fontSize: '14px',
                backgroundColor: '#f7f8fc',
              }}
            />
            <button
              style={{
                padding: '12px 24px',
                backgroundColor: '#f5b82e',
                border: 'none',
                borderRadius: '0 6px 6px 0',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Q 查询
            </button>
          </div>
        </div>
        {/* 筛选栏 */}
        <div style={{ padding: '0 20px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom:'12px' }}>
            <span style={{ fontSize: '16px', fontWeight: 500, color: '#1f2937' }}>投融资</span>
            {fundFilterTopList.map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', fontSize: '15px', color: '#374151' }}>
                <span>{item}</span>
                <span style={{ marginLeft: '4px' }}>&darr;</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <span style={{ fontSize: '15px', color: '#374151' }}>其他</span>
            {fundFilterOtherList.map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', fontSize: '15px', color: '#374151' }}>
                <span>{item}</span>
                <span style={{ marginLeft: '4px' }}>&darr;</span>
              </div>
            ))}
          </div>
        </div>

        {/* 第一块：投资机构非私募基金 */}
        <div style={{ padding: '0 20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', margin:'12px 0'}}>
            <div>
              <span style={{fontSize: '17px', fontWeight: 500, color: '#1f2937'}}>投资机构非私募基金</span>
              <span style={{color:'#2563eb', margin:'0 6px'}}>432994</span>
              <span style={{fontSize:14, color:'#6b7280'}}>注:统计数据和实际条数可能存在偏差</span>
            </div>
            <button style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' }}>
              🗂 营销 &darr;
            </button>
          </div>
          <div className="overflow-x-auto"><table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '12px 8px', textAlign: 'left', border: '1px solid #e5e7eb', width: '40px' }}>
                  <input type="checkbox" />
                </th>
                {nonPrivateFundColumns.map(col => (
                  <th key={col} style={{ padding: '12px 8px', textAlign: 'left', border: '1px solid #e5e7eb', fontSize: '15px', color: '#1f2937' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nonPrivateFundData.map(row => (
                <tr key={row.index}>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb' }}>
                    <input type="checkbox" />
                  </td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.index}</td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px', color:"#2563eb" }}>{row.fundName}</td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.orgName}</td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.fundAddr}</td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.orgFundProject}</td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.investEnt}</td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.createDate}</td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.amacDate}</td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px', color:"#2563eb" }}>{row.operate}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
          {/* 分页 */}
          <div style={{display:'flex', justifyContent:'flex-end', alignItems:'center', gap:'8px', padding:'12px 0'}}>
            <span>共 432994 条</span>
            <select style={{padding:'4px'}}>
              <option>10条/页</option>
            </select>
            <button style={{padding:'4px 8px'}}>&lt;</button>
            <button style={{padding:'4px 8px', background:'#f5b82e', border:'none', borderRadius:'4px'}}>1</button>
            <button style={{padding:'4px 8px'}}>2</button>
            <button style={{padding:'4px 8px'}}>3</button>
            <button style={{padding:'4px 8px'}}>4</button>
            <button style={{padding:'4px 8px'}}>5</button>
            <button style={{padding:'4px 8px'}}>6</button>
            <span>...</span>
            <button style={{padding:'4px 8px'}}>300</button>
            <button style={{padding:'4px 8px'}}>&gt;</button>
            <span>前往</span>
            <input style={{width:'40px',padding:'4px'}} value={1}/>
            <span>页</span>
          </div>
        </div>

        {/* 第二块：私募基金 */}
        <div style={{ padding: '0 20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', margin:'12px 0'}}>
            <div>
              <span style={{fontSize: '17px', fontWeight: 500, color: '#1f2937'}}>私募基金</span>
              <span style={{color:'#2563eb', margin:'0 6px'}}>248998</span>
              <span style={{fontSize:14, color:'#6b7280'}}>注:统计数据和实际条数可能存在偏差</span>
            </div>
          </div>
          <div className="overflow-x-auto"><table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '12px 8px', textAlign: 'left', border: '1px solid #e5e7eb', width: '40px' }}>
                  <input type="checkbox" />
                </th>
                {privateFundColumns.map(col => (
                  <th key={col} style={{ padding: '12px 8px', textAlign: 'left', border: '1px solid #e5e7eb', fontSize: '15px', color: '#1f2937' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {privateFundData.map(row => (
                <tr key={row.index}>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb' }}>
                    <input type="checkbox" />
                  </td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.index}</td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px', color:"#2563eb" }}>{row.fundName}</td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.fundCode}</td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.orgName}</td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.investEnt}</td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.amacDate}</td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px', color:"#2563eb" }}>{row.manager}</td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.manageType}</td>
                  <td style={{ padding: '12px 8px', border: '1px solid #e5e7eb', fontSize: '15px' }}>{row.runStatus}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      </>
    )
  }

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: '#ffffff', overflow: 'auto' }}>
      {/* 顶部Tab栏 */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
        {tabList.map(tab => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              color: activeTab === tab ? '#1f2937' : '#6b7280',
              borderBottom: activeTab === tab ? '2px solid #f59e0b' : '2px solid transparent',
              fontWeight: activeTab === tab ? 500 : 400,
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Tab内容切换渲染 */}
      {activeTab === '投融资事件' && renderFinanceEventTab()}
      {activeTab === '投资机构' && renderInvestOrgTab()}
      {activeTab === '投资机构基金列表' && renderFundListTab()}
    </div>
  );
}