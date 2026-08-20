import React, { useEffect, useMemo, useState } from 'react';
import { Sam, Cfg } from './SourceTag';
import riskData from './entOperatingRisk.json';

/* 企业档案 · 经营风险
 * 顶部横向二级 Tab（自动换行），点击将对应区块滑至屏幕中心；内容区铺陈显示全部模块（不隐藏）。
 * 数据：entOperatingRisk.json（本地样例 JSON，使用域作者维护）
 */

// 二级菜单 key → 已实现模块中文 key 映射
const KEY_MAP: Record<string, string> = {
  'debt-analysis': '债务分析', 'risk-overview': '经营风险概览', 'equity-mortgage': '股权质押',
};
const SECTIONS = ['债务分析', '经营风险概览', '股权质押'];

export default function EntOperatingRisk({ companyName, menu }: { companyName?: string; menu?: { key: string; label: string }[] }) {
  const [activeTab, setActiveTab] = useState('债务分析');
  const [loading, setLoading] = useState(true);
  const [debtCopied, setDebtCopied] = useState(false);
  const [page, setPage] = useState(1);
  const [goPage, setGoPage] = useState('');
  const [timeRange, setTimeRange] = useState<[string, string]>([riskData.riskOverview.timeRange[0], riskData.riskOverview.timeRange[1]]);
  const [blackType, setBlackType] = useState('全部类型');
  const [blackLevel, setBlackLevel] = useState('全部等级');

  const company = companyName || riskData.company;
  const debt = riskData.debt;
  const risk = riskData.riskOverview;
  const eq = riskData.equityMortgage;
  const bl = riskData.blacklist;
  const tabList = menu && menu.length > 0 ? menu : SECTIONS.map(s => ({ key: s, label: s }));

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const scrollTo = (m: string) => {
    setActiveTab(m);
    const el = document.getElementById(`section-${m}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(eq.detailCount / PAGE_SIZE));
  const currentDetails = useMemo(() => eq.details as unknown as any[], [eq]);

  const copyDebt = () => {
    setDebtCopied(true);
    setTimeout(() => setDebtCopied(false), 1500);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(riskData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company}-经营风险.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const blackRows = useMemo(() => {
    let rows = bl.rows as unknown as any[];
    if (blackType !== '全部类型') rows = rows.filter((r) => r.type.includes(blackType));
    if (blackLevel !== '全部等级') rows = rows.filter((r) => r.level === blackLevel);
    return rows;
  }, [bl, blackType, blackLevel]);

  const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#4e5969', background: '#f0f4fc', borderBottom: '1px solid #e8ebf0', whiteSpace: 'nowrap' };
  const td: React.CSSProperties = { padding: '10px 12px', fontSize: 13, color: '#333', borderBottom: '1px solid #f2f3f5' };
  // 中文模块名 → 二级菜单 key
  const CH_2_KEY: Record<string, string> = { '债务分析': 'debt-analysis', '经营风险概览': 'risk-overview', '股权质押': 'equity-mortgage' };
  const section = (m: string, content: React.ReactNode) => (
    <div id={`section-${CH_2_KEY[m] || m}`} style={{ scrollMarginTop: 140, marginBottom: 20 }}>{content}</div>
  );

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif', color: '#333' }}>
      {/* 顶部横向二级 Tab：与展开面板二级菜单数量一致，自动换行，点击滑动定位 */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '4px 2px 12px', marginBottom: 16, borderBottom: '1px solid #edf0f5' }}>
        {tabList.map((m) => (
          <button
            key={m.key}
            onClick={() => scrollTo(m.key)}
            style={{
              padding: '5px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
              border: activeTab === m.key ? '1px solid #1677ff' : '1px solid #e0e3ea',
              background: activeTab === m.key ? '#eaf2ff' : '#fff',
              color: activeTab === m.key ? '#1677ff' : '#666',
              fontWeight: activeTab === m.key ? 600 : 400,
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {loading ? <div style={{ padding: '60px 16px', textAlign: 'center', color: '#86909c', fontSize: 14, border: '1px solid #e8ebf0', borderRadius: 8, background: '#fff' }}>加载中…</div> : (
        <div>
          {/* 模块1：债务分析 */}
          {section('债务分析', (
            <div style={{ border: '1px solid #e8ebf0', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f2f3f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#1d2129' }}>债务分析 · {debt.title}</span>
                <button onClick={copyDebt} style={{ padding: '5px 14px', border: '1px solid #d9d9d9', borderRadius: 6, background: '#fff', color: '#333', fontSize: 13, cursor: 'pointer' }}>{debtCopied ? '✓ 已复制' : '复制'}</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 40, padding: 20 }}>
                <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0 }}>
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="62" fill="none" stroke="#eef1f6" strokeWidth="26" />
                    <circle cx="80" cy="80" r="62" fill="none" stroke="#1677ff" strokeWidth="26" strokeDasharray={`${2 * Math.PI * 62}`} strokeDashoffset={0} transform="rotate(-90 80 80)" />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#1677ff' }}>100.00%</span>
                    <span style={{ fontSize: 12, color: '#999' }}>融资债务</span>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  {debt.items.map((it) => (
                    <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: '#1677ff', flexShrink: 0 }} />
                      <span style={{ fontSize: 14, color: '#333' }}>{it.label}</span>
                      <span style={{ fontSize: 14, color: '#333', fontWeight: 600 }}>{it.percent}</span>
                      <span style={{ fontSize: 14, color: '#666', marginLeft: 'auto' }}>{it.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* 模块2：经营风险概览 */}
          {section('经营风险概览', (
            <div style={{ border: '1px solid #e8ebf0', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f2f3f5', fontSize: 15, fontWeight: 600, color: '#1d2129' }}>经营风险概览</div>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <span style={{ fontSize: 13, color: '#999' }}>{risk.source}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#333' }}>
                    <span>时间区间</span>
                    <input type="date" value={timeRange[0]} onChange={(e) => setTimeRange([e.target.value, timeRange[1]])} style={{ padding: '5px 8px', border: '1px solid #d9dde8', borderRadius: 6, fontSize: 13 }} />
                    <span>~</span>
                    <input type="date" value={timeRange[1]} onChange={(e) => setTimeRange([timeRange[0], e.target.value])} style={{ padding: '5px 8px', border: '1px solid #d9dde8', borderRadius: 6, fontSize: 13 }} />
                  </div>
                </div>
                <div style={{ padding: '60px 0', textAlign: 'center', color: '#86909c', fontSize: 14, background: '#fafbfc', borderRadius: 8 }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>🛡️</div>
                  {risk.empty}
                </div>
              </div>
            </div>
          ))}

          {/* 模块3：股权质押 */}
          {section('股权质押', (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 16, border: '1px solid #e8ebf0', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
                {eq.summary.map((s, i) => (
                  <div key={s.label} style={{ flex: 1, padding: '16px 12px', textAlign: 'center', borderRight: i < eq.summary.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#1677ff' }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ border: '1px solid #e8ebf0', borderRadius: 8, background: '#fff', marginBottom: 16, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #f2f3f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#1d2129' }}>股东累计质押（共{eq.shareholderAccum.length}条）</span>
                  <button onClick={exportData} style={{ padding: '5px 14px', border: '1px solid #d9d9d9', borderRadius: 6, background: '#fff', color: '#333', fontSize: 13, cursor: 'pointer' }}>下载数据</button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                    <thead><tr><th style={th}>序号</th><th style={th}>股东名称</th><th style={th}>累计质押股数</th><th style={th}>累计占持股比</th><th style={th}>累计占总股本比</th><th style={th}>最新日期</th></tr></thead>
                    <tbody>{eq.shareholderAccum.map((s, i) => (
                      <tr key={i}><td style={td}>{i + 1}</td><td style={td}>{s.name}</td><td style={td}>{s.amount}</td><td style={td}>{s.shareRatio}</td><td style={td}>{s.totalRatio}</td><td style={td}>{s.date}</td></tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
              <div style={{ border: '1px solid #e8ebf0', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #f2f3f5' }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#1d2129' }}>质押明细（共{eq.detailCount}条）</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1100 }}>
                    <thead><tr><th style={th}>序号</th><th style={th}>股东名称</th><th style={th}>本次质押股数</th><th style={th}>剩余未解押股数</th><th style={th}>占持股比</th><th style={th}>占总股本比</th><th style={th}>当前进度</th><th style={th}>更新日期</th><th style={th}>内容</th></tr></thead>
                    <tbody>{currentDetails.map((r, i) => (
                      <tr key={i}>
                        <td style={td}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                        <td style={td}>{r.name}</td>
                        <td style={td}>{r.pledgeAmount}</td>
                        <td style={td}>{r.remaining}</td>
                        <td style={td}>{r.shareRatio}</td>
                        <td style={td}>{r.totalRatio}</td>
                        <td style={td}><span style={{ padding: '2px 8px', borderRadius: 4, background: r.progress === '解押' ? '#e8f5e9' : '#eef1f6', color: r.progress === '解押' ? '#2e7d32' : '#666', fontSize: 12 }}>{r.progress}</span></td>
                        <td style={td}>{r.date}</td>
                        <td style={td}><a style={{ color: '#1677ff', cursor: 'pointer' }} onClick={() => {}}>详情</a></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: 12, color: '#999' }}>数据来源：中登公司</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#555' }}>
                    <span>共{eq.detailCount}条，{PAGE_SIZE}条/页</span>
                    <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} style={{ padding: '3px 10px', border: '1px solid #d9dde8', borderRadius: 4, background: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}>上一页</button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
                      <button key={n} onClick={() => setPage(n)} style={{ padding: '3px 9px', border: '1px solid ' + (page === n ? '#1677ff' : '#d9dde8'), borderRadius: 4, background: page === n ? '#eaf2ff' : '#fff', color: page === n ? '#1677ff' : '#555', cursor: 'pointer' }}>{n}</button>
                    ))}
                    <span>… 共{totalPages}页</span>
                    <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} style={{ padding: '3px 10px', border: '1px solid #d9dde8', borderRadius: 4, background: '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}>下一页</button>
                    <span>前往</span>
                    <input value={goPage} onChange={(e) => setGoPage(e.target.value.replace(/[^\d]/g, ''))} style={{ width: 46, padding: '3px 6px', border: '1px solid #d9dde8', borderRadius: 4, fontSize: 13 }} />
                    <button onClick={() => { const n = parseInt(goPage); if (n >= 1 && n <= totalPages) setPage(n); }} style={{ padding: '3px 10px', border: '1px solid #d9dde8', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>跳转</button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* 模块4：黑名单 */}
          {section('黑名单', (
            <div style={{ border: '1px solid #e8ebf0', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #f2f3f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#1d2129' }}>黑名单（共{bl.count}条）</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select value={blackType} onChange={(e) => setBlackType(e.target.value)} style={{ padding: '5px 8px', border: '1px solid #d9dde8', borderRadius: 6, fontSize: 13, background: '#fff' }}>
                    <option>全部类型</option><option>环保</option>
                  </select>
                  <select value={blackLevel} onChange={(e) => setBlackLevel(e.target.value)} style={{ padding: '5px 8px', border: '1px solid #d9dde8', borderRadius: 6, fontSize: 13, background: '#fff' }}>
                    <option>全部等级</option><option>市级</option>
                  </select>
                  <button onClick={exportData} style={{ padding: '5px 14px', border: '1px solid #d9d9d9', borderRadius: 6, background: '#fff', color: '#333', fontSize: 13, cursor: 'pointer' }}>下载数据</button>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1300 }}>
                  <thead><tr>
                    <th style={th}>序号</th><th style={th}>黑名单类型</th><th style={th}>黑名单名称</th><th style={th}>黑名单认定依据</th><th style={th}>认定部门</th><th style={th}>认定等级</th><th style={th}>列入日期</th><th style={th}>移出日期</th><th style={th}>内容</th><th style={th}>处罚结果</th><th style={th}>数据来源</th><th style={th}>操作</th>
                  </tr></thead>
                  <tbody>
                    {blackRows.map((r, i) => (
                      <tr key={i}>
                        <td style={td}>{i + 1}</td><td style={td}>{r.type}</td><td style={td}>{r.name}</td><td style={td}>{r.basis}</td><td style={td}>{r.dept}</td><td style={td}>{r.level}</td><td style={td}>{r.inDate}</td><td style={td}>{r.outDate}</td><td style={td}>{r.content}</td><td style={td}>{r.penalty}</td><td style={td}>{r.source}</td>
                        <td style={td}><a style={{ color: '#1677ff', cursor: 'pointer' }} onClick={() => {}}>详情</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!loading && blackRows.length === 0 && (
                  <div style={{ padding: '40px 16px', textAlign: 'center', color: '#86909c', fontSize: 14 }}>当前筛选条件下无黑名单记录</div>
                )}
              </div>
            </div>
          ))}
          {/* 未实现 children：占位区块，保证二级 tab 数量与展开面板一致 */}
          {tabList.filter(item => !KEY_MAP[item.key]).map(item => (
            <div key={item.key} id={`section-${item.key}`} style={{ scrollMarginTop: 140, marginBottom: 20, border: '1px dashed #c9cdd4', borderRadius: 8, background: '#fafbfc', padding: '40px 16px', textAlign: 'center', color: '#86909c', fontSize: 14 }}>
              「{item.label}」模块建设中
            </div>
          ))}
        </div>
      )}

      {/* 数据来源标签 */}
      <div style={{ marginTop: 16 }}>
        <Sam label="经营风险" /> <Cfg label="数据配置" />
      </div>
    </div>
  );
}
