/* 企业档案子系统 · 页面
 * 模块：①企业档案检索(qy:search) ②企业档案详情(qy:profile)
 * 模型参考：企查查（Qichacha）企业档案页 —— 工商信息 / 股东 / 主要人员 / 对外投资 /
 *           变更记录 / 分支机构 / 司法案件 / 裁判文书 / 商标 / 专利 / 经营风险 / 经营信息 等。
 * 数据：qiyeData.ts（qiyeData.json 样例橘 Sam；实时统计 灰 Cal）
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel, StatCard, DataTable, Button, Badge } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import { useQiyeData, toggleFollow, type QiyeProfile, type QiyeCountItem } from './qiyeData';

const CRUMB = '企业档案';

// 跨页面预选企业（从检索页跳转时带入）
export let qiyeSelectedKeyNo = '';

const STATUS_KIND: Record<string, 'green' | 'blue' | 'red' | 'gray' | 'amber'> = {
  存续: 'green', 在业: 'blue', 吊销: 'red', 注销: 'gray', 迁出: 'amber',
};

/* ============ ① 企业档案检索 ============ */
export function QiyeSearch() {
  const d = useQiyeData();
  const nav = useNavigate();
  const [kw, setKw] = useState('');
  const list = useMemo(() => {
    const q = kw.trim().toLowerCase();
    if (!q) return d.enterprises;
    return d.enterprises.filter(
      (e) => e.name.toLowerCase().includes(q) || e.industry.toLowerCase().includes(q) || e.legalPerson.toLowerCase().includes(q) || e.keyNo.includes(q),
    );
  }, [kw, d.enterprises]);

  const open = (e: QiyeProfile) => { qiyeSelectedKeyNo = e.keyNo; nav('/console/qy/profile'); };

  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="企业档案检索" crumb={`${CRUMB} / 检索`} subtitle="按企业名称、行业、法定代表人或唯一标识检索企业工商档案，查看工商信息、股东、司法、经营、知识产权等全维度画像"
        actions={<><Sam label="企业样例" value="qiyeData.json.enterprises" /><Cal label="实时统计" /></>} />

      <Panel title="检索" desc={<span>共 <b>{d.enterprises.length}</b> 家在档企业 · <Cal label="实时汇总" /></span>}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder="输入企业名称 / 行业 / 法定代表人 / 标识"
            style={{ flex: 1, minWidth: 280, padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, outline: 'none' }}
          />
          <span style={{ fontSize: 12, color: '#94A3B8' }}>命中 {list.length} 家</span>
        </div>
      </Panel>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 12, marginTop: 16 }}>
        {list.map((e) => (
          <div key={e.keyNo} style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, background: '#fff', cursor: 'pointer' }}
            onClick={() => open(e)}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{e.name}</div>
              <Badge kind={STATUS_KIND[e.status]}>{e.status}</Badge>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
              {e.tags.map((t) => <Badge key={t} kind="blue">{t}</Badge>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', fontSize: 12, color: '#475569', marginTop: 10 }}>
              <div>行业：{e.industry}</div>
              <div>法定代表人：{e.legalPerson}</div>
              <div>注册资本：{e.regCapital.toLocaleString()} 万元</div>
              <div>成立：{e.regDate}</div>
              <div>参保人数：{e.employees.toLocaleString()}</div>
              <div>科创分：<b style={{ color: '#0EA5E9' }}>{e.kcScore}</b></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
              <span style={{ fontSize: 11, color: '#94A3B8' }}>标识 {e.keyNo.slice(0, 12)}…</span>
              <Button size="sm" onClick={(ev) => { ev.stopPropagation(); open(e); }}>查看档案</Button>
            </div>
          </div>
        ))}
        {!list.length && <div style={{ color: '#94A3B8', fontSize: 13, padding: 24 }}>未检索到匹配企业</div>}
      </div>
    </div>
  );
}

