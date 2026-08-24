// 零售信贷风控 · 首页（需求14 重构 / 需求18 优化）
// 定位：子系统落地页（cr:overview）—— 搜索直达单客详情 / 高级搜索 / 快捷入口 / 核心概要数据
// 设计语言：科技 · 简洁 · 数据 · 算法（本地样例 JSON 驱动，三色标签标注来源）
import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageNav } from './pageNav';
import { MenuIcon, type IconName } from '../components/icons';
import { SingleSelect } from '../components/ui';
import { Sam, Cal, SourceTagLegend } from './SourceTag';
import { useMidCustomers, useMidAlerts } from './midStore';
import { useCollection } from './collectionData';
import { useFlows } from './flowStore';

type Cust = ReturnType<typeof useMidCustomers>[number];

type QuickItem = { key: string; label: string; desc: string; icon: IconName };

// 快捷入口按「贷前审核 / 贷中监控」分组（icon 与左侧菜单 MENU_ICON 保持一致）
const QUICK_GROUPS: { title: string; items: QuickItem[] }[] = [
  {
    title: '贷前审核',
    items: [
      { key: 'cr:pre-report', label: '进件审核', desc: '信审决策报告', icon: 'report' },
      { key: 'cr:pre-verify', label: '信息核验', desc: '基本信息真实性核验', icon: 'verify' },
      { key: 'cr:credit-kimi', label: '信用风控', desc: '信用风险评估报告', icon: 'shield' },
      { key: 'cr:pre-fraud', label: '欺诈识别', desc: '欺诈风险识别报告', icon: 'alert' },
    ],
  },
  {
    title: '贷中监控',
    items: [
      { key: 'cr:mid-alert-workbench', label: '预警工作台', desc: '红黄灯预警任务队列', icon: 'zoom' },
      { key: 'cr:mid-td1', label: '贷中监控大盘', desc: '红黄灯综合预警信号总览', icon: 'grid' },
      { key: 'cr:mid-td2', label: '风险监测', desc: '分场景分产品监测', icon: 'monitor' },
      { key: 'cr:mid-td3', label: '红黄灯预警中心', desc: '预警信号作业台', icon: 'bell' },
      { key: 'cr:mid-td4', label: '持续性周期监测', desc: '周期监测评估趋势', icon: 'trend' },
      { key: 'cr:mid-td5', label: '存量客群运营', desc: '客群运营场景', icon: 'flag' },
    ],
  },
];

