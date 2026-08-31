import React, { useEffect, useState } from 'react';
import hiData from './entHistoryInfo.json';

/* 企业档案 · 历史信息
 * 顶部横向二级 Tab（自动换行），点击将对应区块滑至屏幕中心；内容区铺陈显示全部模块（不隐藏）。
 * 数据：entHistoryInfo.json（本地样例 JSON，使用域作者维护）
 */

type Module = {
  key: string; title: string; count?: string; pageSize?: number; subTabs?: string[];
  filters?: string[]; columns?: string[]; rows?: string[][];
  source?: string; summary?: string; chart?: boolean;
};

// 二级菜单 key → 已实现模块中文 key 映射
const KEY_MAP: Record<string, string> = {
  'history-shareholder': '股东信息', 'history-invest': '对外投资', 'history-person': '主要人员',
  'history-change': '变更记录', 'history-court': '开庭公告', 'history-executed': '被执行人',
};

export default function EntHistoryInfo({ companyName, menu }: { companyName?: string; menu?: { key: string; label: string }[] }) {
  const [activeModule, setActiveModule] = useState('股东信息');
  const [loading, setLoading] = useState(true);

  const company = companyName || hiData.company;
  const modules = hiData.modules as unknown as Module[];
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
    const blob = new Blob([JSON.stringify(hiData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company}-历史信息.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const th: React.CSSProperties = { padding: '9px 11px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#4e5969', background: '#f0f4fc', borderBottom: '1px solid #e8ebf0', whiteSpace: 'nowrap' };
  const td: React.CSSProperties = { padding: '9px 11px', fontSize: 12, color: '#333', borderBottom: '1px solid #f2f3f5' };

  const renderModule = (mod: Module, menuKey: string) => {
    const content = mod.chart ? (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 16 }}>
          <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 8 }}>资质认证类型分布</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r="42" fill="none" stroke="#eef1f6" strokeWidth="20" />
                <circle cx="55" cy="55" r="42" fill="none" stroke="#1677ff" strokeWidth="20" strokeDasharray="90 264" transform="rotate(-90 55 55)" />
                <circle cx="55" cy="55" r="42" fill="none" stroke="#00b42a" strokeWidth="20" strokeDasharray="60 264" strokeDashoffset="-90" transform="rotate(-90 55 55)" />
                <circle cx="55" cy="55" r="42" fill="none" stroke="#f5a623" strokeWidth="20" strokeDasharray="40 264" strokeDashoffset="-150" transform="rotate(-90 55 55)" />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#666' }}>▎工业产品认证</span>
                <span style={{ fontSize: 12, color: '#666' }}>▎CCC产品认证</span>
                <span style={{ fontSize: 12, color: '#666' }}>▎质量管理体系</span>
              </div>
            </div>
          </div>
          <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 8 }}>资质认证时间分布</div>
            <svg width="100%" height="90" viewBox="0 0 200 90">
              <polyline points="20,70 60,50 100,40 140,25 180,15" fill="none" stroke="#1677ff" strokeWidth="2" />
              {[[20,70],[60,50],[100,40],[140,25],[180,15]].map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#1677ff" />)}
              {['2022','2023','2024','2025','2026'].map((y, i) => <text key={y} x={[20,60,100,140,180][i]} y="85" textAnchor="middle" fontSize="9" fill="#999">{y}</text>)}
            </svg>
          </div>
        </div>
        <div style={{ overflowX: 'auto', paddingBottom: 16 }}>
          <div className="overflow-x-auto"><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
            <thead><tr>{(mod.columns || []).map((c, ci) => <th key={ci} style={th}>{c}</th>)}</tr></thead>
            <tbody>{(mod.rows || []).map((r, ri) => <tr key={ri}><td style={td}>{ri + 1}</td>{r.map((cell, ci) => <td key={ci} style={td}>{cell}</td>)}</tr>)}</tbody>
          </table></div>
        </div>
      </div>
    ) : (
      <div style={{ overflowX: 'auto' }}>
        <div className="overflow-x-auto"><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
          <thead><tr>{(mod.columns || []).map((c, ci) => <th key={ci} style={th}>{c}</th>)}</tr></thead>
          <tbody>
            {(mod.rows || []).length === 0 ? (
              <tr><td colSpan={(mod.columns || []).length} style={{ padding: '32px 16px', textAlign: 'center', color: '#86909c' }}>暂无数据</td></tr>
            ) : (mod.rows || []).map((r, ri) => (
              <tr key={ri}><td style={td}>{ri + 1}</td>{r.map((cell, ci) => <td key={ci} style={td}>{cell}</td>)}</tr>
            ))}
          </tbody>
        </table></div>
      </div>
    );

    return (
      <div id={`section-${menuKey}`} style={{ scrollMarginTop: 140, marginBottom: 20, border: '1px solid #e8ebf0', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f2f3f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#1d2129' }}>{mod.title}{mod.count && <span style={{ color: '#f53f3f', fontWeight: 600, marginLeft: 6 }}>({mod.count})</span>}</span>
          <span style={{ fontSize: 12, color: '#999' }}>{mod.source ? `数据来源：${mod.source}` : '数据来源：公开数据'}</span>
        </div>
        {mod.summary && <div style={{ padding: '12px 16px', borderBottom: '1px solid #f2f3f5', fontSize: 14, color: '#333' }}>{mod.summary}</div>}
        {(mod.subTabs || []).length > 0 && (
          <div style={{ padding: '10px 16px', display: 'flex', gap: 8, borderBottom: '1px solid #f2f3f5' }}>
            {(mod.subTabs || []).map((st) => <button key={st} style={{ padding: '4px 12px', borderRadius: 6, fontSize: 13, cursor: 'pointer', border: '1px solid #1677ff', background: '#eaf2ff', color: '#1677ff' }}>{st}</button>)}
          </div>
        )}
        {(mod.filters || []).length > 0 && (
          <div style={{ padding: '10px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid #f2f3f5' }}>
            {(mod.filters || []).map((f) => <select key={f} style={{ padding: '5px 8px', border: '1px solid #d9dde8', borderRadius: 6, fontSize: 13, background: '#fff' }}><option>{f}</option></select>)}
          </div>
        )}
        {content}
      </div>
    );
  };

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
              return (
                <div key={item.key} id={`section-${item.key}`} style={{ scrollMarginTop: 140, marginBottom: 20, border: '1px dashed #c9cdd4', borderRadius: 8, background: '#fafbfc', padding: '40px 16px', textAlign: 'center', color: '#86909c', fontSize: 14 }}>
                  「{item.label}」模块建设中
                </div>
              )
            }
            return renderModule(mod, item.key)
          })}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
      </div>
    </div>
  );
}
