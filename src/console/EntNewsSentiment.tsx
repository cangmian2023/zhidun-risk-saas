import React, { useEffect, useState } from 'react';
import { Sam, Cfg } from './SourceTag';
import nsData from './entNewsSentiment.json';

/* 企业档案 · 新闻舆情（舆情概览 + 可视化图表 + 关联图谱 + 舆情动态列表 + 右侧TOP榜单）
 * 数据：entNewsSentiment.json（本地样例 JSON，使用域作者维护）
 */

const SENTI_COLOR: Record<string, string> = { '积极': '#00b42a', '中立': '#1677ff', '消极': '#f53f3f' };

export default function EntNewsSentiment({ companyName }: { companyName?: string }) {
  const [activeView, setActiveView] = useState('舆情概览');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [wcFilter, setWcFilter] = useState('全部');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [timeWatermark, setTimeWatermark] = useState(true);

  const company = companyName || nsData.company;
  const d = nsData;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(nsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company}-新闻舆情.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const th: React.CSSProperties = { padding: '9px 11px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#4e5969', background: '#f0f4fc', borderBottom: '1px solid #e8ebf0', whiteSpace: 'nowrap' };
  const td: React.CSSProperties = { padding: '9px 11px', fontSize: 12, color: '#333', borderBottom: '1px solid #f2f3f5' };

  const chartCard = (title: string, content: React.ReactNode, extra?: React.ReactNode) => (
    <div style={{ border: '1px solid #e8ebf0', borderRadius: 8, background: '#fff', marginBottom: 16, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f2f3f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1d2129' }}>{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{extra}</div>
      </div>
      <div style={{ padding: 16 }}>{content}</div>
    </div>
  );

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif', color: '#333' }}>
      {/* 顶部横向二级 Tab：自动换行，点击滑动定位 */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '4px 2px 12px', marginBottom: 16, borderBottom: '1px solid #edf0f5' }}>
        {['舆情概览', '舆情动态'].map((t) => (
          <button key={t} onClick={() => { setActiveView(t); const el = document.getElementById(`news-${t}`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} style={{
            padding: '5px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
            border: activeView === t ? '1px solid #1677ff' : '1px solid #e0e3ea',
            background: activeView === t ? '#eaf2ff' : '#fff',
            color: activeView === t ? '#1677ff' : '#666',
            fontWeight: activeView === t ? 600 : 400,
          }}>{t}</button>
        ))}
        <span style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: 12, color: '#999' }}>数据总量：{d.total}条 · 图表统计近1年数据</span>
      </div>

      {loading ? <div style={{ padding: '60px 16px', textAlign: 'center', color: '#86909c', fontSize: 14 }}>加载中…</div> : (<>
        <div id="news-舆情概览" style={{ scrollMarginTop: 140 }}>
          {/* 模块1：核心指标卡片 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{ border: '1px solid #e8ebf0', borderRadius: 8, background: '#fff', padding: '16px 20px' }}>
              <div style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>舆情月总量</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#1d2129' }}>{d.metrics.monthTotal}</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>条</div>
            </div>
            <div style={{ border: '1px solid #e8ebf0', borderRadius: 8, background: '#fff', padding: '16px 20px' }}>
              <div style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>消极舆情</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#f53f3f' }}>{d.metrics.negative}</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>条</div>
            </div>
            <div style={{ border: '1px solid #e8ebf0', borderRadius: 8, background: '#fff', padding: '16px 20px' }}>
              <div style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>同比上月</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#00b42a' }}>{d.metrics.monthChange}</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>趋势</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* 2.1 趋势折线图 */}
              {chartCard('舆情信息趋势图', (
                <div>
                  <svg width="100%" height="160" viewBox="0 0 520 160">
                    <polyline points="20,140 90,110 160,120 230,60 300,90 370,40 440,70 500,30" fill="none" stroke="#1677ff" strokeWidth="2" />
                    {[[20,140],[90,110],[160,120],[230,60],[300,90],[370,40],[440,70],[500,30]].map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#1677ff" />)}
                    <text x={10} y="155" fontSize="10" fill="#999">{d.range[0]}</text>
                    <text x={470} y="155" fontSize="10" fill="#999">{d.range[1]}</text>
                  </svg>
                  <div style={{ fontSize: 12, color: '#999' }}>X轴：{d.range[0]} ~ {d.range[1]} · Y轴：每日舆情数量</div>
                </div>
              ), <button style={{ padding: '3px 10px', border: '1px solid #d9dde8', borderRadius: 4, background: '#fff', color: '#555', fontSize: 12, cursor: 'pointer' }}>导出</button>)}

              {/* 2.2 情感属性分布 饼图 */}
              {chartCard('情感属性分布', (
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <svg width="130" height="130" viewBox="0 0 130 130">
                    <circle cx="65" cy="65" r="48" fill="none" stroke="#eef1f6" strokeWidth="26" />
                    <circle cx="65" cy="65" r="48" fill="none" stroke="#00b42a" strokeWidth="26" strokeDasharray="78 314" transform="rotate(-90 65 65)" />
                    <circle cx="65" cy="65" r="48" fill="none" stroke="#1677ff" strokeWidth="26" strokeDasharray="68 314" strokeDashoffset="-78" transform="rotate(-90 65 65)" />
                    <circle cx="65" cy="65" r="48" fill="none" stroke="#f53f3f" strokeWidth="26" strokeDasharray="13 314" strokeDashoffset="-146" transform="rotate(-90 65 65)" />
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {d.sentimentPie.map((s) => (
                      <span key={s[0]} style={{ fontSize: 12, color: '#666' }}>▎{s[0]} {s[2]}</span>
                    ))}
                  </div>
                </div>
              ), <button style={{ padding: '3px 10px', border: '1px solid #d9dde8', borderRadius: 4, background: '#fff', color: '#555', fontSize: 12, cursor: 'pointer' }}>导出</button>)}

              {/* 2.4 舆情类型分布 横向条形图 */}
              {chartCard('舆情类型分布', (
                <div>
                  {d.typeBar.map((t) => (
                    <div key={t[0]} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ width: 70, fontSize: 12, color: '#666', textAlign: 'right' }}>{t[0]}</span>
                      <div style={{ flex: 1, height: 16, background: '#f0f4fc', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${(t[1] / 24000) * 100}%`, height: '100%', background: '#1677ff' }} />
                      </div>
                      <span style={{ width: 50, fontSize: 12, color: '#333' }}>{t[1]}</span>
                    </div>
                  ))}
                </div>
              ), <button style={{ padding: '3px 10px', border: '1px solid #d9dde8', borderRadius: 4, background: '#fff', color: '#555', fontSize: 12, cursor: 'pointer' }}>导出</button>)}

              {/* 2.6 舆情权威等级 饼图 */}
              {chartCard('舆情权威等级', (
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <svg width="130" height="130" viewBox="0 0 130 130">
                    <circle cx="65" cy="65" r="48" fill="none" stroke="#eef1f6" strokeWidth="26" />
                    <circle cx="65" cy="65" r="48" fill="none" stroke="#1677ff" strokeWidth="26" strokeDasharray="72 314" transform="rotate(-90 65 65)" />
                    <circle cx="65" cy="65" r="48" fill="none" stroke="#00b42a" strokeWidth="26" strokeDasharray="150 314" strokeDashoffset="-72" transform="rotate(-90 65 65)" />
                    <circle cx="65" cy="65" r="48" fill="none" stroke="#f5a623" strokeWidth="26" strokeDasharray="66 314" strokeDashoffset="-222" transform="rotate(-90 65 65)" />
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {d.authorityPie.map((a) => <span key={a[0]} style={{ fontSize: 12, color: '#666' }}>▎{a[0]}级 {a[1]}</span>)}
                  </div>
                </div>
              ), <button style={{ padding: '3px 10px', border: '1px solid #d9dde8', borderRadius: 4, background: '#fff', color: '#555', fontSize: 12, cursor: 'pointer' }}>导出</button>)}

              {/* 2.5 舆情主题分类 饼图 */}
              {chartCard('舆情主题分类', (
                <div>
                  {d.themePie.slice(0, 6).map((t) => (
                    <div key={t[0]} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ width: 40, fontSize: 12, color: '#666' }}>{t[0]}</span>
                      <div style={{ flex: 1, height: 14, background: '#f0f4fc', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${(t[1] / 19475) * 100}%`, height: '100%', background: '#f5a623' }} />
                      </div>
                      <span style={{ width: 50, fontSize: 12, color: '#333' }}>{t[1]}</span>
                    </div>
                  ))}
                </div>
              ), <button style={{ padding: '3px 10px', border: '1px solid #d9dde8', borderRadius: 4, background: '#fff', color: '#555', fontSize: 12, cursor: 'pointer' }}>导出</button>)}

              {/* 模块3：关联舆情 关联图谱 */}
              {chartCard('关联舆情', (
                <div>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>① 相关人员</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {d.relation.persons.map((p) => (
                      <span key={p[0]} style={{ padding: '4px 10px', borderRadius: 12, background: '#e8f3ff', color: '#1677ff', fontSize: 12, cursor: 'pointer' }}>{p[0]} {p[1]} / {p[2]}</span>
                    ))}
                    <a style={{ fontSize: 12, color: '#1677ff', cursor: 'pointer', alignSelf: 'center' }}>展开 ›</a>
                  </div>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>② 相关企业</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {d.relation.companies.map((p) => (
                      <span key={p[0]} style={{ padding: '4px 10px', borderRadius: 12, background: '#e8f3ff', color: '#1677ff', fontSize: 12, cursor: 'pointer' }}>{p[0]} {p[2]}</span>
                    ))}
                    <a style={{ fontSize: 12, color: '#1677ff', cursor: 'pointer', alignSelf: 'center' }}>展开 ›</a>
                  </div>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>③ 相关组织</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {d.relation.orgs.map((p) => (
                      <span key={p[0]} style={{ padding: '4px 10px', borderRadius: 12, background: '#e8f3ff', color: '#1677ff', fontSize: 12, cursor: 'pointer' }}>{p[0]} {p[1]} / {p[2]}</span>
                    ))}
                    <a style={{ fontSize: 12, color: '#1677ff', cursor: 'pointer', alignSelf: 'center' }}>展开 ›</a>
                  </div>
                </div>
              ))}
            </div>

            {/* 右侧 TOP 榜单 */}
            <div style={{ width: 240, flexShrink: 0 }}>
              {['companies', 'orgs', 'persons'].map((k, ki) => (
                <div key={k} style={{ border: '1px solid #e8ebf0', borderRadius: 8, background: '#fff', marginBottom: 16, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 16px', borderBottom: '1px solid #f2f3f5', fontSize: 14, fontWeight: 600, color: '#1d2129' }}>
                    {k === 'companies' ? '相关企业' : k === 'orgs' ? '相关组织' : '相关人员'} TOP10
                  </div>
                  <div style={{ padding: '6px 16px' }}>
                    {d.topLists[k].map((r, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13 }}>
                        <span style={{ color: i < 3 ? '#1677ff' : '#333' }}>{i + 1}. {r[0]}</span>
                        <span style={{ color: '#999' }}>{r[1]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* 模块4：舆情动态 列表 */}
        <div id="news-舆情动态" style={{ scrollMarginTop: 140 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {['舆情分类', '情感属性', '主题分类', '媒体等级'].map((f) => <select key={f} style={{ padding: '6px 8px', border: '1px solid #d9dde8', borderRadius: 6, fontSize: 13, background: '#fff' }}><option>{f}</option></select>)}
            <button style={{ marginLeft: 'auto', padding: '5px 12px', border: '1px solid #d9d9d9', borderRadius: 6, background: '#fff', color: '#333', fontSize: 13, cursor: 'pointer' }}>合并相似</button>
            <button onClick={exportData} style={{ padding: '5px 12px', border: '1px solid #d9d9d9', borderRadius: 6, background: '#fff', color: '#333', fontSize: 13, cursor: 'pointer' }}>下载前2000条</button>
          </div>
          <div style={{ border: '1px solid #e8ebf0', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <div className="overflow-x-auto"><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                <thead><tr>{d.list.cols.map((c, ci) => <th key={ci} style={th}>{c}</th>)}</tr></thead>
                <tbody>
                  {d.list.rows.map((r, ri) => (
                    <tr key={ri}>
                      <td style={td}>{(page - 1) * 5 + ri + 1}</td>
                      {r.map((cell, ci) => (
                        <td key={ci} style={td}>
                          {ci === 2 ? <span style={{ padding: '2px 8px', borderRadius: 4, background: (SENTI_COLOR[cell] || '#999') + '1a', color: SENTI_COLOR[cell] || '#666', fontSize: 12 }}>{cell}</span>
                            : ci === 1 ? <a style={{ color: '#1677ff', cursor: 'pointer' }}>{cell}</a> : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </div>
            <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#999' }}>数据来源：新闻舆情全网监测</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#555' }}>
                <span>共{d.total}条，10条/页</span>
                <button style={{ padding: '3px 10px', border: '1px solid #d9dde8', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>上一页</button>
                <button style={{ padding: '3px 9px', border: '1px solid #1677ff', borderRadius: 4, background: '#eaf2ff', color: '#1677ff', cursor: 'pointer' }}>1</button>
                <button style={{ padding: '3px 9px', border: '1px solid #d9dde8', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>2</button>
                <button style={{ padding: '3px 10px', border: '1px solid #d9dde8', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>下一页</button>
              </div>
            </div>
          </div>
        </div>
      </>)}

      {/* 数据来源标签 */}
      <div style={{ marginTop: 16 }}>
        <Sam label="新闻舆情" /> <Cfg label="数据配置" />
      </div>
    </div>
  );
}
