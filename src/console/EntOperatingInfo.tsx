import React, { useEffect, useState } from 'react';
import oiData from './entOperatingInfo.json';

/* 企业档案 · 经营信息
 * 顶部横向二级 Tab（自动换行），点击将对应区块滑至屏幕中心；内容区铺陈显示全部模块（不隐藏）。
 * 数据：entOperatingInfo.json（本地样例 JSON，使用域作者维护）
 */

type Module = {
  key: string; title: string; count?: string; pageSize?: number;
  filters?: string[]; columns?: string[]; rows?: string[][];
  subTables?: [string, string[], string[][]][];
  cards?: [string, string[]][]; tag?: string; checks?: string[]; radar?: string[];
};

const SPECIAL_CARD = ['行业排名'];
const SPECIAL_TAG = ['空壳指数'];
const SPECIAL_SUB = ['进出口信用'];
const SPECIAL_RADAR = ['科创评分'];

// 二级菜单 key → 已实现模块中文 key 映射
const KEY_MAP: Record<string, string> = {
  'tender': '招投标', 'financing': '融资信息', 'qualification': '资质认证', 'credit-rating': '信用评级',
  'competitor': '竞争对手', 'recruit': '招聘信息', 'import-export': '进出口信用', 'admin-license': '行政许可',
  'spot-check': '抽查信息', 'supplier': '供应商', 'customer': '客户', 'biz-coop': '合作企业',
  'credit-limit': '授信额度', 'bond-info': '债券信息', 'guarantee-info': '担保信息', 'industry-rank': '行业排名',
};

export default function EntOperatingInfo({ companyName, menu }: { companyName?: string; menu?: { key: string; label: string }[] }) {
  const [activeModule, setActiveModule] = useState('招投标');
  const [loading, setLoading] = useState(true);

  const company = companyName || oiData.company;
  const modules = oiData.modules as unknown as Module[];
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
    const blob = new Blob([JSON.stringify(oiData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company}-经营信息.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#4e5969', background: '#f0f4fc', borderBottom: '1px solid #e8ebf0', whiteSpace: 'nowrap' };
  const td: React.CSSProperties = { padding: '10px 12px', fontSize: 13, color: '#333', borderBottom: '1px solid #f2f3f5' };

  // 渲染单个模块区块
  const renderModule = (mod: Module, menuKey: string) => {
    const isCard = SPECIAL_CARD.includes(mod.key);
    const isTag = SPECIAL_TAG.includes(mod.key);
    const isRadar = SPECIAL_RADAR.includes(mod.key);
    const isSub = SPECIAL_SUB.includes(mod.key);
    const content = isCard ? (
      <div style={{ padding: 16 }}>
        {(mod.cards || []).map(([title, items]) => (
          <div key={title} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 8 }}>{title}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{items.map((it) => <span key={it} style={{ padding: '6px 14px', borderRadius: 6, background: '#f0f4fc', color: '#1677ff', fontSize: 13 }}>{it}</span>)}</div>
          </div>
        ))}
      </div>
    ) : isTag ? (
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 12 }}>空壳指数</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#2e7d32', marginBottom: 12 }}>{mod.tag}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{(mod.checks || []).map((c) => <span key={c} style={{ padding: '6px 14px', borderRadius: 6, background: '#f0f4fc', color: '#1677ff', fontSize: 13 }}>{c}</span>)}</div>
      </div>
    ) : isRadar ? (
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 12 }}>科创评分维度</div>
        {(mod.radar || []).map((r, i) => (
          <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ width: 100, fontSize: 13, color: '#333' }}>{r}</span>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#eef1f6', overflow: 'hidden' }}>
              <div style={{ width: `${85 - i * 8}%`, height: '100%', background: '#1677ff' }} />
            </div>
          </div>
        ))}
      </div>
    ) : isSub ? (
      <div style={{ padding: 16 }}>
        {(mod.subTables || []).map(([subTitle, cols, subRows], si) => (
          <div key={si} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 8 }}>{subTitle}</div>
            <div style={{ overflowX: 'auto' }}>
              <div className="overflow-x-auto"><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead><tr>{cols.map((c, ci) => <th key={ci} style={th}>{c}</th>)}</tr></thead>
                <tbody>{subRows.map((r, ri) => <tr key={ri}>{r.map((cell, ci) => <td key={ci} style={td}>{cell}</td>)}</tr>)}</tbody>
              </table></div>
            </div>
          </div>
        ))}
        {(mod.rows || []).length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <div className="overflow-x-auto"><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead><tr>{(mod.columns || []).map((c, ci) => <th key={ci} style={th}>{c}</th>)}</tr></thead>
              <tbody>{mod.rows!.map((r, ri) => <tr key={ri}>{r.map((cell, ci) => <td key={ci} style={td}>{cell}</td>)}</tr>)}</tbody>
            </table></div>
          </div>
        )}
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
          <span style={{ fontSize: 12, color: '#999' }}>数据来源：公开数据</span>
        </div>
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