/* ============ 计数网格（经营风险 / 经营信息 / 企业发展 / 知识产权） ============ */
function CountGrid({ title, items }: { title: string; items: QiyeCountItem[] }) {
  return (
    <Panel title={title} desc={<span>子项统计 · <Cal label="实时统计" /></span>}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
        {items.map((it) => (
          <div key={it.name} style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: it.danger && it.count > 0 ? '#FEF2F2' : '#fff' }}>
            <span style={{ fontSize: 12, color: it.danger && it.count > 0 ? '#DC2626' : '#475569' }}>{it.name}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: it.danger && it.count > 0 ? '#DC2626' : '#334155' }}>{it.count}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ============ ② 企业档案详情 ============ */
const TABS = ['基本信息', '法律诉讼', '经营风险', '经营信息', '企业发展', '知识产权'] as const;
type Tab = (typeof TABS)[number];

export function QiyeProfile() {
  const d = useQiyeData();
  const init = qiyeSelectedKeyNo ? d.enterprises.find((e) => e.keyNo === qiyeSelectedKeyNo) : undefined;
  const [cur, setCur] = useState<QiyeProfile>(init ?? d.enterprises[0]);
  const [tab, setTab] = useState<Tab>('基本信息');

  const switchTo = (e: QiyeProfile) => { setCur(e); setTab('基本信息'); };

  if (!cur) return <div style={{ padding: 24 }}>暂无企业档案</div>;

  // ---- 基本信息表格 ----
  const shCols: Column[] = [
    { key: 'name', label: '股东', type: 'text', fixed: 'left', width: '220px' },
    { key: 'type', label: '类型', type: 'badge', badgeKind: 'blue', width: '110px' },
    { key: 'ratio', label: '持股比例', type: 'percent', width: '110px' },
    { key: 'amount', label: '认缴出资额', type: 'money', width: '140px' },
  ];
  const shRows: Row[] = cur.shareholders.map((s) => ({ id: s.name, name: s.name, type: { v: s.type, kind: 'blue' }, ratio: s.ratio, amount: s.amount * 10000 }));

  const psCols: Column[] = [
    { key: 'name', label: '姓名', type: 'text', fixed: 'left', width: '160px' },
    { key: 'position', label: '职务', type: 'text' },
  ];
  const psRows: Row[] = cur.persons.map((p) => ({ id: p.name, name: p.name, position: p.position }));

  const invCols: Column[] = [
    { key: 'name', label: '被投资企业', type: 'text', fixed: 'left', width: '260px' },
    { key: 'ratio', label: '持股', type: 'percent', width: '100px' },
    { key: 'legal', label: '法定代表人', type: 'text', width: '140px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'gray', width: '120px' },
  ];
  const invRows: Row[] = cur.invests.map((i) => ({ id: i.name, name: i.name, ratio: i.ratio, legal: i.legal, status: { v: i.status, kind: 'gray' } }));

  const chCols: Column[] = [
    { key: 'date', label: '变更日期', type: 'text', width: '130px' },
    { key: 'item', label: '变更项目', type: 'text', width: '140px' },
    { key: 'before', label: '变更前', type: 'text' },
    { key: 'after', label: '变更后', type: 'text' },
  ];
  const chRows: Row[] = cur.changes.map((c, idx) => ({ id: `c${idx}`, date: c.date, item: c.item, before: c.before, after: c.after }));

  const brCols: Column[] = [
    { key: 'name', label: '分支机构', type: 'text', fixed: 'left', width: '320px' },
    { key: 'addr', label: '注册地址', type: 'text' },
  ];
  const brRows: Row[] = cur.branches.map((b) => ({ id: b.name, name: b.name, addr: b.addr }));

  // ---- 法律诉讼 ----
  const caseCols: Column[] = [
    { key: 'id', label: '案号', type: 'text', width: '140px' },
    { key: 'title', label: '案件名称', type: 'text' },
    { key: 'type', label: '类型', type: 'badge', badgeKind: 'red', width: '130px' },
    { key: 'date', label: '日期', type: 'text', width: '120px' },
    { key: 'role', label: '身份', type: 'badge', badgeKind: 'blue', width: '100px' },
    { key: 'amount', label: '标的(万)', type: 'number', width: '100px' },
    { key: 'status', label: '状态', type: 'text', width: '120px' },
  ];
  const caseRows: Row[] = cur.legalCases.map((c) => ({ id: c.id, title: c.title, type: { v: c.type, kind: 'red' }, date: c.date, role: { v: c.role, kind: 'blue' }, amount: c.amount ?? 0, status: c.status }));

  // ---- 知识产权 ----
  const ipCols: Column[] = [
    { key: 'name', label: '名称', type: 'text', fixed: 'left', width: '240px' },
    { key: 'type', label: '类型', type: 'badge', badgeKind: 'violet', width: '120px' },
    { key: 'no', label: '注册号', type: 'text', width: '200px' },
    { key: 'date', label: '申请/注册日', type: 'text', width: '130px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'green', width: '100px' },
  ];
  const ipRows: Row[] = cur.ips.map((i) => ({ id: i.id, name: i.name, type: { v: i.type, kind: 'violet' }, no: i.no, date: i.date, status: { v: i.status, kind: 'green' } }));

  const riskCases = cur.legalCases.length;
  const dangerCount = cur.riskCounts.filter((r) => r.danger && r.count > 0).length;

  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="企业档案" crumb={`${CRUMB} / ${cur.name}`} subtitle="企业工商档案：工商信息、股东与主要人员、对外投资与分支、司法与经营风险、经营信息、企业发展与知识产权全维度画像"
        actions={<><Sam label="企业样例" value="qiyeData.json" /><Cal label="实时统计" /></>} />

      {/* 头部卡片 */}
      <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, background: '#fff', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 10, background: 'linear-gradient(135deg,#0EA5E9,#22D3EE)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>
              {cur.name.slice(0, 1)}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                {cur.name} <Badge kind={STATUS_KIND[cur.status]}>{cur.status}</Badge>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {cur.tags.map((t) => <Badge key={t} kind="blue">{t}</Badge>)}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>科创分</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0EA5E9' }}>{cur.kcScore}</div>
            </div>
            <Button size="sm" variant={cur.followed ? 'secondary' : 'primary'} onClick={() => toggleFollow(cur.keyNo)}>
              {cur.followed ? '已关注' : '＋ 关注'}
            </Button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 14, fontSize: 13, color: '#475569' }}>
          <span>注册资本：<b>{cur.regCapital.toLocaleString()} 万元</b></span>
          <span>实缴资本：<b>{cur.paidCapital.toLocaleString()} 万元</b></span>
          <span>成立日期：<b>{cur.regDate}</b></span>
          <span>法定代表人：<b>{cur.legalPerson}</b></span>
          <span>参保人数：<b>{cur.employees.toLocaleString()}</b></span>
          <span>行业：<b>{cur.industry}</b></span>
        </div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 6, fontSize: 12, color: '#64748B' }}>
          <span>邮箱：{cur.email}</span>
          <span>官网：{cur.website}</span>
          <span>地址：{cur.regAddr}</span>
          <span>统一社会信用代码：{cur.creditCode}</span>
        </div>
      </div>

      {/* 企业切换（在档列表） */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {d.enterprises.map((e) => (
          <button key={e.keyNo} onClick={() => switchTo(e)}
            style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, border: '1px solid', borderColor: e.keyNo === cur.keyNo ? '#0EA5E9' : '#E2E8F0', background: e.keyNo === cur.keyNo ? '#E0F2FE' : '#fff', color: e.keyNo === cur.keyNo ? '#0369A1' : '#475569', cursor: 'pointer' }}>
            {e.name}
          </button>
        ))}
      </div>

      {/* Tab 导航 */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #E2E8F0', marginBottom: 14, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '8px 14px', fontSize: 13, border: 'none', background: 'none', cursor: 'pointer', color: t === tab ? '#0EA5E9' : '#64748B', fontWeight: t === tab ? 700 : 400, borderBottom: t === tab ? '2px solid #0EA5E9' : '2px solid transparent', marginBottom: -1 }}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      {tab === '基本信息' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
            <StatCard label="股东人数" value={String(cur.shareholders.length)} accent="brand" hint={<Sam label="样例" />} />
            <StatCard label="主要人员" value={String(cur.persons.length)} accent="cyan" hint={<Sam label="样例" />} />
            <StatCard label="对外投资" value={String(cur.invests.length)} accent="violet" hint={<Sam label="样例" />} />
            <StatCard label="分支机构" value={String(cur.branches.length)} accent="emerald" hint={<Sam label="样例" />} />
          </div>
          <Panel title="工商信息" desc={<span>基础登记信息 · <Sam value="qiyeData.json" /></span>}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px', fontSize: 13 }}>
              {([
                ['统一社会信用代码', cur.creditCode],
                ['注册号', cur.regNo],
                ['法定代表人', cur.legalPerson],
                ['注册资本', `${cur.regCapital.toLocaleString()} 万元`],
                ['实缴资本', `${cur.paidCapital.toLocaleString()} 万元`],
                ['成立日期', cur.regDate],
                ['经营状态', cur.status],
                ['行业', cur.industry],
                ['注册地址', cur.regAddr],
                ['参保人数', `${cur.employees.toLocaleString()} 人`],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
                  <span style={{ color: '#94A3B8' }}>{k}</span><span style={{ color: '#334155', fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: '#64748B' }}>经营范围：{cur.bizScope}</div>
          </Panel>
          <Panel title="股东信息" desc={<span>股东及出资 · <Sam value="qiyeData.json.shareholders" /></span>}>
            <DataTable columns={shCols} rows={shRows} empty="无" pager defaultPageSize={10} />
          </Panel>
          <Panel title="主要人员" desc={<span>董监高 · <Sam value="qiyeData.json.persons" /></span>}>
            <DataTable columns={psCols} rows={psRows} empty="无" pager defaultPageSize={10} />
          </Panel>
          <Panel title="对外投资" desc={<span>被投资企业与持股比例 · <Sam value="qiyeData.json.invests" /></span>}>
            <DataTable columns={invCols} rows={invRows} empty="无" pager defaultPageSize={10} />
          </Panel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <Panel title="变更记录" desc={<span>工商变更 · <Sam value="qiyeData.json.changes" /></span>}>
              <DataTable columns={chCols} rows={chRows} empty="无" pager defaultPageSize={6} />
            </Panel>
            <Panel title="分支机构" desc={<span>分公司 · <Sam value="qiyeData.json.branches" /></span>}>
              <DataTable columns={brCols} rows={brRows} empty="无" pager defaultPageSize={6} />
            </Panel>
          </div>
        </>
      )}

      {tab === '法律诉讼' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
            <StatCard label="司法案件" value={String(riskCases)} accent="rose" hint={<Cal label="实时统计" />} />
            <StatCard label="裁判文书" value={String(cur.legalCases.length)} accent="amber" hint={<Cal label="实时统计" />} />
            <StatCard label="立案信息" value="99" accent="amber" hint="案件量级" />
            <StatCard label="开庭公告" value="119" accent="cyan" hint="案件量级" />
          </div>
          <Panel title="司法案件" desc={<span>企业涉诉记录（抽样） · <Sam value="qiyeData.json.legalCases" /></span>}>
            <DataTable columns={caseCols} rows={caseRows} empty="无涉诉记录" pager defaultPageSize={10} />
          </Panel>
        </>
      )}

      {tab === '经营风险' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
            <StatCard label="风险子项" value={String(cur.riskCounts.length)} accent="brand" hint={<Cal label="实时统计" />} />
            <StatCard label="风险命中" value={String(dangerCount)} accent="rose" hint="需关注项" />
            <StatCard label="行政处罚" value={String(cur.riskCounts.find((r) => r.name === '行政处罚')?.count ?? 0)} accent="emerald" hint="绿色为无" />
            <StatCard label="劳动仲裁" value={String(cur.riskCounts.find((r) => r.name === '劳动仲裁')?.count ?? 0)} accent="amber" hint="争议项" />
          </div>
          <CountGrid title="经营风险" items={cur.riskCounts} />
        </>
      )}

      {tab === '经营信息' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
            <StatCard label="资质证书" value={String(cur.bizCounts.find((r) => r.name === '资质证书')?.count ?? 0)} accent="brand" hint={<Cal label="实时统计" />} />
            <StatCard label="行政许可" value={String(cur.bizCounts.find((r) => r.name === '行政许可')?.count ?? 0)} accent="cyan" hint={<Cal label="实时统计" />} />
            <StatCard label="招投标" value={String(cur.bizCounts.find((r) => r.name === '招投标')?.count ?? 0)} accent="violet" hint={<Cal label="实时统计" />} />
            <StatCard label="招聘" value={String(cur.bizCounts.find((r) => r.name === '招聘')?.count ?? 0)} accent="emerald" hint={<Cal label="实时统计" />} />
          </div>
          <CountGrid title="经营信息" items={cur.bizCounts} />
        </>
      )}

      {tab === '企业发展' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
            <StatCard label="新闻舆情" value={String(cur.newsCount)} accent="brand" hint={<Cal label="实时统计" />} />
            <StatCard label="上榜榜单" value={String(cur.devCounts.find((r) => r.name === '上榜榜单')?.count ?? 0)} accent="violet" hint={<Cal label="实时统计" />} />
            <StatCard label="荣誉" value={String(cur.devCounts.find((r) => r.name === '荣誉')?.count ?? 0)} accent="amber" hint={<Cal label="实时统计" />} />
            <StatCard label="相关公告" value={String(cur.devCounts.find((r) => r.name === '相关公告')?.count ?? 0)} accent="cyan" hint={<Cal label="实时统计" />} />
          </div>
          <CountGrid title="企业发展" items={cur.devCounts} />
        </>
      )}

      {tab === '知识产权' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
            <StatCard label="商标信息" value={String(cur.ipCounts.find((r) => r.name === '商标信息')?.count ?? 0)} accent="brand" hint={<Cal label="实时统计" />} />
            <StatCard label="专利信息" value={String(cur.ipCounts.find((r) => r.name === '专利信息')?.count ?? 0)} accent="violet" hint={<Cal label="实时统计" />} />
            <StatCard label="软件著作权" value={String(cur.ipCounts.find((r) => r.name === '软件著作权')?.count ?? 0)} accent="cyan" hint={<Cal label="实时统计" />} />
            <StatCard label="标准信息" value={String(cur.ipCounts.find((r) => r.name === '标准信息')?.count ?? 0)} accent="emerald" hint={<Cal label="实时统计" />} />
          </div>
          <CountGrid title="知识产权" items={cur.ipCounts} />
          <Panel title="商标 / 专利 / 著作权（抽样）" desc={<span>知识产权明细 · <Sam value="qiyeData.json.ips" /></span>}>
            <DataTable columns={ipCols} rows={ipRows} empty="无" pager defaultPageSize={10} />
          </Panel>
        </>
      )}
    </div>
  );
}
