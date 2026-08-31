import React, { useEffect, useState } from 'react';
import ipData from './entIntellectualProperty.json';

/* 企业档案 · 知识产权
 * 顶部横向二级 Tab（自动换行），点击将对应区块滑至屏幕中心；内容区铺陈显示全部模块（不隐藏）。
 * 数据：entIntellectualProperty.json（本地样例 JSON，使用域作者维护）
 */

const MODULES = ['统计概览', '科研团队', '专利信息', '商标信息', '商标文书', '著作权信息', '软件著作权', '域名信息', '标准制定', '政府奖励项目', '集成电路布图'];
const RESEARCH = { count: 24643, cols: ['序号', '发明人名称', '疑似高管', '专利数量', '科研水平', '操作'], rows: [['王传福', '是', '1280', '高', '详情'], ['吕向阳', '否', '560', '中', '详情'], ['陈刚', '否', '420', '中', '详情']] };

export default function EntIntellectualProperty({ companyName }: { companyName?: string }) {
  const [activeModule, setActiveModule] = useState('统计概览');
  const [loading, setLoading] = useState(true);

  const company = companyName || ipData.company;
  const d = ipData;
  const modules = d.modules as Record<string, any>;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const scrollTo = (m: string) => {
    setActiveModule(m);
    const el = document.getElementById(`ip-${m}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(ipData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company}-知识产权.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const th: React.CSSProperties = { padding: '9px 11px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#4e5969', background: '#f0f4fc', borderBottom: '1px solid #e8ebf0', whiteSpace: 'nowrap' };
  const td: React.CSSProperties = { padding: '9px 11px', fontSize: 12, color: '#333', borderBottom: '1px solid #f2f3f5' };

  const renderTable = (cols: string[], rows: string[][], withSeq = true, minW = 800) => (
    <div style={{ overflowX: 'auto' }}>
      <div className="overflow-x-auto"><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: minW }}>
        <thead><tr>{cols.map((c, ci) => <th key={ci} style={th}>{c}</th>)}</tr></thead>
        <tbody>
          {rows.length === 0 ? <tr><td colSpan={cols.length} style={{ padding: '32px 16px', textAlign: 'center', color: '#86909c' }}>暂无数据</td></tr> : rows.map((r, ri) => (
            <tr key={ri}>
              {withSeq && <td style={td}>{ri + 1}</td>}
              {r.map((cell, ci) => <td key={ci} style={td}>{cell === '详情' || cell === '查看详情' ? <a style={{ color: '#1677ff', cursor: 'pointer' }}>{cell}</a> : cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );

  const pagination = (count: number) => (
    <div style={{ padding: '10px 16px', textAlign: 'right', fontSize: 12, color: '#999' }}>共{count}条，10条/页</div>
  );

  const header = (title: string, source?: string) => (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid #f2f3f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: '#1d2129' }}>{title}{source && <span style={{ fontSize: 12, color: '#999', fontWeight: 400, marginLeft: 8 }}>统计来源：{source}</span>}</span>
      <button onClick={exportData} style={{ padding: '4px 12px', border: '1px solid #d9d9d9', borderRadius: 6, background: '#fff', color: '#333', fontSize: 13, cursor: 'pointer' }}>下载数据</button>
    </div>
  );

  // 通用模块区块（表格 + 可选可视化）
  const renderModule = (m: string) => {
    const mod = modules[m];
    const isPatentOrTrademark = m === '专利信息' || m === '商标信息';
    return (
      <div id={`ip-${m}`} style={{ scrollMarginTop: 140, marginBottom: 20, border: '1px solid #e8ebf0', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
        {header(`${m}${isPatentOrTrademark ? '' : `（共${mod?.count}条）`}`, mod?.source)}
        {/* 可视化（专利/商标） */}
        {isPatentOrTrademark && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 16, borderBottom: '1px solid #f2f3f5' }}>
            <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 8 }}>类型分布</div>
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r="42" fill="none" stroke="#eef1f6" strokeWidth="20" />
                <circle cx="55" cy="55" r="42" fill="none" stroke="#1677ff" strokeWidth="20" strokeDasharray="180 264" transform="rotate(-90 55 55)" />
                <circle cx="55" cy="55" r="42" fill="none" stroke="#00b42a" strokeWidth="20" strokeDasharray="60 264" strokeDashoffset="-180" transform="rotate(-90 55 55)" />
                <circle cx="55" cy="55" r="42" fill="none" stroke="#f5a623" strokeWidth="20" strokeDasharray="24 264" strokeDashoffset="-240" transform="rotate(-90 55 55)" />
              </svg>
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 11, color: '#666', marginRight: 10 }}>▎发明专利</span>
                <span style={{ fontSize: 11, color: '#666', marginRight: 10 }}>▎实用新型</span>
                <span style={{ fontSize: 11, color: '#666' }}>▎外观设计</span>
              </div>
            </div>
            <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 8 }}>申请年份趋势</div>
              <svg width="100%" height="90" viewBox="0 0 240 90">
                {[['2021',40],['2022',50],['2023',60],['2024',70],['2025',80]].map((b, i) => (
                  <g key={i}><rect x={20 + i * 44} y={85 - b[1]} width="26" height={b[1]} fill="#1677ff" rx="3" /><text x={33 + i * 44} y="88" textAnchor="middle" fontSize="9" fill="#999">{b[0]}</text></g>
                ))}
              </svg>
            </div>
          </div>
        )}
        {/* 筛选 */}
        {(mod?.filters || []).length > 0 && (
          <div style={{ padding: '10px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid #f2f3f5' }}>
            {(mod.filters || []).map((f: string) => <select key={f} style={{ padding: '5px 8px', border: '1px solid #d9dde8', borderRadius: 6, fontSize: 13, background: '#fff' }}><option>{f}</option></select>)}
          </div>
        )}
        {renderTable(mod.cols, mod.rows)}
        {pagination(mod.count)}
      </div>
    );
  };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif', color: '#333' }}>
      {/* 顶部横向二级 Tab：自动换行，点击滑动定位 */}
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
      </div>

      {loading ? <div style={{ padding: '60px 16px', textAlign: 'center', color: '#86909c', fontSize: 14, border: '1px solid #e8ebf0', borderRadius: 8, background: '#fff' }}>加载中…</div> : (
        <div>
          {/* 统计概览 */}
          <div id="ip-统计概览" style={{ scrollMarginTop: 140, marginBottom: 20, border: '1px solid #e8ebf0', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
            {header('统计概览')}
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>该图表根据企业知识产权最早和最近时间的数据统计</div>
              <svg width="100%" height="220" viewBox="0 0 640 220">
                <text x="10" y="15" fontSize="12" fill="#1677ff">商标</text>
                <polyline points="20,180 100,150 180,120 260,90 340,70 420,50" fill="none" stroke="#1677ff" strokeWidth="2" />
                <text x="60" y="40" fontSize="12" fill="#b37feb">专利</text>
                <polyline points="20,160 100,130 180,100 260,60 340,40 420,25" fill="none" stroke="#b37feb" strokeWidth="2" />
                <text x="110" y="70" fontSize="12" fill="#f5a623">著作权</text>
                <polyline points="20,190 100,170 180,140 260,110 340,90 420,75" fill="none" stroke="#f5a623" strokeWidth="2" />
                <text x="160" y="100" fontSize="12" fill="#f53f3f">软著</text>
                <polyline points="20,185 100,160 180,145 260,120 340,105 420,90" fill="none" stroke="#f53f3f" strokeWidth="2" />
                <text x="210" y="130" fontSize="12" fill="#2fa8e0">域名</text>
                <polyline points="20,195 100,175 180,155 260,140 340,125 420,110" fill="none" stroke="#2fa8e0" strokeWidth="2" />
                {[1995, 2000, 2005, 2010, 2015, 2020, 2025].map((y, i) => <text key={y} x={20 + i * 60} y="215" textAnchor="middle" fontSize="10" fill="#999">{y}</text>)}
              </svg>
            </div>
          </div>

          {/* 科研团队 */}
          <div id="ip-科研团队" style={{ scrollMarginTop: 140, marginBottom: 20, border: '1px solid #e8ebf0', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
            {header(`科研团队（共${RESEARCH.count}条）`)}
            {renderTable(RESEARCH.cols, RESEARCH.rows)}
            {pagination(RESEARCH.count)}
          </div>

          {/* 专利/商标等模块铺陈 */}
          {MODULES.filter((m) => m !== '统计概览' && m !== '科研团队').map((m) => renderModule(m))}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
      </div>
    </div>
  );
}
