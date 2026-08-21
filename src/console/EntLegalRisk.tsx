import React, { useEffect, useState } from 'react';
import { Sam, Cfg } from './SourceTag';
import lrData from './entLegalRisk.json';

/* 企业档案 · 司法风险
 * 顶部横向二级 Tab（自动换行），点击将对应区块滑至屏幕中心；内容区铺陈显示全部模块（不隐藏）。
 * 数据：entLegalRisk.json（本地样例 JSON，使用域作者维护）
 */

type Module = {
  key: string; title: string; count?: string; pageSize?: number;
  source?: string; filters?: string[]; columns?: string[]; rows?: string[][];
  isSummary?: boolean; summaryTexts?: string[];
  caseCols?: string[]; caseRows?: string[][]; relCols?: string[]; relRows?: string[][];
};

const ROLE_COLOR: Record<string, string> = { '原告': '#1677ff', '被告': '#f53f3f', '上诉人': '#b37feb', '被上诉人': '#00b42a', '申请人': '#f5a623', '被申请人': '#ff7d00' };

// 二级菜单 key → 已实现模块中文 key 映射（用于对齐展开面板的二级菜单数量）
const KEY_MAP: Record<string, string> = {
  'judicial-case': '司法案件', 'judgment-doc': '裁判文书', 'filing-info': '立案信息',
  'court-notice': '开庭公告', 'court-announce': '法院公告', 'service-notice': '送达公告',
};

