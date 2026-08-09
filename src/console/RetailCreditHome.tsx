// 零售信贷风控 · 首页（需求14 重构）
// 定位：子系统落地页（cr:overview）—— 搜索直达单客详情 / 快捷入口 / 核心概要数据
// 设计语言：科技 · 简洁 · 数据 · 算法（本地样例 JSON 驱动，三色标签标注来源）
import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuIcon, type IconName } from '../components/icons';
import { Sam, Cal, SourceTagLegend } from './SourceTag';
import { useMidCustomers, useMidAlerts } from './midStore';
import { useCollection } from './collectionData';
import { useFlows } from './flowStore';

type Cust = ReturnType<typeof useMidCustomers>[number];

const QUICK: { key: string; label: string; desc: string; icon: IconName; param?: string }[] = [
  { key: 'cr:mid-alert-workbench', label: '预警工作台', desc: '红黄灯预警任务队列', icon: 'zoom' },
  { key: 'cr:mid-td1', label: '贷中监控大盘', desc: '红黄灯综合预警信号总览', icon: 'chart' },
  { key: 'cr:mid-td2', label: '风险监测', desc: '分场景分产品监测', icon: 'monitor' },
  { key: 'cr:mid-td3', label: '红黄灯预警中心', desc: '预警信号作业台', icon: 'bell' },
  { key: 'cr:mid-td4', label: '持续性周期监测', desc: '周期监测评估趋势', icon: 'trend' },
  { key: 'cr:mid-td5', label: '存量客群运营', desc: '客群运营场景', icon: 'flag' },
  { key: 'cr:pre-report', label: '进件审核', desc: '信审决策报告', icon: 'report' },
  { key: 'cr:pre-verify', label: '信息核验', desc: '基本信息真实性核验', icon: 'filter' },
];

// 智能风控引擎管线（算法链路可视化）
const PIPELINE = ['信息核验', '信用风控', '欺诈识别', '决策引擎'];

