import React, { useEffect, useState } from 'react';
import beneData from './entBeneficialOwner.json';

/* 企业档案 · 企业图谱 · 受益所有人（从上至下流式表格布局）
 * 数据：entBeneficialOwner.json（本地样例 JSON，使用域作者维护）
 * 结构：Tab栏 → 标题操作区 → 状态标签区 → 分类标题 → 数据表格 → 底部折叠提示栏
 */

type Row = {
  id: number; name: string; avatar: string; badge?: number;
  benefitType: string; postType: string; shareType: string;
  ratio: string; date: string; reason: string;
};

const thStyle: React.CSSProperties = {
  padding: '11px 14px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#4e5969',
  background: '#f0f4fc', borderBottom: '1px solid #e8ebf0', whiteSpace: 'nowrap',
};
const tdStyle: React.CSSProperties = {
  padding: '11px 14px', fontSize: 13, color: '#333', borderBottom: '1px solid #f2f3f5', verticalAlign: 'top',
};

export default function EntBeneficialOwner({ companyName }: { companyName?: string }) {
  const [timeWatermark, setTimeWatermark] = useState(true);
  const [help, setHelp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratioOrder, setRatioOrder] = useState<'asc' | 'desc' | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [expandedFooter, setExpandedFooter] = useState(false);

  const company = companyName || beneData.company;
  const rows = beneData.rows as unknown as Row[];
  const footerRows = beneData.footerRows as unknown as Row[];

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  // 持股比例排序
  const sortedRows = [...rows].sort((a, b) => {
    if (!ratioOrder) return 0;
    const na = parseFloat(a.ratio) || 0;
    const nb = parseFloat(b.ratio) || 0;
    return ratioOrder === 'asc' ? na - nb : nb - na;
  });

  const exportData = () => {
    const blob = new Blob([JSON.stringify(beneData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company}-受益所有人.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif', color: '#333' }}>
      {/* ============ 区块1：标题与全局操作栏 ============ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1d2129', margin: 0 }}>
            受益所有人 <span style={{ color: '#1677ff', fontWeight: 600 }}>{rows.length}</span>
          </h3>
          <span style={{ color: '#8c8c8c', cursor: 'help', position: 'relative', fontSize: 16 }} onClick={() => setHelp(!help)}>
            ⓘ
            {help && (
              <span style={{ position: 'absolute', left: 0, top: 22, width: 240, background: '#fff', border: '1px solid #e8ebf0', borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,.12)', padding: 8, fontSize: 12, color: '#555', zIndex: 20, lineHeight: 1.5 }}>
                受益所有人：最终拥有或实际控制公司/组织并享受其收益的自然人，依据法规（银发【2017】235号）识别。
              </span>
            )}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#555', cursor: 'pointer' }}>
            <span>时间水印</span>
            <span
              onClick={() => setTimeWatermark((v) => !v)}
              style={{ width: 34, height: 18, borderRadius: 10, background: timeWatermark ? '#1677ff' : '#ccc', position: 'relative', cursor: 'pointer', display: 'inline-block' }}
            >
              <span style={{ position: 'absolute', top: 2, left: timeWatermark ? 18 : 2, width: 14, height: 14, borderRadius: 7, background: '#fff', transition: 'left .2s' }} />
            </span>
          </label>
          <button onClick={exportData} style={{ padding: '5px 14px', border: '1px solid #d9d9d9', borderRadius: 6, background: '#fff', color: '#333', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            下载数据
          </button>
        </div>
      </div>

      {/* 时间水印提示条 */}
      {timeWatermark && (
        <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>数据更新时间：{beneData.updatedAt}</div>
      )}

      {/* ============ 区块2：状态标签组 ============ */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {beneData.statusTags.map((tag) => (
          <span key={tag} style={{ padding: '4px 12px', borderRadius: 12, background: '#e8f3ff', color: '#1677ff', fontSize: 12 }}>
            {tag}
          </span>
        ))}
      </div>

      {/* ============ 区块3：识别标准标题 ============ */}
      <div style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 12 }}>{beneData.sectionTitle}</div>

      {/* ============ 区块4：核心数据表格 ============ */}
      <div style={{ border: '1px solid #e8ebf0', borderRadius: 8, overflowX: 'auto' }}>
        <div className="overflow-x-auto"><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1080 }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 56 }}>序号</th>
              <th style={thStyle}>受益所有人</th>
              <th style={thStyle}>受益类型</th>
              <th style={thStyle}>任职类型</th>
              <th style={thStyle}>持股类型</th>
              <th style={{ ...thStyle, cursor: 'pointer' }} onClick={() => setRatioOrder(ratioOrder === 'asc' ? 'desc' : ratioOrder === 'desc' ? null : 'asc')}>
                持股比例 {ratioOrder === 'asc' ? '↑' : ratioOrder === 'desc' ? '↓' : '↕'}
              </th>
              <th style={thStyle}>受益所有权形成日期</th>
              <th style={thStyle}>判定原因</th>
            </tr>
          </thead>
          <tbody>
            {!loading && !error && sortedRows.map((r) => (
              <tr key={r.id} style={{ background: '#fff' }}>
                <td style={tdStyle}>{r.id}</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 30, height: 30, borderRadius: '50%', background: '#1677ff', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{r.avatar}</span>
                    <a style={{ color: '#1677ff', cursor: 'pointer' }} onClick={() => {}}>{r.name}</a>
                    <span style={{ color: '#1677ff' }}>◎</span>
                    {r.badge && <span style={{ padding: '0 6px', borderRadius: 8, background: '#e8f3ff', color: '#1677ff', fontSize: 11 }}>{r.badge}</span>}
                  </div>
                </td>
                <td style={tdStyle}>{r.benefitType}</td>
                <td style={tdStyle}>{r.postType}</td>
                <td style={tdStyle}>{r.shareType}</td>
                <td style={tdStyle}>
                  {r.ratio}
                  <span title="该比例为受益所有权核算后的最终受益比例" style={{ color: '#8c8c8c', cursor: 'help', marginLeft: 4 }}>ⓘ</span>
                </td>
                <td style={tdStyle}>{r.date}</td>
                <td style={tdStyle}>{r.reason}</td>
              </tr>
            ))}
          </tbody>
        </table></div>

        {/* 加载骨架屏 */}
        {loading && (
          <div style={{ padding: '24px 16px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ display: 'flex', gap: 16, padding: '10px 0', alignItems: 'center' }}>
                {[40, 120, 100, 90, 80, 60, 110, 200].map((w, j) => (
                  <div key={j} style={{ width: w, height: 16, borderRadius: 4, background: '#eef1f6', animation: 'benePulse 1.2s ease-in-out infinite', animationDelay: `${j * 0.1}s` }} />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* 空状态 */}
        {!loading && !error && sortedRows.length === 0 && (
          <div style={{ padding: '48px 16px', textAlign: 'center', color: '#86909c', fontSize: 14 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🗂️</div>暂无受益所有人数据
          </div>
        )}

        {/* 报错态 */}
        {!loading && error && (
          <div style={{ padding: '48px 16px', textAlign: 'center', color: '#f53f3f', fontSize: 14 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>数据加载失败：{error}
          </div>
        )}
      </div>
      <style>{`@keyframes benePulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      {/* ============ 区块5：底部折叠提示栏 ============ */}
      <div style={{ marginTop: 20, border: '1px solid #e8ebf0', borderRadius: 8, padding: '14px 16px', fontSize: 13, color: '#666' }}>
        <span>{beneData.footerTitle} 根据法规要求，已识别标准一至标准三的受益所有人信息，仍需继续展示 </span>
        <a style={{ color: '#1677ff', cursor: 'pointer' }} onClick={() => setExpandedFooter(!expandedFooter)}>
          {beneData.footerTitle} ▾
        </a>
        {expandedFooter && (
          <div style={{ marginTop: 12 }}>
            <div className="overflow-x-auto"><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1080 }}>
              <thead>
                <tr>
                  <th style={thStyle}>序号</th>
                  <th style={thStyle}>受益所有人</th>
                  <th style={thStyle}>受益类型</th>
                  <th style={thStyle}>任职类型</th>
                  <th style={thStyle}>持股类型</th>
                  <th style={thStyle}>持股比例</th>
                  <th style={thStyle}>受益所有权形成日期</th>
                  <th style={thStyle}>判定原因</th>
                </tr>
              </thead>
              <tbody>
                {footerRows.map((r) => (
                  <tr key={r.id} style={{ background: '#fff' }}>
                    <td style={tdStyle}>{r.id}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 30, height: 30, borderRadius: '50%', background: '#8c8c8c', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{r.avatar}</span>
                        <a style={{ color: '#1677ff', cursor: 'pointer' }}>{r.name}</a>
                      </div>
                    </td>
                    <td style={tdStyle}>{r.benefitType}</td>
                    <td style={tdStyle}>{r.postType}</td>
                    <td style={tdStyle}>{r.shareType}</td>
                    <td style={tdStyle}>{r.ratio}</td>
                    <td style={tdStyle}>{r.date}</td>
                    <td style={tdStyle}>{r.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
      </div>
    </div>
  );
}