export default function EntLegalRisk({ companyName, menu }: { companyName?: string; menu?: { key: string; label: string }[] }) {
  const [activeModule, setActiveModule] = useState('司法案件');
  const [loading, setLoading] = useState(true);

  const company = companyName || lrData.company;
  const modules = lrData.modules as unknown as Module[];
  const tabList = menu && menu.length > 0 ? menu : modules.map(m => ({ key: m.key, label: m.title }));

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const scrollTo = (key: string) => {
    setActiveModule(key);
    const el = document.getElementById(`section-${key}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(lrData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company}-司法风险.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const th: React.CSSProperties = { padding: '9px 11px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#4e5969', background: '#f0f4fc', borderBottom: '1px solid #e8ebf0', whiteSpace: 'nowrap' };
  const td: React.CSSProperties = { padding: '9px 11px', fontSize: 12, color: '#333', borderBottom: '1px solid #f2f3f5' };

  const roleCell = (cell: string) => {
    const color = ROLE_COLOR[cell];
    if (!color) return <span style={{ color: '#333' }}>{cell}</span>;
    return <span style={{ padding: '2px 8px', borderRadius: 4, background: color + '1a', color: color, fontSize: 12 }}>{cell}</span>;
  };

  // 通用表格模块渲染
  const renderTableModule = (m: Module, menuKey: string) => (
    <div id={`section-${menuKey}`} style={{ scrollMarginTop: 140, marginBottom: 20, border: '1px solid #e8ebf0', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f2f3f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#1d2129' }}>{m.title}{m.count && <span style={{ color: '#f53f3f', fontWeight: 600, marginLeft: 6 }}>({m.count})</span>}</span>
        <span style={{ fontSize: 12, color: '#999' }}>数据来源：{m.source}</span>
      </div>
      {(m.filters || []).length > 0 && (
        <div style={{ padding: '10px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid #f2f3f5' }}>
          {(m.filters || []).map((f) => <select key={f} style={{ padding: '5px 8px', border: '1px solid #d9dde8', borderRadius: 6, fontSize: 13, background: '#fff' }}><option>{f}</option></select>)}
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <div className="overflow-x-auto"><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead><tr>{(m.columns || []).map((c, ci) => <th key={ci} style={th}>{c}</th>)}</tr></thead>
          <tbody>
            {(m.rows || []).length === 0 ? (
              <tr><td colSpan={(m.columns || []).length} style={{ padding: '32px 16px', textAlign: 'center', color: '#86909c' }}>暂无数据</td></tr>
            ) : (m.rows || []).map((r, ri) => (
              <tr key={ri}><td style={td}>{ri + 1}</td>{r.map((cell, ci) => <td key={ci} style={td}>{roleCell(cell)}</td>)}</tr>
            ))}
          </tbody>
        </table></div>
      </div>
      <div style={{ padding: '10px 16px', textAlign: 'right', fontSize: 12, color: '#999' }}>共{m.count}条，10条/页</div>
    </div>
  );

  // 司法案件模块（汇总分析）渲染
  const renderSummary = (m: Module, menuKey: string) => (
    <div id={`section-${menuKey}`} style={{ scrollMarginTop: 140, marginBottom: 20, border: '1px solid #e8ebf0', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f2f3f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#1d2129' }}>司法案件<span style={{ color: '#f53f3f', fontWeight: 600, marginLeft: 6 }}>({m.count})</span></span>
        <button onClick={exportData} style={{ padding: '4px 12px', border: '1px solid #d9d9d9', borderRadius: 6, background: '#fff', color: '#333', fontSize: 13, cursor: 'pointer' }}>下载数据</button>
      </div>
      {/* 汇总分析面板 */}
      <div style={{ padding: 16, borderBottom: '1px solid #f2f3f5' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1d2129' }}>汇总统计</span>
          <select style={{ padding: '5px 8px', border: '1px solid #d9dde8', borderRadius: 6, fontSize: 13, background: '#fff' }}><option>案件身份</option></select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {(m.summaryTexts || []).map((t) => <div key={t} style={{ fontSize: 13, color: '#333' }}>{t}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 8 }}>案件身份分布</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r="42" fill="none" stroke="#eef1f6" strokeWidth="20" />
                <circle cx="55" cy="55" r="42" fill="none" stroke="#1677ff" strokeWidth="20" strokeDasharray="58 264" transform="rotate(-90 55 55)" />
                <circle cx="55" cy="55" r="42" fill="none" stroke="#f53f3f" strokeWidth="20" strokeDasharray="137 264" strokeDashoffset="-58" transform="rotate(-90 55 55)" />
                <circle cx="55" cy="55" r="42" fill="none" stroke="#f5a623" strokeWidth="20" strokeDasharray="69 264" strokeDashoffset="-195" transform="rotate(-90 55 55)" />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#666' }}>▎原告 22.05%</span>
                <span style={{ fontSize: 12, color: '#666' }}>▎被告 51.97%</span>
                <span style={{ fontSize: 12, color: '#666' }}>▎其他 25.98%</span>
              </div>
            </div>
          </div>
          <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 8 }}>案件类型分布</div>
            <svg width="100%" height="110" viewBox="0 0 200 110">
              {[['民事',60,57],['执行',30,14],['行政',20,9],['其他',15,8],['非诉保全',25,12]].map((b, i) => (
                <g key={b[0]}>
                  <rect x={10 + i * 38} y={95 - b[1]} width="26" height={b[1]} fill="#1677ff" rx="3" />
                  <text x={23 + i * 38} y={90 - b[1]} textAnchor="middle" fontSize="9" fill="#333">{b[2]}%</text>
                  <text x={23 + i * 38} y="108" textAnchor="middle" fontSize="9" fill="#999">{b[0]}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
      {/* 案件串联 */}
      <div style={{ padding: 16, borderBottom: '1px solid #f2f3f5' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 10 }}>案件串联（共{m.count}条）</div>
        <div style={{ overflowX: 'auto' }}>
          <div className="overflow-x-auto"><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead><tr>{(m.caseCols || []).map((c, ci) => <th key={ci} style={th}>{c}</th>)}</tr></thead>
            <tbody>{(m.caseRows || []).map((r, ri) => (
              <tr key={ri}><td style={td}>{ri + 1}</td>{r.map((cell, ci) => <td key={ci} style={td}>{ci === 5 ? roleCell(cell) : cell}</td>)}</tr>
            ))}</tbody>
          </table></div>
        </div>
        <div style={{ padding: '10px 0', textAlign: 'right', fontSize: 12, color: '#999' }}>共{m.count}条，10条/页</div>
      </div>
      {/* 诉讼关系 */}
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 10 }}>诉讼关系（共228条）</div>
        <div style={{ overflowX: 'auto' }}>
          <div className="overflow-x-auto"><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead><tr>{(m.relCols || []).map((c, ci) => <th key={ci} style={th}>{c}</th>)}</tr></thead>
            <tbody>{(m.relRows || []).map((r, ri) => (
              <tr key={ri}><td style={td}>{ri + 1}</td>{r.map((cell, ci) => <td key={ci} style={td}>{ci === r.length - 1 ? <a style={{ color: '#1677ff', cursor: 'pointer' }}>{cell}</a> : cell}</td>)}</tr>
            ))}</tbody>
          </table></div>
        </div>
      </div>
    </div>
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
              border: activeModule === m.key ? '1px solid #1677ff' : '1px solid #e0e3ea',
              background: activeModule === m.key ? '#eaf2ff' : '#fff',
              color: activeModule === m.key ? '#1677ff' : '#666',
              fontWeight: activeModule === m.key ? 600 : 400,
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {loading ? <div style={{ padding: '60px 16px', textAlign: 'center', color: '#86909c', fontSize: 14, border: '1px solid #e8ebf0', borderRadius: 8, background: '#fff' }}>加载中…</div> : (
        <div>
          {tabList.map((item) => {
            const mod = modules.find((x) => x.key === KEY_MAP[item.key])
            if (!mod) {
              // 未实现模块：占位区块，保证二级 tab 数量与展开面板一致
              return (
                <div key={item.key} id={`section-${item.key}`} style={{ scrollMarginTop: 140, marginBottom: 20, border: '1px dashed #c9cdd4', borderRadius: 8, background: '#fafbfc', padding: '40px 16px', textAlign: 'center', color: '#86909c', fontSize: 14 }}>
                  「{item.label}」模块建设中
                </div>
              )
            }
            return mod.isSummary ? renderSummary(mod, item.key) : renderTableModule(mod, item.key)
          })}
        </div>
      )}

      {/* 数据来源标签 */}
      <div style={{ marginTop: 16 }}>
        <Sam label="司法风险" /> <Cfg label="数据配置" />
      </div>
    </div>
  );
}