export default function RetailCreditHome() {
  const nav = useNavigate();
  const customers = useMidCustomers();
  const alerts = useMidAlerts();
  const collection = useCollection();
  const flows = useFlows();

  const [q, setQ] = useState('');
  const [focus, setFocus] = useState(false);

  const cases = collection.cases ?? [];

  // 概要数据（实时计算 · 灰）
  const total = customers.length;
  const high = customers.filter((c) => c.riskLevel === '高风险').length;
  const mid = customers.filter((c) => c.riskLevel === '中风险').length;
  const low = customers.filter((c) => c.riskLevel === '低风险').length;
  const red = alerts.filter((a) => a.level === 'RED').length;
  const yellow = alerts.filter((a) => a.level === 'YELLOW').length;
  const overdue = cases.reduce((s, c) => s + (c.overdueAmt ?? 0), 0);
  const m3 = cases.filter((c) => c.stage === 'M3+').length;

  const highP = total ? Math.round((high / total) * 100) : 0;
  const midP = total ? Math.round((mid / total) * 100) : 0;
  const lowP = total ? 100 - highP - midP : 0;

  // 搜索：按客户名 / 客户号匹配（样例 JSON · 橘）
  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [] as Cust[];
    return customers
      .filter((c) => c.name.toLowerCase().includes(t) || c.custId.toLowerCase().includes(t))
      .slice(0, 8);
  }, [q, customers]);

  const goKey = (key: string, param?: string) => {
    nav(param ? `/console/${key}?${param}` : `/console/${key}`);
    setFocus(false);
  };
  const goCust = (custId: string) => {
    nav(`/console/cr/mid-cust-detail?cust=${custId}`);
    setQ(''); setFocus(false);
  };
  const onEnter = () => {
    if (matches.length >= 1) goCust(matches[0].custId);
  };

  const metric = (label: string, value: string, sub: string, accent: string, tag: ReactNode) => (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: 14, padding: '16px 18px', background: '#fff' }}>
      <div style={{ fontSize: 12, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>{label}{tag}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: accent, marginTop: 6, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>{sub}</div>
    </div>
  );

  return (
    <div style={{ padding: 24, maxWidth: 1180, margin: '0 auto' }}>
      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, padding: '30px 32px', background: 'linear-gradient(135deg, #EEF4FF 0%, #F8FAFF 60%, #FFFFFF 100%)', border: '1px solid #E5E7EB' }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,.10), transparent 70%)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: '#2563EB', fontWeight: 600 }}>RETAIL CREDIT RISK CONTROL</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', margin: '6px 0 4px' }}>零售信贷风控中枢</h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {['科技', '数据', '算法', '敏捷'].map((t) => (
              <span key={t} style={{ fontSize: 12, color: '#2563EB', background: '#DBEAFE', borderRadius: 999, padding: '2px 10px', fontWeight: 500 }}>{t}</span>
            ))}
          </div>

          {/* 搜索直达单客详情 */}
          <div style={{ position: 'relative', maxWidth: 560 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #CBD5E1', borderRadius: 12, padding: '12px 14px', boxShadow: '0 1px 2px rgba(0,0,0,.04)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setFocus(true); }}
                onFocus={() => setFocus(true)}
                onBlur={() => setTimeout(() => setFocus(false), 150)}
                onKeyDown={(e) => { if (e.key === 'Enter') onEnter(); }}
                placeholder="搜索客户姓名 / 客户号，直达单客 360 视图"
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#0F172A', background: 'transparent' }}
              />
              <span style={{ fontSize: 11, color: '#94A3B8' }}>回车直达</span>
            </div>
            {focus && matches.length > 0 && (
              <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(100% + 6px)', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, boxShadow: '0 12px 28px rgba(0,0,0,.12)', overflow: 'hidden', zIndex: 50 }}>
                {matches.map((c) => (
                  <div
                    key={c.custId}
                    onMouseDown={() => goCust(c.custId)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #F1F5F9' }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>{c.custId} · {c.product}</div>
                    </div>
                    <span style={{ fontSize: 11, color: c.riskLevel === '高风险' ? '#DC2626' : c.riskLevel === '中风险' ? '#D97706' : '#059669', fontWeight: 600, whiteSpace: 'nowrap' }}>{c.riskLevel}</span>
                  </div>
                ))}
              </div>
            )}
            {focus && q.trim() && matches.length === 0 && (
              <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(100% + 6px)', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '12px 14px', fontSize: 12, color: '#94A3B8', boxShadow: '0 12px 28px rgba(0,0,0,.12)', zIndex: 50 }}>
                未匹配到客户（共 {total} 个样例客户）
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 概要数据 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 14, margin: '18px 0' }}>
        {metric('存量客户', String(total), '本地样例客户总数', '#0F172A', <Sam label="客户样例" />)}
        {metric('红色预警', String(red), `黄色 ${yellow} ｜ 实时红黄灯信号`, '#DC2626', <Cal label="实时统计" />)}
        {metric('逾期金额', `¥${overdue.toLocaleString()}`, `M3+ 案件 ${m3} 笔`, '#D97706', <Sam label="催收样例" />)}
        {metric('业务流程', String(flows.length), '可配置审核/监控流程', '#2563EB', <Cal label="配置驱动" />)}
      </div>

      {/* 快捷入口 + 智能风控引擎 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, alignItems: 'start' }}>
        {/* 快捷入口 */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: 16, padding: 18, background: '#fff' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>快捷入口</div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 14 }}>一键直达核心作业与监控页面</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 12 }}>
            {QUICK.map((it) => (
              <button
                key={it.key}
                onClick={() => goKey(it.key, it.param)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', padding: '12px 14px', borderRadius: 12, border: '1px solid #EEF2F7', background: '#FAFBFE', cursor: 'pointer', transition: 'all .12s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#93C5FD'; e.currentTarget.style.background = '#EFF6FF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EEF2F7'; e.currentTarget.style.background = '#FAFBFE'; }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#EFF4FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MenuIcon name={it.icon} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{it.label}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.desc}</div>
                </div>
              </button>
            ))}
            {customers[0] && (
              <button
                onClick={() => goCust(customers[0].custId)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', padding: '12px 14px', borderRadius: 12, border: '1px solid #EEF2F7', background: '#FAFBFE', cursor: 'pointer', transition: 'all .12s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#93C5FD'; e.currentTarget.style.background = '#EFF6FF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EEF2F7'; e.currentTarget.style.background = '#FAFBFE'; }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MenuIcon name="monitor" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>单客视图（示例）</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>{customers[0].name} · 360 档案</div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* 智能风控引擎 + 风险分布 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ border: '1px solid #E5E7EB', borderRadius: 16, padding: 18, background: '#fff' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>智能风控引擎</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 14 }}>算法驱动的四段式决策链路</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {PIPELINE.map((p, i) => (
                <div key={p} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ flex: 1, borderRadius: 10, padding: '10px 8px', textAlign: 'center', background: i === PIPELINE.length - 1 ? '#0F172A' : '#EFF4FF', color: i === PIPELINE.length - 1 ? '#fff' : '#1D4ED8' }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{p}</div>
                  </div>
                  {i < PIPELINE.length - 1 && <span style={{ color: '#CBD5E1', fontSize: 16 }}>›</span>}
                </div>
              ))}
            </div>
          </div>

          <div style={{ border: '1px solid #E5E7EB', borderRadius: 16, padding: 18, background: '#fff' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>客户风险分布</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 14 }}>存量客户风险等级占比</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ width: 116, height: 116, borderRadius: '50%', flexShrink: 0, background: `conic-gradient(#DC2626 0% ${highP}%, #D97706 ${highP}% ${highP + midP}%, #059669 ${highP + midP}% 100%)` }}>
                <div style={{ width: 76, height: 76, borderRadius: '50%', background: '#fff', margin: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>{total}</div>
                  <div style={{ fontSize: 10, color: '#94A3B8' }}>客户</div>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { l: '高风险', v: high, p: highP, c: '#DC2626' },
                  { l: '中风险', v: mid, p: midP, c: '#D97706' },
                  { l: '低风险', v: low, p: lowP, c: '#059669' },
                ].map((r) => (
                  <div key={r.l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 2, background: r.c, flexShrink: 0 }} />
                    <span style={{ color: '#334155', width: 48 }}>{r.l}</span>
                    <span style={{ color: '#94A3B8', width: 40 }}>{r.v} 户</span>
                    <span style={{ color: '#64748B', fontWeight: 600 }}>{r.p}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <SourceTagLegend />
      </div>
    </div>
  );
}