export default function RetailCreditHome() {
  const nav = useNavigate();
  const { goDetail } = usePageNav();
  const customers = useMidCustomers();
  const alerts = useMidAlerts();
  const collection = useCollection();
  const flows = useFlows();

  const [q, setQ] = useState('');
  const [focus, setFocus] = useState(false);
  const [advOpen, setAdvOpen] = useState(false);

  const cases = collection.cases ?? [];

  // 概要数据（实时计算 · 灰）
  const total = customers.length;
  const red = alerts.filter((a) => a.level === 'RED').length;
  const yellow = alerts.filter((a) => a.level === 'YELLOW').length;
  const overdue = cases.reduce((s, c) => s + (c.overdueAmt ?? 0), 0);
  const m3 = cases.filter((c) => c.stage === 'M3+').length;
  // 需求18.3：业务流程统计值由「流程总数」改为「已上线流程数」
  const onlineFlows = flows.filter((f) => f.flowState === '已上线').length;

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [] as Cust[];
    return customers
      .filter((c) => c.name.toLowerCase().includes(t) || c.custId.toLowerCase().includes(t))
      .slice(0, 8);
  }, [q, customers]);

  // 高级搜索（需求18.1）
  const [advName, setAdvName] = useState('');
  const [advLevel, setAdvLevel] = useState('');
  const [advProduct, setAdvProduct] = useState('');
  const products = useMemo(
    () => Array.from(new Set(customers.map((c) => c.product).filter(Boolean))),
    [customers],
  );
  const advMatches = useMemo(() => {
    const t = advName.trim().toLowerCase();
    return customers
      .filter((c) => {
        const okName = !t || c.name.toLowerCase().includes(t) || c.custId.toLowerCase().includes(t);
        const okLevel = !advLevel || c.riskLevel === advLevel;
        const okProd = !advProduct || c.product === advProduct;
        return okName && okLevel && okProd;
      })
      .slice(0, 20);
  }, [advName, advLevel, advProduct, customers]);

  const goPath = (key: string) => nav('/console/' + key.replace(':', '/'));
  const goKey = (key: string) => {
    goPath(key);
    setFocus(false);
  };
  const goCust = (custId: string, name?: string) => {
    goDetail(`/console/dm/person-archive-basic?name=${encodeURIComponent(name || custId)}`);
    setQ(''); setFocus(false); setAdvOpen(false);
  };
  const onEnter = () => {
    if (matches.length >= 1) goCust(matches[0].custId, matches[0].name);
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
      <div style={{ position: 'relative', borderRadius: 20, padding: '30px 32px', background: 'linear-gradient(135deg, #EEF4FF 0%, #F8FAFF 60%, #FFFFFF 100%)', border: '1px solid #E5E7EB' }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 'inherit' }}>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,.10), transparent 70%)' }} />
        </div>
        <div style={{ position: 'relative' }}>
          {/* 搜索直达单客详情 + 高级搜索（同一行） */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 760 }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #CBD5E1', borderRadius: 12, padding: '12px 14px', boxShadow: '0 1px 2px rgba(0,0,0,.04)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setFocus(true); }}
                  onFocus={() => setFocus(true)}
                  onBlur={() => setTimeout(() => setFocus(false), 150)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) onEnter(); }}
                  placeholder="搜索客户姓名 / 客户号，直达单客 360 视图"
                  style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', fontSize: 14, color: '#0F172A', background: 'transparent' }}
                />
                <span style={{ fontSize: 11, color: '#94A3B8', whiteSpace: 'nowrap' }}>回车直达</span>
              </div>
              {focus && matches.length > 0 && (
                <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(100% + 6px)', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, boxShadow: '0 12px 28px rgba(0,0,0,.12)', overflow: 'hidden', zIndex: 50 }}>
                  {matches.map((c) => (
                    <div
                      key={c.custId}
                      onMouseDown={() => goCust(c.custId, c.name)}
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

            {/* 需求18.1：高级搜索按钮（搜索框同行右侧） */}
            <button
              onClick={() => setAdvOpen(true)}
              style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '12px 18px', borderRadius: 12, border: '1px solid #CBD5E1', background: '#fff', color: '#334155', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#93C5FD'; e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.color = '#1D4ED8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#334155'; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
              高级搜索
            </button>
          </div>
        </div>
      </div>

      {/* 概要数据 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 14, margin: '18px 0' }}>
        {metric('存量客户', String(total), '本地样例客户总数', '#0F172A', <Sam label="客户样例" />)}
        {metric('红色预警', String(red), `黄色 ${yellow} ｜ 实时红黄灯信号`, '#DC2626', <Cal label="实时统计" />)}
        {metric('逾期金额', `¥${overdue.toLocaleString()}`, `M3+ 案件 ${m3} 笔`, '#D97706', <Sam label="催收样例" />)}
        {metric('业务流程', String(onlineFlows), `已上线 / 共 ${flows.length} 条流程`, '#2563EB', <Cal label="配置驱动" />)}
      </div>

      {/* 快捷入口（需求18.2：占整行、横向铺满；按「贷前审核 / 贷中监控」分组） */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 16, padding: 18, background: '#fff' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>快捷入口</div>
        <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 14 }}>一键直达核心作业与监控页面</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {QUICK_GROUPS.map((g) => (
            <div key={g.title}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 3, height: 14, borderRadius: 2, background: '#2563EB', display: 'inline-block' }} />
                {g.title}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12 }}>
                {g.items.map((it) => (
                  <button
                    key={it.key}
                    onClick={() => goKey(it.key)}
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
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 需求18.1：高级搜索弹窗 */}
      {advOpen && (
        <div
          onClick={() => setAdvOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: 540, maxWidth: '100%', background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 24px 60px rgba(0,0,0,.25)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>高级搜索</div>
              <button onClick={() => setAdvOpen(false)} style={{ border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label style={{ fontSize: 12, color: '#64748B' }}>客户姓名 / 客户号
                <input
                  value={advName}
                  onChange={(e) => setAdvName(e.target.value)}
                  placeholder="支持模糊匹配"
                  style={{ marginTop: 4, width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', color: '#0F172A' }}
                />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ fontSize: 12, color: '#64748B' }}>风险等级
                  <div style={{ marginTop: 4 }}>
                    <SingleSelect label="全部" clearable fullWidth value={advLevel} onChange={setAdvLevel}
                      options={[{ value: '', label: '全部' }, { value: '高风险', label: '高风险' }, { value: '中风险', label: '中风险' }, { value: '低风险', label: '低风险' }]} />
                  </div>
                </label>
                <label style={{ fontSize: 12, color: '#64748B' }}>产品
                  <div style={{ marginTop: 4 }}>
                    <SingleSelect label="全部" clearable fullWidth value={advProduct} onChange={setAdvProduct}
                      options={[{ value: '', label: '全部' }, ...products.map((p) => ({ value: p, label: p }))]} />
                  </div>
                </label>
              </div>
            </div>

            <div style={{ marginTop: 16, marginBottom: 6, fontSize: 12, color: '#94A3B8' }}>匹配结果（{advMatches.length} 个）</div>
            <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid #F1F5F9', borderRadius: 10 }}>
              {advMatches.length === 0 ? (
                <div style={{ padding: 16, fontSize: 13, color: '#94A3B8' }}>未匹配到客户，调整筛选条件试试</div>
              ) : advMatches.map((c) => (
                <div
                  key={c.custId}
                  onClick={() => goCust(c.custId, c.name)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #F1F5F9' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>{c.custId} · {c.product}</div>
                  </div>
                  <span style={{ fontSize: 11, color: c.riskLevel === '高风险' ? '#DC2626' : c.riskLevel === '中风险' ? '#D97706' : '#059669', fontWeight: 600, whiteSpace: 'nowrap' }}>{c.riskLevel}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <SourceTagLegend />
      </div>
    </div>
  );
}
