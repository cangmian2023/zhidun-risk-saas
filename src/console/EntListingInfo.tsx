import React, { useEffect, useState } from 'react';
import { Sam, Cfg } from './SourceTag';
import liData from './entListingInfo.json';

/* 企业档案 · 上市信息
 * 顶部横向二级 Tab（自动换行），点击将对应区块滑至屏幕中心；
 * 内容区铺陈显示全部 12 个模块（不隐藏）。
 * 数据：entListingInfo.json（本地样例 JSON，使用域作者维护）
 */

const MODULES = ['股票信息', '企业概况', '发行股票', '企业公告', '主要股东', '股本信息', '企业高管', '员工构成', '财务数据', '分红情况', '增发情况', '对外担保'];

export default function EntListingInfo({ companyName }: { companyName?: string }) {
  const [activeModule, setActiveModule] = useState('股票信息');
  const [loading, setLoading] = useState(true);

  const company = companyName || liData.company;
  const d = liData;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(liData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company}-上市信息.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 二级 tab 点击：滑动到对应区块，使其位于屏幕中心
  const scrollTo = (m: string) => {
    setActiveModule(m);
    const el = document.getElementById(`listing-${m}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const th: React.CSSProperties = { padding: '9px 11px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#4e5969', background: '#f0f4fc', borderBottom: '1px solid #e8ebf0', whiteSpace: 'nowrap' };
  const td: React.CSSProperties = { padding: '9px 11px', fontSize: 12, color: '#333', borderBottom: '1px solid #f2f3f5' };
  const formLbl: React.CSSProperties = { width: 120, color: '#999', fontSize: 13, padding: '10px 12px', background: '#fafbfc' };
  const formVal: React.CSSProperties = { fontSize: 13, color: '#333', padding: '10px 12px' };

  const renderTable = (cols: string[], rows: string[][], withSeq?: boolean, minW = 700) => (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: minW }}>
        <thead><tr>{cols.map((c, ci) => <th key={ci} style={th}>{c}</th>)}</tr></thead>
        <tbody>
          {rows.length === 0 ? <tr><td colSpan={cols.length} style={{ padding: '32px 16px', textAlign: 'center', color: '#86909c' }}>暂无数据</td></tr> : rows.map((r, ri) => (
            <tr key={ri}>
              {withSeq && <td style={td}>{ri + 1}</td>}
              {r.map((cell, ci) => <td key={ci} style={td}>{cell === '查看简历' || cell === '查看' || cell === '详情' ? <a style={{ color: '#1677ff', cursor: 'pointer' }}>{cell}</a> : cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderForm = (rows: string[][]) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #f0f0f0' }}>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((cell, j) => (
              <React.Fragment key={j}>
                <td style={formLbl}>{cell}</td>
                {j + 1 < r.length && <td style={formVal}>{r[j + 1]}</td>}
              </React.Fragment>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  // 模块区块包装：带锚点 id，便于滚动定位
  const section = (m: string, content: React.ReactNode) => (
    <div id={`listing-${m}`} style={{ scrollMarginTop: 140, marginBottom: 20, border: '1px solid #e8ebf0', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f2f3f5', fontSize: 15, fontWeight: 600, color: '#1d2129' }}>{m}</div>
      {content}
    </div>
  );

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif', color: '#333' }}>
      {/* 顶部横向二级 Tab：自动换行 */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '4px 2px 12px', marginBottom: 16, borderBottom: '1px solid #edf0f5' }}>
        {MODULES.map((m) => (
          <button
            key={m}
            onClick={() => scrollTo(m)}
            style={{
              padding: '5px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
              border: activeModule === m ? '1px solid #1677ff' : '1px solid #e0e3ea',
              background: activeModule === m ? '#eaf2ff' : '#fff',
              color: activeModule === m ? '#1677ff' : '#666',
              fontWeight: activeModule === m ? 600 : 400,
            }}
          >
            {m}
          </button>
        ))}
        <button onClick={exportData} style={{ marginLeft: 'auto', padding: '5px 12px', border: '1px solid #d9d9d9', borderRadius: 6, background: '#fff', color: '#333', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          下载数据
        </button>
      </div>

      {loading ? <div style={{ padding: '60px 16px', textAlign: 'center', color: '#86909c', fontSize: 14, border: '1px solid #e8ebf0', borderRadius: 8, background: '#fff' }}>加载中…</div> : (
        <div>
          {/* 模块1：股票信息 */}
          {section('股票信息', (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid #f2f3f5' }}>
                <span style={{ fontSize: 13, color: '#1677ff' }}>{d.stock.code} {d.stock.name}</span>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: '#999' }}>更新日期：{d.stock.updateDate}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>
                {d.stock.rows.map((r, i) => (
                  <div key={i} style={{ borderBottom: '1px solid #f7f8fa', borderRight: (i % 3) !== 2 ? '1px solid #f0f0f0' : 'none', padding: '14px 16px' }}>
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>{r[0]}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#1d2129' }}>{r[1]}</div>
                    {r[2] && <div style={{ fontSize: 12, color: '#f53f3f', marginTop: 4 }}>{r[2]}</div>}
                    {r[3] && <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{r[3]}</div>}
                  </div>
                ))}
              </div>
              <div style={{ padding: 12, fontSize: 12, color: '#1677ff', cursor: 'pointer' }}>历史行情K线 &gt;</div>
            </div>
          ))}

          {/* 模块2：企业概况 */}
          {section('企业概况', (
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 8 }}>基础信息</div>
              {renderForm(d.profile.basic)}
              <div style={{ fontSize: 14, fontWeight: 600, color: '#333', margin: '16px 0 8px' }}>公司简介</div>
              <div style={{ fontSize: 13, color: '#666', lineHeight: 1.8 }}>{d.profile.intro}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#333', margin: '16px 0 8px' }}>联系方式</div>
              {renderForm(d.profile.contact)}
            </div>
          ))}

          {/* 模块3：发行股票 */}
          {section('发行股票', (
            <div style={{ padding: 16 }}>{renderForm(d.issue)}</div>
          ))}

          {/* 模块4：企业公告 */}
          {section('企业公告', (
            <div>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f2f3f5', display: 'flex', gap: 8 }}>
                <select style={{ padding: '5px 8px', border: '1px solid #d9dde8', borderRadius: 6, fontSize: 13 }}><option>请选择公告类型</option></select>
              </div>
              <div style={{ padding: 16 }}>
                {d.announcement.rows.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f7f8fa' }}>
                    <a style={{ color: '#1677ff', cursor: 'pointer', fontSize: 13 }}>{r[0]}</a>
                    <span style={{ fontSize: 12, color: '#999' }}>{r[1]}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, fontSize: 13, color: '#555' }}>
                <span>共{d.announcement.count}条，5条/页</span>
                <button style={{ padding: '3px 10px', border: '1px solid #d9dde8', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>上一页</button>
                <button style={{ padding: '3px 9px', border: '1px solid #1677ff', borderRadius: 4, background: '#eaf2ff', color: '#1677ff', cursor: 'pointer' }}>1</button>
                <button style={{ padding: '3px 9px', border: '1px solid #d9dde8', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>2</button>
                <button style={{ padding: '3px 10px', border: '1px solid #d9dde8', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>下一页</button>
              </div>
            </div>
          ))}

          {/* 模块5：主要股东 */}
          {section('主要股东', (
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 8 }}>股东人数统计</div>
              {renderTable(d.shareholders.countTable.cols, d.shareholders.countTable.rows)}
              <div style={{ fontSize: 14, fontWeight: 600, color: '#333', margin: '16px 0 8px' }}>十大流通股东</div>
              <div style={{ marginBottom: 8 }}><select style={{ padding: '5px 8px', border: '1px solid #d9dde8', borderRadius: 6, fontSize: 13 }}><option>2026-03-31</option></select></div>
              {renderTable(d.shareholders.topFlow.cols, d.shareholders.topFlow.rows, true, 800)}
              <div style={{ fontSize: 14, fontWeight: 600, color: '#333', margin: '16px 0 8px' }}>十大股东</div>
              <div style={{ marginBottom: 8 }}><select style={{ padding: '5px 8px', border: '1px solid #d9dde8', borderRadius: 6, fontSize: 13 }}><option>2026-03-31</option></select></div>
              {renderTable(d.shareholders.top.cols, d.shareholders.top.rows, true, 800)}
            </div>
          ))}

          {/* 模块6：股本信息 */}
          {section('股本信息', (
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 8 }}>股本结构</div>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 16 }}>
                <svg width="130" height="130" viewBox="0 0 130 130">
                  <circle cx="65" cy="65" r="50" fill="none" stroke="#eef1f6" strokeWidth="26" />
                  <circle cx="65" cy="65" r="50" fill="none" stroke="#1677ff" strokeWidth="26" strokeDasharray="88 314" transform="rotate(-90 65 65)" />
                  <circle cx="65" cy="65" r="50" fill="none" stroke="#00b42a" strokeWidth="26" strokeDasharray="58 314" strokeDashoffset="-88" transform="rotate(-90 65 65)" />
                  <circle cx="65" cy="65" r="50" fill="none" stroke="#f5a623" strokeWidth="26" strokeDasharray="14 314" strokeDashoffset="-146" transform="rotate(-90 65 65)" />
                  <circle cx="65" cy="65" r="50" fill="none" stroke="#ff7d00" strokeWidth="26" strokeDasharray="12 314" strokeDashoffset="-160" transform="rotate(-90 65 65)" />
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#666' }}>▎已上市流通A股 55.2%</span>
                  <span style={{ fontSize: 12, color: '#666' }}>▎已上市流通H股 36.6%</span>
                  <span style={{ fontSize: 12, color: '#666' }}>▎其他流通股份 4.5%</span>
                  <span style={{ fontSize: 12, color: '#666' }}>▎未流通股份 3.7%</span>
                </div>
              </div>
              {renderTable(d.capital.pieCols, d.capital.pieRows, true, 500)}
              <div style={{ fontSize: 14, fontWeight: 600, color: '#333', margin: '16px 0 8px' }}>股本变动</div>
              <svg width="100%" height="90" viewBox="0 0 240 90">
                {[['2023',50,30],['2024',70,45],['2025',90,60]].map((b, i) => (
                  <g key={i}>
                    <rect x={30 + i * 70} y={85 - b[1]} width="22" height={b[1]} fill="#1677ff" rx="3" />
                    <rect x={56 + i * 70} y={85 - b[2]} width="22" height={b[2]} fill="#00b42a" rx="3" />
                    <text x={41 + i * 70} y={88} textAnchor="middle" fontSize="9" fill="#999">{b[0]}</text>
                  </g>
                ))}
              </svg>
              {renderTable(d.capital.changeCols, d.capital.changeRows, true, 800)}
            </div>
          ))}

          {/* 模块7：企业高管 */}
          {section('企业高管', (
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 8 }}>高管信息列表</div>
              {renderTable(d.executives.listCols, d.executives.listRows, true, 900)}
              <div style={{ fontSize: 14, fontWeight: 600, color: '#333', margin: '16px 0 8px' }}>高管持股</div>
              {renderTable(d.executives.holdCols, d.executives.holdRows, true, 1300)}
              <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, fontSize: 13, color: '#555' }}>
                <span>共{d.executives.holdCount}条，5条/页</span>
                <button style={{ padding: '3px 10px', border: '1px solid #d9dde8', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>上一页</button>
                <button style={{ padding: '3px 9px', border: '1px solid #1677ff', borderRadius: 4, background: '#eaf2ff', color: '#1677ff', cursor: 'pointer' }}>1</button>
                <button style={{ padding: '3px 10px', border: '1px solid #d9dde8', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>下一页</button>
              </div>
            </div>
          ))}

          {/* 模块8：员工构成 */}
          {section('员工构成', (
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 8 }}>员工学历构成</div>
              <svg width="100%" height="90" viewBox="0 0 260 90">
                {[['博士',10,8],['硕士',50,40],['本科',80,75],['大专',45,40],['中专',30,25]].map((b, i) => (
                  <g key={i}>
                    <rect x={20 + i * 48} y={85 - b[1]} width="18" height={b[1]} fill="#1677ff" rx="3" />
                    <rect x={40 + i * 48} y={85 - b[2]} width="18" height={b[2]} fill="#00b42a" rx="3" />
                    <text x={39 + i * 48} y={88} textAnchor="middle" fontSize="9" fill="#999">{b[0]}</text>
                  </g>
                ))}
              </svg>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#333', margin: '16px 0 8px' }}>员工专业构成趋势</div>
              <svg width="100%" height="90" viewBox="0 0 260 90">
                <polyline points="20,70 100,40 180,20" fill="none" stroke="#1677ff" strokeWidth="2" />
                <polyline points="20,75 100,55 180,45" fill="none" stroke="#00b42a" strokeWidth="2" />
                {[20,100,180].map((x, i) => <text key={i} x={x} y="85" textAnchor="middle" fontSize="9" fill="#999">{['2023','2024','2025'][i]}</text>)}
              </svg>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#333', margin: '12px 0 8px' }}>员工构成统计</div>
              {renderTable(d.staff.profCols, d.staff.profRows, true, 800)}
              <div style={{ marginTop: 8 }}>{renderTable(d.staff.eduCols, d.staff.eduRows, true, 600)}</div>
            </div>
          ))}

          {/* 模块9：财务数据 */}
          {section('财务数据', (
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>基本每股收益</span>
                <div style={{ display: 'flex', border: '1px solid #d9dde8', borderRadius: 6, overflow: 'hidden' }}>
                  <button style={{ padding: '4px 12px', border: 'none', background: '#1677ff', color: '#fff', fontSize: 12, cursor: 'pointer' }}>按报告期</button>
                  <button style={{ padding: '4px 12px', border: 'none', background: '#fff', color: '#666', fontSize: 12, cursor: 'pointer' }}>按年度</button>
                </div>
              </div>
              <svg width="100%" height="90" viewBox="0 0 260 90">
                {[['2024',35],['2025',55],['2026',70]].map((b, i) => (
                  <g key={i}><rect x={60 + i * 60} y={85 - b[1]} width="30" height={b[1]} fill="#1677ff" rx="3" /><text x={75 + i * 60} y={88} textAnchor="middle" fontSize="9" fill="#999">{b[0]}</text></g>
                ))}
              </svg>
              {renderTable(d.finance.epsCols, d.finance.epsRows, true, 1100)}
              <div style={{ fontSize: 14, fontWeight: 600, color: '#333', margin: '16px 0 8px' }}>利润表</div>
              {renderTable(d.finance.incomeCols, d.finance.incomeRows, true, 1800)}
              <div style={{ fontSize: 14, fontWeight: 600, color: '#333', margin: '16px 0 8px' }}>资产负债表</div>
              {renderTable(d.finance.balanceCols, d.finance.balanceRows, true, 1600)}
              <div style={{ fontSize: 14, fontWeight: 600, color: '#333', margin: '16px 0 8px' }}>现金流量表</div>
              {renderTable(d.finance.cashCols, d.finance.cashRows, true, 1100)}
            </div>
          ))}

          {/* 模块10：分红情况 */}
          {section('分红情况', (
            <div style={{ padding: 16 }}>{renderTable(d.dividend.cols, d.dividend.rows, true, 1000)}</div>
          ))}

          {/* 模块11：增发情况 */}
          {section('增发情况', (
            <div style={{ padding: 16 }}>{renderTable(d.increase.cols, d.increase.rows, true, 1200)}</div>
          ))}

          {/* 模块12：对外担保 */}
          {section('对外担保', (
            <div style={{ padding: 16 }}>{renderTable(d.guarantee.cols, d.guarantee.rows, true, 1100)}</div>
          ))}
        </div>
      )}

      {/* 数据来源标签 */}
      <div style={{ marginTop: 16 }}>
        <Sam label="上市信息" /> <Cfg label="数据配置" />
      </div>
    </div>
  );
}
